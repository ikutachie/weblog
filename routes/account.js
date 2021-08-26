var { CONNECTION_URL, OPTIONS, DATABASE } = require("../config/mongodb.config");
var {authenticate, authorize} =require("../lib/security/accountcontrol.js");
var router = require("express").Router();
var MongoClient = require("mongodb").MongoClient;
var tokens= new require("csrf")();

var validateRegistData = function (body) {
  var isValidated = true, errors = {};

  if (!body.url) {
    isValidated = false;
    errors.url = "URLが未入力です。'/'から始まるURLを入力してください。";
  }

  if (body.url && /^\//.test(body.url) === false) {
    isValidated = false;
    errors.url = "'/'から始まるURLを入力してください。";
  }

  if (!body.title) {
    isValidated = false;
    errors.title = "タイトルが未入力です。任意のタイトルを入力してください。";
  }

  return isValidated ? undefined : errors;
};

var createRegistData = function (body) {
  var datetime = new Date();
  return {
    url: body.url,
    published: datetime,
    updated: datetime,
    title: body.title,
    content: body.content,
    keywords: (body.keywords || "").split(","),
    authors: (body.authors || "").split(","),
  };
};

router.get("/", authorize("readWrite"), (req, res, next)=>{
  if(req.isAuthenticated()){
    next();
  }else{
    res.redirect("/account/login");
  }
},(req, res) => {
  res.render("./account/index.ejs");
});

router.get("/login", (req, res)=>{
  res.render("./account/login.ejs",{message: req.flash("message")});
});

router.post("/login",authenticate());

router.post("/logout", (req, res)=>{
  req.logout();
  res.redirect("/account/login");
});

router.get("/posts/regist", authorize("readWrite"), (req, res) => {
  tokens.secret((error, secret)=>{
    var token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie("_csrf",token);
    res.render("./account/posts/regist-form.ejs");
  });
});

router.post("/posts/regist/input", authorize("readWrite"),(req, res) => {
  var original = createRegistData(req.body);
  res.render("./account/posts/regist-form.ejs", { original });
});

router.post("/posts/regist/confirm", authorize("readWrite"),(req, res) => {
  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }
  res.render("./account/posts/regist-confirm.ejs", { original });
});

router.post("/posts/regist/execute", authorize("readWrite"),(req, res) => {
  var secret = req.session._csrf;
  var token = req.cookies._csrf;

  if(tokens.verify(secret, token)=== false){
    throw new Error("Invalid Token.");
  }

  var original = createRegistData(req.body);
  var errors = validateRegistData(req.body);
  if (errors) {
    res.render("./account/posts/regist-form.ejs", { errors, original });
    return;
  }

  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABASE);
    db.collection("posts")
      .insertOne(original)
      .then(() => {
        delete req.session._csrf;
        res.clearCookie("_csrf");
        res.redirect("/account/posts/regist/complete");
      }).catch((error) => {
        throw error;
      }).then(() => {
        client.close();
      });
  });
});

router.get("/posts/regist/complete", authorize("readWrite"),(req, res)=>{
  res.render("./account/posts/regist-complete.ejs");
});

module.exports = router;
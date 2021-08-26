var {SESSION_SECRET} = require("./config/app.config.js").security;

var systemlogger = require("./lib/log/systemlogger.js");
var accesslogger = require("./lib/log/accessloger.js");
var accountcontrol = require("./lib/security/accountcontrol.js");
var express =require("express");
var flash = require("connect-flash");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var app = express();

app.set("view engine","ejs");
app.disable("x-powered-by");

app.use("/public",express.static(__dirname + "/public/" + (process.env.NODE_ENV === "development" ? "development" : "production")));

app.use(accesslogger());

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(flash());
app.use(cookieParser());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: "sid"
}));

app.use("/api",(()=>{
  var router = express.Router();
  router.use("/posts",require("./api/posts.js"));
  return router;
})());

app.use("/", (()=>{
  var router = express.Router();
  router.subscribe((req, res, next)=>{
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
  });
  router.use(...accountcontrol.initialize());
  router.use("/posts/",require("./routes/posts.js"));
  router.use("/search/",require("./routes/search.js"));
  router.use("/account/", require("./routes/account.js"));
  router.use("/",require("./routes/index.js"));
  return router;

})());

var logger = require("./lib/log/logger.js").application;
//logger.addContext("key","test");
//logger.error("message");
logger.error("test","message2");


app.use(systemlogger());

app.use((req, res, next)=>{
  var data = {
    method: req.method,
    protocol: req.protocol,
    version: req.httpVersion,
    url: req.url

  };
  res.status(404);
  if(req.xhr){
    res.json(data);
  }else{
    res.render("./404.ejs", {data});
  }
});

app.use((err, req, res, next)=>{
  var data = {
    method: req.method,
    protocol: req.protocol,
    version: req.httpVersion,
    url: req.url,
    error: (process.env.NODE_ENV === "development") ? {
      name: err.name,
      message: err.message,
      stack: err.stack
    }: undefined,
    

  };
  res.status(500);
  if(req.xhr){
    res.json(data);
  }else{
    res.render("/500.ejs",{ data });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT);
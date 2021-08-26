var { CONNECTION_URL, OPTIONS, DATABASE } = require("../../config/mongodb.config");
var hash = require("./hash.js");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var MongoClient = require("mongodb").MongoClient;
var initialize, authenticate, authorize;

passport.serializeUser((email, done) => {
  done(null, email);
});

passport.deserializeUser((email, done) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
    var db = client.db(DATABASE);
    db.collection("users")
      .findOne({ email })
      .then((user) => {
        return new Promise((resolve, reject) => {
          db.collection("privileges")
            .findOne({ role: user.role })
            .then((privilege) => {
              user.permissions = privilege.permissions;
              resolve(user);
            }).catch((error) => {
              reject(error);
            });
        });
      }).then((user) => {
        done(null, user);
      }).catch((error) => {
        done(error);
      }).then(() => {
        client.close();
      });
  });
});

passport.use("local-strategy",
  new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, (req, username, password, done) => {
    MongoClient.connect(CONNECTION_URL, OPTIONS, (error, client) => {
      var db = client.db(DATABASE);
      db.collection("users").findOne({
        email: username,
        password: hash.digest(password)
      }).then((user) => {
        if (user) {
          req.session.regenerate((error) => {
            if (error) {
              done(error);
            } else {
              done(null, user.email);
            }
          });
        } else {
          done(null, false, req.flash("message", "ユーザー名 または パスワード が間違っています。"));
        }
      }).catch((error) => {
        done(error);
      }).then(() => {
        client.close();
      });
    });
  })
);

initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    }
  ];
};

authenticate = function () {
  return passport.authenticate(
    "local-strategy", {
      successRedirect: "/account/",
      failureRedirect: "/account/login"
    }
  );
};

authorize = function (privilege) {
  return function (req, res, next) {
    if (req.isAuthenticated() &&
      (req.user.permissions || []).indexOf(privilege) >= 0) {
      next();
    } else {
      res.redirect("/account/login");
    }
  };
};

module.exports = {
  initialize,
  authenticate,
  authorize
};
var { PASSWORD_SALT, PASSWORD_STRETCH } = require("../../config/app.config.js").security;
var crypto = require("crypto");

var digest = function (text) {
  var hash;

  text += PASSWORD_SALT;

  for (var i = PASSWORD_STRETCH; i--;) {
    hash = crypto.createHash("sha256");
    hash.update(text);
    text = hash.digest("hex");
  }

  return text;
};

module.exports = {
  digest
};
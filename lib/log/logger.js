var levels = require("log4js/lib/levels.js")().levels;
var log4js = require("log4js");
var console,system, application, access;

var config = require("../../config/log4js.config.js");
log4js.configure(config);

console = log4js.getLogger();
system = log4js.getLogger("system");

var ApplicationLogger = function(){
  this.logger = log4js.getLogger("application");

};
var proto = ApplicationLogger.prototype;
for(var level of levels){
  level = level.toLowerCase();
  proto[level] =( function (level){
    return function (key, message){
      var logger = this.logger;
      logger.addContext("key",key);
      logger[level](message);
    };
  })(level);
}
access = log4js.getLogger("access");
application = new ApplicationLogger();
module.exports = {
  console,
  system,
  application,
  access
};
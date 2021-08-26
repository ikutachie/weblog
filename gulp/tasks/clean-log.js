var config = require("../config.js");
var gulp = require("gulp");
var del = require("del");


gulp.task("clean-log", () => {
  return del("./**/*", { cwd: config.path.log });
});
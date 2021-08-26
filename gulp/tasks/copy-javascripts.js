var config = require("../config.js");
var gulp = require("gulp");
var del = require("del");

gulp.task("copy-javascripts.clean", () => {
  return del("./javascripts/**/*", { cwd: config.path.output });
});

gulp.task("copy-javascripts", gulp.task("copy-javascripts.clean"), () => {
  gulp.src("./javascripts/**/*", { cwd: config.path.input })
    .pipe(gulp.dest("./javascripts", { cwd: config.path.output }));
});
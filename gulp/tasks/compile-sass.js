var config = require("../config.js");
var gulp = require("gulp");
var del = require("del");
var sass = require("gulp-sass");

gulp.task("compile-sass.clean", () => {
  return del("./**/*", { cwd: config.path.log });
});

gulp.task("compile-sass",gulp.series( gulp.parallel("compile-sass.clean"),()=>{
  return gulp.src("./stylesheets/**/*.scss",{cwd: config.path.input})
    .pipe(sass(config))
    .pipe(gulp.dest("./stylesheets",{cwd: config.path.output}));
}));
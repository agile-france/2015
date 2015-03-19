var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');

gulp.task('clean', function (cb) {
  del([
    // delete everything under public directory
    'public/*',
    // except Git files
    '!public/.git',
    '!public/.gitignore'
  ], cb);
});

gulp.task('sass', function () {
  gulp.src('app/styles/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

gulp.task('copy', function() {
  return gulp.src('app/assets/**')
    .pipe(gulp.dest('public'));
});

gulp.task('build', ['clean', 'copy', 'sass']);

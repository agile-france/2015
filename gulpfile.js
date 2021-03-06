var gulp = require('gulp');
var es = require('event-stream');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var path = require('path');

gulp.task('clean', function (cb) {
  var del = require('del');

  del([
    // delete everything under public directory
    './public/*',
    // except images, very long to generate
    '!./public/img',
    // except Git files
    '!./public/.git',
    '!./public/.gitignore'
  ], cb);
});

gulp.task('clean-img', function (cb) {
  require('del')([
    './public/img'
  ], cb);
});

gulp.task('css', ['clean'], function () {
  var sass = require('gulp-sass');
  var minifyCSS = require('gulp-minify-css');

  // keep stream CSS after Sass pre-processing
  var appFile = gulp.src('./app/styles/*.scss')
    .pipe(sass());
  // concat and minify CSS files and stream CSS
  return es.concat(gulp.src('./app/assets/css/*.css'), appFile)
    .pipe(concat('app.css'))
    .pipe(minifyCSS())
    .pipe(rename('app.min.css'))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('html-min', ['clean', 'bower'], function() {
  var wiredep = require('wiredep').stream;
  var htmlmin = require('gulp-htmlmin');

  return gulp.src('./app/assets/*.html')
    .pipe(wiredep({ignorePath: '../../'}))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./public'));
});

gulp.task('image-min', ['clean-img'], function () {
  var imagemin = require('gulp-imagemin');
  var pngquant = require('imagemin-pngquant');

  return gulp.src('./app/assets/img/**/*')
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./public/img'));
});

gulp.task('copy-fonts', ['clean'], function() {
  return gulp.src(['./app/assets/fonts/**'])
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('copy-travis', ['clean'], function() {
    return gulp.src(['./.travis.yml'])
        .pipe(gulp.dest('./public/'));
});

gulp.task('bower', ['clean'], function() {
  var bower = require('gulp-bower');

  return bower()
    .pipe(gulp.dest('./public/bower_components'));
});

gulp.task('deploy_integ', ['build'], function(cb) {
    var ghPages = require('gh-pages');

    ghPages.publish('./public', {
        clone: path.relative(process.cwd(), path.resolve(__dirname, '.cache/integ')),
        logger: function(message) {
            console.log(message);
        }
    }, cb);
});

gulp.task('deploy_prod', ['build'], function(cb) {
    var ghPages = require('gh-pages');

    ghPages.publish('./public', {
        clone: path.relative(process.cwd(), path.resolve(__dirname, '.cache/prod')),
        branch: 's3',
        dotfiles: true,
        logger: function(message) {
            console.log(message);
        }
    }, cb);
});

gulp.task('build-fast', ['clean', 'copy-fonts', 'copy-travis', 'css', 'html-min']);
gulp.task('build', ['build-fast', 'image-min']);


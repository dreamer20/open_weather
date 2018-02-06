const gulp = require('gulp');
const pug = require('gulp-pug2');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const browserSync = require('browser-sync');

gulp.task('browser-sync', function () {
  browserSync.init({
    server: true,
    files: 'index.html'
  });
});


gulp.task('pug', function() {
  return gulp.src('./index.pug')
          .pipe(pug())
          .on('error', notify.onError(function (error) {
            return 'Error in the pug: ' + error;
          }))
          .pipe(gulp.dest('./'));
});

gulp.task('sass', function() {
  return css = gulp.src('./sass/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  return js = gulp.src('./js/*.js')
    .on('error', notify.onError(function(error) {
      return 'Error in js: ' + error;
    }))
    .pipe(gulp.dest('./js/'));
});


gulp.task('default', ['browser-sync'], function() {
  gulp.watch('./index.pug', ['pug']);
  gulp.watch('./sass/*.sass', ['sass']);
  gulp.watch('./js/*.js', ['js']).on('change', browserSync.reload);
});


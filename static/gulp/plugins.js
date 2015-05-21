var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var size = require('gulp-size');
var paths = gulp.paths;

gulp.task('fontawesome', function () {
   return gulp.src('bower_components/fontawesome/fonts/*.*')
      .pipe(gulp.dest(paths.dist + '/fonts/'));
});

gulp.task('bootstrap-js', function() {
   return gulp.src('bower_components/bootstrap/dist/js/*.js')
      .pipe(gulp.dest(paths.dist + '/plugins/js/'))
});

gulp.task('bootstrap-fonts', function() {
   return gulp.src('bower_components/bootstrap/dist/fonts/*.*')
      .pipe(gulp.dest(paths.dist + '/fonts/'))
});

gulp.task('bootstrap-css', function() {
   return gulp.src(['bower_components/bootstrap/dist/css/bootstrap.css'])
      .pipe(gulp.dest(paths.dist + '/plugins/css/'));
});

gulp.task('bootstrap', ['bootstrap-fonts'], function() {});

gulp.task('jquery', function() {
   return gulp.src('bower_components/jquery/dist/**/*.js')
      .pipe(gulp.dest(paths.dist + '/plugins/js'))
});

gulp.task('angular', function() {
   return gulp.src('src/plugins/angular/**/*.js')
      .pipe(gulp.dest(paths.dist + '/plugins/js'))
});

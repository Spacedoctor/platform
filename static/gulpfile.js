'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var RevAll = require('gulp-rev-all');
var debug = require('gulp-debug');

gulp.paths = {
   src: 'src',
   dist: 'dist',
   build: 'build',
};

//Won't minify html, css and js when "production" task isn't being run
if (gutil.env._[0] !== 'production') {
   gulp.paths.dev = false;
} else {
   gulp.paths.dev = true;
}

require('require-dir')('./gulp');

//Default task when running gulp without an arguments
//Assumes that you want to run the development task
gulp.task('default', ['clean'], function() {
   gulp.start('dev');
});

//Need to remove files from previous build before a new one can get run
gulp.task('clean', ['cdn-clean'],function (done) {
   return gulp.src([gulp.paths.dist, gulp.paths.build, './cdn'], {read: false})
      .pipe(clean());
})


//Cleans production files
gulp.task('cdn-clean', function (done) {
   return gulp.src(['./cdn'], {read: false})
      .pipe(clean());
})

//Run when on production instance
gulp.task('production', ['clean', 'build'], function() {
   gulp.start('rev');
});

//Development task (default)
gulp.task('dev', ['build'], function() {

   //When change to browserify fields in package.json new build will get run
   gulp.watch([
      './package.json',
   ], ['clean', 'build']);

   //runs when change is made to html files only
   gulp.watch([
      '!./src/express/**/*.js',
      './src/**/html/*.html',
      './src/html/**/*.html',
   ], ['express', 'html', 'components']);

   //when change made to css and plugins
   gulp.watch([
      './src/css/*.css',
      './src/assets/*',
   ], ['fontawesome', 'bootstrap', 'images', 'html', 'css']);

});

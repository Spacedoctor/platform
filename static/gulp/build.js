var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var size = require('gulp-size');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var debug = require('gulp-debug');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var es = require('event-stream');
var source = require('vinyl-source-stream');
var RevAll = require('gulp-rev-all');
var ngAnnotate = require('gulp-ng-annotate');
var watchify = require('watchify');
var concatCss = require('gulp-concat-css');
var glob = require('glob');
var notifier = require('node-notifier');
var paths = gulp.paths;

gulp.task('data', function() {
   return gulp.src('src/data/**/*')
      .pipe(gulp.dest(paths.dist + '/data'))
});

gulp.task('html', function() {
   var assets = useref.assets();
   var jsFilter = filter('**/*.js');
   var cssFilter = filter('**/*.css');

   return gulp.src('src/html/index.html')
      .pipe(assets)
      .pipe(jsFilter)
      .pipe(gulpif(paths.dev, uglify()))
      .pipe(jsFilter.restore())
      .pipe(cssFilter)
      .pipe(gulpif(paths.dev, minifyCss()))
      .pipe(cssFilter.restore())
   .pipe(assets.restore())
   .pipe(useref())
   .pipe(gulp.dest(paths.dist));
});

gulp.task('images', function() {
   gulp.src(['src/assets/images/**/*'])
      .pipe(gulp.dest(paths.dist + '/assets/img'));

   return gulp.src(['src/assets/images/patterns/*'])
      .pipe(gulp.dest(paths.dist + '/css/patterns'));
});

gulp.task('css', function() {
   gulp.src(['src/css/login.css'])
      .pipe(gulpif(paths.dev, minifyCss()))
      .pipe(gulp.dest(paths.dist + '/css'));

   return gulp.src(['src/css/nav.css', 'src/css/animate.css', 'src/css/style.css', 'src/css/loading-bar.css'])
      .pipe(concatCss("dashboard.css"))
      .pipe(gulpif(paths.dev, minifyCss()))
      .pipe(gulp.dest(paths.dist + '/css/'));

});

//html components. Gets stored in dist/components/**
//Minifies html when not on production
gulp.task('components', function() {
   return gulp.src(['src/html/**/*.html'])
      .pipe(gulpif(paths.dev, minifyHtml()))
      .pipe(gulp.dest(paths.dist + '/components/'));
});

//Used to compiles express server
gulp.task('express', function() {
   return gulp.src('src/express/html/index.html')
      .pipe(gulp.dest(paths.dist + '/express/'));
});

//Socket.io plugin task
gulp.task('socket-io', function() {
  return gulp.src('node_modules/socket.io/node_modules/socket.io-client/socket.io.js')
      .pipe(gulpif(paths.dev, uglify()))
      .pipe(gulp.dest(paths.dist + '/js/'));
});

//Add hash to name of every file but favicon.ico and index.html
//Forces browsers to update cache
gulp.task('rev', [], function() {
   var revAll = new RevAll({ dontRenameFile: [/^\/favicon.ico$/g, /^\/index.html/g] });
   return gulp.src('dist/**')
      .pipe(revAll.revision())
      .pipe(size())
      .pipe(gulp.dest('cdn'));
});

//combines all of the plugins tasks
gulp.task('build', [
   'browserify',
   'components',
   'fontawesome',
   'html',
   'images',
   'bootstrap',
   'express',
   'socket-io',
   'css',
   'data'
], function() {
});

//Bundles angularjs files into modules
gulp.task('browserify', function() {

   var notify = function (filename) {
      var output = String(filename).split('modules/')[1]
      gutil.log(gutil.colors.green('✔' + ' Bundle ') + gutil.colors.blue(output));
   };

   var files = []
   var testFiles = glob.sync('./src/modules/**/*.js');

   for (var i = 0; i < testFiles.length; i++) {
      var file = testFiles[i];
      if (file.indexOf("controllers") < 0 && file.indexOf("directives") < 0 && file.indexOf("routes") < 0 && file.indexOf("services") < 0) {
         files.push(file);
      }
   }

   function createBundle(b, entry) {
      return b
         .bundle().on('error', handleError)
         .pipe(source(entry.replace("./src/modules/", "")))
         .pipe(ngAnnotate())
         .pipe(gulpif(paths.dev, uglify()))
         .pipe(gulp.dest(gulp.paths.dist + '/js/'));
   };

   var tasks = files.map(function(entry) {
      var b = browserify({entries: [entry]}, watchify.args);
      b.on('bundle', notify.bind(null, entry));

      b = watchify(b);

      b.on('update', function() {
         createBundle(b, entry).on('error', handleError);
      });

      return createBundle(b, entry).on('error', handleError);
   });

   return es.merge.apply(null, tasks);

});

function handleError(err) {
   console.log(err);
   var notify = function(title, message) {
      notifier.notify({
         'title': title,
         'message': message
      });
   };

   var print = function(file, type, description) {
      var first = String(gutil.colors.red('✘' + ' Error: ') + type);
      var second = String(gutil.colors.red('✘ File:  ') + file);
      var third = String(gutil.colors.red('✘ Info: ') + description);

      gutil.log(first);
      gutil.log(second);
      gutil.log(third);

   };

   //Parsing file error
   var regex = /(.+)\s.+modules\/(.+?):(.+)$/;
   var results = regex.exec(err.message);

   if(results != null && results.length > 2) {
      var error_type = results[1];
      var error_file = results[2];
      var error_message = results[3];

      var type = gutil.colors.yellow(results[1]);
      var file = gutil.colors.yellow(results[2]);
      var description = gutil.colors.yellow(results[3]);

      var message = ' ' + error_file + '\n' + error_message;
      notify(error_type, message);

      print(file, type, description);

   } else {

      //Parse Error Token
      var regex = /.+modules\/(.+?):(\d.+)/;
      var str = err.toString().split('\n');
      var results = regex.exec(err.toString());
      if(results != null && results.length > 2) {
         var line = parseInt(results[2]) - 1;

         var error_type = str[4] + ' at (' + results[2] + ')';
         var error_file = results[1];
         var error_message = ' Error on line (' + line + ')'

         var type = gutil.colors.yellow(error_type);
         var file = gutil.colors.yellow(error_file);
         var description = gutil.colors.yellow();
         
         var message = ' ' + error_file + '\n' + error_message;
         notify(error_type, message);

         print(file, type, description);
      }
   }

   this.emit('end');
};


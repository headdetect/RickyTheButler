var gulp        = require('gulp');
var sass        = require('gulp-sass');
var catify      = require('gulp-concat');
var uglyfy      = require('gulp-uglify');
var mincss      = require('gulp-minify-css');

gulp.task('sass', function() {
   gulp.src('./app/scss/main.scss')
    .pipe(catify('main.css'))
    .pipe(sass())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('css', function() {
   gulp.src('./app/scss/vendor/*.css')
    .pipe(catify('vendor.css'))
    .pipe(mincss({keepSpecialComments: 0}))
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('js', function() {
  gulp.src('./app/js/*.js')
    .pipe(catify('main.js'))
    .pipe(uglyfy())
    .pipe(gulp.dest('./public/js/'))
})

gulp.task('vendorjs', function() {
  gulp.src('./app/js/vendor/*.js')
    .pipe(uglyfy())
    .pipe(gulp.dest('./public/js/vendor/'))
})

gulp.task('watch', function() {
   //gulp.watch('./app/scss/*.scss', ['sass']);
});

 
 gulp.task('default', ['sass', 'js', 'vendorjs','css', 'watch']);

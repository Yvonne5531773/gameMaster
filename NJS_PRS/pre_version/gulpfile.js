var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    jsmin = require('gulp-jsmin'),
    rename = require("gulp-rename"),
    cssmin = require('gulp-cssmin');

gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true,  //清除HTML注释
        collapseWhitespace: true,  //压缩HTML
        collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
        minifyJS: true,  //压缩页面JS
        minifyCSS: true  //压缩页面CSS
    };
    // gulp.src('*.html')
    //     .pipe(htmlmin(options))
    //     .pipe(gulp.dest('heytime'));
    // gulp.src('css/newsclient.css')
    //     .pipe(cssmin())
    //     .pipe(rename({prefix:"min."}))
    //     .pipe(gulp.dest('css/'));

    gulp.src('js/newsclient.js')
        .pipe(jsmin())
        .pipe(rename({prefix:"min."}))
        .pipe(gulp.dest('js/'));

});
gulp.task('clean', function() {
    gulp.src('heytime')
        .pipe(clean());
});

// 整体任务
gulp.task('default', function(){
    gulp.start('testHtmlmin');
});

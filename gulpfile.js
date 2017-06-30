'use strict';
const gulp = require('gulp');
const lazypipe = require('lazypipe');
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const header = require("gulp-header");
const footer = require("gulp-footer");
const pkg = require('./package.json');

const now = new Date();
const textAuthor = `/**
  @rely: jQuery
  @author: ${ pkg.author }
  @version: ${ pkg.version }
  @lastModify: ${ now.getFullYear() }/${ now.getMonth() + 1 }/${ now.getDate() }
  @git: ${ pkg.homepage }
*/\n`;
const textHeader = `
;(function(ctx, factory) {
  if (typeof define === 'function') {
    if (define.amd) {
      define(factory);
    } else if (define.cmd) {
      define(function(require, exports, module) {
        module.exports = factory();
      });
    }
  } else {
    ctx['Pjax'] = factory();
  }
})(this, function() {\n`;
const textFooter = `return Pjax; \n});`;

gulp.task('build', [], () => {
  gulp.src(['./src/common.js', './src/path.js', './src/event.js', './src/resource.js', './src/state.js', './src/state-cls-ctrl.js', './src/runner.js', './src/pjax.js'])
    .pipe(concat('jquery-pjax.js'))
    .pipe(header(textHeader))
    .pipe(footer(textFooter))
    .pipe(uglify({
      mangle: {
        keep_fnames: true
      },
      output: {
        comments: 'some',
        indent_level: 2,
        beautify: true
      }
    }))
    .pipe(header(textAuthor))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(header(textAuthor))
    .pipe(gulp.dest('dist'));
});

gulp.task('dev', [], () => {
  gulp.watch('./src/*.js', ['build']);
});

gulp.task('default', ['build'], () => {
  // nothing
});

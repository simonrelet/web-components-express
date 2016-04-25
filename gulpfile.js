'use strict';

const gulp = require('gulp');
const del = require('del');
const sync = require('gulp-npm-script-sync');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const glob = require('glob');
const es = require('event-stream');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const jade = require('gulp-jade');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const path = require('path');

const paths = {
  build: {
    dist: 'dist/',
    components: 'dist/components',
    tmp: '.tmp/',
    tmpComponents: '.tmp/components',
    view: '.tmp/components/**/index.jade'
  },
  components: {
    js: 'components/**/index.js',
    view: 'components/**/index.jade',
    style: 'components/**/index.scss'
  }
};

gulp.task('clean', () => {
  return del([paths.build.dist, paths.build.tmp]);
});

gulp.task('build:js', done => {
  glob(paths.components.js, (err, files) => {
    if (err) {
      done(err);
    }
    const tasks = files.map(entry => {
      return browserify({entries: [entry]})
        .transform(babelify, {presets: ['es2015']})
        .bundle()
        .pipe(source(entry))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(paths.build.tmp));
    });
    es.merge(tasks).on('end', done);
  });
});

gulp.task('build:css', () => {
  return gulp.src(paths.components.style)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(paths.build.tmpComponents));
});

gulp.task('build:copy-jade', () => {
  return gulp.src(paths.components.view)
    .pipe(gulp.dest(paths.build.tmpComponents));
});

gulp.task('build:html', ['build:js', 'build:css', 'build:copy-jade'], () => {
  return gulp.src(paths.build.view)
    .pipe(jade())
    .pipe(rename(filePath => {
      filePath.basename = path.basename(filePath.dirname);
      filePath.dirname = path.dirname(filePath.dirname);
    }))
    .pipe(gulp.dest(paths.build.components));
});

gulp.task('build', ['build:html'], done => {
  done();
});

gulp.task('watch', ['build'], done => {
  gulp.watch(paths.components.js, ['build:js']);
  gulp.watch(paths.components.view, ['build:html']);
  gulp.watch(paths.components.style, ['build:html']);
  done();
});

sync(gulp, {
  excluded: ['build:js', 'build:html', 'build:css', 'build:copy-jade']
});

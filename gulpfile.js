'use strict';

const path = require('path');
var gulp = require('gulp');
var del = require('del');
const PolymerProject = require('polymer-build').PolymerProject;
const mergeStream = require('merge-stream');
const browserSync = require('browser-sync').create();
const historyApiFallback = require('connect-history-api-fallback');
var $ = require('gulp-load-plugins')();

const distDir = 'build';

var watches = [];

gulp.task('polymer', function () {
    const project = new PolymerProject(require('./polymer.json'));

    return mergeStream(project.sources(), project.dependencies())
        .pipe(project.analyzer)
        .pipe(project.bundler)
        .pipe(gulp.dest(distDir));
});
watches.push({
    src: "elements/**/*",
    tasks: 'polymer'
});

gulp.task('generate-icons', ['clean-icons'], function () {
    return gulp.src('images/icon.png')
        .pipe($.responsive({
            '*.png': [48, 72, 96, 144, 192, 512].map(function (width) {
                return {width: width, rename: {suffix: '-' + width + 'x' + width}};
            })
        }))
        .pipe(gulp.dest(path.join(distDir, 'images/manifest')));
});

gulp.task('clean-icons', function () {
    return del(['images/manifest/*.png']);
});

gulp.task('serve', function () {
    browserSync.init({
        notify: false,
        open: false,
        reloadOnRestart: true,
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>'
            }
        },
        middleware: [historyApiFallback()],
        ui: false,
        injectChanges: false,
        ghostMode: false,
        server: {
            baseDir: ['.']
        }
    });

    watches.forEach(function (item) {
        gulp.watch(item.src, item.tasks);
    });
});

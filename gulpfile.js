const autoprefixer = require('autoprefixer'),
      babel = require('gulp-babel'),
      browsersync = require('browser-sync'),
      concat = require('gulp-concat'),
      eslint = require('gulp-eslint'),
      gulp = require('gulp'),
      imagemin = require('gulp-imagemin'),
      plumber = require('gulp-plumber'),
      postcss = require('gulp-postcss'),
      sass = require('gulp-sass'),
      stylelint = require('gulp-stylelint'),
      uglify = require('gulp-uglify');

var paths = {
    img: {
        src: 'img/**/*',
        dir: 'img'
    },
    js: {
        src: 'src/js/**/*.js',
        dest: 'js'
    },
    styles: {
        src: 'src/scss/**/*.scss',
        dest: 'css'
    },
    html: {
        src: ['**/*.html', '!./node_modules/**']
    }
};

function browser() {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
}

function cssBuild() {
    return gulp
        .src(paths.styles.src)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(paths.styles.dest))
}

function cssDev() {
    return gulp
        .src(paths.styles.src, { sourcemaps: true })
        .pipe(plumber())
        .pipe(stylelint({
                reporters: [{
                formatter: 'string',
                console: true
            }]
        }))
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(paths.styles.dest, { sourcemaps: true }))
        .pipe(browsersync.reload({ stream: true }))
}

function jsBuild() {
    return gulp
        .src(paths.js.src)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.js'))
        .pipe(uglify())
        .pipe(gulp.dest(paths.js.dest))
}

function jsDev() {
    return gulp
        .src(paths.js.src, { sourcemaps: true })
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(paths.js.dest, { sourcemaps: true }))
        .pipe(browsersync.reload({ stream: true }))
}

function img() {
    return gulp
        .src(paths.img.src)
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: false,
                            collapseGroups: true
                        }
                    ]
                })
            ])
        )
        .pipe(gulp.dest(paths.img.dir));
}

function reload() {
    return gulp
        .src(paths.html.src)
        .pipe(browsersync.reload({ stream: true }))
}

function watch() {
    gulp.watch(paths.html.src, reload);
    gulp.watch(paths.styles.src, cssDev);
    gulp.watch(paths.js.src, jsDev);
    browser;
}

const build = gulp.series(jsBuild, cssBuild, img);
const dev = gulp.parallel(cssDev, jsDev, watch, browser);

exports.cssBuild = cssBuild;
exports.cssDev = cssDev;
exports.jsDev = jsDev;
exports.jsBuild = jsBuild;
exports.watch = watch;
exports.build = build;
exports.browser = browser;
exports.dev = dev;
exports.img = img;
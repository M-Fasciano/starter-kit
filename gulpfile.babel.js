/* eslint no-unused-vars: 0, indent: 0 */

// modules
import assets from 'postcss-assets';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import del from 'del';
import gulp from 'gulp';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack-stream';

// gulp specific modules
import eslint from 'gulp-eslint';
import gutil from 'gulp-util';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import sequence from 'gulp-sequence';
import sourcemaps from 'gulp-sourcemaps';
import stripDebug from 'gulp-strip-debug';

gutil.log = gutil.noop;

// development mode?
const devBuild = (process.env.NODE_ENV !== 'production');

const APP_DIR = './frontend-src';
const DIST_DIR = './public/assets';

const paths = {
    styles: {
        src: `${APP_DIR}/scss/`,
        dist: `${DIST_DIR}/css/`,
    },
    scripts: {
        src: `${APP_DIR}/js/`,
        dist: `${DIST_DIR}/js/`,
    },
    images: {
        src: `${APP_DIR}/images/`,
        dist: `${DIST_DIR}/images/`,
    },
    fonts: {
        src: `${APP_DIR}/fonts/`,
        dist: `${DIST_DIR}/fonts/`,
    },
    templates: {
        src: './templates',
    },
};

// -------------------------------------------------------------------------
// [Clean]
// - Delete all the files in the dist folder
// -------------------------------------------------------------------------
gulp.task('clean', () => {
    return del(DIST_DIR).then((allPaths) => {
        console.log('Deleted files and folders:\n', allPaths.join('\n'));
    });
});

// ------------------------------------------------------------------------
// [Styles]
// - Compile sass
// - Add prefixes
// - Create minified/uglified version
// - Combine media queries
// - Generate sourcemaps
// ------------------------------------------------------------------------
gulp.task('styles', () => {
    const postCssOpts = [
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        cssnano,
    ];

    gulp.src(`${paths.styles.src}main.scss`)
        .pipe(plumber({
            errorHandler: (err) => {
                notify.onError({
                    title: 'Style Task error',
                    message: '<%= error.message %>',
                    sound: 'Sosumi',
                    onLast: true,
                })(err);
                this.emit('end');
            },
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compact',
            sourceMap: true,
        }))
        .pipe(postcss(postCssOpts))
        .pipe(rename('main.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(notify({
            message: 'Styles task complete',
            onLast: true,
        }));
});

gulp.task('eslint', () => {
    gulp.src(`${paths.scripts.src}**/*`)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// ------------------------------------------------------------------------
// [Scripts]
// - Compile js with webpack
// - Create minified/uglified version
// - Generate sourcemaps
// ------------------------------------------------------------------------
gulp.task('scripts', () => {
    let jsBuild = gulp.src(`${paths.scripts.src}main.js`)
        .pipe(webpack({
            mode: 'production',
            output: {
                filename: 'main.min.js',
            },
            devtool: 'source-map',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                        },
                    },
                ],
            },
        }))
        .pipe(gulp.dest(paths.scripts.dist))
        .pipe(notify({
            message: 'Scripts task complete',
            onLast: true,
        }));

    if (!devBuild) {
        jsBuild = jsBuild
            .pipe(stripDebug());
    }

    return jsBuild;
});

// ------------------------------------------------------------------------
// [Images]
// - Minify Images
// ------------------------------------------------------------------------
gulp.task('images', () => {
    gulp.src(`${paths.images.src}**/*`)
        .pipe(plumber({
            errorHandler: (err) => {
                notify.onError({
                    title: 'Image Task error',
                    message: '<%= error.message %>',
                    sound: 'Sosumi',
                    onLast: true,
                })(err);
                this.emit('end');
            },
        }))
        .pipe(newer(paths.images.dist))
        .pipe(imagemin([], { progressive: true }))
        .pipe(gulp.dest(paths.images.dist))
        .pipe(notify({
            message: 'Images task complete',
            onLast: true,
        }));
});

// ------------------------------------------------------------------------
// [Fonts]
// - Copy contents of fonts path
// ------------------------------------------------------------------------
gulp.task('fonts', () => {
    gulp.src(`${paths.fonts.src}**/*`)
        .pipe(plumber({
            errorHandler: (err) => {
                notify.onError({
                    title: 'Font Task error',
                    message: '<%= error.message %>',
                    sound: 'Sosumi',
                    onLast: true,
                })(err);
            },
        }))
        .pipe(gulp.dest(paths.fonts.dist))
        .pipe(notify({
            message: 'Fonts task complete',
            onLast: true,
        }));
});

gulp.task('watch', () => {
    // Sass changes
    gulp.watch([`${paths.styles.src}**/*`], ['styles']);

    // JS changes
    gulp.watch([`${paths.scripts.src}**/*`], ['scripts']);

    // Image changes
    gulp.watch([`${paths.images.src}**/*`], ['images']);

    // Font changes
    gulp.watch([`${paths.fonts.src}**/*`], ['fonts']);

    // Watch any files in dist/, reload on change
    // gulp.watch([`${DIST_DIR}/**.*`, `${paths.templates.src}/**.*`], browserSync.reload);
});

//  Default Task
gulp.task('default', sequence('clean', ['scripts', 'styles', 'images', 'fonts'], 'watch'));

//  Production/Deployment task
gulp.task('deploy-prod', sequence('clean', ['scripts', 'styles', 'images', 'fonts']));

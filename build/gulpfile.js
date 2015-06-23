var gulp       = require( 'gulp' ),
    minifycss  = require( 'gulp-minify-css' ),
    sass       = require( 'gulp-sass' ),
    imagemin   = require( 'gulp-imagemin' ),
    uglify     = require( 'gulp-uglify' ),
    minifyHTML = require( 'gulp-minify-html' ),
    rename     = require( 'gulp-rename' ),
    notify     = require( 'gulp-notify' ),
    php        = require('gulp-connect-php'),
    browserSync = require( 'browser-sync' ),
    reload     = browserSync.reload;



var config = {
    build:      '',
    web:        '../public/'
};


//Error Handler
var handleErrors = function() {
    // Send error to notification center with gulp-notify
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, arguments);
 
    // Keep gulp from hanging on this task
    this.emit('end');
};

gulp.task('php', function() {
    php.server({ base:config.web, port:8001, keepalive:true});
});

// browser-sync task for starting the server.
gulp.task('browser-sync', ['php'], function() {

    browserSync({
        proxy: '127.0.0.1:8001',
        port: 3001,
        open: true,
        notify: false
    });

});



gulp.task( 'styles', function() {
    
    gulp
        .src([config.build + 'scss/style.scss'])
        .on('error', handleErrors)
        .pipe(sass({
            style: 'compress',
            'sourcemap=none': true,
            errLogToConsole: false,
        })).on('error', function (err) {
            console.error('Error: ' + err + '<%= file.relative %>');
            return notify().write(err); //
        })
        .pipe( minifycss() )
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe( gulp.dest( config.web + 'css' ) )
        .pipe(reload({stream:true}))
        .pipe( notify({ message:'Css ok!', onLast:true }) );

});



gulp.task( 'scripts', function() {
    
    gulp
        .src([config.build + 'js/**/*.js', '!' + config.build + 'js/**/*.min.js'])
        .pipe( uglify() )
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe( gulp.dest( config.web + 'js' ) )
        .pipe( notify({ message:'Js ok!', onLast:true }) )
        .pipe(reload({stream:true}));

});


// Copy Web Fonts To Dist
gulp.task('fonts', function () {
    
    gulp.src([config.build +'fonts/**'])
        .pipe(gulp.dest(config.web + 'fonts'));

});


gulp.task('imagemin', function () {
    gulp
        .src(config.build + 'img/**/*')
        .on('error', handleErrors)
        .pipe(imagemin({
            optimizationLevel: 5, 
            progressive: true, 
            interlaced: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(gulp.dest( config.web + 'img'))
        .pipe(reload({stream:true}));
});


gulp.task('minify-html', function() {

    gulp
        .src([config.build + '**/*.{php,html}', '!' + config.build + 'bootstrap/**/*.php'])
        .pipe(minifyHTML({ spare:true }))
        .pipe(gulp.dest(config.web))
        .pipe(reload({stream:true}));

});


gulp.task('copy', function() {
    
    gulp.src([config.build + 'js/**/*.min.js'])
        .pipe( uglify() )
        .pipe( gulp.dest(config.web + 'js') );

});



// Default Task
gulp.task( 'default', function() {
    gulp.start('styles', 'scripts', 'imagemin', 'copy', 'fonts');
});


// Create server in localhost;
gulp.task('server', function() {
    gulp.start('browser-sync', 'default', 'watch');
});


// Watch
gulp.task('watch', ['default'], function(){

    // Watch files
    gulp.watch(config.build + 'scss/**/*.scss', ['styles']);
    gulp.watch(config.build + 'js/**/*.js', ['scripts']);
    gulp.watch(config.build + 'img/**/*', ['imagemin']);
    gulp.watch(config.build + 'fonts/**/*', ['fonts']);
    gulp.watch(config.web + '*.{php,html}', browserSync.reload);

});
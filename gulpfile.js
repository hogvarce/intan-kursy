var gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	webserver = require('gulp-webserver'),
	autoprefixer = require('gulp-autoprefixer');
	imagemin = require('gulp-imagemin'),
	jade = require('gulp-jade'),
	jadeOrig = require('jade');
	stylus = require('gulp-stylus'),
	sourcemaps = require('gulp-sourcemaps'),
	spritesmith = require('gulp.spritesmith'),
	uglify = require('gulp-uglify'), // минификатор
	csso = require('gulp-csso'),
	concat = require('gulp-concat'); // Склейка файлов
	ts = require('gulp-typescript');

// Локальный сервер
gulp.task('webserver', function() {
	gulp.src('public')
		.pipe(webserver({
			host: 'localhost', // Если нужен сервер в сети ставьте 0.0.0.0 localhost
			// host: '192.168.120.213', // Если нужен сервер в сети ставьте 0.0.0.0 localhost
			port: 3003,
			livereload: true,
			//open: "/index.html"
		}));
});

// Пути к файлам
path = {
	html: {
		source: ['./dev/**/*.jade', './dev/layouts/*.jade', './dev/layouts/**/*.jade'],
		watch: './dev/**/*.jade',
		destination: './public/',
		basedir: './dev'
	},
	css: {
		source: ['./dev/css/layout.styl','./dev/css/lib/**/*.styl'],
		watch: './dev/**/*.styl',
		destination: './public/assets/css/',
		distribution:'css.css',
		sourseMap: './dev/css'
	},
	img: {
		source: './dev/img/**/*.{jpg,jpeg,png,gif,svg}',
		watch: './dev/img/**/*',
		destination: './public/assets/img'
	},
	js: {
		source: ['./dev/js/**/*.js', './dev/js/*.js'],
		watch: './dev/js/**/*.js',
		destination: './public/assets/js'
	},
	ts: {
		source: ['./dev/js/**/*.ts', './dev/js/*.ts'],
		watch: './dev/js/**/*.ts',
		destination: './public/assets/js'
	},
	sprite: {
		source: './dev/img/sprite/*.png',
		icons: './dev/img/',
		style: './dev/css/',
		watch: './dev/img/sprite/*',

	}
};

// Собираем JS
gulp.task('js', function() {
	gulp.src(path.js.source)
		//  	.pipe(concat('init.min.js'))
		// .pipe(uglify())
		.pipe(gulp.dest(path.js.destination));
});

// Собираем typeScript
gulp.task('ts', function() {
	gulp.src(path.ts.source)
 	// 	.pipe(concat('init.min.js'))
		.pipe(ts({
				target: 'ES5',
				declaration: true,
				noExternalResolve: true
		}))
		// .pipe(uglify())
		.pipe(gulp.dest(path.ts.destination));
});


// стпрайты
gulp.task('sprite', function() {
	var spriteData = gulp.src(path.sprite.source)
		.pipe(spritesmith({
			algorithm: 'binary-tree',
			imgName: '../img/sprite.png',
			cssName: 'sprite.styl',
		}));

	spriteData.img.pipe(gulp.dest(path.sprite.icons)); // путь, куда сохраняем картинку
	spriteData.css.pipe(gulp.dest(path.sprite.style)); // путь, куда сохраняем стили
});

// --- Собираем Stylus ---//

// налик
gulp.task('stylus', function() {
	gulp.src(path.css.source)
		.pipe(stylus())
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ie 10', 'ie 11', 'ie 12', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(concat(path.css.distribution)) // file views
		//.pipe(csso())
		.pipe(gulp.dest(path.css.destination)); // out place
});


// --- END Собираем Stylus ---//

// Собираем html из Jade
gulp.task('jade', function() {
	gulp.src(path.html.source)
		.pipe(jade({
			jade: jadeOrig,
			pretty: '\t',
			basedir: path.html.basedir,
			data: gulp.src(['users.json'])
		}))
		.pipe(gulp.dest(path.html.destination));
});

gulp.task('fonts', function() {
    gulp.src(['./dev/fonts/**/*', './dev/fonts/*'])
        .pipe(gulp.dest('./public/assets/fonts'));
});

//Копируем изображения и сразу их обновляем
gulp.task('img', function() {
	gulp.src('dev/img/**/*')
		.pipe(imagemin())
		.pipe(gulp.dest('public/assets/img'));
});

// Watch Task
gulp.task('watch', function() {
	livereload.listen();
	gulp.watch(path.sprite.watch, ['sprite']).on('change', livereload.changed);
	gulp.watch(path.img.watch, ['img']).on('change', livereload.changed);
	gulp.watch(path.html.watch, ['jade']).on('change', livereload.changed);
	gulp.watch(path.js.watch, ['js']).on('change', livereload.changed);
	gulp.watch(path.ts.watch, ['ts']).on('change', livereload.changed);
	gulp.watch(path.css.watch, ['stylus']).on('change', livereload.changed);
});

gulp.task("build", ['sprite', 'img', 'jade', 'fonts', 'js', 'ts','stylus']);
// Default Task
gulp.task("default", ['build', 'watch']);

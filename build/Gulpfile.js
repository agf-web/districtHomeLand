var gulp = require("gulp");
var clean = require("gulp-clean");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mq4HoverShim = require("mq4-hover-shim");
var rimraf = require("rimraf").sync;
var browser = require("browser-sync");
var panini = require("panini");
var concat = require("gulp-concat");
var port = process.env.SERVER_PORT || 8080;
var nodepath = "node_modules/";

// Starts a BrowerSync instance
gulp.task("server", ["build"], function() {
  browser.init({ server: "./dist", port: port });
});

// Watch files for changes
gulp.task("watch", function() {
  gulp.watch("scss/**/*", ["compile-sass", browser.reload]);
  gulp.watch("html/pages/**/*", ["compile-html"]);
  gulp.watch(
    ["html/{layouts,includes,helpers,data}/**/*"],
    ["compile-html:reset", "compile-html"]
  );
});

// Erases the dist folder
gulp.task("clean", function() {
  rimraf("dist");
});

var sassOptions = {
  errLogToConsole: true,
  outputStyle: "expanded",
  includePaths: [nodepath + "bootstrap/scss/"]
};

gulp.task("compile-sass", function() {
  var processors = [
    mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: ".bs-true-hover " }),
    autoprefixer({
      browsers: [
        "Chrome >= 45",
        "Firefox ESR",
        "Edge >= 12",
        "Explorer >= 10",
        "iOS >= 9",
        "Safari >= 9",
        "Android >= 4.4",
        "Opera >= 30"
      ]
    }) //,
    //cssnano(),
  ];
  return gulp
    .src("./scss/app.scss")
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on("error", sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/css/"));
});

gulp.task("compile-html", function() {
  gulp
    .src("html/pages/**/*.html")
    .pipe(
      panini({
        root: "html/pages/",
        layouts: "html/layouts/",
        partials: "html/includes/",
        helpers: "html/helpers/",
        data: "html/data/"
      })
    )
    .pipe(gulp.dest("dist"))
    .on("finish", browser.reload);
});

gulp.task("compile-html:reset", function(done) {
  panini.refresh();
  done();
});

// Copy assets
gulp.task("copy", function() {
    gulp.src(["assets/**/*"]).pipe(gulp.dest("dist"));
});


gulp.task("build", [
  "clean",
  "compile-sass",
  "compile-html",
  "copy"
]);
gulp.task("default", ["server", "watch"]);

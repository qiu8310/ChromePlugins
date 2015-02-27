module.exports = (grunt) ->

  require('jit-grunt')(grunt)
  require('time-grunt')(grunt)

  defaultAppName = if /--appName=(\w+)/.test(process.argv.join(',')) then RegExp.$1 else 'fantasy'

  showAppName = () -> grunt.log.subhead("\r\n============= App Name: " + defaultAppName + ' =============')
  updateAppName = (appName) ->
    if appName and appName != defaultAppName
      showAppName()
      compassOption = grunt.config('compass.app.options')
      compassOption[key] = val.replace(/^apps\/\w+/, 'apps/' + appName) for own key, val of compassOption
      defaultAppName = appName
      grunt.config('compass.app.options', compassOption);
      return true
    return false

  showAppName()

  grunt.initConfig
    watch:
      grunt:
        options: { reload: true }
        files: [ 'Gruntfile.coffee']

      js:
        options: { atBegin: true }
        files: ['apps/*/scripts/*/{,*/}*.js']
        tasks: ['browserify:apps']

      css:
        options: { spawn: false } # 不能在子程序中，否则无法在 event 触发后执行 grunt.task.run
        files: ['apps/*/assets/sass/{,*/}*.*', 'sass-lib/**/*.*']

    bowerInstall:
      apps:
        src: [ 'apps/*/*.html' ]

    compass:
      options:
        require: [ 'ceaser-easing' ] # easings.net/zh-cn 缓动库，用 github.com/postcss/postcss-easings 替代
        importPath: 'sass-lib'
        outputStyle: 'nested'  #`nested`, `expanded`, `compact`, `compressed`
        noLineComments: true
        debugInfo: false

        httpImagesPath: '../images'
        httpGeneratedImagesPath: '../images/gen'
        httpFontsPath: '../fonts'
        relativeAssets: false
        assetCacheBuster: false
        raw: 'Sass::Script::Number.precision = 10\n'

      app: (() ->
        options:
          sassDir: 'apps/' + defaultAppName + '/assets/sass'
          cssDir: 'apps/' + defaultAppName + '/assets/css'
          imagesDir: 'apps/' + defaultAppName + '/assets/images'
          generatedImagesDir: 'apps/' + defaultAppName + '/assets/images/gen'
          fontsDir: 'apps/' + defaultAppName + '/assets/fonts'
      )()

    postcss:
      options:
        map: true,
        processors: [
          require('autoprefixer-core')({browsers: 'Chrome >= 24'})
        ]
      apps:
        files: [{
          expand: true
          src: 'apps/*/assets/css/*.css'
          dest: ''
          rename: (dest, src) -> src
        }]


    browserify:
      options:
        browserifyOptions:
          debug: true
        transform: [
          ['babelify', {modules: 'common'}] # 指定命令的参数
        ]
        # sourceMap: true # for babel
      apps:
        files: [{
          expand: true
          cwd: 'apps'
          src: '*/scripts/*/index.js'
          dest: ''
          rename: (dest, src) -> 'apps/'+ src.substring(0, src.lastIndexOf('/')) + '.js'
        }]




  grunt.registerTask 'css', ['compass:app', 'postcss:apps']

  grunt.event.on 'watch', (action, filepath, target) ->
    if target == 'css'
      updateAppName(if /apps\/(\w+)\/assets/.test(filepath) then RegExp.$1 else false)
      grunt.task.run 'css';

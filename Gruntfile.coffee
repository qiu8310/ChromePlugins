module.exports = (grunt) ->

  require('time-grunt')(grunt)
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  })({
    loadTasks: 'plugins/grunt/tasks'
  })


  requireDataFileSafily = (file) -> if grunt.file.exists(file) then require(file) else {}


  defaultAppName = grunt.option('appName') || grunt.option('app-name') || 'fantasy'
  grunt.log.subhead("\r\n============= App Name: " + defaultAppName + ' =============')

  grunt.initConfig
    appName: defaultAppName

    watch:
      grunt:
        files: [ 'Gruntfile.coffee']

      bower:
        files: ['apps/<%=appName%>/bower.json'],
        tasks: ['bower']
      js:
        files: ['apps/<%=appName%>/scripts/{,*/}*.js']
        tasks: ['js']

      css:
        files: ['apps/<%=appName%>/styles/{,*/}*.*', 'compass_lib/{,*/}*.*', '!compass_lib/vendors']
        tasks: ['css']

      html:
        files: ['apps/<%=appName%>/{,views/}*.jade']
        tasks: ['html']

      image:
        files: ['apps/<%=appName%>/images/{,*/}*.*', '!<%=appName%>/images/sp_*/*.*']
        tasks: ['copy:app']


    bowerBundle:
      app:
        bowerDir: 'apps/<%=appName%>'
        installDir: 'dists/<%=appName%>'
        src: 'apps/<%=appName%>/*.jade'

    jade:
      options:
        pretty: true
        data: requireDataFileSafily('./' + defaultAppName + '/jade_data.js')
      app:
        files: [{
          expand: true
          cwd: 'apps'
          dest: 'dists'
          ext: '.html'
          src: ['<%=appName%>/*.jade']
        }]

    compass:
      options:
        require: [
          './plugins/sass/functions.rb'
          # 'ceaser-easing' # easings.net/zh-cn 缓动库，用 github.com/postcss/postcss-easings 替代
        ]
        importPath: 'compass_lib'
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
          sassDir: 'apps/<%=appName%>/styles'
          cssDir: 'dists/<%=appName%>/styles'
          imagesDir: 'apps/<%=appName%>/images'
          generatedImagesDir: 'dist/<%=appName%>/images/gen'
      )()

    postcss:
      options:
        map: true,
        processors: [
          require('autoprefixer-core')({browsers: 'Chrome >= 24'})
        ]
      app:
        files: [{
          expand: true
          src: 'dists/<%=appName%>/styles/*.css'
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
      app:
        files: [{
          expand: true
          cwd: 'apps'
          src: '<%=appName%>/scripts/*.js'
          dest: 'dists'
        }]

    clean:
      all: ['dists/<%=appName%>', '.tmp']
      js: 'dists/<%=appName%>/scripts'
      css: 'dists/<%=appName%>/styles'
      html: 'dists/<%=appName%>/*.html'

    copy:
      app:
        files: [{
          expand: true
          cwd: 'apps'
          dest: 'dists'
          src: [
            '<%=appName%>/_locales/**/*.*'
            '<%=appName%>/images/{,*/}*.*'
            '!<%=appName%>/images/sp_*/*.*'
            '<%=appName%>/manifest.json'
          ]
        }]


  grunt.registerTask 'bower', ['bowerBundle', 'html']
  grunt.registerTask 'js', ['clean:js', 'browserify:app']
  grunt.registerTask 'css', ['clean:css', 'compass:app', 'postcss:app']
  grunt.registerTask 'html', ['clean:html', 'jade:app']
  grunt.registerTask 'default', ['clean:all', 'copy:app', 'js', 'css', 'bower', 'watch']

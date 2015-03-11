module.exports = function(grunt) {
  // css <= htmls (options: files, alias)

  grunt.registerMultiTask( 'cssInject', 'Auto inject style to your specified css file according to your html\'s class attribute', function() {

    // options
    var options = this.options({
      injectableFiles: false, // 指定可供导入的文件
      injectPos: 'top',  // 插入的位置，支持 top, bottom
      inspectAttr: 'data-ci-class' // 默认检查 data-ci-class 中的类名
    }),
      aliasMap = {
        fs: 'font-size',
        lh: 'line-height',

        w: 'width',
        h: 'height',
        size: 'width height',

        dl: 'left',
        dr: 'right',
        dt: 'top',
        db: 'bottom',

        m: 'margin',
        mt: 'margin-top',
        mb: 'margin-bottom',
        ml: 'margin-left',
        mr: 'margin-right',
        mtb: 'margin-top margin-bottom',

        p: 'padding',
        pt: 'padding-top',
        pb: 'padding-bottom',
        pl: 'padding-left',
        pr: 'padding-right',
        ptb: 'padding-top padding-bottom',

        mp: 'margin padding',
        mpt: 'margin-top padding-top',
        mpb: 'margin-bottom padding-bottom',
        mpl: 'margin-left padding-left',
        mpr: 'margin-right padding-right'
      },
      classContentMap; // 用户定义的所有 class 名称及其内容


    var regLineSep = /[\r\n]/g,
      regComment = /\/\*.*?\*\//g,
      regSpace = /\s+/,
      regTag = new RegExp('<[^>]+\\s(?:class|' + options.inspectAttr + ')\\s*=[^>]+>', 'gi'),
      regClass = /\s(?:class)\s*=\s*["']([^"']+)["']/i,
      regCustomClass = new RegExp('\\s(?:' + options.inspectAttr + ')\\s*=\\s*["\']([^"\']+)["\']', 'i');


    // 获取 html 文件中的所有 class
    // 一次处理一个文件
    function getHtmlClasses(file) {
      var content = grunt.file.read(file), result = [];

      // 去掉换行符
      content = content.replace(regLineSep, ' ');

      // 匹配标签
      var matches = content.match(regTag);
      if (matches) {
        matches.forEach(function(tag) {
          // 获取 tag 中的 class
          [regClass, regCustomClass].forEach(function(reg) {
            var classes = tag.match(reg);
            if (classes) {
              classes = classes[1].trim().split(regSpace);
              result = result.concat(classes);
            }
          });
        });
      }

      return result;
    }


    // 获取 css 文件中的所有 class 名称， 并关联 class 内容
    // 同时处理多个文件
    // TODO 支持 SASS
    function getCssClasses(injectableFiles) {
      var classMap = {};

      [].concat(injectableFiles).forEach(function (file) {
        var content = grunt.file.read(file);

        // 去掉换行（@FIXED 在不去掉换行的情况下直接去掉注释，通过把 . 换成 \s\S ）
        content = content.replace(regLineSep, '');

        // 去掉注释
        content = content.replace(regComment, '');


        // 匹配一个个的 class
        var matches = content.match(/[\w\- ]*?\..*?\s*\{.*?\}/g);
        if (matches) {
          matches.forEach(function(styleRule) {
            // 得到类名
            var className = styleRule.match(/\.([\w\-]+)/);
            className = className[1];

            // 组装
            if (className in classMap) {
              classMap[className] += ' ' + styleRule;
            } else {
              classMap[className] = styleRule;
            }

          });
        }

      });

      return classMap;
    }



    // 注入 class 到指定的文件
    function injectToFile(content, destFile) {
      var destContent = grunt.file.read(destFile);

      var tplStart = '/**** CSS Inject Start ****/\n',
        tplEnd = '\n/**** CSS Inject End ****/';

      // 删除上次注入的
      var startIndex = destContent.indexOf(tplStart),
        endIndex = destContent.indexOf(tplEnd);
      if (startIndex >= 0 && endIndex >= 0) {
        destContent = destContent.substr(0, startIndex) + destContent.substr(endIndex + tplEnd.length);
      }

      // 插入新的
      content = tplStart + content + tplEnd;
      destContent = options.injectPos === 'bottom' ? destContent + content : content + destContent;
      

      grunt.file.write(destFile, destContent);
      grunt.log.ok('write to ' + destFile + ' ok');

    }



    var classMap = {};
    if (options.injectableFiles) {
      getCssClasses(grunt.file.expand(options.injectableFiles));
    }


    function getClassRules(cls) {
      if (cls in classMap) {
        return classMap[cls];

      } else if (/([a-zA-Z_-]+)([0-9]+)/.test(cls)) {
        var alias = RegExp.$1, result,
          val = RegExp.$2 !== '0' ? RegExp.$2 + 'px' : '0';

        if (alias in aliasMap) {
          result = '.' + cls + '{';
          aliasMap[alias].split(/\s+/).forEach(function(attr) {
            result += attr + ': ' +  val + ';';
          });
          return result + '}';
        }
      }
    }


    this.files.forEach(function(f) {
      var cache = {}, content = [], rule;
      f.src.forEach(function(file) {
        getHtmlClasses(file).forEach(function(cls) {
          if (!(cls in cache)) {
            cache[cls] = true;
            rule = getClassRules(cls);
            if (rule) {
              content.push(rule);
            }
          }
        });
      });

      injectToFile(content.join('\n'), f.dest);
    });
  });
};
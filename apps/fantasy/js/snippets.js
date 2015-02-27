"use strict";
console.$ = function () {
	var helps = {
		// 用中文在 GBK 环境下会乱码
		aboveTheFolderCSS: 'print above the folder css rules',
		save: 		'(data, filename) -> void; Save data to a file',
		markdown: 	'() -> void; Markdown element with attribute data-markdown',
		allColors: 	'() -> void; Show all colors in this page (backgound-color, color, border-color)',
		cssReload: 	'() -> void;',
		toDataURL: 	'([elem]) -> void; Make canvas, img or elem to DataURL',
		closestHashLink: '(elem) -> void; Find the nearest hashlink to elem',
		showHeaders:'([url]) -> void; Show request headers',
		queryString:'([url]) -> void; Show query string',
		cookie: 	'(key [, value [, expire [, domain [, path [, secure]]]]]) -> void;',
		loadJquery: '() -> void; Load jQuery to the site',
	};

	var key, funcKey, doc, parts, docFunc, docDesc;
	console.group('CONSOLE SNIPPETS');
	for (key in helps) {
		// 注入到全局变量中
		funcKey = '$' + key;
		if (console[funcKey] && !window[funcKey]) window[funcKey] = console[funcKey];

		// 输出帮助
		doc = helps[key];
		parts = doc.split(';');
		docFunc = parts.shift().trim();
		docDesc = parts.join(';').trim();
		console.groupCollapsed(key);
		console.log('%c ' + docFunc, 'color: #444');
		if (docDesc) {
			console.log('%c ' + docDesc, 'color: green');
		}
		console.groupEnd(key);
	}
	console.groupEnd('CONSOLE SNIPPETS');
};


/**
 *	更多资源 http://css-tricks.com/authoring-critical-fold-css/
 */
console.$aboveTheFolderCSS = function() {
  var CSSCriticalPath = function(w, d, opts) {
    var opt = opts || {};
    var css = {};
    var pushCSS = function(r) {
      if(!!css[r.selectorText] === false) css[r.selectorText] = {};
      var styles = r.style.cssText.split(/;(?![A-Za-z0-9])/);
      for(var i = 0; i < styles.length; i++) {
        if(!!styles[i] === false) continue;
        var pair = styles[i].split(": ");
        pair[0] = pair[0].trim();
        pair[1] = pair[1].trim();
        css[r.selectorText][pair[0]] = pair[1];
      }
    };

    var parseTree = function() {
      // Get a list of all the elements in the view.
      var height = w.innerHeight;
      var walker = d.createTreeWalker(d, NodeFilter.SHOW_ELEMENT, function(node) { return NodeFilter.FILTER_ACCEPT; }, true);

      while(walker.nextNode()) {
        var node = walker.currentNode;
        var rect = node.getBoundingClientRect();
        if(rect.top < height || opt.scanFullPage) {
          var rules = w.getMatchedCSSRules(node);
          if(!!rules) {
            for(var r = 0; r < rules.length; r++) {
              pushCSS(rules[r]);
            }
          }
        }
      }
    };

    this.generateCSS = function() {
      var finalCSS = "";
      for(var k in css) {
        finalCSS += k + " { ";
        for(var j in css[k]) {
          finalCSS += j + ": " + css[k][j] + "; ";
        }
        finalCSS += "}\n";
      }

      return finalCSS;
    };

    parseTree();
  };
  var cp = new CSSCriticalPath(window, document);
  var css = cp.generateCSS();
  console.log(css);
};


/**
 *	加载 jQuery 库
 */
console.$loadJquery = function () {
	var s = document.createElement('script');
	s.src = 'http://code.jquery.com/jquery-latest.js'
	document.getElementsByTagName('head')[0].appendChild(s);
}

/**
 *	通过 console.save 来下载文件
 * 	Reference: http://bgrins.github.io/devtools-snippets/#console-save
 */
console.$save = function (data, filename) {
	if(!data) {
		console.error('Console.save: No data')
		return;
	}

	if(!filename) filename = 'console.json'

	if(typeof data === "object"){
		data = JSON.stringify(data, undefined, 4)
	}

	var blob = new Blob([data], {type: 'text/json'}),
	e = document.createEvent('MouseEvents'),
	a = document.createElement('a')

	a.download = filename
	a.href = window.URL.createObjectURL(blob)
	a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
	a.dispatchEvent(e)
};


/**
 * 	@name Use Markdown, sometimes, in your HTML.
 * 	@author Paul Irish <http://paulirish.com/>
 *	@link https://gist.github.com/paulirish/1343518
 * 	@link markdown https://github.com/coreyti/showdown
 * 	@match *
 */
console.$markdown = function () {
	if (!window.Showdown){
		var scr = document.createElement('script');
		scr.onload = console.$markdown;
		scr.src = 'https://raw.github.com/coreyti/showdown/master/src/showdown.js';
		document.getElementsByTagName('head')[0].appendChild(scr);
		return;
	}

	[].forEach.call( document.querySelectorAll('[data-markdown]'), function  fn(elem){
		// strip leading whitespace so it isn't evaluated as code
		var text      = elem.innerHTML.replace(/\n\s*\n/g,'\n'),
		// set indentation level so your markdown can be indented within your HTML
		leadingws = text.match(/^\n?(\s*)/)[1].length,
		regex     = new RegExp('\\n?\\s{' + leadingws + '}','g'),
		md        = text.replace(regex,'\n'),
		html      = (new Showdown.converter()).makeHtml(md);

		// here, have sum HTML
		elem.innerHTML = html;
	});
};


/**
 *	获取当前页面使用的所有颜色
 * 	Reference: http://bgrins.github.io/devtools-snippets/#allcolors
 */
console.$allColors = function () {
	var allColors = {},
		props = [
			"background-color",
			"color",
			"border-top-color",
			"border-right-color",
			"border-bottom-color",
			"border-left-color"
		],
		skipColors = {
			"rgb(0, 0, 0)": 1,
			"rgba(0, 0, 0, 0)": 1,
			"rgb(255, 255, 255)": 1
		};

	[].forEach.call(document.querySelectorAll("*"), function (node) {
		var nodeColors = {};
		props.forEach(function (prop) {
			var color = window.getComputedStyle(node, null).getPropertyValue(prop);
			if (color && !skipColors[color]) {
				if (!allColors[color]) {
					allColors[color] = {count: 0,nodes: []};
				}
				if (!nodeColors[color]) {
					allColors[color].count++;
					allColors[color].nodes.push(node);
				}
				nodeColors[color] = true;
			}
		});
	});

	var allColorsSorted = [];
	for (var i in allColors) {
		allColorsSorted.push({key: i, value: allColors[i]});
	}
	allColorsSorted = allColorsSorted.sort(function (a, b) {
		return b.value.count - a.value.count;
	});

	var nameStyle = "font-weight:normal;";
	var countStyle = "font-weight:bold;";
	var colorStyle = function (color) {
		return "background:" + color + ";color:" + color + ";border:1px solid #333;";
	};

	console.group("All colors used in elements on the page");
	allColorsSorted.forEach(function (c) {
		console.groupCollapsed("%c    %c " + c.key + " %c(" + c.value.count + " times)", colorStyle(c.key), nameStyle, countStyle);
		c.value.nodes.forEach(function (node) {
			console.log(node);
		});
		console.groupEnd();
	});
	console.groupEnd("All colors used in elements on the page");
};


/**
 *	重新拉取 CSS 文件
 *	Reference: https://github.com/bgrins/devtools-snippets/tree/master/snippets/cssreload/cssreload.js
 *	到时候
 */
console.$cssReload = function () {
	function insertAfter (newElem, targetElem) {
		var parent = targetElem.parentNode;
		if (parent.lastChild == targetElem) {
			parent.appendChild(newElem);
		} else {
			parent.insertBefore(newElem, targetElem.nextSibling);
		}
	}

	function reloadSytleSheet (styleSheet) {
		var elem = styleSheet.ownerNode,
			clone= elem.cloneNode(false);

			clone.href = addRandomToUrl(clone.href);
			clone.addEventListener("load", function () {
				if (elem.parentNode) {
					elem.parentNode.removeChild(elem);
				}
			});
			insertAfter(clone, elem);
	}

	function addRandomToUrl (url) {
		// prevent CSS caching
		var hasRnd = /([?&])_=[^&]*/,
			hasQueryString = /\?/,
			hasHash = /(.+)#(.+)/,
			hash = null,
			rnd = Math.random();

		var hashMatches = url.match(hasHash);
		if (hashMatches) {
			url = hashMatches[1];
			hash = hashMatches[2];
		}

		url = hasRnd.test(url)
				? url.replace(hasRnd, "$1_=" + rnd)
				: url + (hasQueryString.test(url) ? "&" : "?") + "_=" + rnd;

		if (hash) url += '#' + hash;

		return url;
	}

	[].forEach.call(document.styleSheets, function (styleSheet) {
		if (!styleSheet.href) return ;
		reloadSytleSheet(styleSheet);
	})
};


/**
 *	将网页内的图片转化成 Data URL（只支持同域名下的图片）
 *	Reference: https://github.com/bgrins/devtools-snippets/tree/master/snippets/dataurl/dataurl.js
 *
 */
console.$toDataURL = function (elem) {

	var _toDataURL = function (imgOrCanvas) {
		var cvs, img, ctx, isCanvas = imgOrCanvas.tagName === 'CANVAS';
		if (isCanvas) {
			cvs = imgOrCanvas;
		} else {
			img = imgOrCanvas;
			cvs = document.createElement('canvas');
			ctx = cvs.getContext('2d');
			cvs.width = img.width;
			cvs.height = img.height;
		}

		try {
			img && ctx.drawImage(img, 0, 0);
			console.log(imgOrCanvas, cvs.toDataURL());
		} catch (e) {
			console.log(imgOrCanvas, 'No Permission - try opening this image in a new tab and running the snippet again?');
		}
	}

	console.group('Data URLs');
	if (elem && elem.tagName === 'IMG') {
		_toDataURL(elem);
	} else {
		[].forEach.call(document.querySelectorAll('img'), function (it) {
			_toDataURL(it)
		});
	}
	console.groupEnd('Data URLs');
};

/**
 *	向上查找返回一个最近的 hashLink，方便分享给其它人
 *	Reference: https://github.com/bgrins/devtools-snippets/tree/master/snippets/hashlink/hashlink.js
 */
console.$closestHashLink = function (node) {
	var id, url;
	while (node != null) {
		if (node.tagName === 'A' && node.name) {
			id = node.name;
			break;
		}

		if (node.id) {
			id = node.id;
			break;
		}
		node = node.parentNode;
	}

	url = window.location.origin
		+ window.location.pathname
		+ window.location.search;

	if (typeof id === 'undefined') {
		console.log("No ID Found - closest anchor: " +  url);
	} else {
		url = url + '#' + id;
		console.log('Closest linkable url ' + url);
	}
};


/**
 *	显示当前 URL 请求的头部
 *	Reference: http://bgrins.github.io/devtools-snippets/#showheaders
 */
console.$showHeaders = function (url) {
	url = url || location.href;
	var req = new XMLHttpRequest();
	req.open('HEAD', url, false);
	req .send(null);

	var headers, tab;
	headers = req.getAllResponseHeaders();
	tab = headers.split('\n').map(function (h) {
		return {'key':h.split(': ')[0], 'value':h.split(': ')[1] };
	}).filter(function (h) { return typeof h.value !== 'undefined'; });

	console.table(tab);
};


/**
 *	获取 URL 的查询字符串
 */
console.$queryString = function (url) {
	var query, tab, mat;
	url = url || location.href ;
	if (mat = url.match(/\?([^#]+)/)) {
		query = mat[1].split('&').forEach(function (v) {
			tab = tab || {};
			v = v.split('=');
			tab[v[0]] = {'value': v[1]};
		});
	}
	if (!tab) {
		console.log('No query string');
		return false;
	} else {
		console.table(tab);
	}
};


/**
 *	Cookie 操作
 * 	Reference https://github.com/carhartl/jquery-cookie/blob/master/jquery.cookie.js
 */
console.$cookie = function (key, val, expire, domain, path, secure) {
	var tab = {}, cookies, cookie;
	// 显示所有 Cookie
	if (typeof key === 'undefined') {
		tab = {},
		cookies = document.cookie ? document.cookie.split('; ') : [];
		cookies.forEach(function (it) {
			var k, v, parts = it.split('=');
			k = parts.shift();
			v = parts.join('=');
			try {
				tab[k] = {'value': decodeURIComponent(v)};
			} catch (e) {
				tab[k] = v;
			}
		});
		console.table(tab);

	// 显示某一个 Cookie
	} else if (typeof val === 'undefined') {
		var reg = new RegExp('(?:^|; )' + key + '=([^;]*)');
		if ((document.cookie || '').match(reg)) {
			try {
				tab[key] = {'value': decodeURIComponent(RegExp.$1) }
			} catch (e) {
				tab[key] = {'value': RegExp.$1 }
			}
			console.table(tab);
		} else {
			console.log('Not find cookie ' + key);
		}

	// 设置 Cookie
	} else {
		cookie = key + '=' + encodeURIComponent(val);

		cookie += '; path=' + (path ? path : '/'); // 如果这里不设置，path 默认是当前路径
		if (domain) cookie += '; domain=' + domain;
		if (expire) cookie += '; expires=' + new Date(Date.now() + expire * 1000).toUTCString();
		if (secure) cookie += '; secure';

		document.cookie = cookie;
	}
};


// 初始化
!function () {
	console.$();
}();

/**
 *	常量定义
 */
const
	DEBUG  = false,	// 是否开启调试模式
	EXT_ID = chrome.i18n.getMessage('@@extension_id'); // 获取当前扩展的ID，参考：http://developer.chrome.com/extensions/i18n.html#overview-predefined


/**
 * 	Emulate `unsafeWindow` in browsers that don’t support it.
 * 	Reference: 	https://gist.github.com/mathiasbynens/1143845
 * 				http://wiki.greasespot.net/XPCNativeWrapper
 * 				https://developer.mozilla.org/en-US/docs/XPCNativeWrapper
 */
/*
window.unsafeWindow || (
	window.unsafeWindow = (function() {
		//var el = document.createElement('p');
		//el.setAttribute('onclick', 'return window;');
		//return el.onclick();
	}())
);
*/

/**
 *	常用函数集
 */
var util = (function () {
	var util = {
		/**
		 *	调试模式
		 */
		debug : DEBUG,

		/**
		 *	事件绑定，暂不提供解绑函数（解绑需要将所有的 handler 保存起来）
		 */
		bindEvent: function (obj, type, func, scope) {
			if(typeof obj === 'string') obj = document.querySelector(obj);
			function handler (e) {
				e = e || window.event;
				if (!e.target){
					e.target = e.srcElement;
					e.preventDefault = function(){
						this.returnValue = false;
					};
					e.stopPropagation = function(){
						this.cancelBubble = true;
					};
				}
				func.call(scope || this, e);
			};

			// 建议不要一议性监听多个组件，可以监听它们的共同父元素，再来判断是哪个具体子元素，除非是些不冒泡的事件
			if(toString(obj) === '[object NodeList]') {
				for (var i=0, l=obj.length; i<l; ++i) {
					util.bindEvent(obj[i], type, handler);
				}
			} else if (obj) {
				if (obj.attachEvent) {
					obj.attachEvent('on' + type, handler);
				} else if (obj.addEventListener) {
					obj.addEventListener(type, handler, false);
				}
			}
		},

		/**
		 *	动态加载 JS，支持加载完的回调
		 */
		loadScript: function (url, cb) {
			var script = document.createElement('script'), done = false;
			if (util.debug) url += (url.indexOf('?') > 0 ? '&' : '?') + '__v=' + (+new Date());
			// script.type = 'application/javascript;version=1.7';
			script.type = 'application/javascript';
			script.src = url;
			util.log('Start loading script ' + url);
			script.onload = script.onreadystatechange = function () {
				if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
					done = true;
					util.log('Finish loading script ' + url);
					if (typeof cb === 'function') cb();
					script.onload = script.onreadystatechange = null;
					script.parentNode.removeChild(script);
				}
			}
			document.getElementsByTagName('head')[0].appendChild(script);
			return script;
		},

		/**
		 *	调试信息
		 */
		log: function (msg, level) {
			if (!util.debug) return false;
			if ( ['error', 'info', 'warn', 'debug'].indexOf(level) === -1 ) level = 'debug';

			if (typeof msg === 'function') msg();
			else console[level](msg);
		}
	};

	return util;
})();


/**
 *  Key Event
 *  David Flanagan 《JavaScript: The Definitive Guide》
 *
 *  Example: 	keyEvent.bind(ele, {'Ctrl+R': handlerFunc1, 'Ctrl+Shift+D': handlerFunc2});
 * 	handlerFunction return 1: preventDefault, return 2: stopPropagation, return 3: both;
 *
 */
var keyEvent = (function(){
	var maps = {},
		keyCodeToFunctionKey = {
			8: "backspace", 9: "tab", 13: "return", 19:'pause', 27: "escape", 32: "space",
			33: "pageup", 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up",
			39:'right', 40:'down', 44:'printscreen', 45:'insert', 46:'delete',
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7",
			119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12",144: "numlock", 145: "scrolllock"
		},
		 keyCodeToPrintableChar = {
			48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 59: ";", 61: "=",
			65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m",
			78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z",
			107: "+", 109: "-", 110: ".", 188: ",", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "\""
		};
	function bind (element, obj) {
		if (typeof obj === 'undefined') { obj=element; element=window.document; }
		for (var i in obj) {
			if(typeof obj[i] !== 'function') continue;
			// 将用户输入的按键前缀按 alt+ctrl+shift排序
			var keys, key, keyStr = i.toLowerCase();
			keys = keyStr.split('+');
			key = keys.pop();
			keys.sort().push(key);
			key = keys.join('+');
			maps[key] = obj[i];
		}
		if (element) install(element);
	}
	function unbind(name){
		delete maps[name.toLowerCase()];
	}
	function install(element){
		function handler(e){ return filter(e); }
		util.bindEvent(element, 'keydown', handler);
		util.bindEvent(element, 'keypress', handler);
	}
	/*
	 *  每次按键，一般都会有keydown,keypress全过来，用这个函数来过滤，看用户按下的到底是什么按键
	 *  keydown/deyup 是两个低层的事件，而keypress则属于用户层吧，一般只有在用户按下的键可以打印出来才会触发这个keypress
	 */
	function filter(e){
		var modifiers = '', // 表示 Alt,Ctrl,Shift这些前缀
			keyname = null;	// 键盘上显示的名字
		if(e.type == 'keydown'){
			var code = e.keyCode;
			//  Alt,Ctrl,Shift 按下则忽略
			if(code == 16 || code == 17 || code == 18) return;

			keyname = keyCodeToFunctionKey[code];

			//按下的不是功能键，如果Alt或Ctrl按下了则就把这个键当作功能键
			if (!keyname && (e.altKey || e.ctrlKey))
				keyname = keyCodeToPrintableChar[code];

			if (keyname) {
				if(e.altKey) modifiers += 'alt+';
				if(e.ctrlKey) modifiers += 'ctrl+';
				if(e.shiftKey) modifiers += 'shift+';
			} else {
				return;
			}
		} else if (e.type == 'keypress') {
			// keydown的时候已经处理了这两个键
			if(e.altKey || e.ctrlKey) return;
			// 在Firefox中，不可打印的字符也会触发 keypress 事件，我们要忽略它
			if(e.charCode != undefined && e.charCode == 0) return ;
			// Firefox 把打印的字符的ASCII码保存在 charCode 上，而IE保存在 keyCode上
			var code = e.charCode || e.keyCode;
			keyname = String.fromCharCode(code);
			var lowercase = keyname.toLowerCase();
			if(keyname != lowercase){
				keyname = lowercase;
				modifiers = 'shift+';
			}
		}
		//log(modifiers+keyname)
		var func = maps[modifiers+keyname];
		if(func){
			var target = e.target, r=0;
			r = func(target, modifiers+keyname, e);
			if(r&1) e.preventDefault();
			if(r&2) e.stopPropagation();
		}
	}
	return {
		bind : bind,
		unbind : unbind,
		install : install
	}
})();

/**
 * 加载 snippets 脚本，使得里面的代码可以注入到当前页面
 * 一般在 扩展里定义的变量是没办法在外部页面访问的，所以通过这种方式来注入
 */
// util.loadScript('chrome-extension://' + EXT_ID + '/js/snippets.js');


keyEvent.bind({
	//'Ctrl+Shift+Alt+F': function (target, key, event) {
	//	console.log(target, key, event);
	//}
});
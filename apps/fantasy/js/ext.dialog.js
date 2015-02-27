'use strict';
var ext = ext || {};

(function ($) {
	ext.dialog = ext.dialog || function (opts) { return new dialog(opts); }

	function dialog (opts) {
		var _opts, nope, $context, self = this;

		// jQuery 容器
		this.$context = $context = $('body').eq(0);

		// 一个空函数
		nope = function () {};

		// 默认配置
		this.options = _opts = $.extend({
			lock : 		true,
			title :		'title',
			content : 	'here is content',
			width : 	300,
			height : 	0,
			time : 		0,
			padding : 	'20px 25px',
			zIndex : 	'9999',
			beforeLoad : 	nope,
			afterLoad : 	nope,
			beforeUnload : 	nope,
			afterUnload : 	nope,
			buttons : {
				ok: {
					name: '知道了',
					handler: function () {}
				}
			}
			
		}, opts || {});

		this.__init = true;
		_opts.beforeLoad.call(this);

		var btn, btnKey, btnStr = [];
		for (btnKey in _opts.buttons) {
			btn = _opts.buttons[btnKey];
			btnStr.push('<div class="ext-btn ext-btn-'+btnKey+'" id="ext-btn-'+btnKey+'">'+btn.name+'</div>');
		}

		this.lock(_opts.lock);
		this.$content = $('<div class="ext-dialog">'
							+ '<div class="ext-header">'
								+ '<h1>'+this.title()+'</h1>'
								+ '<a class="ext-icon-close">x</a>'
							+ '</div>'
							+ '<div class="ext-body">'
								+ '<div class="ext-wrap">'
									+ '<div class="ext-content">'
										+ this.content()
									+ '</div>'
									+ '<div class="ext-btns">'
										+ btnStr.join('')
									+ '</div>'
								+ '</div>'
							+ '</div>'
						+ '</div>');

		this.width(_opts.width);
		this.height(_opts.height);
		if (this.options.padding) {
			this.$content.find('.ext-wrap').css('padding', _opts.padding);
		}
		this.time(_opts.time);
		$context.append(this.$content);
		this.$content
			.css({
				'z-index' 	  : _opts.zIndex,
				'margin-left' : '-' + (parseInt(this.width(), 10)/2) + 'px',
				'margin-top'  : '-' + (parseInt(this.height(), 10)/2) + 'px'
			})
			.delegate('.ext-btn', 'click', function () {
				var $this = $(this), id = $this.attr('id'), rtn;
				id = id && id.substr('ext-btn-'.length);
				if (self.options.buttons && self.options.buttons[id]) {
					rtn = self.options.buttons[id].handler.call(self);
					if (rtn !== false) self.close();
				}
			})
			.find('.ext-icon-close').on('click', function () {
				self.close();
			});
		this.__init = false;
		_opts.afterUnload.call(this);
	}

	dialog.fn = dialog.prototype = {
		title : 	function (title) {
			if (typeof title === 'undefined') {
				return this.options.title;
			} else {
				this.options.title = '' + title;
				this.$content.find('.ext-header h1').text(title);
			}
		},
		content : 	function (content) {
			if (typeof content === 'undefined') {
				return this.options.content;
			} else {
				this.options.content = '' + content;
				this.$content.find('.ext-content').html(content);
			}
		},
		width : 	function (width) {
			if (typeof width === 'undefined') {
				return this.$content.width();
			} else {
				width = parseInt(width, 10);
				if (width >= 300) {
					this.$content.css('width', width);
					this.options.width = width;
				}
			}
		},
		height : 	function (height) {
			if (typeof height === 'undefined') {
				return this.$content.height();
			} else {
				height = parseInt(height, 10);
				if (height >= 200) {
					this.$content
						.find('.ext-wrap').css('height', height - 42)
						.css('height', height);
					this.options.height = height;
				}
			}
		},
		time : 		function (time) {
			if (time > 0) {
				clearTimeout(this.timer);
				var self = this;
				this.timer = setTimeout(function () {self.close()}, time);
			}
		},
		lock : 		function (locked) {
			locked = typeof locked === 'undefined' ? true : !!locked;

			// 非内部初始化 并且 值已经设置了 
			if (!this.__init && this.options.lock === locked) return ;

			this.options.lock = locked;

			if (locked) {
				this.locker = $('<div style="display:block; z-index:'+(this.options.zIndex-1)+'; position:fixed; top:0; left:0; bottom:0; right:0; background-color: rgba(0, 0, 0, .7);"></div>');
				this.$context.append(this.locker);
			} else {
				this.locker && this.locker.remove();
			}
		},
		close : 	function () {
			this.options.beforeUnload.call(this);
			this.lock(false);
			this.$content && this.$content.remove();
			this.$content = null;
			this.options.afterUnload.call(this);
			this.options = null;
		}
	};



	/**
	 *	页面加载时间， 通过 chrome 自带的 chrome.loadTimes 来得到
	 */
	ext.pageLoadTime = function () {
		var times = chrome && chrome.loadTimes(), list = [];

		if (!times) return ;

		var start = times.startLoadTime, obj = {}, k, d = new Date(Math.round(start*1000));
		obj.startLoadTime 			= [d.getFullYear(),(d.getMonth()+1),d.getDate()].join('/') + ' ' + [d.getHours(),d.getMinutes(),d.getSeconds()].join(':');
		obj.domLoadTime 			= (times.finishDocumentLoadTime  	- start).toFixed(5) + ' s';
		obj.firstPaintTime 			= (times.firstPaintTime  			- start).toFixed(5) + ' s';
		obj.loadTime 				= (times.finishLoadTime  			- start).toFixed(5) + ' s';
		obj.firstPaintAfterLoadTime = (times.firstPaintAfterLoadTime  	- start).toFixed(5) + ' s';

		for (k in obj) {
			if (parseFloat(obj[k]) < 0) obj[k] = ' 未获取到 ';
			list.push('<dt>'+k+' :</dt><dd>'+obj[k]+'</dd>');
		}

		ext.dialog({
			title 	: '页面时间分析',
			width 	: '380',
			content : '<dl>' + list.join('') + '</dl>'
		});
	}

})(Zepto);



document.addEventListener('DOMContentLoaded', function () {

	var BG = chrome.extension.getBackgroundPage(),
		F  = BG.F,	// 获取 background 脚本中的函数
		G  = BG.G;	// 获取 background 脚本中的变量
	

	// TODO 根据 G 中的数据，来判断哪些 menu 哪些应该隐藏，哪些应该显示
	$('#links').delegate('li', 'click', function () {
		var $btn = $(this), id;
		if ($btn.hasClass('disabled')) return false;

		id = $btn.attr('id');
		id = id && id[3] && id[3].toLowerCase() + id.substr(4);
		if (!id) return false;

		switch (id) {
			case 'pageLoadTime':
				chrome.tabs.executeScript(null, {code: "ext.pageLoadTime()"});
				window.close();
			break;
			case 'clearBrowerData':
				clearBrowerDataInit();
				goToPage(id);
			case 'pageQRCode': 
				pageQRCodeInit();
				goToPage(id);
			break;
		}
	});

	// 返回按钮
	$('.btnBack').on('click', function () {
		$(this).closest('#pages').hide().children('div').hide();
		$('#wrapper').show();
		return false;
	});
	// 跳转到指定页面
	function goToPage (id) {
		$('#wrapper').hide();
		$('#pages').show().find('#page' + id[0].toUpperCase() + id.substr(1)).show();
	}


	/**
	 *	pagePageQRCode
	 */
	$('#qrdata input').on('blur', function () {
		var data = $(this).val(), src = $('#qrcode img').attr('src');
			api = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chld=L|4&chl=';
		data = api + encodeURIComponent(data);
		if (src != data) {
			$('#qrcode img').attr('src', data);
		}
	});
	function pageQRCodeInit () {
		chrome.tabs.query({active:true, currentWindow: true}, function (tabs) {
			var url, 
				tab = tabs && tabs[0],
				api = 'https://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chld=L|4&chl=';
			if (tab) {
				url = tab.url;
				$('#qrdata input').val(url);
				$('#qrcode img').attr('src', api + encodeURIComponent(url));
			}
		});
	}


	/**
	 * 	pageClearBrowerData
	 *	data = {Cache: [true, 2], History: [false, 0], Cookies: [true, 8]};
	 */
	;(function () {
		var data = {}, isClearing = 0;
		window.clearBrowerDataInit = function () {
			chrome.storage.sync.get('pageClearBrowerData', function (storageData) {
				data = storageData.pageClearBrowerData || {};
				console.log('storage.sync.get', data);
				$('#pageClearBrowerData li').each(function () {
					var $this 		= $(this), 
						$checkBox 	= $this.find('input[type=checkbox]'),
						$rangeBox 	= $this.find('input[type=range]'),
						type 		= $checkBox.attr('name'), 
						params		= data[type] || [];
				
					var v = params[1] || 1;
					$rangeBox.val(v).prev('label').text('过去' + ['1','4','8'][(v-1) % 3] + ['时','天','月'][Math.floor(v/3)]);
					if (params[0]) {
						$checkBox.attr('checked', 'checked');
						$rangeBox.removeAttr('disabled');
					} else {
						$checkBox.removeAttr('checked');
						$rangeBox.attr('disabled', 'disabled');
					}
				});
			})
		}

		$('#pageClearBrowerData li').each(function () {
			$(this).find('input[type=checkbox]').on('click', function () {
				$(this).is(':checked')
					? $(this).closest('li').find('input[type=range]').removeAttr('disabled')
					: $(this).closest('li').find('input[type=range]').attr('disabled', 'disabled');
			});

			$(this).find('input[type=range]').on('change', function () {
				var v = $(this).val() - 1;
				$(this).prev('label').text('过去' + ['1','4','8'][v % 3] + ['时','天','月'][Math.floor(v/3)]);
			});			
		});

		$('#pageClearBrowerData .btn').on('click', function () {
			$('#pageClearBrowerData input[type=range]').each(function () {
				var $this = $(this), type, val;
				type = $this.closest('li').find('input[type=checkbox]').attr('name');
				val  = $this.val();
				data[type] = [!$this.attr('disabled'), val];
				if ($this.attr('disabled')) return ;
				
				val = val - 1;
				val = ([1, 4, 8][val % 3]) * ([60*60, 24*60*60, 30*24*60*60][Math.floor(val/3)]) * 1000;

				var walk = function (type, val) {
					if (isClearing) { setTimeout(function(){walk(type, val)}, 500); return ;}
					isClearing++;
					F.clear(type, val, function () {
						console.log('finish', type, val);
						isClearing--;
					});
				}
				walk(type, val);
			});
			chrome.storage.sync.set({pageClearBrowerData: data}, function () {
				console.log('storage.sync.set', data);
				var close = function () {
					if (isClearing) {setTimeout(function(){ close(); }, 1000); return ;}
					console.log('finish all clear');
					window.close();
				};
				close();
			});
		});
	})();
		
});
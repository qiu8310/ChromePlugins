
var F, G;
// 数据
G = {
  extId: chrome.i18n.getMessage('@@extension_id'),
	currentTabId: 0,
	currentWinId: 0,

  omniboxCmds: [
    {key: 'qr', path: 'qr.html'},
    {key: 'regexp', path: 'regexp.html'}
  ]
};
// 函数
F = {
	clear : function (what, time, cb) {
		var date;

		if (time === 0) { //if time is 0 then is to clear all
			date = 0;
		} else { //else calculate since
			date = (new Date()).getTime() - time;
		}
		switch(what) {
			case 'Cache':
				chrome.browsingData.removeCache({ 'since': date }, cb);
				break;
			case 'Cookies':
				chrome.browsingData.removeCookies({ 'since': date }, cb);
				break;
			case 'History':
				chrome.browsingData.removeHistory({ 'since': date }, cb);
				break;
		}
	},

  navigate: function (url, tabId) {
    chrome.tabs.update(tabId || G.currentTabId, {url: url});
  },

  navigateToInner: function (path, tabId) {
    this.navigate('chrome-extension://' + G.extId + '/' + path, tabId);
  }

};



function tabChange (tab) {
  if (tab) {

  } else {

  }
  console.log(tab);
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError.message);
  } else {
    chrome.browserAction.setBadgeText({text: '1'});
    chrome.browserAction.setBadgeBackgroundColor({color: '#FF00FF'});
    //chrome.browserAction.getBadgeBackgroundColor({}, function(d) {console.log(d);});
  }
}


chrome.extension.onMessage.addListener(function (msg) {
  var cmd = msg && msg.cmd,
    data = msg && msg.data;
  if (cmd in F) { F[cmd](data); }
});

// 获取当前 tabId 和 windowId;
chrome.tabs.query({active:true, currentWindow: true}, function (tabs) {
	// chrome.tabs.getCurrent(function (tab) { // 不好使
	var tab = tabs && tabs[0];
	G.currentTabId = tab ? tab.id : 0;
	G.currentWinId = tab ? tab.windowId : 0;
	tabChange(tab);
});

// 监听 tab 的变化
chrome.tabs.onActivated.addListener(function (tabInfo) {
	G.currentTabId = tabInfo.tabId;
	G.currentWinId = tabInfo.windowId;
	chrome.tabs.get(tabInfo.tabId, function (tab) {
		tabChange(tab);
	});
});




// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + ' one', description: 'the first one'},
      {content: text + ' number two', description: 'the second entry'}
    ]);
  });

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    console.log('inputEntered: ' + text);
    window.alert('You just typed ' + text);
  });





////create the menu itens
//chrome.contextMenus.create({ 'title': 'Cache: Last Hour', 	'onclick': function(){ F.clear('Cache', 1000 * 60 * 60) } });
//chrome.contextMenus.create({ 'title': 'Cache: Last Day', 	'onclick': function(){ F.clear('Cache', 1000 * 60 * 60 * 24) } });
//chrome.contextMenus.create({ 'title': 'Cache: Last Week', 	'onclick': function(){ F.clear('Cache', 1000 * 60 * 60 * 24 * 7) } });
////chrome.contextMenus.create({ 'title': 'Cache: All Time', 	'onclick': function(){ clear('Cache', 0) } });
//chrome.contextMenus.create({ 'type': 'separator' });
//chrome.contextMenus.create({ 'title': 'History: Last Hour', 'onclick': function(){ F.clear('History', 1000 * 60 * 60) } });
//chrome.contextMenus.create({ 'title': 'History: Last Day', 	'onclick': function(){ F.clear('History', 1000 * 60 * 60 * 24) } });
//chrome.contextMenus.create({ 'title': 'History: Last Week', 'onclick': function(){ F.clear('History', 1000 * 60 * 60 * 24 * 7) } });
////chrome.contextMenus.create({ 'title': 'History: All Time', 	'onclick': function(){ clear('History', 0) } });
//chrome.contextMenus.create({ 'type': 'separator' });
//chrome.contextMenus.create({ 'title': 'Cookies: Last Hour', 'onclick': function(){ F.clear('Cookies', 1000 * 60 * 60) } });
//chrome.contextMenus.create({ 'title': 'Cookies: Last Day', 	'onclick': function(){ F.clear('Cookies', 1000 * 60 * 60 * 24) } });
//chrome.contextMenus.create({ 'title': 'Cookies: Last Week', 'onclick': function(){ F.clear('Cookies', 1000 * 60 * 60 * 24 * 7) } });
////chrome.contextMenus.create({ 'title': 'Cookies: All Time', 	'onclick': function(){ clear('Cookies', 0) } });

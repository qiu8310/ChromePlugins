var current = null, Tab = {}, callbacks = [];

function tabChange(tab) {
  if (!current || current.id !== tab.id || current.windowId !== tab.windowId) {
    callbacks.forEach((cb) => cb(tab, current));
    current = tab;
  }
}

// 获取当前 tabId 和 windowId;
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  var tab = tabs && tabs[0];
  if (tab) {
    tabChange(tab);
  }
});

// 监听 tab 的变化
chrome.tabs.onActivated.addListener((tabInfo) => {
  chrome.tabs.get(tabInfo.tabId, (tab) => tabChange(tab));
});

Tab.current = current;
Tab.onChange = (cb) => {
  if (current) {
    cb(current, null);
  }
  callbacks.push(cb);
};


module.exports = Tab;
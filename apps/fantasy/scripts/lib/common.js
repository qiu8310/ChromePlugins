

let extId = chrome.i18n.getMessage('@@extension_id');
let extName = chrome.i18n.getMessage('ExtName');


function navigate (url, tabId) {
  chrome.tabs.update(tabId, {url: url});
}

function inner (path, tabId) {
  navigate('chrome-extension://' + extId + '/' + path, tabId);
}


module.exports = { extId, extName, navigate, inner };
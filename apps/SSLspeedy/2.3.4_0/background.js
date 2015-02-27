var bkg = chrome.extension.getBackgroundPage();
var lastCallTimestamp = 0;
var lastCallId = 0;

function dnsDomainIs(host, pattern) {
  return host.length >= pattern.length && (host === pattern || host.substring(host.length - pattern.length - 1) === '.' + pattern);
}


chrome.tabs.onActivated.addListener(function (activeInfo) {
  // how to fetch tab url using activeInfo.tabid
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (localStorage['connected'] > 0) {
      var domaintmp = tab.url.split("/");
      var domain = domaintmp[2];
      if (domain.indexOf("www.") == 0) {
        domain = domain.replace("www.", "");
      }
      var isSSL = 0;
      auto_black = localStorage['localbldomain'].split("\n");
      for (i = 0; i < auto_black.length; i++) {
        if (auto_black[i].length < 3) continue;
        if (dnsDomainIs(domain, auto_black[i])) {
          isSSL = 1;
          break;
        }
      }


      if (isSSL > 0) {
        chrome.browserAction.setIcon({
          path: "icon-ok-go.png"
        });
      } else {
        chrome.browserAction.setIcon({
          path: "icon-ok.png"
        });

      }
    }

  });
});
chrome.webRequest.onAuthRequired.addListener(
  function (details) {

    var locked = typeof localStorage["proxy_locked"] === 'string' && localStorage["proxy_locked"] === 'true';

    if (details.isProxy === true && !locked) {

      console.log('PROXY : ' + JSON.stringify(details));
      localStorage['details'] = JSON.stringify(details);
      var currentCallTimestamp = parseFloat(details.timeStamp);
      var currentId = details.requestId;

      if (lastCallTimestamp > 0) {
        // Probable error on proxy credentials.
        if (parseFloat(details.timeStamp) - lastCallTimestamp < 150 && currentId === lastCallId) {
          localStorage["proxy_locked"] = true;
          alert('PROXY AUTO AUTH : Too many proxy authentication request. Please check your proxy credentials in the option page.');
          lastCallTimestamp = currentCallTimestamp;
          lastCallId = currentId;
          return ({
            cancel: true
          });
        }
      }

      lastCallTimestamp = currentCallTimestamp;
      lastCallId = currentId;

      var login = localStorage["username"];
      var password = localStorage["password"];

      if (login && password && !locked) {
        return ({
          authCredentials: {
            username: login,
            password: password
          }
        });
      }
    }
  },
  {urls: ["<all_urls>"]},
  ["blocking"]
);


function checklogin(res) {


  if (res['status'] < 1) {
    chrome.browserAction.setIcon({
      path: "icon.png"
    });
    localStorage['connected'] = 0;
  } else {
    chrome.browserAction.setIcon({
      path: "icon-ok.png"
    });
    localStorage['connected'] = 1;

  }

}
function checkLoginStatus() {
  if (localStorage['connected'] < 1) {
    chrome.browserAction.setIcon({
      path: "icon.png"
    });

  } else {
    chrome.browserAction.setIcon({
      path: "icon-ok.png"
    });
  }

}
//chrome.tabs.create({url:""}); 

checkLoginStatus();
 
 


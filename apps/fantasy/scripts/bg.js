(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Tab = require("../lib/tab"),
    Common = require("../lib/common");

require("../lib/omnibox");

console.log(Common);

Tab.onChange(function (tab) {
  return console.log(tab);
});

},{"../lib/common":2,"../lib/omnibox":3,"../lib/tab":4}],2:[function(require,module,exports){
"use strict";

var extId = chrome.i18n.getMessage("@@extension_id");
var extName = chrome.i18n.getMessage("ExtName");

function navigate(url, tabId) {
  chrome.tabs.update(tabId, { url: url });
}

function inner(path, tabId) {
  navigate("chrome-extension://" + extId + "/" + path, tabId);
}

module.exports = { extId: extId, extName: extName, navigate: navigate, inner: inner };

},{}],3:[function(require,module,exports){
"use strict";

function updateSuggestion(text) {
  text = text ? text.trim() : "";
  var isRegExp = /^re:/.test(text),
      isFile = /^file:/.test(text),
      isPlainText = text.length && !isRegExp && !isFile,
      types = [[isPlainText, "plaintext-search"], [isRegExp, "re:regexp-search"], [isFile, "file:filename-search"]];

  var typesStr = types.map(function (it) {
    return it[0] ? "<match>" + it[1] + "</match>" : it[1];
  }).join("<dim> | </dim>");

  var desc = "<match><url>" + text.replace(/^(re:|file:)/, "") + "</url></match><dim> [ </dim>" + typesStr + "<dim> ] </dim>";

  chrome.omnibox.setDefaultSuggestion({
    description: desc
  });
}

chrome.omnibox.onInputCancelled.addListener(function () {
  return updateSuggestion();
});
chrome.omnibox.onInputStarted.addListener(function () {
  return updateSuggestion();
});

chrome.omnibox.onInputEntered.addListener(function (text) {
  console.log(text);
});

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
  updateSuggestion(text);
  //suggest([
  //  {content: text + ' one', description: 'the first one'},
  //  {content: text + ' number two', description: 'the second entry'}
  //]);
});

},{}],4:[function(require,module,exports){
"use strict";

var current = null,
    Tab = {},
    callbacks = [];

function tabChange(tab) {
  if (!current || current.id !== tab.id || current.windowId !== tab.windowId) {
    callbacks.forEach(function (cb) {
      return cb(tab, current);
    });
    current = tab;
  }
}

// 获取当前 tabId 和 windowId;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var tab = tabs && tabs[0];
  if (tab) {
    tabChange(tab);
  }
});

// 监听 tab 的变化
chrome.tabs.onActivated.addListener(function (tabInfo) {
  chrome.tabs.get(tabInfo.tabId, function (tab) {
    return tabChange(tab);
  });
});

Tab.current = current;
Tab.onChange = function (cb) {
  if (current) {
    cb(current, null);
  }
  callbacks.push(cb);
};

module.exports = Tab;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbW9yYS9Xb3Jrc3BhY2UvQ2hyb21lUGx1Z2lucy9hcHBzL2ZhbnRhc3kvc2NyaXB0cy9iZy9pbmRleC5qcyIsIi9Vc2Vycy9tb3JhL1dvcmtzcGFjZS9DaHJvbWVQbHVnaW5zL2FwcHMvZmFudGFzeS9zY3JpcHRzL2xpYi9jb21tb24uanMiLCIvVXNlcnMvbW9yYS9Xb3Jrc3BhY2UvQ2hyb21lUGx1Z2lucy9hcHBzL2ZhbnRhc3kvc2NyaXB0cy9saWIvb21uaWJveC5qcyIsIi9Vc2Vycy9tb3JhL1dvcmtzcGFjZS9DaHJvbWVQbHVnaW5zL2FwcHMvZmFudGFzeS9zY3JpcHRzL2xpYi90YWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDN0IsTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFcEMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRTFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBR3BCLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBQyxHQUFHO1NBQUssT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7Q0FBQSxDQUFDLENBQUM7Ozs7O0FDTnhDLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDckQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBR2hELFNBQVMsUUFBUSxDQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDN0IsUUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FB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QUFhLEVBQUUsSUFBSSxFQUFDLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDL0QsTUFBSSxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixNQUFJLEdBQUcsRUFBRTtBQUNQLGFBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNoQjtDQUNGLENBQUMsQ0FBQzs7O0FBR0gsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQy9DLFFBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBQyxHQUFHO1dBQUssU0FBUyxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUN6RCxDQUFDLENBQUM7O0FBRUgsR0FBRyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdEIsR0FBRyxDQUFDLFFBQVEsR0FBRyxVQUFDLEVBQUUsRUFBSztBQUNyQixNQUFJLE9BQU8sRUFBRTtBQUNYLE1BQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDbkI7QUFDRCxXQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3BCLENBQUM7O0FBR0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFRhYiA9IHJlcXVpcmUoJy4uL2xpYi90YWInKSxcbiAgQ29tbW9uID0gcmVxdWlyZSgnLi4vbGliL2NvbW1vbicpO1xuXG5yZXF1aXJlKCcuLi9saWIvb21uaWJveCcpO1xuXG5jb25zb2xlLmxvZyhDb21tb24pO1xuXG5cblRhYi5vbkNoYW5nZSgodGFiKSA9PiBjb25zb2xlLmxvZyh0YWIpKTtcbiIsIlxuXG5sZXQgZXh0SWQgPSBjaHJvbWUuaTE4bi5nZXRNZXNzYWdlKCdAQGV4dGVuc2lvbl9pZCcpO1xubGV0IGV4dE5hbWUgPSBjaHJvbWUuaTE4bi5nZXRNZXNzYWdlKCdFeHROYW1lJyk7XG5cblxuZnVuY3Rpb24gbmF2aWdhdGUgKHVybCwgdGFiSWQpIHtcbiAgY2hyb21lLnRhYnMudXBkYXRlKHRhYklkLCB7dXJsOiB1cmx9KTtcbn1cblxuZnVuY3Rpb24gaW5uZXIgKHBhdGgsIHRhYklkKSB7XG4gIG5hdmlnYXRlKCdjaHJvbWUtZXh0ZW5zaW9uOi8vJyArIGV4dElkICsgJy8nICsgcGF0aCwgdGFiSWQpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0geyBleHRJZCwgZXh0TmFtZSwgbmF2aWdhdGUsIGlubmVyIH07IiwiZnVuY3Rpb24gdXBkYXRlU3VnZ2VzdGlvbih0ZXh0KSB7XG4gIHRleHQgPSB0ZXh0ID8gdGV4dC50cmltKCkgOiAnJztcbiAgbGV0IGlzUmVnRXhwID0gL15yZTovLnRlc3QodGV4dCksXG4gICAgaXNGaWxlID0gL15maWxlOi8udGVzdCh0ZXh0KSxcbiAgICBpc1BsYWluVGV4dCA9IHRleHQubGVuZ3RoICYmICFpc1JlZ0V4cCAmJiAhaXNGaWxlLFxuXG4gICAgdHlwZXMgPSBbW2lzUGxhaW5UZXh0LCAncGxhaW50ZXh0LXNlYXJjaCddLCBbaXNSZWdFeHAsICdyZTpyZWdleHAtc2VhcmNoJ10sIFtpc0ZpbGUsICdmaWxlOmZpbGVuYW1lLXNlYXJjaCddXTtcblxuXG4gIGxldCB0eXBlc1N0ciA9IHR5cGVzLm1hcCgoaXQpID0+IGl0WzBdID8gYDxtYXRjaD4ke2l0WzFdfTwvbWF0Y2g+YCA6IGl0WzFdKS5qb2luKCc8ZGltPiB8IDwvZGltPicpO1xuXG4gIGxldCBkZXNjID0gYDxtYXRjaD48dXJsPiR7dGV4dC5yZXBsYWNlKC9eKHJlOnxmaWxlOikvLCAnJyl9PC91cmw+PC9tYXRjaD48ZGltPiBbIDwvZGltPiR7dHlwZXNTdHJ9PGRpbT4gXSA8L2RpbT5gO1xuXG4gIGNocm9tZS5vbW5pYm94LnNldERlZmF1bHRTdWdnZXN0aW9uKHtcbiAgICBkZXNjcmlwdGlvbjogZGVzY1xuICB9KTtcbn1cblxuXG5jaHJvbWUub21uaWJveC5vbklucHV0Q2FuY2VsbGVkLmFkZExpc3RlbmVyKCgpID0+IHVwZGF0ZVN1Z2dlc3Rpb24oKSk7XG5jaHJvbWUub21uaWJveC5vbklucHV0U3RhcnRlZC5hZGRMaXN0ZW5lcigoKSA9PiB1cGRhdGVTdWdnZXN0aW9uKCkpO1xuXG5cbmNocm9tZS5vbW5pYm94Lm9uSW5wdXRFbnRlcmVkLmFkZExpc3RlbmVyKCh0ZXh0KSA9PiB7XG4gIGNvbnNvbGUubG9nKHRleHQpO1xufSk7XG5cbmNocm9tZS5vbW5pYm94Lm9uSW5wdXRDaGFuZ2VkLmFkZExpc3RlbmVyKCh0ZXh0LCBzdWdnZXN0KSA9PiB7XG4gIHVwZGF0ZVN1Z2dlc3Rpb24odGV4dCk7XG4gIC8vc3VnZ2VzdChbXG4gIC8vICB7Y29udGVudDogdGV4dCArICcgb25lJywgZGVzY3JpcHRpb246ICd0aGUgZmlyc3Qgb25lJ30sXG4gIC8vICB7Y29udGVudDogdGV4dCArICcgbnVtYmVyIHR3bycsIGRlc2NyaXB0aW9uOiAndGhlIHNlY29uZCBlbnRyeSd9XG4gIC8vXSk7XG59KTsiLCJ2YXIgY3VycmVudCA9IG51bGwsIFRhYiA9IHt9LCBjYWxsYmFja3MgPSBbXTtcblxuZnVuY3Rpb24gdGFiQ2hhbmdlKHRhYikge1xuICBpZiAoIWN1cnJlbnQgfHwgY3VycmVudC5pZCAhPT0gdGFiLmlkIHx8IGN1cnJlbnQud2luZG93SWQgIT09IHRhYi53aW5kb3dJZCkge1xuICAgIGNhbGxiYWNrcy5mb3JFYWNoKChjYikgPT4gY2IodGFiLCBjdXJyZW50KSk7XG4gICAgY3VycmVudCA9IHRhYjtcbiAgfVxufVxuXG4vLyDojrflj5blvZPliY0gdGFiSWQg5ZKMIHdpbmRvd0lkO1xuY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sICh0YWJzKSA9PiB7XG4gIHZhciB0YWIgPSB0YWJzICYmIHRhYnNbMF07XG4gIGlmICh0YWIpIHtcbiAgICB0YWJDaGFuZ2UodGFiKTtcbiAgfVxufSk7XG5cbi8vIOebkeWQrCB0YWIg55qE5Y+Y5YyWXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcigodGFiSW5mbykgPT4ge1xuICBjaHJvbWUudGFicy5nZXQodGFiSW5mby50YWJJZCwgKHRhYikgPT4gdGFiQ2hhbmdlKHRhYikpO1xufSk7XG5cblRhYi5jdXJyZW50ID0gY3VycmVudDtcblRhYi5vbkNoYW5nZSA9IChjYikgPT4ge1xuICBpZiAoY3VycmVudCkge1xuICAgIGNiKGN1cnJlbnQsIG51bGwpO1xuICB9XG4gIGNhbGxiYWNrcy5wdXNoKGNiKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUYWI7Il19

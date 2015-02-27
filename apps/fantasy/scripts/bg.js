(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var Tab = require("../lib/tab"),
    Common = require("../lib/common");

// require('babel/polyfill');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbW9yYS9Xb3Jrc3BhY2UvQ2hyb21lUGx1Z2lucy9hcHBzL2ZhbnRhc3kvc2NyaXB0cy9iZy9pbmRleC5qcyIsIi9Vc2Vycy9tb3JhL1dvcmtzcGFjZS9DaHJvbWVQbHVnaW5zL2FwcHMvZmFudGFzeS9zY3JpcHRzL2xpYi9jb21tb24uanMiLCIvVXNlcnMvbW9yYS9Xb3Jrc3BhY2UvQ2hyb21lUGx1Z2lucy9hcHBzL2ZhbnRhc3kvc2NyaXB0cy9saWIvb21uaWJveC5qcyIsIi9Vc2Vycy9tb3JhL1dvcmtzcGFjZS9DaHJvbWVQbHVnaW5zL2FwcHMvZmFudGFzeS9zY3JpcHRzL2xpYi90YWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7SUFDN0IsTUFBTSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQzs7O0FBR3BDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUUxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUdwQixHQUFHLENBQUMsUUFBUSxDQUFDLFVBQUMsR0FBRztTQUFLLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0NBQUEsQ0FBQyxDQUFDOzs7OztBQ1B4QyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3JELElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUdoRCxTQUFTLFFBQVEsQ0FBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0FBQzdCLFFBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtB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YUFBYSxFQUFFLElBQUksRUFBQyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQy9ELE1BQUksR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsTUFBSSxHQUFHLEVBQUU7QUFDUCxhQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDaEI7Q0FDRixDQUFDLENBQUM7OztBQUdILE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxVQUFDLE9BQU8sRUFBSztBQUMvQyxRQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFVBQUMsR0FBRztXQUFLLFNBQVMsQ0FBQyxHQUFHLENBQUM7R0FBQSxDQUFDLENBQUM7Q0FDekQsQ0FBQyxDQUFDOztBQUVILEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsVUFBQyxFQUFFLEVBQUs7QUFDckIsTUFBSSxPQUFPLEVBQUU7QUFDWCxNQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ25CO0FBQ0QsV0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNwQixDQUFDOztBQUdGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBUYWIgPSByZXF1aXJlKCcuLi9saWIvdGFiJyksXG4gIENvbW1vbiA9IHJlcXVpcmUoJy4uL2xpYi9jb21tb24nKTtcblxuLy8gcmVxdWlyZSgnYmFiZWwvcG9seWZpbGwnKTtcbnJlcXVpcmUoJy4uL2xpYi9vbW5pYm94Jyk7XG5cbmNvbnNvbGUubG9nKENvbW1vbik7XG5cblxuVGFiLm9uQ2hhbmdlKCh0YWIpID0+IGNvbnNvbGUubG9nKHRhYikpO1xuIiwiXG5cbmxldCBleHRJZCA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoJ0BAZXh0ZW5zaW9uX2lkJyk7XG5sZXQgZXh0TmFtZSA9IGNocm9tZS5pMThuLmdldE1lc3NhZ2UoJ0V4dE5hbWUnKTtcblxuXG5mdW5jdGlvbiBuYXZpZ2F0ZSAodXJsLCB0YWJJZCkge1xuICBjaHJvbWUudGFicy51cGRhdGUodGFiSWQsIHt1cmw6IHVybH0pO1xufVxuXG5mdW5jdGlvbiBpbm5lciAocGF0aCwgdGFiSWQpIHtcbiAgbmF2aWdhdGUoJ2Nocm9tZS1leHRlbnNpb246Ly8nICsgZXh0SWQgKyAnLycgKyBwYXRoLCB0YWJJZCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7IGV4dElkLCBleHROYW1lLCBuYXZpZ2F0ZSwgaW5uZXIgfTsiLCJmdW5jdGlvbiB1cGRhdGVTdWdnZXN0aW9uKHRleHQpIHtcbiAgdGV4dCA9IHRleHQgPyB0ZXh0LnRyaW0oKSA6ICcnO1xuICBsZXQgaXNSZWdFeHAgPSAvXnJlOi8udGVzdCh0ZXh0KSxcbiAgICBpc0ZpbGUgPSAvXmZpbGU6Ly50ZXN0KHRleHQpLFxuICAgIGlzUGxhaW5UZXh0ID0gdGV4dC5sZW5ndGggJiYgIWlzUmVnRXhwICYmICFpc0ZpbGUsXG5cbiAgICB0eXBlcyA9IFtbaXNQbGFpblRleHQsICdwbGFpbnRleHQtc2VhcmNoJ10sIFtpc1JlZ0V4cCwgJ3JlOnJlZ2V4cC1zZWFyY2gnXSwgW2lzRmlsZSwgJ2ZpbGU6ZmlsZW5hbWUtc2VhcmNoJ11dO1xuXG5cbiAgbGV0IHR5cGVzU3RyID0gdHlwZXMubWFwKChpdCkgPT4gaXRbMF0gPyBgPG1hdGNoPiR7aXRbMV19PC9tYXRjaD5gIDogaXRbMV0pLmpvaW4oJzxkaW0+IHwgPC9kaW0+Jyk7XG5cbiAgbGV0IGRlc2MgPSBgPG1hdGNoPjx1cmw+JHt0ZXh0LnJlcGxhY2UoL14ocmU6fGZpbGU6KS8sICcnKX08L3VybD48L21hdGNoPjxkaW0+IFsgPC9kaW0+JHt0eXBlc1N0cn08ZGltPiBdIDwvZGltPmA7XG5cbiAgY2hyb21lLm9tbmlib3guc2V0RGVmYXVsdFN1Z2dlc3Rpb24oe1xuICAgIGRlc2NyaXB0aW9uOiBkZXNjXG4gIH0pO1xufVxuXG5cbmNocm9tZS5vbW5pYm94Lm9uSW5wdXRDYW5jZWxsZWQuYWRkTGlzdGVuZXIoKCkgPT4gdXBkYXRlU3VnZ2VzdGlvbigpKTtcbmNocm9tZS5vbW5pYm94Lm9uSW5wdXRTdGFydGVkLmFkZExpc3RlbmVyKCgpID0+IHVwZGF0ZVN1Z2dlc3Rpb24oKSk7XG5cblxuY2hyb21lLm9tbmlib3gub25JbnB1dEVudGVyZWQuYWRkTGlzdGVuZXIoKHRleHQpID0+IHtcbiAgY29uc29sZS5sb2codGV4dCk7XG59KTtcblxuY2hyb21lLm9tbmlib3gub25JbnB1dENoYW5nZWQuYWRkTGlzdGVuZXIoKHRleHQsIHN1Z2dlc3QpID0+IHtcbiAgdXBkYXRlU3VnZ2VzdGlvbih0ZXh0KTtcbiAgLy9zdWdnZXN0KFtcbiAgLy8gIHtjb250ZW50OiB0ZXh0ICsgJyBvbmUnLCBkZXNjcmlwdGlvbjogJ3RoZSBmaXJzdCBvbmUnfSxcbiAgLy8gIHtjb250ZW50OiB0ZXh0ICsgJyBudW1iZXIgdHdvJywgZGVzY3JpcHRpb246ICd0aGUgc2Vjb25kIGVudHJ5J31cbiAgLy9dKTtcbn0pOyIsInZhciBjdXJyZW50ID0gbnVsbCwgVGFiID0ge30sIGNhbGxiYWNrcyA9IFtdO1xuXG5mdW5jdGlvbiB0YWJDaGFuZ2UodGFiKSB7XG4gIGlmICghY3VycmVudCB8fCBjdXJyZW50LmlkICE9PSB0YWIuaWQgfHwgY3VycmVudC53aW5kb3dJZCAhPT0gdGFiLndpbmRvd0lkKSB7XG4gICAgY2FsbGJhY2tzLmZvckVhY2goKGNiKSA9PiBjYih0YWIsIGN1cnJlbnQpKTtcbiAgICBjdXJyZW50ID0gdGFiO1xuICB9XG59XG5cbi8vIOiOt+WPluW9k+WJjSB0YWJJZCDlkowgd2luZG93SWQ7XG5jaHJvbWUudGFicy5xdWVyeSh7YWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlfSwgKHRhYnMpID0+IHtcbiAgdmFyIHRhYiA9IHRhYnMgJiYgdGFic1swXTtcbiAgaWYgKHRhYikge1xuICAgIHRhYkNoYW5nZSh0YWIpO1xuICB9XG59KTtcblxuLy8g55uR5ZCsIHRhYiDnmoTlj5jljJZcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKCh0YWJJbmZvKSA9PiB7XG4gIGNocm9tZS50YWJzLmdldCh0YWJJbmZvLnRhYklkLCAodGFiKSA9PiB0YWJDaGFuZ2UodGFiKSk7XG59KTtcblxuVGFiLmN1cnJlbnQgPSBjdXJyZW50O1xuVGFiLm9uQ2hhbmdlID0gKGNiKSA9PiB7XG4gIGlmIChjdXJyZW50KSB7XG4gICAgY2IoY3VycmVudCwgbnVsbCk7XG4gIH1cbiAgY2FsbGJhY2tzLnB1c2goY2IpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRhYjsiXX0=

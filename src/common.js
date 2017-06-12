'use strict';
var EVENT_STATE_CHANGE = 'popstate';
var EVENT_STATE_PUSH = 'pushstate';
var EVENT_STATE_REPLACE = 'replacestate';

var isSupport = 'pushState' in history && !!window.sessionStorage;
// localStorage 不可用时，代表不支持
if (window.sessionStorage) {
  try {
    var key = '__pajax';
    // var old = sessionStorage.getItem(key);
    sessionStorage.setItem(key, 1);
    sessionStorage.removeItem(key);
    // if (old !== null && old === void 0) {
    //   sessionStorage.setItem(key, old);
    // }
  } catch (e) {
    isSupport = false;
  }
}

function each(list, callback) {
  for (var i in list) {
    if (list.hasOwnProperty(i)) {
      callback.call(list, list[i], i);
    }
  }
  return list;
}

function toArray(obj) {
  return [].slice.call(obj, 0);
}

function queryType(obj) {
  return $.type(obj);
}

function toAbsUrl(url, sourceAbsUrl) {
  if (path.isAbsolute(url)) {
    return url;
  }

  var currentHref = location.href;

  sourceAbsUrl = sourceAbsUrl || currentHref;
  if (!path.isAbsolute(sourceAbsUrl)) {
    sourceAbsUrl = toAbsUrl(sourceAbsUrl, currentHref);
  }

  sourceAbsUrl = path.dir(sourceAbsUrl);

  return path.join(sourceAbsUrl, url);
}

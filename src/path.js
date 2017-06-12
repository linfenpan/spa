'use strict';

// test.json?xx --> test.json
function removeUrlSeachAndHash(uri){
    return uri.replace(/(\?|#).*$/, "");
};

var path = {
  // 路径格式化
  normal: function(uri){
    // 1. ./a/./b//c/d/../e/ ==> ./a//b//c/d/../e/
    // 2. ./a//b/c/d/../e/ ==> ./a/b/c/d/../e/
    // 3. ./a/b/c/d/../e/ ==> ./a/b/c/e/
    return uri.replace(/\/\.\//g, "\/\/")
      .replace(/(^|[^:])\/{2,}/g, "$1\/")
      .replace(/[^/]*\/\.\.\/([^/]*)/g, "$1");
  },

  // 是否绝对路径, ftp:// 或 http:// 或 //
  isAbsolute: function(uri){
    return /((https?|ftp):)?\/\//.test(uri);
  },

  // 路径合并
  //  http://www.baidu.com/test, /a.html -> http://www.baidu.com/a.html
  //  http://www.baidu.com/test, ./a.html -> http://www.baidu.com/test/a.html
  join: function(){
    var list = [].slice.call(arguments, 0);
    var url = list.shift();

    var dir = '/', isRootDir = false, root = '/';
    if (path.isAbsolute(url)) {
      dir = /.*?:?\/\/[^/]+\/?/.exec(url)[0] + '/';
      // 如果已经是根目录了，则所有地址，都应该从根目录开始寻址
      isRootDir = /^.*?:?\/\/[^/]+\/?$/.test(url);
    }

    if (isRootDir) {
      root = dir;
      dir = '/';
      url = '/';
    }

    var p = list.shift();
    while (p) {
      if (path.isAbsolute(p)) {
        url = p;
        list.unshift(url);
        return path.join.apply(path, list);
      } else if (/^\//.test(p)) {
        url = path.normal(dir + '/' + p);
      } else {
        url = path.normal(path.dir(url) + '/' + p);
      }
      p = list.shift();
    }

    return isRootDir ? path.normal(root + './' + url) : url;
  },

  // 目录，http://www.100bt.com 这样的，会有BUG，现实不存在这样的路径，先无视
  //  删除 search 和 hash 部分
  dir: function(uri){
    uri = removeUrlSeachAndHash(uri);
    if (path.isDir(uri)) { return path.normal(uri); }
    return path.normal(uri.replace(/(.*\/).*$/, "$1"));
  },

  isDir: function(uri) {
    // 没有后缀的，就是目录了
    uri = path.normal(uri);
    return !/(?:[^/])\/[^/]+\.[^/]+$/.test(uri);
  },

  root: function(uri){
    // http://www.baidu.com/xxx/index.html --> http://www.baidu.com/
    var res = uri.match(/.*:\/{2,}.*?(\/|$)/g);
    return res ? res[0] : "";
  },

  // 后缀名
  ext: function(uri){
    uri = removeUrlSeachAndHash(uri);
    return uri.match(/\.([^.]*)$/)[1];
  }
};

'use strict';
// 资源控制器
var resourceCtrl = {
  elHead: null,
  map: { },
  init: function() {
    var ctx = this;
    ctx.elHead = document.head || document.getElementsByTagName('head')[0];
    ctx.init = function() {};

    $('script,link').each(function(i, el) {
      var uri = el.src || el.href;
      ctx._setExist(uri);
    });
  },

  _setExist: function(uri) {
    if (!uri) { return; }

    if (!path.isAbsolute(uri)) {
      uri = toAbsUrl(uri);
    }

    this.map[uri] = 1;
  },

  // [插入列表, 插入的父级元素, 检测重复否?, js|css]
  _addResource: function(dom, uri, elAppendTo, ignoreRepeat) {
    var ctx = this;

    elAppendTo = elAppendTo || ctx.elHead;

    if (uri) {
      ignoreRepeat = ignoreRepeat === void 0 ? true : ignoreRepeat;
      uri = toAbsUrl(uri);

      if (ignoreRepeat && ctx.map[uri]) {
        return;
      }

      elAppendTo.appendChild(dom);

      if (ignoreRepeat) {
        ctx._setExist(uri);
      }
    } else {
      elAppendTo.appendChild(dom);
    }
  },

  /*
    * 添加脚本资源
    * @param {Array} [list] 配置列表: [{ dom: script, pos: 插入位置, ignoreRepeat: 已经加载过的是否忽略? }]
  */
  addScripts: function(list, callback) {
    var ctx = this;
    var defList = [];
    ctx.init();

    each(list, function(item) {
      var dom = item.dom,
          pos = item.pos,
          ignoreRepeat = item.ignoreRepeat;

      if (!dom) { return; }

      var el = document.createElement('script');
      if (dom.src) {
        each(dom.attributes, function(attr) {
          var key = attr.name || attr.nodeName || attr;
          el.setAttribute(key, dom.getAttribute(key));
        });

        // 可重复 或者 在map上不存在的，应该都开始加载
        if (!ignoreRepeat || !ctx.map[dom.src]) {
          var def = $.Deferred();
          el.addEventListener('load', def.resolve, false);
          el.addEventListener('error', def.resolve, false);
          defList.push(def);
        }

        // 等待上一个脚本完成之后，继续插入 AND~ 最后一个是自己
        $.when.apply($, defList.slice(0, -1)).always(function() {
          ctx._addResource(el, el.src, pos, ignoreRepeat);
        });

        return;
      } else {
        // 应该等待上述的所有脚本执行完毕之后，再执行~
        el.innerHTML = $(dom).html();
        $.when.apply($, defList.slice(0)).always(function() {
          ctx._addResource(el, el.src, pos, ignoreRepeat);
        });
        return;
      }
    });

    $.when.apply($, defList.slice(0)).always(function() {
      callback && callback();
    });
  },

  /*
    * 添加样式资源
    * @param {Array} [list] 配置列表: [{ dom: link, pos: 插入位置, ignoreRepeat: 已经加载过的是否忽略? }]
  */
  addLinks: function(list) {
    var ctx = this;
    ctx.init();

    each(list, function(item) {
      var dom = item.dom;
      ctx._addResource(dom, dom.href, item.pos, item.ignoreRepeat);
    });
  }
};

$(function() {
  resourceCtrl.init();
});

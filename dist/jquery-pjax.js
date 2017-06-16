/**
  @rely: jQuery
  @author: da宗熊
  @version: 0.0.2
  @lastModify: 2017/6/16
  @git: https://github.com/linfenpan/spa#readme
*/
!function(e, t) {
  "function" == typeof define ? define.amd ? define(t) : define.cmd && define(function(e, r, n) {
    n.exports = t();
  }) : e.SPA = t();
}(this, function() {
  "use strict";
  function each(e, t) {
    for (var r in e) e.hasOwnProperty(r) && t.call(e, e[r], r);
    return e;
  }
  function toArray(e) {
    return [].slice.call(e, 0);
  }
  function queryType(e) {
    return $.type(e);
  }
  function toAbsUrl(e, r) {
    if (t.isAbsolute(e)) return e;
    var n = location.href;
    return r = r || n, t.isAbsolute(r) || (r = toAbsUrl(r, n)), r = t.dir(r), t.join(r, e);
  }
  function removeUrlSeachAndHash(e) {
    return e.replace(/(\?|#).*$/, "");
  }
  function getStateId() {
    return a++;
  }
  function HistoryController(e) {
    this.key = e, this.keyBack = e + "-back", this.keyForward = e + "-forward", this.current = null, 
    this.bindEvent(), this.init();
  }
  function StateClsCtrl(e, t) {
    this.key = e, this.waitTime = t || 300, this.isRunning = !1, this.runTimer = null, 
    this.prevFn = null;
  }
  function Pjax(t, n) {
    var i = this;
    r.call(i), i.$root = t, i.opts = $.extend({
      key: "pjax",
      animateTime: 300
    }, n || {});
    var o = i.key = i.opts.key;
    i.keyContainer = "data-" + o + "-container", i.keyIgnore = "data-" + o + "-ignore", 
    i.keyResource = "data-" + o + "-res", i.keyCurrent = "data-" + o + "-current", i.keyId = "data-" + o + "-id", 
    i.ajax = null, i.lockAjax = !1, e && (i.init(), i.bindEvent());
  }
  var e = "pushState" in history && !!window.sessionStorage;
  if (window.sessionStorage) try {
    sessionStorage.setItem("__pajax", 1), sessionStorage.removeItem("__pajax");
  } catch (t) {
    e = !1;
  }
  var t = {
    normal: function(e) {
      return e.replace(/\/\.\//g, "//").replace(/(^|[^:])\/{2,}/g, "$1/").replace(/[^/]*\/\.\.\/([^/]*)/g, "$1");
    },
    isAbsolute: function(e) {
      return /((https?|ftp):)?\/\//.test(e);
    },
    join: function() {
      var e = [].slice.call(arguments, 0), r = e.shift(), n = "/", i = !1, o = "/";
      t.isAbsolute(r) && (n = /.*?:?\/\/[^/]+\/?/.exec(r)[0] + "/", i = /^.*?:?\/\/[^/]+\/?$/.test(r)), 
      i && (o = n, n = "/", r = "/");
      for (var a = e.shift(); a; ) {
        if (t.isAbsolute(a)) return r = a, e.unshift(r), t.join.apply(t, e);
        r = /^\//.test(a) ? t.normal(n + "/" + a) : t.normal(t.dir(r) + "/" + a), a = e.shift();
      }
      return i ? t.normal(o + "./" + r) : r;
    },
    dir: function(e) {
      return e = removeUrlSeachAndHash(e), t.isDir(e) ? t.normal(e) : t.normal(e.replace(/(.*\/).*$/, "$1"));
    },
    isDir: function(e) {
      return e = t.normal(e), !/(?:[^/])\/[^/]+\.[^/]+$/.test(e);
    },
    root: function(e) {
      var t = e.match(/.*:\/{2,}.*?(\/|$)/g);
      return t ? t[0] : "";
    },
    ext: function(e) {
      return (e = removeUrlSeachAndHash(e)).match(/\.([^.]*)$/)[1];
    }
  }, r = function() {
    this._ = $("<div></div>");
  };
  r.prototype = {
    on: function(e, t, r) {
      var n = this, i = t._e_on_fn_ || function() {
        var e = toArray(arguments);
        return e.shift(), t.apply(n, e);
      };
      return n._[r ? "one" : "on"](e, i), n;
    },
    off: function(e, t) {
      return this._.off(e, t ? t._e_on_fn_ || t : t), this;
    },
    one: function(e, t) {
      return this.on(e, t, !0);
    },
    fire: function() {
      return this._.trigger.apply(this._, arguments), this;
    }
  };
  var n = new r(), i = {
    elHead: null,
    map: {},
    init: function() {
      var e = this;
      e.elHead = document.head || document.getElementsByTagName("head")[0], e.init = function() {}, 
      $("script,link").each(function(t, r) {
        var n = r.src || r.href;
        e._setExist(n);
      });
    },
    _setExist: function(e) {
      e && (t.isAbsolute(e) || (e = toAbsUrl(e)), this.map[e] = 1);
    },
    _addResource: function(e, t, r, n) {
      var i = this;
      if (r = r || i.elHead, t) {
        if (n = void 0 === n || n, t = toAbsUrl(t), n && i.map[t]) return;
        r.appendChild(e), n && i._setExist(t);
      } else r.appendChild(e);
    },
    addScripts: function(e, t) {
      var r = this, n = [];
      r.init(), each(e, function(e) {
        var t = e.dom, i = e.pos, o = e.ignoreRepeat;
        if (t) {
          var a = document.createElement("script");
          if (!t.src) return a.innerHTML = $(t).html(), void $.when.apply($, n.slice(0)).always(function() {
            r._addResource(a, a.src, i, o);
          });
          if (each(t.attributes, function(e) {
            var r = e.name || e.nodeName || e;
            a.setAttribute(r, t.getAttribute(r));
          }), !o || !r.map[t.src]) {
            var s = $.Deferred();
            a.addEventListener("load", s.resolve, !1), a.addEventListener("error", s.resolve, !1), 
            n.push(s);
          }
          $.when.apply($, n.slice(0, -1)).always(function() {
            r._addResource(a, a.src, i, o);
          });
        }
      }), $.when.apply($, n.slice(0)).always(function() {
        t && t();
      });
    },
    addLinks: function(e) {
      var t = this;
      t.init(), each(e, function(e) {
        var r = e.dom;
        t._addResource(r, r.href, e.pos, e.ignoreRepeat);
      });
    }
  };
  $(function() {
    i.init();
  });
  var o = sessionStorage, a = new Date() / 1;
  HistoryController.prototype = {
    init: function() {
      if (!this.current) {
        var e = JSON.parse(o.getItem(this.keyBack) || "[]");
        this.current = e[e.length - 1];
      }
    },
    bindEvent: function() {
      var e = this;
      window.addEventListener("popstate", function(t) {
        var r = t.state;
        if (!r || !r.id) return !0;
        e.onStateChange(r);
      });
    },
    clear: function() {
      o.setItem(this.keyBack, "[]"), o.setItem(this.keyForward, "[]");
    },
    _getList: function(e) {
      return JSON.parse(o.getItem(e) || "[]");
    },
    _setList: function(e, t) {
      o.setItem(e, JSON.stringify(t || []));
    },
    push: function(e, t) {
      var r = this, i = r.current, o = $.extend({
        key: r.key,
        id: getStateId(),
        url: e
      }, t || {});
      history.pushState(o, "", e), r._push(o), n.fire("pushstate", [ {
        key: r.key,
        from: i,
        to: o,
        back: r._getList(r.keyBack),
        forward: []
      } ]);
    },
    _push: function(e) {
      var t = this, r = t._getList(t.keyBack);
      r.push(e), o.setItem(t.keyBack, JSON.stringify(r)), t._setList(t.keyForward, []), 
      t.current = e;
    },
    replace: function(e, t) {
      var r = this, i = r.current, o = $.extend({
        key: r.key,
        id: getStateId(),
        url: e
      }, t || {});
      history.replaceState(o, "", e), this._replace(o), n.fire("replacestate", [ {
        key: r.key,
        from: i,
        to: o,
        back: r._getList(r.keyBack),
        foward: r._getList(r.keyForward)
      } ]);
    },
    _replace: function(e) {
      var t = this, r = t._getList(t.keyBack);
      r[Math.max(0, r.length - 1)] = e, t._setList(t.keyBack, r), t.current = e;
    },
    _back: function(e) {
      var t = this;
      t.current = e;
      var r = t._getList(t.keyBack);
      r.pop(), t._setList(t.keyBack, r), (r = t._getList(t.keyForward)).unshift(e), t._setList(t.keyForward, r);
    },
    _forward: function(e) {
      var t = this;
      t.current = e;
      var r = t._getList(t.keyBack);
      r.push(e), t._setList(t.keyBack, r), (r = t._getList(t.keyForward)).shift(), t._setList(t.keyForward, r);
    },
    onStateChange: function(e) {
      var t = this, r = !1, i = t.current;
      i && i.id !== e.id && (i.id > e.id ? (r = !0, t._back(e)) : t._forward(e)), n.fire("popstate", [ {
        key: t.key,
        from: i,
        to: e,
        isBack: r,
        back: t._getList(t.keyBack),
        foward: t._getList(t.keyForward)
      } ]);
    }
  }, StateClsCtrl.prototype = {
    getCls: function(e) {
      var t = this.key, r = t + "-" + e;
      return {
        beforeShow: r + "-before-show " + t + "-before-show pjax-before-show",
        show: r + "-show " + t + "-show pjax-show",
        beforeHide: r + "-before-hide " + t + "-before-hide pjax-before-hide",
        hide: r + "-hide " + t + "-hide pjax-hide"
      };
    },
    clearCls: function(e) {
      var t = e[0];
      if (t) {
        var r = new RegExp("(\\s+)" + this.key + "(-[^-]+)+-(show|hide)\\s*", "g");
        t.className = t.className.replace(r, "$1");
      }
    },
    animate: function(e, t, r, n) {
      var i = this, o = i.getCls(e);
      i.clearCls(t), i.clearCls(r), t.addClass(o.beforeHide), r.addClass(o.beforeShow), 
      t[0] && t[0].clientWidth, r[0] && r[0].clientWidth, clearTimeout(i.runTimer), i.isRunning && i.prevFn && i.prevFn(), 
      i.prevFn = function() {
        i.isRunning = !1, t.addClass(o.hide), r.addClass(o.show), n && n();
      }, i.isRunning = !0, i.runTimer = setTimeout(i.prevFn, i.waitTime);
    }
  };
  return Pjax.prototype = $.extend({
    init: function() {
      var e = this, t = this.$root, r = this.opts, n = t.find("[" + e.keyContainer + "]");
      if (n.length > 1) throw "[" + e.keyContainer + "] 元素，同一个页面，不能有多个";
      var i = e.history = new HistoryController(e.key);
      if (history.state || i.clear(), i.replace(location.href), n.length > 0) {
        var o = i.current;
        e._setDomIdByConf(n, o), e._setDomState(n, !0);
      }
      e.clsCtrl = new StateClsCtrl(e.key, r.animateTime);
    },
    _setDomIdByConf: function(e, t) {
      e.attr(this.keyId, t.id);
    },
    _setDomState: function(e, t) {
      t ? e.attr(this.keyCurrent, !0) : e.removeAttr(this.keyCurrent);
    },
    bindEvent: function() {
      function clearHistory(t) {
        var r = {};
        each([].concat(t.back || [], t.forward || []), function(e) {
          r[e.id] = 1;
        }), e.$root.find("[" + e.keyId + "]").each(function(t, n) {
          var i = $(n), o = i.attr(e.keyId);
          r[o] || setTimeout(function() {
            e.fire("dom:destroy", [ i ]), i.remove();
          }, e.opts.animateTime);
        });
      }
      var e = this, t = e.opts.key;
      n.on("pushstate", function(e) {
        e && e.key == t && clearHistory(e);
      }), n.on("popstate", function(r) {
        if (r && r.key == t && r.to) {
          clearHistory(r);
          var n = r.to.url, i = r.isBack ? "back" : "forward", o = e.$root.find("[" + e.keyId + "=" + r.to.id + "]");
          o.length > 0 ? e._addContent({
            $dom: o
          }, i) : e._load(n, i, !0);
        }
      });
    },
    back: function(e) {
      history.back();
    },
    forward: function(e) {
      history.forward();
    },
    push: function(t) {
      e ? this._load(t, "push") : location.href = t;
    },
    replace: function(t) {
      e ? this._load(t, "replace") : location.replace(t);
    },
    reload: function(t) {
      e ? this._load(t || location.href, "replace", !0) : location.reload();
    },
    _load: function(e, t, r) {
      var n = this;
      "object" === queryType(e) && (e = e.href || "");
      var i = toAbsUrl(e);
      if ((r || i !== location.href) && !n.lockAjax) return n.fire("pjax:request", [ i ].concat(toArray(arguments))), 
      n.ajax && n.ajax.abort(), n.ajax = $.get(i, {}, $.noop, "html").always(function() {
        n.fire("pjax:complete", [ i ].concat(toArray(arguments)));
      }).done(function(e) {
        n.fire("pjax:success", [ i ].concat(toArray(arguments))), n.handlerSuccess(i, t, e);
      }).fail(function() {
        n.fire("pjax:failure", [ i ].concat(toArray(arguments)));
      }), n.ajax;
    },
    handlerSuccess: function(e, t, r) {
      var n = this;
      n.lockAjax = !0;
      try {
        var i = n._analysisiHtml(r, e);
        if (!i.$dom || i.$dom.length <= 0) return n.lockAjax = !1, void n.fire("pjax:parseerror", [ e, r ]);
        n._addContent(i, t, function(r, i) {
          switch (n.lockAjax = !1, t) {
           case "push":
            n.history.push(e), n._setDomIdByConf(i, n.history.current);
            break;

           case "replace":
            n.history.replace(e), n.fire("dom:destroy", [ r ]), r.remove(), n._setDomIdByConf(i, n.history.current);
          }
        });
      } catch (t) {
        n.lockAjax = !1, n.fire("pjax:parseerror", [ e, r ]);
      }
    },
    _analysisiHtml: function(e, t) {
      var r = this, n = document.head || document.getElementsByTagName("head")[0], i = e.match(/<body[^>]*>([\s\S.]*)<\/body>/), o = e.match(/<head[^>]*>([\s\S.]*)<\/head>/), a = [], s = [], c = null, u = null, f = null;
      i && (u = $("<div>" + i[1] + "</div>")), o && (f = $("<div>" + o[1] + "</head>"));
      var d = "link[" + r.keyIgnore + "],style[" + r.keyIgnore + "],script[" + r.keyIgnore + "]", l = function(e, n) {
        var i = e.getAttribute(r.keyResource);
        return e.href ? e.setAttribute("href", toAbsUrl(e.getAttribute("href"), t)) : e.src && e.setAttribute("src", toAbsUrl(e.getAttribute("src"), t)), 
        {
          dom: e,
          pos: n,
          ignoreRepeat: 0 == i || !i
        };
      };
      return f && (u.find(d).remove(), f.find("style,link,script").each(function(e, t) {
        var r = s;
        "script" === t.tagName.toLowerCase() && (r = a), r.push(l(t, n));
      })), u && (u.find(d).remove(), c = u.find("[" + r.keyContainer + "]"), u.find("script").map(function(e, t) {
        $(t);
        c.find(t).length > 0 ? (t.setAttribute(r.keyResource, t.getAttribute(r.keyResource) || 1), 
        a.push(l(t, c[0]))) : t.hasAttribute(r.keyResource) && a.push(l(t, n));
      }), c.find("script").remove(), c.remove(), u.find("style,link").each(function(e, t) {
        t.hasAttribute(r.keyResource) && s.push(l(t, n));
      })), {
        scripts: a,
        links: s,
        $dom: c
      };
    },
    _addContent: function(e, t, r) {
      var n = this;
      if (e.$dom && 1 === e.$dom.length) {
        n.$root.append(e.$dom);
        var o = e.$dom, a = n.$root.find("[" + n.keyCurrent + "]"), s = $.Deferred(), c = $.Deferred();
        i.addScripts(e.scripts, function() {
          s.resolve();
        }), i.addLinks(e.links), $.when(s, c).always(function() {
          n.fire("pjax:render", [ o ]), n.fire("dom:ready", [ o ]);
        }), n.fire("dom:beforeshow", [ o ]), n.fire("dom:beforehide", [ a ]), n.clsCtrl.animate(t || "replace", a, o, function() {
          n._setDomState(o, !0), n._setDomState(a, !1), n.fire("dom:show", [ o ]), n.fire("dom:hide", [ a ]), 
          c.resolve(), r && r(a, o);
        });
      } else console.error("缺少 dom 元素");
    }
  }, r.prototype), $.pjax = function(e, t) {
    return new Pjax(e, t);
  }, $.pjax.support = e, Pjax;
});
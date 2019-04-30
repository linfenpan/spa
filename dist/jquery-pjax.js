/**
  @rely: jQuery
  @author: da宗熊
  @version: 0.0.6
  @lastModify: 2019/4/30
  @git: https://github.com/linfenpan/spa#readme
*/
!function(e, n) {
  "function" == typeof define ? define.amd ? define(n) : define.cmd && define(function(e, t, r) {
    r.exports = n();
  }) : e.Pjax = n();
}(this, function() {
  "use strict";
  var a = "popstate", s = "pushstate", o = "pushState" in history && !!window.sessionStorage;
  if (window.sessionStorage) try {
    var e = "__pajax";
    sessionStorage.setItem(e, 1), sessionStorage.removeItem(e);
  } catch (e) {
    o = !1;
  }
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
  function toAbsUrl(e, t) {
    if (c.isAbsolute(e)) return e;
    var r = location.href;
    return t = t || r, c.isAbsolute(t) || (t = toAbsUrl(t, r)), t = c.dir(t), c.join(t, e);
  }
  function removeUrlSeachAndHash(e) {
    return e.replace(/(\?|#).*$/, "");
  }
  function l() {
    this._ = $("<div></div>");
  }
  var c = {
    normal: function(e) {
      return e.replace(/\/\.\//g, "//").replace(/(^|[^:])\/{2,}/g, "$1/").replace(/[^/]*\/\.\.\/([^/]*)/g, "$1");
    },
    isAbsolute: function(e) {
      return /((https?|ftp):)?\/\//.test(e);
    },
    join: function() {
      var e = [].slice.call(arguments, 0), t = e.shift(), r = "/", n = !1, i = "/";
      c.isAbsolute(t) && (r = /.*?:?\/\/[^/]+\/?/.exec(t)[0] + "/", n = /^.*?:?\/\/[^/]+\/?$/.test(t)), 
      n && (i = r, t = r = "/");
      for (var o = e.shift(); o; ) {
        if (c.isAbsolute(o)) return t = o, e.unshift(t), c.join.apply(c, e);
        t = /^\//.test(o) ? c.normal(r + "/" + o) : c.normal(c.dir(t) + "/" + o), o = e.shift();
      }
      return n ? c.normal(i + "./" + t) : t;
    },
    dir: function(e) {
      return e = removeUrlSeachAndHash(e), c.isDir(e) ? c.normal(e) : c.normal(e.replace(/(.*\/).*$/, "$1"));
    },
    isDir: function(e) {
      return e = c.normal(e), !/(?:[^/])\/[^/]+\.[^/]+$/.test(e);
    },
    root: function(e) {
      var t = e.match(/.*:\/{2,}.*?(\/|$)/g);
      return t ? t[0] : "";
    },
    ext: function(e) {
      return (e = removeUrlSeachAndHash(e)).match(/\.([^.]*)$/)[1];
    }
  }, u = "_e_on_fn_";
  l.prototype = {
    on: function(e, t, r) {
      var n = this, i = t[u] || function() {
        var e = toArray(arguments);
        return e.shift(), t.apply(n, e);
      };
      return n._[r ? "one" : "on"](e, i), n;
    },
    off: function(e, t) {
      return this._.off(e, t && t[u] || t), this;
    },
    one: function(e, t) {
      return this.on(e, t, !0);
    },
    fire: function() {
      return this._.trigger.apply(this._, arguments), this;
    }
  };
  var d = new l(), f = {
    elHead: null,
    map: {},
    init: function() {
      var n = this;
      n.elHead = document.head || document.getElementsByTagName("head")[0], n.init = function() {}, 
      $("script,link").each(function(e, t) {
        var r = t.src || t.href;
        n._setExist(r);
      });
    },
    _setExist: function(e) {
      e && (c.isAbsolute(e) || (e = toAbsUrl(e)), this.map[e] = 1);
    },
    _addResource: function(e, t, r, n) {
      if (r = r || this.elHead, t) {
        if (n = void 0 === n || n, t = toAbsUrl(t), n && this.map[t]) return;
        r.appendChild(e), n && this._setExist(t);
      } else r.appendChild(e);
    },
    addScripts: function(e, t) {
      var a = this, s = [];
      a.init(), each(e, function(e) {
        var r = e.dom, t = e.pos, n = e.ignoreRepeat;
        if (r) {
          var i = document.createElement("script");
          if (!r.src) return i.innerHTML = $(r).html(), void $.when.apply($, s.slice(0)).always(function() {
            a._addResource(i, i.src, t, n);
          });
          if (each(r.attributes, function(e) {
            var t = e.name || e.nodeName || e;
            i.setAttribute(t, r.getAttribute(t));
          }), !n || !a.map[r.src]) {
            var o = $.Deferred();
            i.addEventListener("load", o.resolve, !1), i.addEventListener("error", o.resolve, !1), 
            s.push(o);
          }
          $.when.apply($, s.slice(0, -1)).always(function() {
            a._addResource(i, i.src, t, n);
          });
        }
      }), $.when.apply($, s.slice(0)).always(function() {
        t && t();
      });
    },
    addLinks: function(e) {
      var r = this;
      r.init(), each(e, function(e) {
        var t = e.dom;
        r._addResource(t, t.href, e.pos, e.ignoreRepeat);
      });
    }
  };
  $(function() {
    f.init();
  });
  var n = sessionStorage, t = new Date() / 1;
  function getStateId() {
    return t++;
  }
  function HistoryController(e) {
    this.key = e, this.keyBack = e + "-back", this.keyForward = e + "-forward", this.current = null, 
    this.bindEvent(), this.init();
  }
  function StateClsCtrl(e, t) {
    this.key = e, this.waitTime = t || 300, this.isRunning = !1, this.runTimer = null, 
    this.prevFn = null;
  }
  function Runner(e) {
    this.map = {}, this.split = e || "-", this.args = [];
  }
  HistoryController.prototype = {
    init: function() {
      if (!this.current) {
        var e = JSON.parse(n.getItem(this.keyBack) || "[]");
        this.current = e[e.length - 1];
      }
    },
    bindEvent: function() {
      var r = this;
      window.addEventListener("popstate", function(e) {
        var t = e.state;
        if (!t || !t.id) return !0;
        r.onStateChange(t);
      });
    },
    clear: function() {
      n.setItem(this.keyBack, "[]"), n.setItem(this.keyForward, "[]");
    },
    _getList: function(e) {
      return JSON.parse(n.getItem(e) || "[]");
    },
    _setList: function(e, t) {
      n.setItem(e, JSON.stringify(t || []));
    },
    push: function(e, t) {
      var r = this, n = r.current, i = $.extend({
        key: r.key,
        id: getStateId(),
        url: e
      }, t || {});
      history.pushState(i, "", e), r._push(i), d.fire(s, [ {
        key: r.key,
        from: n,
        to: i,
        back: r._getList(r.keyBack),
        forward: []
      } ]);
    },
    _push: function(e) {
      var t = this, r = t._getList(t.keyBack);
      r.push(e), n.setItem(t.keyBack, JSON.stringify(r)), t._setList(t.keyForward, []), 
      t.current = e;
    },
    replace: function(e, t) {
      var r = this, n = r.current, i = $.extend({
        key: r.key,
        id: getStateId(),
        url: e
      }, t || {});
      history.replaceState(i, "", e), this._replace(i), d.fire("replacestate", [ {
        key: r.key,
        from: n,
        to: i,
        back: r._getList(r.keyBack),
        forward: r._getList(r.keyForward)
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
      var t = this, r = !1, n = t.current;
      n && n.id !== e.id && (n.id > e.id ? (r = !0, t._back(e)) : t._forward(e)), d.fire(a, [ {
        key: t.key,
        from: n,
        to: e,
        isBack: r,
        back: t._getList(t.keyBack),
        forward: t._getList(t.keyForward)
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
  }, Runner.prototype = {
    params: function() {
      return this.args = toArray(arguments), this;
    },
    add: function() {
      var e = toArray(arguments), t = e.pop();
      if ("function" == queryType(t)) {
        return this.map[e.join(this.split)] = t, this;
      }
    },
    run: function() {
      var e = toArray(arguments), t = this.map[e.join(this.split)];
      return t && t.apply(null, this.args), this;
    }
  };
  var h = "pjax:render", p = "pjax:parseerror", y = "dom:ready", m = "repeat", v = "ignore", k = "once", g = "inlineScript";
  function Pjax(e, t) {
    var r = this;
    l.call(r), r.$root = e, r.opts = $.extend({
      key: "pjax",
      cache: !0,
      animateTime: 300,
      fireInitEvent: !0,
      resourceLoadConfig: {
        body: {},
        head: {},
        container: {},
        other: {}
      }
    }, t || {});
    var n = r.key = r.opts.key;
    if (r.keyContainer = "data-" + n + "-container", r.keyResource = "data-" + n + "-res", 
    r.keyCurrent = "data-" + n + "-current", r.keyId = "data-" + n + "-id", r.ajax = null, 
    r.lockAjax = !1, o) r.init(), r.bindEvent(); else {
      var i = e.find("[" + r.keyContainer + "]");
      r.opts.fireInitEvent && setTimeout(function() {
        r.fire(y, [ location.href, i ]);
      });
    }
  }
  return Pjax.prototype = $.extend({
    init: function() {
      var e = this, t = this.$root, r = this.opts, n = t.find("[" + e.keyContainer + "]");
      if (1 < n.length) throw "[" + e.keyContainer + "] 元素，同一个页面，不能有多个";
      var i = e.history = new HistoryController(e.key);
      history.state || i.clear();
      var o = location.href;
      if (i.replace(o), 0 < n.length) {
        var a = i.current;
        e._setDomIdByConf(n, a), e._setDomState(n, !0), r.fireInitEvent && setTimeout(function() {
          e.fire(h, [ o, n ]), e.fire(y, [ o, n ]);
        });
      }
      e.clsCtrl = new StateClsCtrl(e.key, r.animateTime), e.stateRunner = new Runner(), 
      e.initRunner();
    },
    initRunner: function() {
      var r = this, e = r.stateRunner, t = "history";
      e.add(t, "push", function(e) {
        r.history.push(e);
      }), e.add(t, "replace", function(e) {
        r.history.replace(e);
      }), t = "dom", e.add(t, "push", function(e, t) {
        r._setDomIdByConf(t, r.history.current);
      }), e.add(t, "replace", function(e, t) {
        r.fire("dom:destroy", [ e ]), e.remove(), r._setDomIdByConf(t, r.history.current);
      });
    },
    _setDomIdByConf: function(e, t) {
      e.attr(this.keyId, t.id);
    },
    _setDomState: function(e, t) {
      t ? e.attr(this.keyCurrent, !0) : e.removeAttr(this.keyCurrent);
    },
    bindEvent: function() {
      var o = this, i = o.opts.key;
      function clearHistory(e) {
        var t = [].concat(e.back || [], e.forward || []), i = {};
        each(t, function(e) {
          i[e.id] = 1;
        }), o.$root.find("[" + o.keyId + "]").each(function(e, t) {
          var r = $(t), n = r.attr(o.keyId);
          i[n] || setTimeout(function() {
            o.fire("dom:destroy", [ r ]), r.remove();
          }, o.opts.animateTime);
        });
      }
      d.on(s, function(e) {
        e && e.key == i && clearHistory(e);
      }), d.on(a, function(e) {
        if (e && e.key == i && e.to) {
          clearHistory(e);
          var t = e.to.url, r = e.isBack ? "back" : "forward", n = o.$root.find("[" + o.keyId + "=" + e.to.id + "]");
          0 < n.length ? o._addContent({
            $dom: n
          }, t, r) : o._load(t, r, !0);
        }
      });
    },
    back: function(e) {
      history.back();
    },
    forward: function(e) {
      history.forward();
    },
    push: function(e, t) {
      o ? this._load(e, "push", !1, t) : location.href = e;
    },
    replace: function(e, t) {
      o ? this._load(e, "replace", !1, t) : location.replace(e);
    },
    reload: function(e, t) {
      "boolean" == typeof e && (t = e, e = void 0), o ? this._load(e || location.href, "replace", !0, t) : location.reload();
    },
    _load: function(e, t, r, n) {
      var i = this;
      "object" === queryType(e) && (e = e.href || "");
      var o = toAbsUrl(e);
      if ((r || o !== location.href) && !i.lockAjax) return i.fire("pjax:request", [ o ].concat(toArray(arguments))), 
      i.ajax && i.ajax.abort(), i.ajax = $.ajax({
        url: o,
        type: "GET",
        cache: void 0 === n ? i.opts.cache : n,
        dataType: "html"
      }).always(function() {
        i.fire("pjax:complete", [ o ].concat(toArray(arguments)));
      }).done(function(e) {
        i.fire("pjax:success", [ o ].concat(toArray(arguments))), i.handlerSuccess(o, t, e);
      }).fail(function() {
        i.fire("pjax:failure", [ o ].concat(toArray(arguments)));
      }), i.ajax;
    },
    handlerSuccess: function(t, r, n) {
      var i = this;
      i.lockAjax = !0;
      try {
        var o = i.stateRunner;
        o.params(t).run("history", r);
        var e = i._analysisiHtml(n, t);
        if (!e.$dom || e.$dom.length <= 0) return i.lockAjax = !1, void i.fire(p, [ t, n, r ]);
        i._addContent(e, t, r, function(e, t) {
          i.lockAjax = !1, o.params(e, t).run("dom", r);
        });
      } catch (e) {
        i.lockAjax = !1, i.fire(p, [ t, n, r ]);
      }
    },
    _getResLoadMode: function(e, t, r) {
      return ((this.opts.resourceLoadConfig || {})[e] || {})[t] || r;
    },
    _analysisiHtml: function(e, s) {
      var c, u = this, d = u.keyResource, f = document.head || document.getElementsByTagName("head")[0], t = e.match(/<body[^>]*>([\s\S.]*)<\/body>/), r = e.match(/<head[^>]*>([\s\S.]*)<\/head>/), l = [], h = [], n = null, i = null, o = null;
      t && (i = $("<div>" + t[1] + "</div>"), n = i.find("[" + u.keyContainer + "]"), 
      c = n[0]), r && (o = $("<div>" + r[1] + "</head>"));
      function vd(e, t, r) {
        var n, i, o = e.getAttribute(d), a = e.tagName.toLowerCase();
        switch (r = r || [], e.href ? (n = h, e.setAttribute("href", toAbsUrl(e.getAttribute("href"), s))) : e.src ? (n = l, 
        e.setAttribute("src", toAbsUrl(e.getAttribute("src"), s))) : "script" === a ? (n = l, 
        a = g) : n = h, a) {
         case g:
         case "style":
          i = c;
          break;

         case "script":
         case "link":
          i = o === m ? c : f;
        }
        o || (o = u._getResLoadMode(t, a, r[a])), n && i && o != v && n.push({
          dom: e,
          pos: i,
          ignoreRepeat: o == k || !o
        });
      }
      var a = d + "=ignore", p = "link[" + a + "],style[" + a + "],script[" + a + "]", y = "script,link,style";
      return o && (i.find(p).remove(), o.find(y).each(function(e, t) {
        vd(t, "head", {
          inlineScript: m,
          script: k,
          style: m,
          link: k
        });
      })), i && (i.find(p).remove(), i.find(y).map(function(e, t) {
        var r = $(t);
        0 < n.find(t).length ? vd(t, "container", {
          inlineScript: m,
          script: m,
          style: m,
          link: m
        }) : r.parent().is(i) ? vd(t, "body", {
          inlineScript: m,
          script: k,
          style: m,
          link: k
        }) : vd(t, "other", {
          inlineScript: v,
          script: v,
          style: v,
          link: v
        });
      }), n.find(y).remove(), n.remove()), {
        scripts: l,
        links: h,
        $dom: n
      };
    },
    _addContent: function(e, t, r, n) {
      var i = this;
      if (e.$dom && 1 === e.$dom.length) {
        i.$root.append(e.$dom);
        var o = e.$dom, a = i.$root.find("[" + i.keyCurrent + "]"), s = $.Deferred(), c = $.Deferred();
        f.addLinks(e.links), f.addScripts(e.scripts, function() {
          s.resolve();
        }), $.when(s, c).always(function() {
          i.fire(h, [ t, o ]), i.fire(y, [ t, o ]);
        }), i.fire("dom:beforeshow", [ t, o ]), i.fire("dom:beforehide", [ t, a ]), i.clsCtrl.animate(r || "replace", a, o, function() {
          i._setDomState(o, !0), i._setDomState(a, !1), i.fire("dom:show", [ t, o ]), i.fire("dom:hide", [ t, a ]), 
          c.resolve(), n && n(a, o);
        });
      } else console.error("缺少 dom 元素");
    }
  }, l.prototype), $.pjax = function(e, t) {
    return new Pjax(e, t);
  }, $.pjax.support = o, Pjax;
});
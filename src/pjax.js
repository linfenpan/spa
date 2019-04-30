'use strict';
var EVENT_PJAX_REQUEST = 'pjax:request';
var EVENT_PJAX_COMPLETE = 'pjax:complete';
var EVENT_PJAX_SUCCESS = 'pjax:success';
var EVENT_PJAX_RENDER = 'pjax:render';
var EVENT_PJAX_FAILURE = 'pjax:failure';
// 结构解析出错，应该检查 ajax 返回的内容，是否合法
var EVENT_PARSE_ERROR = 'pjax:parseerror';

// DOM 事件
var EVENT_DOM_READY = 'dom:ready';
var EVENT_DOM_BEFORE_SHOW = 'dom:beforeshow';
var EVENT_DOM_SHOW = 'dom:show';
var EVENT_DOM_BEFORE_HIDE = 'dom:beforehide';
var EVENT_DOM_HIDE = 'dom:hide';
var EVENT_DOM_DESTROY = 'dom:destroy';

// 资源类型
var TYPE_RES_REPEAT = 'repeat';
var TYPE_RES_IGNORE = 'ignore';
var TYPE_RES_ONCE = 'once';

// dom 元素类型
var DOM_TYPE_SCRIPT = 'script';
var DOM_TYPE_INLINE_SCRIPT = 'inlineScript';
var DOM_TYPE_STYLE = 'style';
var DOM_TYPE_LINK = 'link';

function Pjax($root, opts) {
  var ctx = this;
  Event.call(ctx);

  ctx.$root = $root;

  ctx.opts = $.extend({
    // 每个 pjax 实例的 key，必须唯一
    key: 'pjax',
    // 是否使用缓存
    cache: true,
    // 动画执行完毕需要的时间
    animateTime: 300,
    // 发布初始化的事件
    fireInitEvent: true,

    // 资源默认加载方式，other 是指在 body 内，但又不是 body 最外层的资源
    resourceLoadConfig: {
      body: { /* inlineScript:, script:, style:, link: */ },
      head: { /* inlineScript:, script:, style:, link: */ },
      container: { /* inlineScript:, script:, style:, link: */ },
      other: { /* inlineScript:, script:, style:, link: */ }
    }
  }, opts || {});

  var key = ctx.key = ctx.opts.key;

  ctx.keyContainer = 'data-' + key + '-container';
  ctx.keyResource = 'data-' + key + '-res'; // 0: 重复加载，1: 加载一次
  ctx.keyCurrent = 'data-' + key + '-current';
  ctx.keyId = 'data-' + key + '-id';

  ctx.ajax = null;
  ctx.lockAjax = false;

  if (isSupport) {
    ctx.init();
    ctx.bindEvent();
  } else {
    // 如果不支持 $.pjax，也发布 dom:ready 事件
    var $current = $root.find('[' + ctx.keyContainer+ ']');
    if (ctx.opts.fireInitEvent) {
      setTimeout(function() {
        ctx.fire(EVENT_DOM_READY, [$current]);
      });
    }
  }

}

Pjax.prototype = $.extend({
  init: function() {
    // 如果有多个 ctx.keyContainer 的元素，报错吧
    var ctx = this;
    var $root = this.$root;
    var opts = this.opts;

    var $current = $root.find('[' + ctx.keyContainer+ ']');
    if ($current.length > 1) {
      throw '[' + ctx.keyContainer + '] 元素，同一个页面，不能有多个'
    }

    var his = ctx.history = new HistoryController(ctx.key);
    if (!history.state) {
      his.clear();
    }
    his.replace(location.href);

    if ($current.length > 0) {
      var conf = his.current;
      ctx._setDomIdByConf($current, conf);
      ctx._setDomState($current, true);

      if (opts.fireInitEvent) {
        // 让事件有充分事件进行准备
        setTimeout(function() {
          ctx.fire(EVENT_PJAX_RENDER, [$current]);
          ctx.fire(EVENT_DOM_READY, [$current]);
        });
      }
    }

    // 样式控制器
    ctx.clsCtrl = new StateClsCtrl(ctx.key, opts.animateTime);

    // 状态控制
    ctx.stateRunner = new Runner();
    ctx.initRunner();
  },

  initRunner: function() {
    var ctx = this;
    var runner = ctx.stateRunner;

    var key = 'history';
    runner.add(key, 'push', function(url) {
      // 在 bindEvent 中的 EVENT_STATE_PUSH 中，清理不存在的元素
      ctx.history.push(url);
    });
    runner.add(key, 'replace', function(url) {
      ctx.history.replace(url);
    });

    key = 'dom';
    runner.add(key, 'push', function($old, $now) {
      ctx._setDomIdByConf($now, ctx.history.current);
    });
    runner.add(key, 'replace', function($old, $now) {
      ctx.fire('dom:destroy', [$old]);
      $old.remove();
      ctx._setDomIdByConf($now, ctx.history.current);
    });
  },

  _setDomIdByConf: function($dom, conf) {
    $dom.attr(this.keyId, conf.id);
  },

  _setDomState: function($dom, isCurrent) {
    if (isCurrent) {
      $dom.attr(this.keyCurrent, true);
    } else {
      $dom.removeAttr(this.keyCurrent);
    }
  },

  bindEvent: function() {
    var ctx = this;
    var key = ctx.opts.key;

    pEvent.on(EVENT_STATE_PUSH, function(conf) {
      if (!conf || conf.key != key) { return; }
      clearHistory(conf);
    });

    pEvent.on(EVENT_STATE_CHANGE, function(conf) {
      if (!conf || conf.key != key || !conf.to) { return; }
      clearHistory(conf);

      var url = conf.to.url;
      // 检查有木有元素，没有则重新加载
      var mode = conf.isBack ? 'back' : 'forward';
      var $dom = ctx.$root.find('[' + ctx.keyId + '=' + conf.to.id + ']');
      if ($dom.length > 0) {
        ctx._addContent({ $dom: $dom }, mode);
      } else {
        ctx._load(url, mode, true);
      }
    });

    // 根据前进、后退盏，清空多余的元素
    function clearHistory(conf) {
      var list = [].concat(conf.back || [], conf.forward || []);
      var map = {};

      each(list, function(item) {
        map[item.id] = 1;
      });

      // 清空不存在的元素
      ctx.$root.find('[' + ctx.keyId + ']').each(function(i, dom) {
        var $dom = $(dom), id = $dom.attr(ctx.keyId);
        if (!map[id]) {
          setTimeout(function() {
            ctx.fire(EVENT_DOM_DESTROY, [$dom]);
            $dom.remove();
          }, ctx.opts.animateTime);
        }
      });
    }
  },

  back: function(a) {
    history.back();
  },

  forward: function(a) {
    history.forward();
  },

  push: function(url, isCache) {
    if (isSupport) {
      this._load(url, 'push', false, isCache);
    } else {
      location.href = url;
    }
  },

  replace: function(url, isCache) {
    if (isSupport) {
      this._load(url, 'replace', false, isCache);
    } else {
      location.replace(url);
    }
  },

  reload: function(url, isCache) {
    if (typeof url === 'boolean') {
      isCache = url;
      url = void 0;
    }

    if (isSupport) {
      this._load(url || location.href, 'replace', true, isCache);
    } else {
      location.reload();
    }
  },

  _load: function(absUrl, addMode, forceUpdate, isCache) {
    var ctx = this;
    if (queryType(absUrl) === 'object') {
      absUrl = absUrl.href || '';
    }

    var url = toAbsUrl(absUrl);
    if (!forceUpdate && url === location.href || ctx.lockAjax) {
      // 本页面，及不需要更新了吧？
      return;
    }

    ctx.fire(EVENT_PJAX_REQUEST, [url].concat(toArray(arguments)));
    ctx.ajax && ctx.ajax.abort();

    ctx.ajax = $.ajax({
      url: url,
      type: 'GET',
      cache: isCache === void 0 ? ctx.opts.cache : isCache,
      dataType: 'html'
    })
      .always(function() {
        ctx.fire(EVENT_PJAX_COMPLETE, [url].concat(toArray(arguments)));
      })
      .done(function(html) {
        ctx.fire(EVENT_PJAX_SUCCESS, [url].concat(toArray(arguments)));
        ctx.handlerSuccess(url, addMode, html);
      })
      .fail(function() {
        ctx.fire(EVENT_PJAX_FAILURE, [url].concat(toArray(arguments)));
      });

    return ctx.ajax;
  },

  handlerSuccess: function(url, addMode, html) {
    var ctx = this;
    // 动画执行，是耗费时间的，这时候，如果被人点击了~，就会插入多个元素
    ctx.lockAjax = true;
    try {
      var runner = ctx.stateRunner;
      runner.params(url).run('history', addMode);

      var result = ctx._analysisiHtml(html, url);
      if (!result.$dom || result.$dom.length <= 0) {
        ctx.lockAjax = false;
        ctx.fire(EVENT_PARSE_ERROR, [url, html, addMode]);
        return;
      }
      
      ctx._addContent(result, addMode, function($old, $now) {
        ctx.lockAjax = false;
        runner.params($old, $now).run('dom', addMode);
      });
    } catch (e) {
      ctx.lockAjax = false;
      ctx.fire(EVENT_PARSE_ERROR, [url, html, addMode]);
    }
  },

  _getResLoadMode: function(container, type, defaultValue) {
    var conf = this.opts.resourceLoadConfig || {};
    var map = conf[container] || {};
    return map[type] || defaultValue;
  },

  _analysisiHtml: function(html, url) {
    var ctx = this;
    var keyResource = ctx.keyResource;
    var elHead = document.head || document.getElementsByTagName('head')[0];
    var matcherBody = html.match(/<body[^>]*>([\s\S.]*)<\/body>/);
    var matcherHead = html.match(/<head[^>]*>([\s\S.]*)<\/head>/);

    var scripts = [],    // 插入到 head 的脚本元素
      links = [];        // 插入到 head 的样式元素
    var $dom = null, $body = null, $head = null;
    var elDom;

    if (matcherBody) {
      $body = $('<div>' + matcherBody[1] + '</div>');
      $dom = $body.find('[' + ctx.keyContainer + ']');
      elDom = $dom[0];
    }
    if (matcherHead) {
      $head = $('<div>' + matcherHead[1] + '</head>');
    }

    // 找到所有含有 ctx.keyResource = 'ignore' 属性的 link/style/script 标签
    var attrIgnore = keyResource + '=ignore';
    var selectorIgnore = 'link[' + attrIgnore + '],style[' + attrIgnore + '],script[' + attrIgnore + ']';
    var selectorResource = 'script,link,style';

    // 转为配置列表
    var addConfItem = function(dom, from, resLoadConf) {
      var attrResource = dom.getAttribute(keyResource);
      var domType = dom.tagName.toLowerCase();
      var list;

      resLoadConf = resLoadConf || [];

      // 相对路径，修复为绝对路径
      if (dom.href) {
        list = links;
        dom.setAttribute('href', toAbsUrl(dom.getAttribute('href'), url));
      } else if (dom.src) {
        list = scripts;
        dom.setAttribute('src', toAbsUrl(dom.getAttribute('src'), url));
      } else {
        if (domType === 'script') {
          list = scripts;
          domType = DOM_TYPE_INLINE_SCRIPT;
        } else {
          list = links;
        }
      }

      var appendTo;
      switch (domType) {
        case DOM_TYPE_INLINE_SCRIPT:
        case DOM_TYPE_STYLE:
          appendTo = elDom;
          break;
        case DOM_TYPE_SCRIPT:
        case DOM_TYPE_LINK:
          appendTo = attrResource === TYPE_RES_REPEAT ? elDom : elHead;
          break;
      }

      if (!attrResource) {
        attrResource = ctx._getResLoadMode(from, domType, resLoadConf[domType]);
      }

      if (list && appendTo && attrResource != TYPE_RES_IGNORE) {
        list.push({
          dom: dom,
          pos: appendTo,
          ignoreRepeat: attrResource == TYPE_RES_ONCE || !attrResource
        });
      }
    };

    if ($head) {
      // 删除所有忽略的资源
      $body.find(selectorIgnore).remove();
      // $head 所有元素，默认是仅加载一次的
      $head.find(selectorResource).each(function(i, el) {
        addConfItem(el, 'head', {
          inlineScript: TYPE_RES_REPEAT,
          script: TYPE_RES_ONCE,
          style: TYPE_RES_REPEAT,
          link: TYPE_RES_ONCE
        });
      });
    }

    if ($body) {
      // 删除所有忽略的资源
      $body.find(selectorIgnore).remove();

      // 从上到下，寻找所有资源
      // 寻找脚本
      $body.find(selectorResource).map(function(i, el) {
        var $el = $(el);
        if ($dom.find(el).length > 0) {
          // $dom 的元素，默认是 data-pjax-res="repeat"，即每次异步，都会重新加载，无论它是否已经存在
          addConfItem(el, 'container', {
            inlineScript: TYPE_RES_REPEAT,
            script: TYPE_RES_REPEAT,
            style: TYPE_RES_REPEAT,
            link: TYPE_RES_REPEAT
          });
        } else {
          // 外部脚本:
          //  a) 非 $dom 的元素，默认是 data-pjax-res="once" 的;
          //  b) 如果 data-pjax-res != ignore，就按照规则加载
          //  c) 如果直接父元素是 body 的，又没有 data-pjax-res 标志的，则按 once 的模式加载
          // 内联脚本:
          //  跟外部脚本 a、b 两点规则一致，不过内联脚本，都插入 data-pjax-container 中
          //  c) 如果直接父元素是 body 的，又没有 data-pjax-res 标志的，则按 repeat 的模式加载
          if ($el.parent().is($body)) {
            addConfItem(el, 'body', {
              inlineScript: TYPE_RES_REPEAT,
              script: TYPE_RES_ONCE,
              style: TYPE_RES_REPEAT,
              link: TYPE_RES_ONCE
            });
          } else {
            addConfItem(el, 'other', {
              inlineScript: TYPE_RES_IGNORE,
              script: TYPE_RES_IGNORE,
              style: TYPE_RES_IGNORE,
              link: TYPE_RES_IGNORE
            });
          }
        }
      });

      $dom.find(selectorResource).remove();
      $dom.remove();
    }

    return { scripts: scripts, links: links, $dom: $dom };
  },

  _addContent: function(result, addMode, callback) {
    var ctx = this;
    if (result.$dom && result.$dom.length === 1) {
      ctx.$root.append(result.$dom);

      var $show = result.$dom;
      var $hide = ctx.$root.find('[' + ctx.keyCurrent + ']');

      var defScript = $.Deferred(), defAnimate = $.Deferred();

      resourceCtrl.addLinks(result.links);
      resourceCtrl.addScripts(result.scripts, function() {
        defScript.resolve();
      });

      $.when(defScript, defAnimate).always(function() {
        ctx.fire(EVENT_PJAX_RENDER, [$show]);
        ctx.fire(EVENT_DOM_READY, [$show]);
      });

      ctx.fire(EVENT_DOM_BEFORE_SHOW, [$show]);
      ctx.fire(EVENT_DOM_BEFORE_HIDE, [$hide]);

      ctx.clsCtrl.animate(addMode || 'replace', $hide, $show, function() {
        ctx._setDomState($show, true);
        ctx._setDomState($hide, false);

        ctx.fire(EVENT_DOM_SHOW, [$show]);
        ctx.fire(EVENT_DOM_HIDE, [$hide]);

        defAnimate.resolve();

        callback && callback($hide, $show);
      });
    } else {
      console.error('缺少 dom 元素');
    }
  }
}, Event.prototype);

$.pjax = function($root, opts) {
  return new Pjax($root, opts);
};
$.pjax.support = isSupport;

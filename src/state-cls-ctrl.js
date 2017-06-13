'use strict';

function StateClsCtrl(key, waitTime) {
  this.key = key;
  this.waitTime = waitTime || 300;
  this.isRunning = false;
  this.runTimer = null;
  this.prevFn = null;
}

StateClsCtrl.prototype = {
  getCls: function(action) {
    var key = this.key;
    var prefix = key + '-' + action;
    return {
      beforeShow: prefix + '-before-show ' + key + '-before-show pjax-before-show',
      show: prefix + '-show ' + key + '-show pjax-show',
      beforeHide: prefix + '-before-hide ' + key + '-before-hide pjax-before-hide',
      hide: prefix + '-hide ' + key + '-hide pjax-hide'
    };
  },

  clearCls: function($dom) {
    var dom = $dom[0];
    if (dom) {
      var reg = new RegExp('(\\s+)' + this.key + '(-[^-]+)+-(show|hide)\\s*', 'g');
      dom.className = dom.className.replace(reg, '$1');
    }
  },

  animate: function(action, $hide, $show, callback) {
    var ctx = this;
    var cls = ctx.getCls(action);

    ctx.clearCls($hide);
    ctx.clearCls($show);

    $hide.addClass(cls.beforeHide);
    $show.addClass(cls.beforeShow);

    $hide[0] && $hide[0].clientWidth;
    $show[0] && $show[0].clientWidth;

    clearTimeout(ctx.runTimer);
    if (ctx.isRunning && ctx.prevFn) {
      ctx.prevFn();
    }

    ctx.prevFn = function() {
      ctx.isRunning = false;
      $hide.addClass(cls.hide);
      $show.addClass(cls.show);
      callback && callback();
    };

    ctx.isRunning = true;
    ctx.runTimer = setTimeout(ctx.prevFn, ctx.waitTime);
  }
};

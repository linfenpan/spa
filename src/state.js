'use strict';

var store = sessionStorage;
var StateAutoId = new Date / 1;

function getStateId() {
  return StateAutoId++;
}

function HistoryController(key) {
  this.key = key;
  this.keyBack = key + '-back';
  this.keyForward = key + '-forward';
  this.current = null;

  this.bindEvent();
  this.init();
}

HistoryController.prototype = {
  init: function() {
    if (!this.current) {
      var back = JSON.parse(store.getItem(this.keyBack) || '[]');
      this.current = back[back.length - 1];
    }
  },

  bindEvent: function() {
    var ctx = this;
    window.addEventListener('popstate', function(e) {
      var state = e.state;
      if (!state || !state.id) { return true; }
      ctx.onStateChange(state);
    });
  },

  clear: function() {
    store.setItem(this.keyBack, '[]');
    store.setItem(this.keyForward, '[]');
  },

  _getList: function(key) {
    return JSON.parse(store.getItem(key) || '[]');
  },

  _setList: function(key, list) {
    store.setItem(key, JSON.stringify(list || []));
  },

  push: function(url, opts) {
    var ctx = this;
    var now = ctx.current;
    var state = $.extend({ key: ctx.key, id: getStateId(), url: url }, opts || {});

    history.pushState(state, '', url);
    ctx._push(state);

    pEvent.fire(EVENT_STATE_PUSH, [{
      key: ctx.key,
      from: now,
      to: state,
      back: ctx._getList(ctx.keyBack),
      forward: []
    }]);
  },

  _push: function(state) {
    var ctx = this;
    var list = ctx._getList(ctx.keyBack);

    list.push(state);
    store.setItem(ctx.keyBack, JSON.stringify(list));

    // 清空 forward 列表
    ctx._setList(ctx.keyForward, []);

    ctx.current = state;
  },

  replace: function(url, opts) {
    var ctx = this;
    var now = ctx.current;
    var state = $.extend({ key: ctx.key, id: getStateId(), url: url }, opts || {});

    history.replaceState(state, '', url);
    this._replace(state);

    pEvent.fire(EVENT_STATE_REPLACE, [{
      key: ctx.key,
      from: now,
      to: state,
      back: ctx._getList(ctx.keyBack),
      forward: ctx._getList(ctx.keyForward)
    }]);
  },

  _replace: function(state) {
    var ctx = this;
    var list = ctx._getList(ctx.keyBack);

    list[Math.max(0, list.length - 1)] = state;
    ctx._setList(ctx.keyBack, list);

    ctx.current = state;
  },

  _back: function(state) {
    var ctx = this;
    ctx.current = state;

    var list =  ctx._getList(ctx.keyBack);
    list.pop();
    ctx._setList(ctx.keyBack, list);

    list = ctx._getList(ctx.keyForward);
    list.unshift(state);
    ctx._setList(ctx.keyForward, list);
  },

  _forward: function(state) {
    var ctx = this;
    ctx.current = state;

    var list = ctx._getList(ctx.keyBack);
    list.push(state);
    ctx._setList(ctx.keyBack, list);

    list = ctx._getList(ctx.keyForward);
    list.shift();
    ctx._setList(ctx.keyForward, list);
  },

  onStateChange: function(nowState) {
    var ctx = this;
    var isBack = false;
    var oldState = ctx.current;

    if (!oldState || oldState.id === nowState.id) {
      // 新页面
    } else if (oldState.id > nowState.id) {
      isBack = true;
      ctx._back(nowState);
    } else {
      ctx._forward(nowState);
    }

    pEvent.fire(EVENT_STATE_CHANGE, [{
      key: ctx.key,
      from: oldState,
      to: nowState,
      isBack: isBack,
      back: ctx._getList(ctx.keyBack),
      forward: ctx._getList(ctx.keyForward)
    }]);
  }
};

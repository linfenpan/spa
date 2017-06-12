'use strict';

var Event = function() {
  this._ = $('<div></div>');
};
var KEY_EVENT_ON = '_e_on_fn_';

Event.prototype = {
  on: function(evt, fn, isOne) {
    var ctx = this;
    var newFn = fn[KEY_EVENT_ON] || function() {
      var args = toArray(arguments);
      // 删掉第一个参数：event
      args.shift();
      return fn.apply(this, args);
    };
    ctx._[isOne ? 'one' : 'on'](evt, newFn);
    return ctx;
  },

  off: function(evt, fn) {
    this._.off(evt, fn ? fn[KEY_EVENT_ON] || fn : fn);
    return this;
  },

  one: function(evt, fn) {
    return this.on(evt, fn, true);
  },

  fire: function(/*[ arg1, arg2 ]*/) {
    this._.trigger.apply(this._, arguments);
    return this;
  }
};

var pEvent = new Event();

'use strict';
function Runner(split) {
  var ctx = this;
  ctx.map = {};
  ctx.split = split || '-';
  ctx.args = [];
}

Runner.prototype = {
  params: function() {
    this.args = toArray(arguments);
    return this;
  },

  add: function() {
    var args = toArray(arguments);
    var fn = args.pop();
    if (queryType(fn) != 'function') {
      return;
    }

    var ctx = this;
    ctx.map[args.join(ctx.split)] = fn;

    return ctx;
  },

  run: function() {
    var ctx = this;
    var args = toArray(arguments);
    var fn = ctx.map[args.join(ctx.split)];
    fn && fn.apply(null, ctx.args);
    return ctx;
  }
};

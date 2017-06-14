// 事件测试
// pEvent.on('a', function() {
//   console.log(arguments);
// });
// pEvent.one('a', function() {
//   console.log(arguments);
// });
// pEvent.fire('a', [1, 2, 3]);
// pEvent.fire('a', [1, 2, 3]);
// pEvent.off('a');
// pEvent.fire('a', [1, 2, 3]);

// var hCtrl = new HistoryController('test');
// $('li a').click(function() {
//   hCtrl.push(this.href, { });
// });

var pjax = $.pjax($('body'));

$('#btmBar').on('click', 'a', function() {
  pjax.push(this);
  return false;
});

function info(msg) {
  console.log('%c' + msg, 'background: #222; color: #bada55');
}

pjax.on('pjax:request', function(url) {
  info('pjax:request -> 请求地址:' + url);
});
pjax.on('pjax:complete', function(url) {
  info('pjax:complete -> 请求地址:' + url);
});
pjax.on('pjax:success', function(url) {
  info('pjax:success -> 请求地址:' + url);
});
pjax.on('pjax:failure', function(url) {
  info('pjax:failure -> 请求地址:' + url);
});
pjax.on('pjax:render', function($dom) {
  info('pjax:render，当前元素:');
  console.log($dom);
});
pjax.on('dom:beforeshow', function($dom) {
  info('dom:beforeshow，当前元素:');
  console.log($dom);
});
pjax.on('dom:show', function($dom) {
  info('dom:show，当前元素:');
  console.log($dom);
});
pjax.on('dom:ready', function($dom) {
  info('dom:ready，当前元素:');
  console.log($dom);
});
pjax.on('dom:beforehide', function($dom) {
  info('dom:beforehide，当前元素:');
  console.log($dom);
});
pjax.on('dom:hide', function($dom) {
  info('dom:hide，当前元素:');
  console.log($dom);
});
pjax.on('dom:destroy', function($dom) {
  info('dom:destroy，当前元素:');
  console.log($dom);
});
pjax.on('pjax:parseerror', function(url, html) {
  console.error('页面解析失败');
});

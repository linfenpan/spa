# 设计

## 初始化
```javascript
   // key 值用于区分不同的 pjax 对象
   // animateTime 预设动画时间，不需要动画，可设置为 0
  var pjax = $.pjax($dom, { key: 'pjax', animateTime: 300, ... });
```

## 对外提供
外部使用
```javascript
  // 两个方法，与 history.pushState 和 history.replaceState 相对应
  // 如果 参数 是字符串，则按照当前路径编译为绝对路径，然后再进行请求
  // 如果 参数 是对象，则读取该对象的 href 属性，然后走字符串的逻辑
  pjax.push(ul|{href: 绝对路径})
  pjax.replace(url|{href: 绝对路径})
```

## html使用
整体结果，设想如下
```html
  <head>
    <!-- 自动判定，当前脚本和样式，是否已经被加载过了，如果加载过了，就不再加载 -->
    <link href="" />
    <script src=""></script>
    <script>
      // 每次异步之后，都执行之~~~
    </script>
    <style>
      /* 每次异步之后，都会插入此样式，所以尽量避免使用 style 标签 */
    </style>
  </head>
  <body>

    <!-- 每个页面，只允许有1个 data-pjax-container -->
    <!-- 内部的所有资源，默认都是 data-pjax-res="1" 的 -->
    <div data-pjax-container>
      异步的内容
      <script>每次被异步回来时，都会执行的脚本 或 外部脚本</script>
      <link href="每次异步回来时，都会加载的样式" rel="stylesheet" />
      <style>
        /* 每次异步回来时，都会加载的样式 */
      </style>
      <style data-pjax-ignore>
        /* 每次异步回来时，都会忽略此样式 */
      </style>
      <!-- 加载一次后，忽略重复的 -->
      <link href="" rel="" data-pjax-res="0" />
    </div>

    <!-- 在 body 内部的所有脚本、样式，默认都是 data-pjax-ignore的，默认全不加载! -->
    <script src=""></script>
    <link href="" rel="stylesheet" />
    <style>/* 异步的时候，会被忽略掉 */</style>
    <script>
      /* 异步的时候，会被忽略掉 */
    </script>

    <!-- 有 data-pjax-res="0" 或 没有值 标志的元素，异步时，仅加载一次 -->
    <script src="" data-pjax-res="0"></script>
    <!-- 有 data-pjax-res="1" 标志的元素，每次异步都会进行加载，无论是否已经加载过了 -->
    <script src="" data-pjax-res="1"></script>
  </body>
```

## 原理说明
找到当前页面唯一的 data-pjax-container 元素，给它添加 class=pjax-current，添加属性 data-id=当前地址对应的id；

假设，当前是: $current，上一个是: $prev，下一个是: $next

切换过程，应该锁定整个 $container 区域，禁止操作，切换预留 300ms 作为动画切换

如果是 back 操作:
1. $prev.addClass(pjax-back-before-show);
- $current.addClass(pjax-back-before-hide);
- $current.addClass(pjax-back-hide);
- $prev.addClass(pjax-back-show);

如果是 forward or 新页面 操作:
1. $current.addClass(pjax-forward-before-hide);
- $next.addClass(pjax-forward-before-show);
- $current.addClass(pjax-foward-hide);
- $next.addClass(pjax-forward-show);

如果是 replace 操作:
1. $current.addClass(pjax-replace-before-hide);
- $next.addClass(pjax-replace-before-show);
- $current.addClass(pjax-replace-hide)
- $next.addClass(pjax-replace-show)

事件说明:
1. pjax.on('pjax:request', function($current) {  });
- pjax.on('pjax:complete', function($current, $prev|$next) { });
- pjax.on('pjax:success', function($current, $prev|$next) { });
- pjax.on('pjax:failure', function(error, $prev|$next) { });

# 内置事件
例如:
```javascript
pjax.on('pjax:request', function() {
  console.log('请求新页面');
});
```

所有事件:
  1. pjax:request 请求新页面
  2. pjax:complete 请求完成
  3. pjax:success 请求完成
  4. pjax:failure 请求失败
  5. pjax:render 新页面的脚本资源已经加载完毕，dom元素开始渲染，第一个参数为当前要显示的元素
  6. dom:ready 某个 dom 元素，所有资源已经准备完毕，开始渲染
  7. dom:beforeshow 某个 dom 元素，显示之前
  8. dom:beforehide 某个 dom 元素，隐藏之前
  9. dom:show 某个 dom 元素，显示
  10. dom:hide 某个 dom 元素，隐藏
  11. dom:destroy 某个 dom 元素，销毁

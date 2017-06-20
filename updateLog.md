### 0.0.4
  * 添加 fireInitEvent 参数，控制是否初始化时，异步触发 dom:ready 和 pjax:render 事件。
  * 添加 cache 参数，控制 ajax 请求，是否允许缓存使用
  * pjax.replace/pjax.push/pjax.reload 添加 isCache 参数，传入 false，则使用非缓存形式请求
  * 修复不能自动清理多余 data-pjax-container 的问题

### 0.0.3
  修正使用 spa 后，相对路径，无法找到图片的BUG

### 0.0.2

添加 pjax:parseerror 事件，当请求的页面，缺少 data-[key]-container 元素时，抛出解析失败事件。

隐藏掉 pjax.load() 方法

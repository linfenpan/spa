### 0.0.5
  * 更改 body 最外层资源的加载方式，外部资源更改为 once 模式，内联资源更改为 repeat 模式。非最外层的资源，默认还是 ignore 形式
  * repeat 模式加载的资源，都放在 container 中
  * data-pjax-res="0|1" 太难记了，更改为 repeat|once|ignore
  * 删除 data-pjax-ignore，更替为 data-pjax-res="ignore" 控制
  * 先插入样式，再插入脚本
  * 通过 resourceLoadConfig 参数，可控制资源的默认加载情况
  * 如果不支持 $.pjax，也至少抛出 dom:ready 事件

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

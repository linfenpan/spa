# 优化构思

1. [√] 请求读取缓存? cache: true
2. [X 实际意义不算大，spa应用的深度，应该受到控制才对的!] 设置缓存最大长度，超过最大长度，删除超出的div，节省内存，cacheLength: 10
3. [√] dom:ready 和 pjax:render 在初始化时，也需要触发一次
4. [√] 修复不能自动清理的BUG
5. 添加加载进度百分比的事件，发布 pjax:progress -> fn(sum, cur) 事件
6. [√] body 最外层的脚本、资源，默认应该使用加载一次，不加载的方式；如果是最外层的脚本，而且是 repeat 加载的，应该扔到 data-pjax-container 里面；所有 link 标签，默认都是 once 加载；所有 style 标签，都是 repeat 加载；所有在 head 和 body 最外层的内联 script 标签，都是 repeat 加载；
7. [√] body 最外层的内联脚本、样式，应该扔到 data-pjax-container 的元素内执行
8. [√] data-pjax-res="0|1" 太难记了，更改为 repeat|once|ignore
8. [√] 删除 data-pjax-ignore，更替为 data-pjax-res="ignore" 控制
8. [√] 更改为先插入样式，再插入脚本
9. [√] 用参数，控制各处资源的加载方式，如 bodyRes, headRes, containerRes, otherRes -> repeat|once|ignore
10. [√] 如果不支持 $.pjax，应该也抛出 dom:ready 事件
11. 添加 ajax timeout 参数，添加 pjax:timeout 事件

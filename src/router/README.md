# 路由管理
受 vue 的 nuxtjs 框架启发, 项目通过 webpack 的 `require.context` 函数, 自动解析 `src/views` 文件夹下的页面组件, 生成 `react-router-dom` 的路由配置

支持以下特性
1. 动态路由
2. 嵌套路由
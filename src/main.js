/**
 * 程序入口
 * @author 
 *
 */
 import { createApp } from 'vue'

 // ie浏览器兼容问题处理
 import 'babel-polyfill'
 
 // 根组件
 import App from './App.vue'
 
 // 按需加载ui
 import ui from './helper/ui'
 
 // 公用组件
 import commonPage from './helper/commonPage'
 
 // 初始路由
 import router from './router'
 
 // 初始化store
 import store from './store'
 
 // 引入全局资源
 import plugin from './utils/plugin'
 
 createApp(App).use(store).use(router).use(ui).use(commonPage).use(plugin).mount('#app')
 
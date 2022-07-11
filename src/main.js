/**
 * 程序入口
 * @author
 *
 */
import { createApp } from 'vue';

// 根组件
import App from './App.vue';

// 初始路由
import router from './router';

// 初始化store
import store from './store';

// 引入全局资源
import plugin from './utils/plugin';

// 图片懒加载
import lazyPlugin from 'vue3-lazy';

// 引入字体图标
import './assets/icon/style.css';
import './assets/font/style.css';
// ui样式-公用样式
import 'element-plus/theme-chalk/el-message.css';
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style/index.scss';

/**
 * form表单重置失效问题，必须form表单渲染完成之后修改form的值
 * ref重名问题，所以规范ref字段必须意ref开头
 */
createApp(App).use(store).use(router).use(plugin).use(lazyPlugin, {}).mount('#app');

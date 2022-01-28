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

// 引入字体图标
import './assets/icon/style.css';
import './assets/font/style.css';

// ui
import 'element-plus/theme-chalk/index.css';
import './style/index.scss';

createApp(App).use(store).use(router).use(plugin).mount('#app');

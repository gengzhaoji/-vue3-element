/**
 * 路由导航守卫
 * @function
 * @param {VueRouter} router 路由实例
 */
// vuex数据
import store from '@/store';

// 获取取消正在执行的函数逻辑
import { cancelFn } from '@u/axios';

//进度条
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
NProgress.configure({ showSpinner: false });
/**
 * 获取版本号
 */
import versionTood from './versionUpdate';

/**
 * 白名单
 */
export const whiteList = ['/login', '/'];

export default function (router) {
    /**
     * 全局前置守卫
     */
    router.beforeEach((to, from, next) => {
        NProgress.start();
        cancelFn();
        //判断当前代码版本是否与服务器中代码版本一致，如不一致则刷新页面获取最新
        versionTood.isNewVersion();
        /** 已经登录了存在token */
        // if (store.state.user.token) {
        //     store.dispatch('GETsocketPrint');
        //     if (!store.getters.roles.length) {
        //         // 判断当前用户是否已拉取完user_info信息
        //         store
        //             .dispatch('GetInfo')
        //             .then((res) => {
        //                 store.dispatch('GenerateRoutes').then(() => {
        //                     next({ ...to, replace: false }); // hack方法 确保addRoutes已完成
        //                 });
        //             })
        //             .catch((err) => {
        //                 store.dispatch('LogOut').then(() => {
        //                     Message.error(err);
        //                     next({
        //                         path: '/login',
        //                     });
        //                 });
        //             });
        //     } else {
        //         next(); // hack方法 确保addRoutes已完成
        //     }
        // } else {
        //     // 没有token
        //     if (whiteList.includes(to.path)) {
        //         // 在免登录白名单，直接进入
        //         next();
        //     } else {
        //         next(`/login`); // 否则全部重定向到登录页
        //         // next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
        //     }
        // }
        next();
    });

    /**
     * 全局后置守卫
     */
    router.afterEach((to, from) => {
        NProgress.done();
        window.scroll(0, 0);
    });
}

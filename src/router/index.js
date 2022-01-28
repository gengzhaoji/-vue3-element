import { createWebHashHistory, createRouter } from 'vue-router';
// 路由守卫
import guarder from '@/helper/guarder.js';
// 页面布局
import Layout from '@/extension/layout/index.vue';

// 路由懒加载
export const loadView = (path) => () => import(`../views/${path}.vue`);

// 公共路由
export const constantRoutes = [
    {
        path: '/',
        redirect: '/index',
        component: Layout,
        children: [
            {
                path: 'index',
                name: 'index',
                component: () => import('../views/homepage/index.vue'),
                meta: {
                    title: '首页',
                },
            },
        ],
    },
    {
        path: '/login',
        name: '/login',
        component: () => import('../extension/login/login.vue'),
        meta: {
            title: '登陆页面',
            hideTabs: true,
        },
    },
    {
        path: '/403',
        name: '/403',
        component: () => import('../extension/exception/xdh-403.vue'),
        meta: {
            title: '403页面',
            hideTabs: true,
        },
    },
    {
        path: '/500',
        name: '/500',
        component: () => import('../extension/exception/xdh-500.vue'),
        meta: {
            title: '500页面',
            hideTabs: true,
        },
    },
    {
        path: '/404',
        name: '/404',
        component: () => import('../extension/exception/xdh-404.vue'),
        meta: {
            title: '404页面',
            hideTabs: true,
        },
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes: constantRoutes,
});

guarder(router);

export default router;

import { createWebHistory, createRouter } from 'vue-router';
import Layout from '@/extension/layout/index.vue';
import ParentView from '@/extension/ParentView/index.vue';

// 路由守卫
import guarder from '@/helper/guarder.js';

// 公共路由
export const constantRoutes = [
    {
        path: '/profile',
        name: '/profile',
        component: Layout,
        children: [
            {
                path: '',
                name: '',
                component: () => import('../views/system/user/profile/index.vue'),
                meta: {
                    title: '个人信息',
                    hideTabs: true,
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
        component: () => import('../extension/exception/my-403.vue'),
        meta: {
            title: '403页面',
            hideTabs: true,
        },
    },
    {
        path: '/500',
        name: '/500',
        component: () => import('../extension/exception/my-500.vue'),
        meta: {
            title: '500页面',
            hideTabs: true,
        },
    },
    {
        path: '/404',
        name: '/404',
        component: () => import('../extension/exception/my-404.vue'),
        meta: {
            title: '404页面',
            hideTabs: true,
        },
    },
];

const router = createRouter({ history: createWebHistory(), routes: constantRoutes });

guarder(router);

export default router;

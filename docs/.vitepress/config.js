module.exports = {
    title: 'my-ui',
    description: 'vue3+element-plus二次封装',
    lang: 'en-US',
    themeConfig: {
        head: [
            // 改变title的图标
            [
                'link',
                {
                    rel: 'icon',
                    href: '/favicon.ico',
                },
            ],
        ],
        // 展示搜索框
        algolia: {
            appKey: '',
            indexName: '',
            searchParameters: {
                faeFilters: ['tags:guide,api'],
            },
        },
        nav: [{ text: 'Gitlab', link: 'http://192.168.1.16:9980/fe/my-ui' }],
        // 侧边栏
        sidebar: [
            {
                text: '基础',
                items: [
                    {
                        text: '安装',
                        link: '/installation/',
                    },
                    {
                        text: '快速开始',
                        link: '/quickstart/',
                    },
                    {
                        text: '自动化API',
                        link: '/coder/',
                    },
                ],
            },
            {
                text: '基础组件',
                items: [
                    {
                        text: 'Button 按钮',
                        link: '/guide/button/',
                    },
                ],
            },
        ],
        //丝滑滚动
        smoothScroll: true,
    },
    markdown: {
        config: (md) => {
            const { demoBlockPlugin } = require('vitepress-theme-demoblock');
            md.use(demoBlockPlugin);
        },
    },
};

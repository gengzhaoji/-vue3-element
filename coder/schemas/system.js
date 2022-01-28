module.exports = {
    name: '系统管理模块',
    model: [
        {
            title: '菜单管理',
            name: 'menu',
            path: '/system/menu',
        },
        {
            title: '用户管理',
            name: 'user',
            path: '/system/user',
        },
        {
            title: '用户管理导出',
            name: 'user',
            methods: 'export',
            path: '/system/user/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '部门管理',
            name: 'dept',
            path: '/system/dept',
        },
        {
            title: '操作日志',
            name: 'operlog',
            methods: ['page', 'remove'],
            path: '/system/operlog',
        },
        {
            title: '操作日志导出',
            name: 'operlog',
            methods: 'export',
            path: '/system/operlog/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '登录日志',
            name: 'logininfor',
            methods: ['page', 'remove'],
            path: '/system/logininfor',
        },
        {
            title: '登录日志导出',
            name: 'logininfor',
            methods: 'export',
            path: '/system/logininfor/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '字典管理',
            name: 'typedict',
            path: '/system/dict/type',
        },
        {
            title: '字典管理导出',
            name: 'typedict',
            methods: 'export',
            path: '/system/dict/type/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '字典管理',
            name: 'datadict',
            path: '/system/dict/data',
        },
        {
            title: '角色管理',
            name: 'role',
            path: '/system/role',
        },
        {
            title: '角色管理导出',
            name: 'role',
            methods: 'export',
            path: '/system/role/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '岗位管理',
            name: 'post',
            path: '/system/post',
        },
        {
            title: '岗位管理导出',
            name: 'post',
            methods: 'export',
            path: '/system/post/export',
            options: {
                responseType: 'blob',
            },
        },
        {
            title: '配置管理',
            name: 'config',
            path: '/system/config',
        },
        {
            title: '配置管理使用Key查询Value',
            name: 'config',
            methods: 'useData',
            path: '/system/config/use/data',
        },
        {
            title: '消息-更新已读',
            name: 'readed',
            methods: 'update',
            path: '/message/info/updateReaded',
        },
        {
            title: '消息-删除',
            name: 'message',
            methods: 'remove',
            path: '/message/info',
            options: {
                method: 'delete',
            },
        },
        {
            title: '消息-未读',
            name: 'count',
            methods: 'unRead',
            path: '/message/info/unReadCount',
        },
        {
            title: '消息-分页',
            name: 'message',
            methods: 'page',
            path: '/message/info',
        },
    ],
};

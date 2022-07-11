module.exports = {
    name: '系统管理模块',
    model: [
        {
            title: '菜单管理',
            name: 'menu',
            methods: ['add', 'edit', 'remove', 'list', 'info'],
            path: '/system/menu',
        },
        {
            title: '用户管理',
            name: 'user',
            methods: ['add', 'edit', 'remove', 'page', 'info', 'export'],
            path: '/system/user',
        },
        {
            title: '部门管理',
            name: 'dept',
            methods: ['add', 'edit', 'remove', 'page', 'info'],
            path: '/system/dept',
        },
        {
            title: '操作日志',
            name: 'operlog',
            methods: ['page', 'remove', 'export'],
            path: '/system/operlog',
        },
        {
            title: '登录日志',
            name: 'logininfor',
            methods: ['page', 'remove', 'export'],
            path: '/system/logininfor',
        },
        {
            title: '字典管理',
            name: 'typedict',
            methods: ['add', 'edit', 'remove', 'page', 'info', 'export'],
            path: '/system/dict/type',
        },
        {
            title: '字典管理-详情',
            name: 'datadict',
            methods: ['add', 'edit', 'remove', 'page'],
            path: '/system/dict/data',
        },
        {
            title: '角色管理',
            name: 'role',
            methods: ['add', 'edit', 'remove', 'page', 'info', 'export'],
            path: '/system/role',
        },
        {
            title: '岗位管理',
            name: 'post',
            methods: ['add', 'edit', 'remove', 'page', 'info', 'export'],
            path: '/system/post',
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
    ],
};

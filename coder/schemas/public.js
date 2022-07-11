module.exports = {
    name: '系统公共接口',
    model: [
        {
            title: '登录接口',
            name: 'login',
            methods: 'auth',
            path: '/auth/login',
            options: {
                method: 'post',
            },
        },
        {
            title: '登出接口',
            name: 'logout',
            methods: 'auth',
            path: '/auth/logout',
            options: {
                method: 'post',
            },
        },
        {
            title: '获取个人信息',
            name: 'userProfile',
            methods: 'info',
            path: '/system/user/profile',
        },
        {
            title: '更新个人信息',
            name: 'userProfile',
            methods: 'update',
            path: '/system/user/profile/update',
            options: {
                method: 'put',
            },
        },
        {
            title: '更新密码',
            name: 'userProfile',
            methods: 'updatePwd',
            path: '/system/user/profile/updatePwd',
        },
        {
            title: '路由信息',
            name: 'routers',
            methods: 'home',
            path: '/home/routers',
        },
        {
            title: '获取验证码',
            name: 'image',
            methods: 'captcha',
            path: '/captcha/image',
        },
        {
            title: '文件数据上传',
            name: 'upload',
            methods: 'rdfileData',
            path: '/rdfile/data/upload',
            options: {
                method: 'post',
            },
        },
        {
            title: '文件上传',
            name: 'upload',
            methods: 'rdfile',
            path: '/rdfile/upload',
            options: {
                method: 'post',
            },
        },
        {
            title: '批量文件上传',
            name: 'upload',
            methods: 'rdfileBatch',
            path: '/rdfile/data/batch/upload',
            options: {
                method: 'post',
            },
        },
        {
            title: '文件数据修改名称',
            name: 'rename',
            methods: 'rdfile',
            path: '/rdfile/data/rename',
            options: {
                method: 'put',
            },
        },
        {
            title: '部门信息',
            name: 'dept',
            methods: 'get',
            path: '/system/dept/use/list',
        },
        {
            title: '字典数据',
            name: 'dicts',
            methods: 'get',
            path: '/system/dict/data/use/list/:dictType',
        },
        {
            title: '多个字典key查询多个字典数据',
            name: 'dictTypes',
            methods: 'get',
            path: '/system/dict/data/use/types',
        },
        {
            title: '用户信息',
            name: 'user',
            methods: 'get',
            path: '/system/user/use/list',
        },
        {
            title: '角色信息',
            name: 'role',
            methods: 'get',
            path: '/system/role/use/list',
        },
        {
            title: '岗位信息',
            name: 'post',
            methods: 'get',
            path: '/system/post/use/list',
        },
        {
            title: '修改密码',
            name: 'password',
            methods: 'rest',
            path: '/system/user/restPwd',
        },
        {
            title: '用户更改状态',
            name: 'changeStatus',
            methods: 'user',
            path: '/system/user/changeStatus',
        },
        {
            title: '角色更改状态',
            name: 'roleStatus',
            methods: 'change',
            path: '/system/role/changeStatus',
        },
        {
            title: '角色更改数据权限',
            name: 'dataPerm',
            methods: 'change',
            path: '/system/role/changeDataPerm',
            options: {
                method: 'put',
            },
        },
        {
            title: '角色菜单查询',
            name: 'roleMenuList',
            methods: 'get',
            path: '/system/role/use/roleMenuList',
        },
        {
            title: '角色部门查询',
            name: 'roleDeptList',
            methods: 'get',
            path: '/system/role/use/roleDeptList',
        },
        {
            title: '头像上传',
            name: 'avatar',
            methods: 'upload',
            path: '/system/user/profile/avatar',
            options: {
                method: 'post',
            },
        },
        {
            title: '根据部门id查询人员列表',
            name: 'List',
            methods: 'worker',
            path: '/system/worker/workerList',
        },
    ],
};

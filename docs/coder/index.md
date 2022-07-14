# 自动化 API

## 运作详解

1. 自动化 api 相关功能文件 coder
2. 通过运行 coder/index.js `命令：npm run coder api`文件，生成 api 接口文件

#### 解释：

自动化 api 功能，通过运行 coder/index.js，在 index.js 文件中，使用 fs 读取 schemas 文件夹中的 api 配置文件，然后对配置数据进行一系列的处理，然后进而使用 templates/api.js 模板，生成对应的请求文件，从而在项目使用该 api 接口。

## 相关配置

```javascript
module.exports = {
    // 架构配置文件目录
    schemasDir: './schemas/',

    // 模板文件目录
    templatesDir: './templates/',

    // api请求地址前缀
    pathPrefix: 'API_HOST',

    // api支持的请求方法
    methods: [
        'add', // 新增数据
        'edit', // 更新数据
        'remove', // 删除数据
        'page', // 列表数据，响应数据含有分页信息，如：总数、当前页码、页大小
        'list', // 不分页列表数据
        'export', // 根据条件导出
        'info', // 详情查询
        'unique', // 唯一校验
    ],

    // 数据请求类型对应http请求方法的映射
    methodTypeMap: {
        add: 'post',
        edit: 'put',
        remove: 'delete',
        page: 'get',
        list: 'get',
        export: 'get',
        info: 'get',
        unique: 'get',
    },

    // 数据请求类型对应api地址的后缀映射
    methodSuffixMap: {
        add: '/add',
        edit: '/edit',
        remove: '/remove',
        page: '/page',
        list: '/list',
        export: '/export',
        info: '/info',
        unique: '/unique',
    },

    // 请求方法对应的中文注释
    methodCommentMap: {
        add: '新增<%=cname%>',
        edit: '更新<%=cname%>',
        remove: '删除<%=cname%>',
        page: '获取<%=cname%>分页列表',
        list: '获取<%=cname%>不分页列表',
        export: '根据条件导出<%=cname%>',
        info: '获取<%=cname%>单条信息详情',
        unique: '<%=cname%>字段去重校验',
    },

    // 是否开启生成批量删除
    batchEnabled: true,

    // 生成api文件路径
    outApiPath: '../src/api/',

    // iconfont css文件路径
    iconCssFile: '../src/assets/icon/style.css',

    // element-ui icon
    elIconCssFile: '../node_modules/element-plus/theme-chalk/el-icon.css',

    // 生成icon文件路径
    outIconFile: '../src/config/icons.js',
};
```

## 例子

```javascript
module.exports = {
    name: '系统管理模块',
    model: [
        {
            // 生成['add', 'edit', 'remove', 'page', 'info']，常用单表页面新增、修改、删除、分页查询、详情
            title: '部门管理',
            name: 'dept',
            methods: ['add', 'edit', 'remove', 'page', 'info'],
            path: '/system/dept',
        },
        {
            // methods不写，默认生成['add','edit','remove', 'page','list','export','info','unique']
            title: '配置管理',
            name: 'config',
            path: '/system/config',
        },
    ],
};
```

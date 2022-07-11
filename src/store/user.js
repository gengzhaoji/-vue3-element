import { defineStore } from 'pinia';
import { authLogin, authLogout, infoUserProfile } from '@a/public';
import router from '@/router';
import guarder from './guarder';

export default defineStore({
    id: 'user', // id必填，且需要唯一
    state: () => ({
        size: 'small',
        userInfo: {},
        activeMenu: '',
        activeMenuTab: '',
        menuTabsList: [],
        remark: '',
        token: '',
        une: '',
        avatar: '',
        permissions: [],
        roles: [],
        theme: {
            type: 'light',
            primaryColor: '#409eff',
            collapsible: true, //开启折叠
            showTabs: true, // 是否显示导航历史
            layout: 'sidebar', // 布局
            logo: true, // 显示logo
            menuType: 'science',
        },
        // 表格自定义头部缓存数据
        columns: {},
    }),
    getters: {
        columnsGets: (state) => state.columns,
        userIdGets: (state) => state.userInfo.userId,
        rolesGets: (state) => state.roles,
        permissionsGets: (state) => state.permissions,
    },
    actions: {
        // 主题修改
        stateChange(data) {
            this.theme = data;
            const body = document.documentElement;
            // 设置全局顶部body上的class名称，即为主题名称，便于自定义配置符合当前主题的样式统一入口
            body.setAttribute('class', this.theme.type);
            body.setAttribute('id', this.theme.menuType);
            body.style.setProperty('--el-color-primary', this.theme.primaryColor);
        },
        // 页面表格头部缓存
        columnsChange(option) {
            this.columns[option.key] = option.val;
        },
        // 登录
        Login(data) {
            return new Promise((resolve, reject) => {
                authLogin(data)
                    .then((res) => {
                        this.token = res?.data?.tk;
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // 获取用户信息
        GetInfo() {
            return new Promise((resolve, reject) => {
                infoUserProfile()
                    .then((res) => {
                        const { user, roles: Roles, perms } = res?.data;
                        if (Roles.length) {
                            // 验证返回的roles是否是一个非空数组
                            this.roles = Roles;
                            // 按钮级权限数组
                            this.permissions = perms;
                        } else {
                            this.roles = ['ROLE_DEFAULT'];
                        }
                        this.userInfo = { userId: user.id, userName: user.userName, nickName: user.nickName, deptId: user.deptId };
                        this.avatar = user.avatar;
                        this.remark = user.remark;
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // 退出系统
        LogOut() {
            return new Promise((resolve, reject) => {
                authLogout()
                    .then(() => {
                        this.LogOutSET();
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        LogOutSET() {
            // 退出登录removeRoute删除动态添加的路由
            guarder().addRouter.forEach((item) => {
                router.removeRoute(item.name);
            });
            guarder().addRouter = [];
            this.token = '';
            this.roles = [];
            this.permissions = [];
            this.menuTabsList = [];
            this.activeMenu = '';
            this.activeMenuTab = '';
        },
    },
    // 开启数据缓存
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'user',
                storage: localStorage,
                paths: ['size', 'token', 'activeMenu', 'activeMenuTab', 'menuTabsList', 'theme', 'columns'],
            },
        ],
    },
});

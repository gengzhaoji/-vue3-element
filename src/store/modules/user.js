import { authLogin, authLogout, infoUserProfile } from '@a/public';
import store from '@/store';

// 布局等默认配置
const theme = {
    style: 'default',
    primaryColor: '#409eff',
    primaryTextColor: '#fff',
    collapsible: true, //开启折叠
    fixedTop: true, // 是否固定顶部, todo
    showTabs: true, // 是否显示导航历史
    layout: 'sidebar', // 布局
    logo: true, // 显示logo
};

export default {
    state: {
        size: 'small',
        userInfo: {},
        menuTabsList: [],
        remark: '',
        token: '',
        avatar: '',
        permissions: [],
        roles: [],
        theme,
        columns: {},
    },

    mutations: {
        SET_menuTabsList: (state, data) => {
            state.menuTabsList = data;
        },
        SET_SIZE: (state, size) => {
            state.size = size;
        },
        SET_TOKEN: (state, token) => {
            state.token = token;
        },
        SET_USERINFO: (state, item) => {
            state.userInfo = item;
        },
        SET_REMARK: (state, remark) => {
            state.remark = remark;
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar;
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles;
        },
        SET_PERMISSIONS: (state, permissions) => {
            state.permissions = permissions;
        },
        stateChange(state, option) {
            state[option.name] = option.value;
        },
        columnsChange(state, option) {
            state.columns[option.key] = option.val;
        },
    },

    actions: {
        // 登录
        Login({ commit }, data) {
            return new Promise((resolve, reject) => {
                authLogin(data)
                    .then((res) => {
                        let data = res.data;
                        commit('SET_TOKEN', data.tk);
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // 获取用户信息
        GetInfo({ commit, state }) {
            return new Promise((resolve, reject) => {
                infoUserProfile()
                    .then((res) => {
                        const { user, roles, perms } = res?.data;
                        // ? require('@/assets/img/user.png') : user.avatar
                        const avatar = user.avatar;
                        if (roles.length) {
                            // 验证返回的roles是否是一个非空数组
                            store.commit('SET_ROLES', roles);
                            // 按钮级权限数组
                            commit('SET_PERMISSIONS', perms);
                        } else {
                            store.commit('SET_ROLES', ['ROLE_DEFAULT']);
                        }
                        commit('SET_USERINFO', { userId: user.id, userName: user.userName, nickName: user.nickName, deptId: user.deptId });
                        commit('SET_AVATAR', avatar);
                        commit('SET_REMARK', user.remark);
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        // 退出系统
        LogOut({ dispatch }) {
            return new Promise((resolve, reject) => {
                authLogout()
                    .then(() => {
                        dispatch('LogOutSET');
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },
        LogOutSET({ commit, state }) {
            commit('SET_TOKEN', '');
            commit('SET_ROLES', []);
            commit('SET_PERMISSIONS', []);
            commit('stateChange', {
                name: 'theme',
                value: theme,
            });
            store.commit('SET_menuTabsList', []);
        },
    },
};

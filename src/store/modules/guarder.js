import { homeRouters } from '@/api/public';
import Layout from '@/extension/layout/index.vue';
import ParentView from '@/extension/ParentView/index.vue';
import router from '@/router';
import { ElMessageBox } from 'element-plus';
import store from '@/store';
import { clone } from '@u/convert';

// 处理解决import动态家在组件 打包部署为空的问题
const modules = import.meta.glob('../../views/**/*.vue');

const permission = {
    state: {
        Menus: [],
        RoutersList: [],
    },
    mutations: {
        SET_MENUS: (state, data) => {
            state.Menus = data;
        },
        SET_ROUTERS_LIST: (state, data) => {
            state.RoutersList = data;
        },
    },
    actions: {
        // 生成路由
        GenerateRoutes({ commit, state }) {
            return new Promise((resolve) => {
                // 向后端请求路由数据
                homeRouters().then((res) => {
                    if (res?.data?.length) {
                        // 默认添加首页-个人信息-消息
                        res.data.unshift(
                            {
                                component: 'homepage/index',
                                createBy: 'admin',
                                createId: '6100000',
                                createTime: '2022-01-10 10:19:45',
                                icon: 'icon-home',
                                id: '16',
                                isCache: 0,
                                isFrame: 0,
                                layoutPath: '',
                                menuName: '首页',
                                menuType: 'C',
                                orderNum: 0,
                                parentId: '0',
                                path: 'index',
                                perms: '',
                                status: 0,
                                updateBy: 'admin',
                                updateId: '6100000',
                                updateTime: '2022-01-14 09:20:53',
                                visible: 0,
                            },
                            {
                                component: 'system/user/profile/index',
                                createBy: 'admin',
                                createId: '6100000',
                                createTime: '2021-10-15 13:38:28',
                                icon: '#',
                                id: '15',
                                isCache: 0,
                                isFrame: 0,
                                menuName: '个人信息',
                                menuType: 'C',
                                mquery: '',
                                orderNum: 11,
                                parentId: '1',
                                path: 'profile',
                                perms: '',
                                remark: '字典管理菜单',
                                status: 0,
                                updateBy: 'admin',
                                updateId: '6100000',
                                updateTime: '2022-01-11 10:11:25',
                                visible: 1,
                            },
                            {
                                component: 'system/message',
                                createBy: 'admin',
                                createId: '6100000',
                                createTime: '2022-01-11 10:16:23',
                                icon: '#',
                                id: '17',
                                isCache: 0,
                                isFrame: 0,
                                menuName: '消息',
                                menuType: 'C',
                                mquery: '',
                                orderNum: 12,
                                parentId: '1',
                                path: 'message',
                                perms: '',
                                remark: '角色管理菜单',
                                status: 0,
                                updateBy: 'admin',
                                updateId: '6100000',
                                updateTime: '2022-01-11 10:34:02',
                                visible: 1,
                            }
                        );
                        const { Menus, Routes } = filterAsyncRouter(clone(res.data));
                        commit('SET_MENUS', Menus);
                        Routes.forEach((item) => {
                            router.addRoute(item);
                        });
                        router.addRoute({ path: '/:pathMatch(.*)', redirect: '/404', hidden: true });
                        commit(
                            'SET_ROUTERS_LIST',
                            router.getRoutes().map((item) => item.path)
                        );
                        resolve();
                    } else {
                        ElMessageBox.alert('该角色用户暂无可视页面，请管理员分配角色权限！', '系统提示', {
                            confirmButtonText: '确定',
                            callback: () => {
                                store.dispatch('LogOut');
                                window.location.reload();
                            },
                        });
                    }
                });
            });
        },
    },
};

// 遍历后台传来的路由字符串，转换为组件对象  动态添加路由
function filterAsyncRouter(data) {
    let RoutesData = Object.create(null),
        MenusData = Object.create(null),
        Routes = [],
        Menus = [];
    // 数据转换为对象
    data.forEach((item) => {
        let { id, parentId, component, layoutPath, icon, menuName, menuType, path, visible, isCache, isFrame, orderNum } = item;
        if (parentId === '0' && menuType === 'M' && !component) {
            component = Layout;
        } else if (parentId !== '0' && menuType === 'M' && !component) {
            component = ParentView;
        } else {
            component = modules[`../../views/${component}.vue`];
        }
        // 单菜单
        if (parentId === '0' && menuType === 'C' && isFrame === 0) {
            // 默认为Layout布局
            let layout;
            if (!layoutPath) {
                layout = Layout;
            } else {
                layout = modules[`../../views/${layoutPath}.vue`];
            }
            RoutesData[id] = {
                path: '/',
                component: layout,
                parentId: '0',
                children: [
                    {
                        component: component,
                        hidden: visible === 1,
                        meta: { title: menuName, icon, keepAlive: isCache === 1, isFrame: isFrame === 1 },
                        name: path,
                        path: item.path,
                        parentId,
                        orderNum,
                        id,
                    },
                ],
            };
        } else {
            RoutesData[id] = {
                component: component,
                hidden: visible === 1,
                meta: { title: menuName, icon, keepAlive: isCache === 1, isFrame: isFrame === 1 },
                name: path,
                path: parentId === '0' ? (!/^(\/)/.test(item.path) ? `/${item.path}` : item.path) : item.path,
                parentId,
                orderNum,
                id,
            };
        }

        if (visible !== 1) {
            MenusData[id] = {
                component: component,
                hidden: visible === 1,
                meta: { title: menuName, icon, keepAlive: isCache === 1, isFrame: isFrame === 1 },
                name: path,
                path: parentId === '0' ? (!/^(\/)/.test(item.path) ? `/${item.path}` : item.path) : item.path,
                parentId,
                orderNum,
                id,
            };
        }
    });
    // 组成路由树形结构
    for (let key in RoutesData) {
        let item = RoutesData[key];
        if (item.parentId === '0') {
            Routes.push(item);
        } else {
            let parent = RoutesData[item.parentId];
            if (parent) {
                if (!parent.children) {
                    parent.children = [];
                }
                item.path = `${parent.path}/${item.path}`;
                parent.children.push(item);
            }
        }
    }
    // 组成菜单树形结构
    for (let key in MenusData) {
        let item = MenusData[key];
        if (item.parentId === '0') {
            Menus.push(item);
            Menus.sort((a, b) => {
                return a.orderNum - b.orderNum;
            });
        } else {
            let parent = MenusData[item.parentId];
            if (parent) {
                if (!parent.children) {
                    parent.children = [];
                }
                item.path = `${parent.path}/${item.path}`;
                parent.children.push(item);
                parent.children.sort((a, b) => {
                    return a.orderNum - b.orderNum;
                });
            }
        }
    }

    return { Menus, Routes };
}

export default permission;

import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
// 默认全局路由
import { homeRouters } from '@/api/public';
// 默认布局Layout、ParentView
import Layout from '@/extension/layout/index.vue';
import ParentView from '@/extension/ParentView/index.vue';
// 相关数据处理逻辑
import router from '@/router';
import { ElMessageBox } from 'element-plus';
import { clone } from '@u/convert';
import { find } from '@u/tree';
import user from './user';

/*
 * 处理解决import动态加载组件 打包部署为空的问题
 * **为通配符,vite不支持require导入方式,故用import.meta.glob(vite动态导入)
 * import.meta.glob
 * 该方法匹配到的文件默认是懒加载，通过动态导入实现，构建时会分离独立的 chunk，是异步导入，返回的是 Promise
 * import.meta.globEager
 * 该方法是直接导入所有模块，并且是同步导入，返回结果直接通过 for...in循环就可以操作
 */
const modules = import.meta.glob('../views/**/*.vue');

export default defineStore('guarder', {
    state: () => ({
        cachedComponents: [],
        Menus: [],
        RoutersList: [],
        addRouter: [],
    }),
    actions: {
        // 生成路由
        GenerateRoutes() {
            return new Promise((resolve) => {
                // 向后端请求路由数据
                homeRouters().then((res) => {
                    if (res?.data?.length) {
                        const { Menus, Routes } = filterAsyncRouter(clone(res.data));
                        this.Menus = Menus;
                        // 添加首页路由、404路由
                        this.addRouter = [
                            {
                                path: '/',
                                name: '/',
                                redirect: find(Menus, true, (item) => !item.children).path,
                                meta: {
                                    hideTabs: true,
                                },
                            },
                            ...Routes,
                            {
                                path: '/:pathMatch(.*)',
                                name: '/:pathMatch(.*)',
                                redirect: '/404',
                                meta: {
                                    hideTabs: true,
                                },
                            },
                        ];
                        this.addRouter.forEach((item) => {
                            if (item.parentName) {
                                router.addRoute(item.parentName, item);
                            } else {
                                router.addRoute(item);
                            }
                        });
                        this.RoutersList = [...new Set(router.getRoutes().map((item) => item.path))];
                        resolve();
                    } else {
                        ElMessageBox.alert('该角色用户暂无可视页面，请管理员分配角色权限！', '系统提示', {
                            confirmButtonText: '确定',
                            callback: () => {
                                user().LogOut();
                                window.location.reload();
                            },
                        });
                    }
                });
            });
        },
    },
});

// 遍历后台传来的路由字符串，转换为组件对象  动态添加路由
function filterAsyncRouter(data) {
    let RoutesData = Object.create(null),
        MenusData = Object.create(null),
        Routes = [],
        Menus = [];
    // 数据转换为对象
    data.forEach((item) => {
        /**
         * id 数据ID
         * parentId 父类ID
         * component .vue文件路径
         * layoutPath 布局路径 layoutPath == undefined为默认布局，layoutPath == 'ParentView'全屏布局，modules[`../views/${layoutPath}.vue`]自定义页面布局
         * icon 菜单图标
         * menuName 菜单名称
         * menuType 菜单类型  M——目录、C——菜单
         * path 菜单路由
         * visible 是否显示
         * isCache 是否缓存
         * orderNum 排序
         */
        let { id, parentId, component, layoutPath, icon, menuName, menuType, path, visible, isCache, orderNum } = item;
        if (parentId == '0' && menuType == 'M' && !component) {
            // 一层目录页面默认布局
            component = shallowRef(Layout);
        } else if (parentId !== '0' && menuType == 'M' && !component) {
            // 非第一层目录布局为 ParentView
            component = shallowRef(ParentView);
        } else {
            component = modules[`../views/${component}.vue`] || '';
        }
        if (component == '') return;
        // 无目录菜单
        if (parentId == '0' && menuType == 'C') {
            // 布局 layoutPath为默认布局，layoutPath == 'ParentView'全屏布局，modules[`../views/${layoutPath}.vue`]自定义页面布局
            const layout = !layoutPath ? shallowRef(Layout) : layoutPath == 'ParentView' ? shallowRef(ParentView) : modules[`../views/${layoutPath}.vue`];
            const parentName = !layoutPath ? 'Layout' : layoutPath == 'ParentView' ? 'ParentView' : 'layoutPath}';
            if (!router.hasRoute(parentName)) {
                router.addRoute({
                    name: parentName,
                    path: parentName,
                    component: layout,
                });
            }
            const Path = !/^(\/)/.test(path) ? `/${path}` : path;
            RoutesData[id] = {
                parentName,
                parentId,
                component,
                hidden: visible == 1,
                meta: { title: menuName, icon, keepAlive: isCache == 1 },
                path: Path,
                name: Path,
                orderNum,
                id,
            };
        } else {
            const Path = parentId == '0' ? (!/^(\/)/.test(path) ? `/${path}` : path) : path;
            RoutesData[id] = {
                component: component,
                hidden: visible == 1,
                meta: { title: menuName, icon, keepAlive: isCache == 1 },
                name: Path,
                path: Path,
                parentId,
                orderNum,
                id,
            };
        }
        // 左边菜单数据
        if (visible !== 1) {
            const Path = parentId == '0' ? (!/^(\/)/.test(path) ? `/${path}` : path) : path;
            MenusData[id] = {
                component: component,
                hidden: visible == 1,
                meta: { title: menuName, icon, keepAlive: isCache == 1 },
                name: Path,
                path: Path,
                parentId,
                orderNum,
                id,
            };
        }
    });
    // 组成路由树形结构
    for (let key in RoutesData) {
        let item = RoutesData[key];
        if (item.parentId == '0') {
            Routes.push(item);
        } else {
            let parent = RoutesData[item.parentId];
            if (parent) {
                if (!parent.children) {
                    parent.children = [];
                }
                item.path = `${parent.path}/${item.path}`;
                item.name = item.path;
                parent.children.push(item);
            }
        }
    }
    // 组成菜单树形结构
    for (let key in MenusData) {
        let item = MenusData[key];
        if (item.parentId == '0') {
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

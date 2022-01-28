import { createStore } from 'vuex';
import VuexPersistence from 'vuex-persistedstate';
import getters from './getters.js';

const modulesFiles = import.meta.globEager('./modules/*.js');
const modules = Object.keys(modulesFiles).reduce((modules, modulePath) => {
    const moduleName = modulePath.replace(/^\.\/(.*)\/(.*)\.\w+$/, '$2');
    modules[moduleName] = modulesFiles[modulePath].default;
    return modules;
}, {});

export default createStore({
    modules: {
        ...modules,
    },
    getters,
    plugins: [
        VuexPersistence({
            storage: window.localStorage,
            // 配置缓存的内容
            reducer(val) {
                return {
                    user: {
                        size: val.user.size,
                        token: val.user.token,
                        menuTabsList: val.user.menuTabsList,
                        theme: val.user.theme,
                        columns: val.user.columns,
                    },
                };
            },
        }),
    ],
});

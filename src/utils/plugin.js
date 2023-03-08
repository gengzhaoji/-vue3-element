/**
 * 全局插件配置资源（vue插件部分）
 * @module utils/plugin
 */
import { ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import * as ElIcons from '@element-plus/icons-vue';
import draggable from './directives/draggable';
import hasPermi from './directives/hasPermi';
import waterMarker from './directives/waterMarker';
import waves from './directives/waves';
import clipboard from './directives/clipboard';
import showTip from './directives/showTip';

import { clone, cloneDeep } from '@u/convert';
import { selectDictLabel, addDateRange } from '@u/util';
const plugins = [ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification];
/**模块store数据 */
import Com from '@s/com';
import Dict from '@s/dict';
import Guarder from '@s/guarder';
import User from '@s/user';

export default {
    install: function (app, options) {
        plugins.forEach((plugin) => {
            app.use(plugin);
        });
        for (const name in ElIcons) {
            /*
             * 以elIcon为前缀的命名规则，是为了适配已经使用属性名添加图标的内置组件，
             * 例如：<el-button icon="el-icon-refresh"></el-button>
             */
            // app.component('elIcon' + name, ElIcons[name]);
            app.component(name, ElIcons[name]);
        }
        /**
         * 全局指令
         */
        app.directive('draggable', draggable);
        app.directive('hasPermi', hasPermi);
        app.directive('waterMarker', waterMarker);
        app.directive('waves', waves);
        app.directive('clipboard', clipboard);
        app.directive('showTip', showTip);
        /**
         * 原型链全局挂载方法
         */
        app.config.globalProperties.msgSuccess = function (msg) {
            ElMessage({ showClose: true, message: msg, type: 'success' });
        };

        app.config.globalProperties.msgError = function (msg) {
            ElMessage({ showClose: true, message: msg, type: 'error' });
        };

        app.config.globalProperties.msgInfo = function (msg) {
            ElMessage.info(msg);
        };

        app.config.globalProperties.resetForm = function (refName) {
            if (refName) {
                // 不是公用的my-form标签的ref逻辑
                refName?.resetFields?.() || refName?.$refs?.refMyForm?.resetFields?.();
            }
        };

        app.config.globalProperties.$store = {
            com: Com(),
            dict: Dict(),
            guarder: Guarder(),
            user: User(),
        };

        app.config.globalProperties.clone = clone;

        app.config.globalProperties.cloneDeep = cloneDeep;

        app.config.globalProperties.selectDictLabel = selectDictLabel;

        app.config.globalProperties.addDateRange = addDateRange;

        /**
         * vite动态加载图片静态文件
         * @param {string} path 文件路径
         * @returns
         */
        const modules = import.meta.glob('../assets/img/**/*', { eager: true });
        app.config.globalProperties.getImgUrl = (path) => modules[path].default;

        /**
         * 公用$$confirm提示函数
         * @param {string/object} data
         * @returns
         */
        app.config.globalProperties.$$confirm = function (data) {
            let options = {};
            if (typeof data === 'string') {
                options.item = data;
            } else {
                options = { ...data };
            }

            let { item = '是否确认导出所有数据项？', title = '提示', confirmButtonText = '确定', cancelButtonText = '取消', type = 'warning' } = options;
            return new Promise((resolve, reject) => {
                ElMessageBox.confirm(item, title, {
                    showCancelButton: false,
                    confirmButtonText,
                    cancelButtonText,
                    draggable: true,
                    type,
                })
                    .then((res) => {
                        resolve(res);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        };
    },
};

/**
 * 全局插件配置资源（vue插件部分）
 * @module utils/plugin
 */
import { ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import * as ElIcons from '@element-plus/icons';
import draggable from './directives/draggable';
import hasPermi from './directives/hasPermi';
import waterMarker from './directives/waterMarker';
import waves from './directives/waves';
import loadmore from './directives/loadmore';
import clipboard from './directives/clipboard';
import { clone, cloneDeep } from '@u/convert';
import { selectDictLabel, addDateRange } from '@u/util';
const plugins = [ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification];
/**模块store数据 */
import Com from '@s/com';
import Dict from '@s/dict';
import Guarder from '@s/guarder';
import User from '@s/user';

export default {
    install: function (App, options) {
        plugins.forEach((plugin) => {
            App.use(plugin);
        });
        for (const name in ElIcons) {
            /*
             * 以elIcon为前缀的命名规则，是为了适配已经使用属性名添加图标的内置组件，
             * 例如：<el-button icon="el-icon-refresh"></el-button>
             */
            // App.component('elIcon' + name, ElIcons[name]);
            App.component(name, ElIcons[name]);
        }
        /**
         * 全局指令
         */
        App.directive('draggable', draggable);
        App.directive('hasPermi', hasPermi);
        App.directive('waterMarker', waterMarker);
        App.directive('waves', waves);
        App.directive('loadmore', loadmore);
        App.directive('clipboard', clipboard);
        /**
         * 原型链全局挂载方法
         */
        App.config.globalProperties.msgSuccess = function (msg) {
            ElMessage({ showClose: true, message: msg, type: 'success' });
        };

        App.config.globalProperties.msgError = function (msg) {
            ElMessage({ showClose: true, message: msg, type: 'error' });
        };

        App.config.globalProperties.msgInfo = function (msg) {
            ElMessage.info(msg);
        };

        App.config.globalProperties.resetForm = function (refName) {
            if (refName) {
                // 不是公用的my-form标签的ref逻辑
                refName?.resetFields?.() || refName?.$refs?.refMyForm?.resetFields?.();
            }
        };

        App.config.globalProperties.$store = {
            com: Com(),
            dict: Dict(),
            guarder: Guarder(),
            user: User(),
        };

        App.config.globalProperties.clone = clone;

        App.config.globalProperties.cloneDeep = cloneDeep;

        App.config.globalProperties.selectDictLabel = selectDictLabel;

        App.config.globalProperties.addDateRange = addDateRange;

        /**
         * vite动态加载图片静态文件
         * @param {string} path 文件路径
         * @param {string} suffix 文件类型（后缀）只能为svg、png、jpg，默认为svg
         * @returns
         */
        App.config.globalProperties.getImgUrl = (path, suffix = 'svg') => {
            if (suffix === 'svg') return import.meta.globEager('../assets/img/**/*.svg')[path].default;
            if (suffix === 'png') return import.meta.globEager('../assets/img/**/*.png')[path].default;
            if (suffix === 'jpg') return import.meta.globEager('../assets/img/**/*.jpg')[path].default;
        };

        App.config.globalProperties.$$confirm = function (data) {
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

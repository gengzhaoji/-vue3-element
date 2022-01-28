/**
 * 全局插件配置资源（vue插件部分）
 * @module utils/plugin
 */
import { ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { getPropByPath } from 'element-plus/lib/utils/util';
import hasRole from './directives/hasRole';
import hasPermi from './directives/hasPermi';
import { clone, cloneDeep } from '@u/convert';
import { selectDictLabel, selectDictLabels, addDateRange } from '@u/util';
const plugins = [ElInfiniteScroll, ElLoading, ElMessage, ElMessageBox, ElNotification];

export default {
    install: function (App, options) {
        App.config.devtools = true;
        App.config.globalProperties.$ELEMENT = { size: 'small' };

        plugins.forEach((plugin) => {
            App.use(plugin);
        });
        /**
         * 全局指令
         */
        App.directive('hasRole', hasRole);
        App.directive('hasPermi', hasPermi);
        /**
         * 原型链全局挂载方法
         */
        App.config.globalProperties.msgSuccess = function (msg) {
            this.$message({ showClose: true, message: msg, type: 'success' });
        };

        App.config.globalProperties.msgError = function (msg) {
            this.$message({ showClose: true, message: msg, type: 'error' });
        };

        App.config.globalProperties.msgInfo = function (msg) {
            this.$message.info(msg);
        };

        App.config.globalProperties.resetForm = function (refName) {
            if (this.$refs[refName]) {
                // 不是公用的com-form标签的ref逻辑
                this.$refs[refName]?.resetFields?.() || this.$refs[refName]?.$refs?.comForm?.resetFields?.();
            }
        };

        App.config.globalProperties.clone = clone;

        App.config.globalProperties.cloneDeep = cloneDeep;

        App.config.globalProperties.getPropByPath = getPropByPath;

        App.config.globalProperties.selectDictLabel = selectDictLabel;

        App.config.globalProperties.selectDictLabels = selectDictLabels;

        App.config.globalProperties.addDateRange = addDateRange;

        App.config.globalProperties.getImgUrl = function (path) {
            return import.meta.globEager('../assets/img/**/*.svg')[path].default;
        };

        App.config.globalProperties.$$confirm = function (
            item = '是否确认导出所有数据项？',
            title = '提示',
            confirmButtonText = '确定',
            cancelButtonText = '取消',
            type = 'warning'
        ) {
            return new Promise((resolve, reject) => {
                this.$confirm(item, title, {
                    confirmButtonText,
                    cancelButtonText,
                    type,
                    center: true,
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

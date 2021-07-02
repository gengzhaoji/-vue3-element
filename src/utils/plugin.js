/**
 * 全局插件配置资源（vue插件部分）
 * @module utils/plugin
 */
import preventReClick from './directives/preventReClick'
import { clone } from '@utils/convert'

export default {
    install: function (App, options) {
        /**
         * 全局指令
         */
        App.directive('preventReClick', preventReClick)
        /**
         * 原型链全局挂载方法
         */
        App.config.globalProperties.msgSuccess = function (msg) {
            this.$message({ showClose: true, message: msg, type: "success" });
        };

        App.config.globalProperties.msgError = function (msg) {
            this.$message({ showClose: true, message: msg, type: "error" });
        };

        App.config.globalProperties.msgInfo = function (msg) {
            this.$message.info(msg);
        };

        App.config.globalProperties.resetForm = function (refName) {
            if (this.$refs[refName]) {
                this.$refs[refName].resetFields()
            }
        };

        App.config.globalProperties.clone = clone;

        App.config.globalProperties.$$confirm = function (item = "是否确认导出所有数据项？", title = '提示', confirmButtonText = '确定', cancelButtonText = '取消', type = 'warning') {
            return new Promise((resolve, reject) => {
                this.$confirm(item, title, {
                    confirmButtonText,
                    cancelButtonText,
                    type
                }).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            });
        }
    }
}
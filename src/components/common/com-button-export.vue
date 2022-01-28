<template>
    <com-button ref="elButton" plain @click.prevent="exportFn" icon="el-icon-download" :disabled="loading" v-bind="$attrs">
        <slot>{{ loading ? loading_text : text }}</slot>
    </com-button>
</template>

<script>
export default {
    name: 'com-button-export',
    /**
     * props
     * @property {Function} load // 下载请求，必须要返回Promise
     */
    props: {
        load: {
            type: Function,
            default: null,
        },
        text: {
            type: String,
            default: '导 出',
        },
        loading_text: {
            type: String,
            default: '导出中...',
        },
        confirm: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        /**
         * 下载请求， 内部调用从组件props传入‘load’函数
         * @Function exportFn
         */
        exportFn() {
            if (!this.load || this.loading) return;
            this.$$confirm(...this.confirm)
                .then(() => {
                    this.loading = true;
                    this.load()
                        .then(() => {
                            this.msgSuccess('操作成功！');
                        })
                        .catch(() => {
                            this.msgError('操作失败！');
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                })
                .catch(() => {
                    this.msgInfo('已取消导出！');
                });
        },
    },
};
</script>

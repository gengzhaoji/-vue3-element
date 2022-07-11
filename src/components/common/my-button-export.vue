<template>
    <my-button ref="elButton" @click.prevent="exportFn" icon="Download" v-bind="$attrs">
        <slot>导 出</slot>
    </my-button>
</template>

<script setup name="my-button-export">
const $vm = inject('$vm'),
    /**
     * props
     * @property {Function} load // 下载请求，必须要返回Promise
     */
    props = defineProps({
        load: {
            type: Function,
            default: null,
        },
        confirm: {
            type: Object,
            default: () => [],
        },
    });
/**
 * 下载请求，内部调用从组件props传入‘load’函数
 * @Function exportFn
 */
function exportFn() {
    if (!props.load) return;
    $vm.$$confirm(props.confirm)
        .then(() => {
            props
                .load()
                .then(() => {
                    $vm.msgSuccess('操作成功！');
                })
                .catch(() => {
                    $vm.msgError('操作失败！');
                });
        })
        .catch((err) => {
            $vm.msgInfo('操作已取消！');
        });
}
</script>

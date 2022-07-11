<template>
    <el-cascader
        ref="cascader"
        :options="options"
        :show-all-levels="false"
        filterable
        clearable
        collapse-tags
        collapse-tags-tooltip
        :size="$store.user.size"
        @change="cascaderChange"
        v-bind="$attrs"
    />
</template>

<script setup name="my-cascader">
const $vm = inject('$vm'),
    emits = defineEmits(['getLabel']),
    attrs = useAttrs(),
    props = defineProps({
        type: {
            type: String,
        },
        list: {
            type: Array,
            default: () => [],
        },
    }),
    cascader = $ref(null),
    options = $ref(null);

watch(
    () => props.list,
    (val) => {
        options = val;
    },
    { deep: true, immediate: true }
);
watch(
    () => $vm.$store.com[props.type?.replace('GET', '')],
    (val) => {
        if (props.type) options = val;
    },
    { deep: true, immediate: true }
);
/**
 * 初始化执行逻辑
 */
if (props.type) $vm.$store?.com[props.type]();

function cascaderChange(item) {
    if (!attrs.props.multiple) {
        emits('getLabel', cascader.getCheckedNodes()[0]?.label || '');
        cascader.popperVisible = false;
    } else {
        emits('getLabel', cascader.getCheckedNodes() || []);
    }
}
</script>

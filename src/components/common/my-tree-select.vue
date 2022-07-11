<template>
    <el-tree-select ref="TreeSelect" :data="options" clearable filterable check-strictly collapse-tags collapse-tags-tooltip :size="$store.user.size" v-bind="$attrs" />
</template>

<script setup name="my-tree-select">
const $vm = inject('$vm'),
    emits = defineEmits(['update:modelValue', 'getLabel']),
    TreeSelect = $ref(null),
    /***
     * 参数属性
     * @property {Object[]} modelValue 默认值
     * @property {list[]} list 下拉列表数据
     * @property {String} type store.dispatch的方法名
     */
    props = defineProps({
        list: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
        },
    });

let options = $ref();
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
 *  初始化执行逻辑 调用$store获取数据方法
 */
if (props.type) $vm.$store?.com[props.type]();
</script>

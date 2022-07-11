<template>
    <el-select v-model="fieldValue" v-loadmore="loadmore" :size="$store.user.size" collapse-tags-tooltip collapse-tags clearable filterable @change="selectChange" v-bind="$attrs">
        <slot>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
        </slot>
        <template #prefix v-if="$slots.prefix">
            <slot name="prefix"></slot>
        </template>
        <template #empty v-if="$slots.empty">
            <slot name="empty"></slot>
        </template>
    </el-select>
</template>

<script setup name="my-select">
import _camelCase from 'lodash/camelCase';

const $vm = inject('$vm');
const emits = defineEmits(['update:modelValue', 'getLabel']);
/***
 * 参数属性
 * @property {Object[]} modelValue 默认值
 * @property {list[]} list 下拉列表数据
 * @property {Boolean} needAll 是否需要全部选项，默认为false
 * @property {Object} fillType 数据格式默认为{'label':'label','value':'value'}
 * @property {Function} loadmore 滚动加载的方法，loadmore传入时popper-append-to-body为false
 * @property {String} type store.dispatch的方法名
 * @property {String} code 字典类型，传type/code进行数据字典数据请求
 */
const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean, Array],
    },
    list: {
        type: Array,
        default: () => [],
    },
    needAll: {
        type: Boolean,
        default: false,
    },
    fileType: {
        type: Object,
        default: () => ({ label: 'dictLabel', value: 'dictValue' }),
    },
    loadmore: {
        type: Function,
    },
    type: {
        type: String,
        default: '',
    },
    code: {
        type: String,
        default: '',
    },
});
let options = $ref([]);
let fieldValue = computed({
        get() {
            return typeof props.modelValue === 'number' ? `${props.modelValue}` : props.modelValue;
        },
        set(val) {
            emits('update:modelValue', val);
        },
    }),
    dictType = $computed(() => props?.type || (props.code && `GET${_camelCase(props.code)}`));

watch(
    () => props.list,
    (val) => initialization(val),
    { deep: true, immediate: true }
);
watch(
    () => dictType,
    (val) => {
        initFn();
    },
    { immediate: true }
);

watch(
    () => $vm.$store?.dict[dictType?.replace('GET', '')] || props.$store?.com[dictType?.replace('GET', '')],
    (val) => {
        if (dictType) initialization(val);
    },
    { deep: true, immediate: true }
);

// 获取label
function selectChange(val) {
    emits('getLabel', options.find((item) => item.value === val)?.label);
}
function fileTypeFn(data, fileType = props.fileType) {
    return data.map((val, i) => ({
        label: val[fileType.label],
        value: val[fileType.value],
        disabled: val[fileType.disabled] || false,
    }));
}
function needAllFn(data) {
    const num = JSON.stringify(data).includes(JSON.stringify({ label: '全部', value: '' }));
    if (!num) data.unshift({ label: '全部', value: '' });
    return data;
}
function initialization(list = props.list) {
    options = fileTypeFn(list);
    if (props.needAll) options = needAllFn(options);
}

// 初始化执行逻辑
function initFn() {
    if (dictType) {
        ($vm.$store?.dict[dictType] || $vm.$store?.com[dictType])();
    } else {
        initialization();
    }
}
</script>

<style lang="scss" scoped>
:deep(.el-select) {
    width: 100%;
}
</style>

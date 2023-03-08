<template>
    <el-select v-model="fieldValue" :size="$store.user.size" collapse-tags-tooltip collapse-tags clearable filterable @change="selectChange" v-bind="$attrs">
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

<script setup name="MySelect">
import _camelCase from 'lodash/camelCase';
import vLoadmore from '@u/directives/loadmore';
/**模块store数据 */
import Com from '@s/com';
import Dict from '@s/dict';

const store = {
        com: Com(),
        dict: Dict(),
    },
    emits = defineEmits(['update:modelValue', 'getLabel']);
/***
 * 参数属性
 * @property {Object[]} modelValue 默认值
 * @property {list[]} list 下拉列表数据
 * @property {Boolean} needAll 是否需要全部选项，默认为false
 * @property {Object} fillType 数据格式默认为{ label: 'dictLabel', value: 'dictValue' }
 * @property {Function} loadmoreFn 滚动加载的方法，loadmoreFn传入时popper-append-to-body为false
 * @property {String} type store.dispatch的方法名
 * @property {String} code 字典类型，传type/code进行数据字典数据请求
 */
const props = defineProps({
    modelValue: {},
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
    loadmoreFn: {
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

let options = ref([]),
    fieldValue = computed({
        get() {
            if (typeof props.modelValue === 'number') return `${props.modelValue}`;
            return props.modelValue;
        },
        set(val) {
            emits('update:modelValue', val);
        },
    }),
    dictType = computed(() => props?.type || (props.code && `GET${_camelCase(props.code)}`));

watch(
    () => props.list,
    (val) => initialization(val),
    { deep: true, immediate: true }
);
watch(
    () => dictType.value,
    (val) => {
        initFn();
    },
    { immediate: true }
);
watch(
    () => store?.dict[unref(dictType)?.replace('GET', '')] || store?.com[unref(dictType)?.replace('GET', '')],
    (val) => {
        if (unref(dictType)) initialization(val);
    },
    { deep: true, immediate: true }
);

// 获取label
function selectChange(val) {
    emits('getLabel', unref(options).find((item) => item.value === val)?.label);
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
    options.value = fileTypeFn(list);
    if (props.needAll) options.value = needAllFn(options.value);
}

// 初始化执行逻辑
function initFn() {
    if (unref(dictType)) {
        (store?.dict[unref(dictType)] || store?.com[unref(dictType)])();
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

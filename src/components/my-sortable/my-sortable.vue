<template>
    <div class="my-sortable" ref="$el">
        <div v-for="(item, index) in list" :key="index" :data-id="index" v-bind="$attrs" class="my-sortable__item">
            <slot :item="item" :index="index">{{ item }}</slot>
        </div>
    </div>
</template>

<script setup name="MySortable">
/**
 * 拖拽排序组件
 * @module components/my-sortable
 * @example
 */
import Sortable from 'sortablejs';
import { insertAfter } from '@u/dom';

/**
 * 插槽
 * @member slots
 * @property {string} default 作用域插槽，定义各项内容，参数：item 数据项， index 数据项索引
 */
/**
 * 属性参数
 * @member props
 * @property {Array} [data] 数据
 * @property {object} [options] Sortablejs 参数选项
 */
const $emit = defineEmits(['update:data', 'add', 'remove']),
    props = defineProps({
        // 数据
        data: {
            type: Array,
            default() {
                return [];
            },
        },
        // 选项
        options: {
            type: Object,
            default() {
                return {
                    animation: 150,
                    ghostClass: 'blue-background',
                };
            },
        },
    }),
    sortableConfig = computed(() => ({
        animation: 150,
        ...props.options,
        onUpdate: (e) => {
            sort(e.oldIndex, e.newIndex);
            props.options?.onUpdate?.(e);
        },
        onAdd: (e) => {
            add(e.from.__data__, e.item, e.oldIndex, e.newIndex);
            props.options?.onAdd?.(e);
        },
        onRemove: (e) => {
            remove(e.item, e.oldIndex);
            props.options?.onRemove?.();
        },
    }));

let list = ref([]),
    sortable,
    $el = ref(null);

watch(
    () => sortableConfig.value,
    (val) => {
        setOptions(val);
    },
    { deep: true }
);
watch(
    () => props.data,
    (val) => {
        list.value = [...val];
    },
    {
        immediate: true,
    }
);
watch(
    () => list.value,
    () => {
        nextTick(reset());
    },
    {
        deep: true,
    }
);

function sort(oldIndex, newIndex) {
    const oldTemp = list.value[oldIndex];
    list.value.splice(oldIndex, 1);
    list.value.splice(newIndex, 0, oldTemp);
    $emit('update:data', list.value.slice(0));
}
function add(fromData, element, oldIndex, newIndex) {
    const newItem = fromData[oldIndex];
    list.value.splice(newIndex, 0, newItem);
    Array.from(unref($el).children).forEach((el) => {
        if (el === element) {
            unref($el).removeChild(el);
        }
    });
    $emit('update:data', list.value.slice(0));
    /**
     * 新增时触发
     */
    $emit('add', newItem, newIndex);
}
function remove(element, oldIndex) {
    list.value.splice(oldIndex, 1);
    const children = unref($el).children;
    if (children.length > 0) {
        oldIndex > 0 ? insertAfter(element, children[oldIndex - 1]) : unref($el)?.insertBefore(element, children[0]);
    } else {
        unref($el).appendChild(element);
    }
    $emit('update:data', list.value.slice(0));
    /**
     * 删除时触发
     */
    $emit('remove', oldIndex);
}
function setOptions(opts) {
    sortable?.option?.(opts);
}
function reset() {
    const order = list.value.map((n, index) => index.toString());
    sortable?.sort?.(order);
    unref($el).__data__ = list.value;
}
function init() {
    sortable?.destroy?.();
    sortable = new Sortable(unref($el), sortableConfig.value);
    unref($el).__data__ = list.value;
}
onMounted(() => {
    init();
});
onBeforeUnmount(() => {
    sortable?.destroy?.();
    unref($el).__data__ = null;
});
</script>

<style lang="scss" scoped>
.blue-background {
    background: #2c9dff !important;
}
</style>

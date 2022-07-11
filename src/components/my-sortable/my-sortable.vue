<template>
    <div class="my-sortable" :id="Id">
        <div v-for="(item, index) in list" :key="index" :data-id="index" v-bind="$attrs" class="my-sortable__item">
            <slot :item="item" :index="index">{{ item }}</slot>
        </div>
    </div>
</template>

<script setup name="MySortable">
/**
 * 拖拽排序组件
 * @module /components/my-sortable
 * @example
 *  http://www.sortablejs.com/index.html
 */
import Sortable from 'sortablejs';
import { insertAfter } from '@/utils/dom';
import { guid } from '@u/util';

/**
 * 插槽
 * @member slots
 * @property {string} default 作用域插槽，定义各项内容，参数：item 数据项， index 数据项索引
 */
/**
 * 属性参数
 * @member props
 * @property {Array} [data] 数据，支持 sync 修饰符
 * @property {object} [options] Sortablejs 参数选项
 */
const $emit = defineEmits(['update:data', 'add', 'remove']),
    Id = `MySortableId${guid()}`,
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
let list = $ref([...props.data]);

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
        list = val.slice(0);
    }
);
watch(list, () => {
    nextTick(reset());
});

let sortable, $el;
function sort(oldIndex, newIndex) {
    const oldTemp = list[oldIndex];
    list.splice(oldIndex, 1);
    list.splice(newIndex, 0, oldTemp);
    $emit('update:data', list.slice(0));
}
function add(fromData, element, oldIndex, newIndex) {
    const newItem = fromData[oldIndex];
    list.splice(newIndex, 0, newItem);
    Array.from($el.children).forEach((el) => {
        if (el === element) {
            $el.removeChild(el);
        }
    });
    this.$emit('update:data', list.slice(0));
    /**
     * 新增时触发
     */
    this.$emit('add', newItem, newIndex);
}
function remove(element, oldIndex) {
    list.splice(oldIndex, 1);
    const children = $el.children;
    if (children.length > 0) {
        oldIndex > 0 ? insertAfter(element, children[oldIndex - 1]) : $el?.insertBefore(element, children[0]);
    } else {
        $el.appendChild(element);
    }
    $emit('update:data', this.list.slice(0));
    /**
     * 删除时触发
     */
    $emit('remove', oldIndex);
}
function setOptions(opts) {
    sortable?.option?.(opts);
}
function reset() {
    const order = list.map((n, index) => index.toString());
    sortable?.sort?.(order);
    $el.__data__ = list;
}
function init() {
    sortable?.destroy?.();
    sortable = new Sortable($el, sortableConfig.value);
    $el.__data__ = list;
}
onMounted(() => {
    $el = document.getElementById(Id);
    init();
});
onBeforeUnmount(() => {
    sortable?.destroy?.();
    $el.__data__ = null;
});
</script>

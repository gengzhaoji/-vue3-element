<template>
    <div class="f1 h0 flex-col system-page-background">
        <slot :size="pageSize" :page="currentPage"></slot>
        <div class="p-10" v-if="pager">
            <my-pager :layout="layout" :total="total" :size="pageSize" :page="currentPage" @current-change="handlePageChange" @size-change="handleSizeChange" v-bind="$attrs">
                <slot v-if="$slots['pager-custom']" name="pager-custom"></slot>
            </my-pager>
        </div>
    </div>
</template>

<script setup name="myListPanel">
/**
 * 插槽
 * @member slot
 * @property {String} [pager-custom] 分页组件自定义内容
 */
/**
 * 作用域插槽
 * @member scopedSlots
 * @property {String} default 定义列表内容，参数 list：列表数据， height：容器高度, page: 页码， pageSize：页大小
 */

/**
 * 参数属性
 * @property {Boolean} [pager = true] 是否使用分页控件
 * @property {Function(page,size)} [loadFn] 数据加载函数，参数为 加载页和 单页数量。需要返回 promise
 * @property {Boolean} [isAuto = true] 是否在组件初始化时自动加载数据
 */
const props = defineProps({
    // 加载数据函数，传入参数：page，size，必须要返回Promise
    loadFn: {
        type: Function,
        default: null,
    },
    // 是否在初始化时自动加载数据
    isAuto: {
        type: Boolean,
        default: true,
    },
    // 是否显示分页
    pager: {
        type: Boolean,
        default: true,
    },
    size: {
        type: Number,
        default: 20,
    },
    sizes: {
        type: Array,
        default() {
            return [5, 10, 20, 30, 50, 100];
        },
    },
    total: {
        type: Number,
        default: 0,
    },
    layout: {
        type: String,
        default: 'total,sizes, ->, prev, pager, next, jumper,slot',
    },
});

let currentPage = $ref(1),
    pageSize = $ref(props.size);

// 是否为最后一页
const lastcurrentPage = computed(() => currentPage === Math.ceil(props.total / pageSize));

/**
 * 加载数据， 内部调用从组件props传入‘load’函数
 * @Function loadData
 */
function loadData() {
    if (!props.loadFn) return;
    props.loadFn(currentPage, pageSize);
}
/**
 * 分页器页码变动是触发的函数
 * @Function handlePageChange
 * @param page
 */
function handlePageChange(page) {
    currentPage = page;
    loadData();
}
/**
 * 分页器每页数量变动时触发的函数
 * @Function handleSizeChange
 * @param size
 */
function handleSizeChange(size) {
    currentPage = 1;
    pageSize = size;
    loadData();
}
/**
 * 组件重置函数
 * @Function reload
 */
function reload() {
    currentPage = 1;
    loadData();
}
// 属性、方法抛出
defineExpose({ lastcurrentPage, loadData, reload });
// 初始化逻辑
props.isAuto && loadData();
</script>

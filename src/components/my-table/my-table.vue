<template>
    <el-table ref="myTable" :class="['my-table', { 'flex-grow-1': fit }]" :data="tableData" :size="$store.user.size" v-bind="tableOptions" :key="i">
        <template v-for="col in displayColumns" :key="`${col.prop}-${col.type}`">
            <!-- col 没有children 属性 -->
            <el-table-column v-if="!col.children" resizable v-bind="col">
                <template #header="scope" v-if="!col.type">
                    <slot :name="`${col.prop || 'default'}_header`" v-bind="scope">
                        {{ col.label }}
                    </slot>
                </template>
                <template #default="scope" v-if="!col.type">
                    <slot :name="col.prop || 'default'" v-bind="scope">
                        {{ valueFn(scope.row, col.prop) }}
                    </slot>
                </template>
            </el-table-column>
            <!-- col 有children 属性， 直接返回slot插槽 -->
            <slot v-else :name="col.prop" :column="col"></slot>
        </template>
        <el-table-column v-if="columnFilter" :resizable="false" width="26px" align="center" class-name="my-table--not-drag" fixed="right">
            <template #header>
                <ColumnFilter :columns="initColumns" v-model="displayColumnProps" @column-change-confirm="colChangeConfirm" />
            </template>
        </el-table-column>
        <!--暴露 el-table append 插槽-->
        <template #append v-if="$slots.append">
            <slot name="append"></slot>
        </template>
        <!-- 自动无数据提示 插槽-->
        <template #empty>
            <slot name="empty">
                <el-empty description="暂无数据" />
            </slot>
        </template>
    </el-table>
</template>

<script setup name="myTable">
/**
 * myTable 表格组件 报错问题为无法获取使用$props
 * @module components/my-table
 */
import Sortable from 'sortablejs';
import { debounce } from '@/utils/util';
import { insertAfter } from '@/utils/dom';

const emits = defineEmits(['column-change-confirm', 'on-column-sort', 'on-row-sort', 'on-reach-bottom', 'on-reach-top', 'on-scroll']),
    $attrs = useAttrs(),
    /**
     * 属性参数，完全继承 el-table参数，并有以下扩展参数
     * @property {Boolean} [fit = true] 是否占满父类
     * @property {Array} [data = []] 表格行数据
     * @property {Array} [columns = []]  表格列定义，对象属性参数完全继承 el-table-column
     * @property {Object | Boolean} [columnSortable = false] 是否启用列拖拽排序, 可以配置Sortable个性化参数
     * @property {Object | Boolean} [rowSortable = false] 是否启用行拖拽排序, 可以配置Sortable个性化参数
     * @property {Number} [distanceToButton = 50] 滚动到距离底部多少距离触发 on-reach-bottom 事件， table需要设置高度才有效
     * @property {Boolean} [columnFilter] table列的自定义功能，默认为false
     */
    props = defineProps({
        fit: {
            type: Boolean,
            default: true,
        },
        data: {
            type: Array,
            default() {
                return [];
            },
        },
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        initColumns: {
            type: Array,
            default() {
                return [];
            },
        },
        columnSortable: {
            type: [Object, Boolean],
            default: false,
        },
        rowSortable: {
            type: [Object, Boolean],
            default: false,
        },
        distanceToButton: {
            type: Number,
            default: 50,
        },
        columnFilter: {
            type: Boolean,
            default: false,
        },
    }),
    tableOptions = computed(() => {
        if (props.fit) return { height: 10, ...$attrs };
        return { ...$attrs };
    });

// 表格列定义数组
let displayColumnProps = $ref([]),
    // 原始表格数据
    columnsProxy = $ref([]),
    // 表格行数据
    tableData = $ref({}),
    // 列拖拽Sortable实例
    columnSortableInstance = $ref(null),
    // 行拖拽Sortable实例
    rowSortableInstance = $ref(null),
    // 上次滚动的位置
    lastScrollTop = $ref(0),
    // 处理树形表格数据不响应问题
    i = $ref(1);

watch(
    () => props.data,
    (val) => {
        if (!!$attrs['row-key']) i++;
        tableData = val;
    },
    { immediate: true }
);
watch(
    () => props.columns,
    (val) => {
        columnsProxy = [...val];
        resetDisplayColumns();
    },
    { immediate: true }
);
watch(displayColumnProps, (val) => {
    props.columns.forEach((item) => {
        if (!(item.type || !item.prop)) {
            // 默认为显示修改
            if (val.includes(item.prop)) {
                if (item.display === false) delete item.display;
            } else {
                item.display = false;
            }
        }
    });
});

const displayColumns = computed(() =>
    columnsProxy.filter((col) => {
        // 有type的字段 或 没设置属性名称的列固定显示
        if (col.type || !col.prop) return true;
        return displayColumnProps.includes(col.prop);
    })
);

function valueFn(row, key) {
    let keyArray = key?.split('.') || [],
        data = '';
    keyArray.forEach((item, index) => {
        if (index === 0) {
            data = row[item];
        } else {
            data = data?.[item];
        }
    });
    return data;
}
function resetDisplayColumns() {
    displayColumnProps = columnsProxy
        .filter((col) => {
            if (!col.prop || col.type) return false;
            return col.display !== false;
        })
        .map((col) => col.prop);
}
function colChangeConfirm() {
    /**
     * 列表筛选点击确定时触发
     * @event column-change-confirm
     * @param {Array[]} columnPropNames
     */
    emits('column-change-confirm', displayColumnProps);
}
/**
 * 内部调用排序方法，还原由Sortable拖拽改变的DOM顺序，然后修改数据，再由数据驱动改变DOM
 * @function
 * @private
 * @param {String} type 排序类型，row 或 column
 * @param {HTMLElement} container 容器元素DOM
 * @param {Array} data 数据数组
 * @param {Object} e Sortable事件对象
 */
function sort(type, container, data, e) {
    const tempData = [...data];
    const newIndex = e.newIndex;
    const oldIndex = e.oldIndex;
    const temp = tempData[oldIndex];
    container.removeChild(e.item);
    const children = container.children;
    if (children.length) {
        oldIndex > 0 ? insertAfter(e.item, children[oldIndex - 1]) : container?.insertBefore(e.item, children[0]);
    } else {
        container.appendChild(e.item);
    }
    // 固定类型的列不运行拖拽和放置
    if (type === 'column' && data[newIndex] && data[newIndex].type) return;
    tempData.splice(oldIndex, 1);
    tempData.splice(newIndex, 0, temp);
    // 修复ele中重新设置表格配置时要重新描绘表格
    if (type === 'column') {
        columnsProxy = [];
        nextTick(() => {
            columnsProxy = tempData;
        });
    } else {
        tableData = [];
        nextTick(() => {
            tableData = tempData;
        });
    }
}
/**
 * 实例化列Sortable
 */
function initColumnSortable() {
    const tr = myTable.$refs.tableHeader.$el.getElementsByTagName('tr')[0];
    if (!tr) return;
    const options = Object.assign(
        {
            forceFallback: false,
            animation: 150,
        },
        props.columnSortable,
        {
            handle: '.cell',
            filter: '.my-table--not-drag',
            onSort: (e) => {
                sort('column', tr, columnsProxy, e);
                /**
                 * 列拖拽排序完成时触发
                 * @event on-column-sort
                 * @param {object} e Sortable事件对象
                 * @param {Array} columns 列定义数组
                 */
                emits('on-column-sort', e, columnsProxy);
            },
        }
    );
    columnSortableInstance = new Sortable(tr, options);
}
/**
 * 实例化行Sortable
 */
function initRowSortable() {
    const tbody = myTable.$refs.bodyWrapper.getElementsByTagName('tbody')[0];
    if (!tbody) return;
    const options = Object.assign(
        {
            forceFallback: false,
            animation: 150,
        },
        props.rowSortable,
        {
            onSort: (e) => {
                sort('row', tbody, tableData, e);
                /**
                 * 行拖拽排序完成时触发
                 * @event on-row-sort
                 * @param {object} e Sortable事件对象
                 * @param {Array} data 行数据
                 */
                emits('on-row-sort', e, tableData);
            },
        }
    );
    rowSortableInstance = new Sortable(tbody, options);
}
/**
 * 表格滚动加载数据逻辑
 */
function handleScroll(e) {
    const target = e.target;
    const dir = target.scrollTop - lastScrollTop > 0 ? 'down' : 'up';
    lastScrollTop = target.scrollTop;
    const scrollDistance = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (dir === 'down' && scrollDistance <= props.distanceToButton) {
        /**
         * 表格滚动到底部时触发
         * @event on-reach-bottom
         * @param {Number} scrollDistance 离底部的距离
         */
        emits('on-reach-bottom', scrollDistance);
    }
    if (dir === 'up' && target.scrollTop <= props.distanceToButton) {
        /**
         * 表格滚动到顶部时触发
         * @event on-reach-top
         * @param {Number} scrollTop 离顶部的距离
         */
        emits('on-reach-top', target.scrollTop);
    }
    /**
     * 表格滚动时触发
     * @event on-scroll
     * @param {Object} e 事件对象
     */
    emits('on-scroll', e);
}

const myTable = $ref(null);
let proxyHandleScroll, bodyWrapper;
onMounted(() => {
    props.columnSortable && initColumnSortable();
    props.rowSortable && initRowSortable();
    proxyHandleScroll = debounce(handleScroll, 20, false);
    bodyWrapper = myTable.$refs.bodyWrapper.querySelector('.el-scrollbar .el-scrollbar__wrap');
    bodyWrapper.addEventListener('scroll', proxyHandleScroll);
});
onBeforeUnmount(() => {
    columnSortableInstance?.destroy?.();
    rowSortableInstance?.destroy?.();
    if (bodyWrapper && proxyHandleScroll) bodyWrapper.removeEventListener('scroll', proxyHandleScroll);
});
</script>

<style lang="scss">
.my-table {
    .sortable-ghost {
        opacity: 0.3;
    }
    .sortable-ghost.my-table--not-drag {
        background: transparent;
    }
    .my-table--not-drag {
        .cell {
            padding: 0;
            cursor: pointer;
        }
    }
    &-filter {
        &__label {
            font-style: normal;
        }
    }
}
</style>

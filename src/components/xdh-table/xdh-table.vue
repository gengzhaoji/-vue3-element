<template>
    <el-table ref="table" class="xdh-table" :data="tableData" v-bind="tableOptions" :key="i">
        <template v-for="(col, index) in displayColumns" :key="`${col.prop}_${col.type}_${index}`">
            <!-- col 没有children 属性 -->
            <el-table-column v-if="!col.children" v-bind="col">
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
                <ColumnFilter :columns="columns" v-model="displayColumnProps" @column-change-confirm="colChangeConfirm" />
            </template>
        </el-table-column>

        <!--暴露 el-table append 插槽-->
        <template #append v-if="$slots.append">
            <slot name="append"></slot>
        </template>
        <!-- 自动无数据提示 插槽-->
        <template #empty v-if="$slots.empty">
            <slot name="empty"></slot>
        </template>
    </el-table>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { ElTable } from 'element-plus';
import Sortable from 'sortablejs';
import { debounce } from '@/utils/util';
import { insertAfter } from '@/utils/dom';

/**
 * XdhTable 表格组件
 * @module widgets/xdh-table
 */
export default {
    name: 'XdhTable',
    components: {
        ColumnFilter: defineAsyncComponent(() => import('./ColumnFilter.vue')),
    },
    /**
     * 属性参数，完全继承 el-table参数，并有以下扩展参数
     * @property {Array} [data = []] 表格行数据
     * @property {Array} [columns = []]  表格列定义，对象属性参数完全继承 el-table-column
     * @property {Object | Boolean} [columnSortable = false] 是否启用列拖拽排序, 可以配置Sortable个性化参数
     * @property {Object | Boolean} [rowSortable = false] 是否启用行拖拽排序, 可以配置Sortable个性化参数
     * @property {Number} [distanceToButton = 50] 滚动到距离底部多少距离触发 on-reach-bottom 事件， table需要设置高度才有效
     * @property {Number} [height = 10] table高度,默认为10px
     * @property {Boolean} [scroll] table默认高度是否生效，表格是否滚动
     * @property {Boolean} [columnFilter] table列的自定义功能，默认为true
     */
    props: {
        ...ElTable.props,
        columns: {
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
        height: {
            default: 10,
        },
        scroll: {
            type: Boolean,
            default: true,
        },
        columnFilter: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // 处理树形表格页面不刷新的问题
            i: 1,
            // 表格列定义数组
            displayColumnProps: [],
            columnsProxy: [],
            // 表格行数据
            tableData: this.data,
            // 列拖拽Sortable实例
            columnSortableInstance: null,
            // 行拖拽Sortable实例
            rowSortableInstance: null,
            // 上次滚动的位置
            lastScrollTop: 0,
        };
    },
    watch: {
        data: {
            handler(val) {
                if (!!this.rowKey) this.i++;
                this.tableData = val;
            },
        },
        columns: {
            immediate: true,
            handler() {
                this.columnsProxy = [...this.columns];
                this.resetDisplayColumns();
            },
        },
        displayColumnProps(val) {
            this.columns.forEach((item) => {
                if (!(item.type || !item.prop)) {
                    // 默认为显示修改
                    if (val.includes(item.prop)) {
                        if (item.display === false) delete item.display;
                    } else {
                        item.display = false;
                    }
                }
            });
        },
    },
    computed: {
        // el-table 参数
        tableOptions() {
            let options = { ...this.$props };
            delete options.columns;
            delete options.data;
            delete options.columnSortable;
            delete options.rowSortable;
            delete options.distanceToButton;
            if (!this.scroll) delete options.height;
            options.size = options.size || this.$store.state.user.size;
            return options;
        },
        displayColumns() {
            return this.columnsProxy.filter((col) => {
                // 有type的字段 或 没设置属性名称的列固定显示
                if (col.type || !col.prop) return true;
                return this.displayColumnProps.includes(col.prop);
            });
        },
    },
    methods: {
        valueFn(row, key) {
            let keyArray = key.split('.'),
                data;
            keyArray.forEach((item, index) => {
                if (index === 0) {
                    data = row[item];
                } else {
                    data = data && data[item];
                }
            });
            return data == undefined ? '—' : data;
        },
        resetDisplayColumns() {
            this.displayColumnProps = this.columnsProxy
                .filter((col) => {
                    if (!col.prop || col.type) return false;
                    return col.display !== false;
                })
                .map((col) => col.prop);
        },
        colChangeConfirm() {
            /**
             * 列表筛选点击确定时触发
             * @event column-change-confirm
             * @param {Array[]} columnPropNames
             */
            this.$emit('column-change-confirm', this.displayColumnProps);
        },
        /**
         * 内部调用排序方法，还原由Sortable拖拽改变的DOM顺序，然后修改数据，再由数据驱动改变DOM
         * @function
         * @private
         * @param {String} type 排序类型，row 或 column
         * @param {HTMLElement} container 容器元素DOM
         * @param {Array} data 数据数组
         * @param {Object} e Sortable事件对象
         */
        sort(type, container, data, e) {
            const tempData = [...data];
            const newIndex = e.newIndex;
            const oldIndex = e.oldIndex;
            const temp = tempData[oldIndex];
            container.removeChild(e.item);
            const children = container.children;
            if (children.length > 0) {
                oldIndex > 0 ? insertAfter(e.item, children[oldIndex - 1]) : container.insertBefore(e.item, children[0]);
            } else {
                container.appendChild(e.item);
            }

            // 固定类型的列不运行拖拽和放置
            if (type === 'column' && data[newIndex] && data[newIndex].type) {
                return;
            }
            tempData.splice(oldIndex, 1);
            tempData.splice(newIndex, 0, temp);

            // 修复ele中重新设置表格配置时要重新描绘表格
            if (type === 'column') {
                this.tableColumns = [];
                this.$nextTick(() => {
                    this.tableColumns = tempData;
                });
            } else {
                this.tableData = [];
                this.$nextTick(() => {
                    this.tableData = tempData;
                });
            }
        },
        /**
         * 实例化列Sortable
         */
        initColumnSortable() {
            const tr = this.$refs.table.$refs.tableHeader.$el.getElementsByTagName('tr')[0];
            if (!tr) return;

            const options = Object.assign(
                {
                    forceFallback: false,
                    animation: 150,
                },
                this.columnSortable,
                {
                    handle: '.cell',
                    filter: '.xdh-table--not-drag',
                    onSort: (e) => {
                        this.sort('column', tr, this.tableColumns, e);
                        /**
                         * 列拖拽排序完成时触发
                         * @event on-column-sort
                         * @param {object} e Sortable事件对象
                         * @param {Array} columns 列定义数组
                         */
                        this.$emit('on-column-sort', e, this.tableColumns);
                    },
                }
            );

            this.columnSortableInstance = new Sortable(tr, options);
        },
        /**
         * 实例化行Sortable
         */
        initRowSortable() {
            const tbody = this.$refs.table.$refs.bodyWrapper.getElementsByTagName('tbody')[0];
            if (!tbody) return;

            const options = Object.assign(
                {
                    forceFallback: false,
                    animation: 150,
                },
                this.rowSortable,
                {
                    onSort: (e) => {
                        this.sort('row', tbody, this.tableData, e);
                        /**
                         * 行拖拽排序完成时触发
                         * @event on-row-sort
                         * @param {object} e Sortable事件对象
                         * @param {Array} data 行数据
                         */
                        this.$emit('on-row-sort', e, this.tableData);
                    },
                }
            );

            this.rowSortableInstance = new Sortable(tbody, options);
        },
        handleScroll(e) {
            const target = e.target;
            const dir = target.scrollTop - this.lastScrollTop > 0 ? 'down' : 'up';
            this.lastScrollTop = target.scrollTop;
            const scrollDistance = target.scrollHeight - target.scrollTop - target.clientHeight;
            if (dir === 'down' && scrollDistance <= this.distanceToButton) {
                /**
                 * 表格滚动到底部时触发
                 * @event on-reach-bottom
                 * @param {Number} scrollDistance 离底部的距离
                 */
                this.$emit('on-reach-bottom', scrollDistance);
            }

            if (dir === 'up' && target.scrollTop <= this.distanceToButton) {
                /**
                 * 表格滚动到顶部时触发
                 * @event on-reach-top
                 * @param {Number} scrollTop 离顶部的距离
                 */
                this.$emit('on-reach-top', target.scrollTop);
            }

            /**
             * 表格滚动时触发
             * @event on-scroll
             * @param {Object} e 事件对象
             */
            this.$emit('on-scroll', e);
        },
    },
    mounted() {
        this.columnSortable && this.initColumnSortable();
        this.rowSortable && this.initRowSortable();
        this.proxyHandleScroll = debounce(this.handleScroll, 20, false, this);
        this.bodyWrapper = this.$refs.table.$refs.bodyWrapper;
        this.bodyWrapper.addEventListener('scroll', this.proxyHandleScroll);
    },
    beforeUnmount() {
        this.columnSortableInstance && this.columnSortableInstance.destroy();
        this.rowSortableInstance && this.rowSortableInstance.destroy();
        if (this.bodyWrapper && this.proxyHandleScroll) {
            this.bodyWrapper.removeEventListener('scroll', this.proxyHandleScroll);
        }
    },
};
</script>

<style lang="scss">
.xdh-table {
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

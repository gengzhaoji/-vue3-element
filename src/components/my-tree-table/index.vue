<template>
    <div ref="myTreeTable">
        <div class="flex m-between m-h-500" style="height: 50vh">
            <div style="width: 28%" class="flex-col">
                <my-input v-model="filType" placeholder="请输入">
                    <template #append>
                        <my-button
                            icon="Search"
                            @click="
                                filType = '';
                                queryParams[treeKey] = '';
                                refTable.reload();
                            "
                        />
                    </template>
                </my-input>
                <div class="f1 h0 overflow-auto m-t-10">
                    <my-panel shadow="always" fit :title="treeTitle" size="medium" theme="bg-right" icon="Menu">
                        <el-tree
                            ref="refTree"
                            :expand-on-click-node="false"
                            :filter-node-method="filterNode"
                            highlight-current
                            default-expand-all
                            @node-click="handleNodeClick"
                            v-bind="tree"
                        />
                    </my-panel>
                </div>
            </div>
            <div class="border flex-col f1 w0 m-l-10">
                <div class="p-10 system-page-background b-r-4">
                    <my-form inline query :model="queryParams" :formItem="formItem" @searchFn="refTable.reload()" @resetFn="refTable.reload()" />
                </div>
                <!-- 表格部分 -->
                <my-list-panel ref="refTable" :total="state.total" :loadFn="loadData">
                    <comTable ref="myTableRef" :data="state.list" :columns="columns" @select="handleSelectionChange" @select-all="handleSelectionAllChange" />
                </my-list-panel>
            </div>
        </div>
        <slot name="footer">
            <div class="tr m-t-10">
                <my-button type="primary" @click.prevent="subFn()">确 定 {{ state.tableSelection.length }} 项</my-button>
                <my-button @click.prevent="$emit('close')">取 消</my-button>
            </div>
        </slot>
    </div>
</template>

<script>
import myTable from '@c/my-table';
/**
 * 插槽穿透问题的处理方法
 */
const comTable = {
    /**
     * @param {*} props
     * @param {*} context
     * Attribute (非响应式对象，等同于 $attrs) console.log(context.attrs)
     * 插槽 (非响应式对象，等同于 $slots) console.log(context.slots)
     * 触发事件 (方法，等同于 $emit) console.log(context.emit)
     * 暴露公共 property (函数) console.log(context.expose)
     */
    setup(props, context) {
        const {
            parent: {
                attrs,
                parent: { slots },
            },
        } = getCurrentInstance();
        /**
         * h接收三个参数：type，props 和 children
         * type 类型：String | Object | Function
         * 详细：HTML 标签名、组件、异步组件或函数式组件。使用返回 null 的函数将渲染一个注释。此参数是必需的。
         * #props 类型：Object
         * 详细：一个对象，与我们将在模板中使用的 attribute、prop 和事件相对应。可选。
         * #children 类型：String | Array | Object
         * 详细：子代 VNode，使用 h() 生成，或者使用字符串来获取“文本 VNode”，或带有插槽的对象。可选。插槽也包含其中
         */
        return () =>
            h(
                myTable,
                {
                    ...attrs,
                    ref: 'myTable',
                },
                {
                    ...slots,
                }
            );
    },
};
</script>

<script setup name="myTreeTable">
import { SpreadPage } from '@u/mixin';

const $emit = defineEmits(['determine', 'close']),
    refTree = $ref(null),
    refTable = $ref(null),
    myTableRef = $ref(null),
    /**
     * 该组件所有props都为必填
     * @param {Function} pageApi 右边表格的分页接口
     * @param {Object} tree 左边树形tree的配置属性对象
     * @param {String} treeKey 左边树形tree的key值，传给后台查询的字段名
     * @param {String} treeTitle 左边树形tree的title
     * @param {Array} formItem 右边表格的查询条件
     * @param {Array} columns 表格的columns配置数据
     */
    props = defineProps({
        pageApi: {
            type: Function,
            required: true,
        },
        tree: {
            type: Object,
            required: true,
            default: () => ({
                data: [],
                props: { children: 'children', label: 'name' },
                nodeKey: 'id',
            }),
        },
        treeKey: {
            type: String,
            required: true,
        },
        treeTitle: {
            type: String,
            default: '分类',
        },
        formItem: {
            type: Array,
            required: true,
        },
        columns: {
            type: Array,
            required: true,
        },
    });

let queryParams = $ref({}),
    state = $ref({
        tableSelection: [],
        total: 0,
        list: [],
    });

const { loadData, handleSelectionChange, handleSelectionAllChange } = SpreadPage({ queryParams, api: { page: props.pageApi }, state, myTable: () => myTableRef.$refs.myTable });

// 左边tree逻辑部分
let filType = $ref('');
watch(
    () => filType,
    (val) => refTree.filter(val)
);
function handleNodeClick(data) {
    queryParams[props.treeKey] = data[props.tree.nodeKey];
    refTable.reload();
}
function filterNode(val, data) {
    if (!val) return true;
    return data[props.tree.props.label].includes(val);
}

// 确认逻辑
function subFn() {
    $emit('determine', [...state.tableSelection]);
    $emit('close');
}
</script>

<style lang="scss" scoped>
.border {
    border-radius: var(--el-border-radius-base);
    border: 1px solid var(--el-border-color);
}
</style>

<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="85px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeIpaddr', label: '登录地址' },
                    { prop: 'likeUserName', label: '用户名称' },
                    { prop: 'likeBrowser', label: '浏览器类型' },
                    { prop: 'likeOs', label: '操作系统' },
                    { itemType: 'select', list: $store.dict.sysCommonStatus, prop: 'status', label: '状态' },
                    {
                        itemType: 'date',
                        type: 'datetimerange',
                        rangeSeparator: '至',
                        startPlaceholder: '开始日期',
                        endPlaceholder: '结束日期',
                        prop: 'dateRange',
                        label: '登录时间',
                    },
                ]"
                @searchFn="refTable.reload()"
                @resetFn="refTable.reload()"
            />
        </div>
        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:logininfor:remove', 'system:logininfor:export']">
                <my-button-export :load="Export" v-hasPermi="['system:logininfor:export']" />
                <my-button type="danger" :disabled="!tableSelection.length" @click.prevent="deleteFn(tableSelection)" icon="Delete" v-hasPermi="['system:logininfor:remove']">
                    删 除
                </my-button>
            </div>
            <my-list-panel ref="refTable" :loadFn="loadData" :total="state.total">
                <template #default="{ page, size }">
                    <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                        <template #index="{ $index }">
                            {{ $index + 1 + (page - 1) * size }}
                        </template>
                        <template #status="{ row }">
                            {{ selectDictLabel($store.dict.sysCommonStatus, row.status) }}
                        </template>
                    </my-table>
                </template>
            </my-list-panel>
        </div>
    </div>
</template>

<script setup name="logininfor">
import mixin from '@/utils/mixin';
import { pageLogininfor, removeLogininfor, exportLogininfor } from '@a/system';
import { downloadBlob } from '@u/download';

// 查询参数
let queryParams = $ref({
        likeIpaddr: '',
        likeUserName: '',
        likeBrowser: '',
        likeOs: '',
        status: '',
        dateRange: [],
    }),
    state = $ref({
        total: 0,
        list: [],
        columns: [
            {
                type: 'selection',
            },
            {
                label: '序号',
                width: '80',
                prop: 'index',
            },
            {
                label: '访问编号',
                prop: 'id',
            },
            {
                label: '登录地址',
                prop: 'ipaddr',
                width: 150,
            },
            {
                label: '登录地点',
                prop: 'loginLocation',
            },
            {
                label: '用户名称',
                prop: 'userName',
            },
            {
                label: '浏览器类型',
                prop: 'browser',
            },
            {
                label: '操作系统',
                prop: 'os',
            },
            {
                label: '状态',
                prop: 'status',
            },
            {
                label: '描述',
                prop: 'msg',
            },
            {
                label: '访问时间',
                prop: 'loginTime',
                width: 180,
            },
        ],
    }),
    tableSelection = $ref([]);

const refTable = ref(null);
const { $vm, loadData, deleteFn } = mixin({
    queryParams,
    state,
    api: { page: pageLogininfor, remove: removeLogininfor },
    refTable,
});
// 初始化执行逻辑
$vm.$store.dict.GETsysCommonStatus();

/** 导出按钮操作 */
function Export() {
    return exportLogininfor($vm.addDateRange(queryParams, 'dateRange', 'LoginTime')).then((data) => {
        downloadBlob(data, '登录日志.xlsx');
    });
}
</script>

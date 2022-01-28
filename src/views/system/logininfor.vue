<template>
    <div class="page">
        <div class="top-title">登录日志</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="85px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeIpaddr', label: '登录地址' },
                    { prop: 'likeUserName', label: '用户名称' },
                    { prop: 'likeBrowser', label: '浏览器类型' },
                    { prop: 'likeOs', label: '操作系统' },
                    { itemType: 'select', list: $store.state.dict.sysCommonStatus, prop: 'status', label: '状态' },
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
                @searchFn="$refs.table.reload()"
                @resetFn="$refs.table.reload()"
            />
        </div>
        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:logininfor:remove', 'system:logininfor:export']">
                <com-button
                    plain
                    class="el-button--secret"
                    :disabled="!tableSelection.length"
                    @click.prevent="Delete"
                    icon="el-icon-delete"
                    v-hasPermi="['system:logininfor:remove']"
                >
                    删 除
                </com-button>
                <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:logininfor:export']" />
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #index="scope">
                        {{ scope.$index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                    </template>
                    <template #status="{ row }">
                        {{ selectDictLabel($store.state.dict.sysCommonStatus, row.status) }}
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>
    </div>
</template>

<script>
import { pageLogininfor, removeLogininfor, exportLogininfor } from '@a/system';
import { downloadBlob } from '@u/download';

export default {
    name: 'logininfor',
    data() {
        return {
            // 查询参数
            queryParams: {
                needCount: 1,
                likeIpaddr: '',
                likeUserName: '',
                likeBrowser: '',
                likeOs: '',
                status: '',
                dateRange: [],
            },
            state: {
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
            },
            tableSelection: [],
        };
    },
    created() {
        this.$store.dispatch('GETsysCommonStatus');
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageLogininfor(Object.assign({ pageNum, pageSize }, this.addDateRange(this.queryParams, 'dateRange', 'LoginTime'))).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
            });
        },
        /** 删除按钮操作 */
        Delete() {
            this.$$confirm('此操作将永久删除选中数据, 是否继续?')
                .then(() => {
                    removeLogininfor({ ids: this.tableSelection.map((item) => item.id).join(',') }).then(() => {
                        if (this.tableSelection.length === this.state.list.length) {
                            if (this.$refs.table.lastcurrentPage) {
                                this.$refs.table.reload();
                            } else {
                                this.getList();
                            }
                        } else {
                            this.getList();
                        }
                        this.msgSuccess('删除成功');
                    });
                })
                .catch(() => {
                    this.msgInfo('已取消删除！');
                });
        },
        /** 清空按钮操作 */
        Clean() {
            this.$$confirm('是否确认清空所有操作日志数据项?')
                .then(function () {
                    return cleanLogininfor();
                })
                .then(() => {
                    this.getList();
                    this.msgSuccess('清空成功');
                });
        },
        /** 导出按钮操作 */
        Export() {
            return exportLogininfor(this.addDateRange(this.queryParams, 'dateRange', 'LoginTime')).then((data) => {
                downloadBlob(data, '登录日志.xlsx');
            });
        },
    },
};
</script>

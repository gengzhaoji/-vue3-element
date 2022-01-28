<template>
    <div class="page">
        <div class="top-title">操作日志</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeTitle', label: '系统模块' },
                    { itemType: 'select', prop: 'businessType', label: '类型', list: $store.state.dict.sysOperType },
                    { prop: 'likeOperName', label: '操作人员' },
                    { itemType: 'select', prop: 'status', label: '状态', list: $store.state.dict.sysCommonStatus },
                    {
                        itemType: 'date',
                        prop: 'dateRange',
                        label: '操作时间',
                        type: 'datetimerange',
                        'range-separator': '至',
                        'start-placeholder': '开始日期',
                        'end-placeholder': '结束日期',
                    },
                ]"
                @searchFn="$refs.table.reload()"
                @resetFn="$refs.table.reload()"
            />
        </div>

        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['system:operlog:remove', 'system:operlog:export']">
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click.prevent="Delete" icon="el-icon-delete" v-hasPermi="['system:operlog:remove']">
                    删 除
                </com-button>
                <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:operlog:export']" />
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #index="{ $index }">
                        {{ $index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                    </template>
                    <!-- 表格内容插槽模块 -->
                    <template #status="{ row }">
                        {{ selectDictLabel($store.state.dict.sysCommonStatus, row.status) }}
                    </template>
                    <template #businessType="{ row }">
                        {{ selectDictLabel($store.state.dict.sysOperType, row.businessType) }}
                    </template>
                    <template #default="{ row }">
                        <com-button type="text" class="caozuo" @click.prevent="(open = true), (form = row)"> 详情 </com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>

        <!-- 操作日志详情 -->
        <el-dialog title="操作日志详情" v-model="open" width="700px" append-to-body>
            <el-form ref="form" :model="form" label-width="100px" class="validate--bottom">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="操作模块：">
                            {{ form.title }} /
                            {{ selectDictLabel($store.state.dict.sysOperType, form.businessType) }}
                        </el-form-item>
                        <el-form-item label="登录信息："> {{ form.operName }} / {{ form.operIp }} </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
                        <el-form-item label="请求方式：">
                            {{ form.requestMethod }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="返回参数：">
                            {{ form.jsonResult }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="操作状态：">
                            <div v-if="form.status === 0">正常</div>
                            <div v-else-if="form.status === 1">失败</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="操作时间：">{{ form.operTime }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="异常信息：" v-if="form.status === 1">
                            {{ form.errorMsg }}
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <com-button @click.prevent="open = false">关 闭</com-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { pageOperlog, removeOperlog, exportOperlog } from '@a/system.js';
import { downloadBlob } from '@u/download';

export default {
    name: 'Operlog',
    data() {
        return {
            // 查询参数
            queryParams: {
                likeTitle: '',
                likeOperName: '',
                businessType: '',
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
                        label: '日志编号',
                        prop: 'id',
                    },
                    {
                        label: '系统模块',
                        prop: 'title',
                    },
                    {
                        label: '操作类型',
                        prop: 'businessType',
                    },
                    {
                        label: '请求方式',
                        prop: 'requestMethod',
                    },
                    {
                        label: '操作人员',
                        prop: 'operName',
                    },
                    {
                        label: '主机',
                        prop: 'operIp',
                        'show-overflow-tooltip': true,
                    },
                    {
                        label: '操作状态',
                        prop: 'status',
                    },
                    {
                        label: '操作时间',
                        prop: 'operTime',
                    },
                    {
                        label: '操作',
                        width: '200',
                    },
                ],
            },
            tableSelection: [],
            // 是否显示弹出层
            open: false,
            // 表单参数
            form: {},
        };
    },
    created() {
        this.$store.dispatch('GETsysOperType');
        this.$store.dispatch('GETsysCommonStatus');
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageOperlog(Object.assign({ pageNum, pageSize }, this.addDateRange(this.queryParams, 'dateRange', 'OperTime'))).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
            });
        },
        /** 删除按钮操作 */
        Delete() {
            this.$$confirm('此操作将永久删除选中数据, 是否继续?')
                .then(() => {
                    removeOperlog({ ids: this.tableSelection.map((item) => item.id).join(',') }).then(() => {
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
                    return cleanOperlog();
                })
                .then(() => {
                    this.getList();
                    this.msgSuccess('清空成功');
                });
        },
        /** 导出按钮操作 */
        Export() {
            return exportOperlog(this.addDateRange(this.queryParams, 'dateRange', 'OperTime')).then((data) => {
                downloadBlob(data, '操作日志.xlsx');
            });
        },
    },
};
</script>

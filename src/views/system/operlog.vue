<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeTitle', label: '系统模块' },
                    { itemType: 'select', prop: 'businessType', label: '类型', list: $store.dict.sysOperType },
                    { prop: 'likeOperName', label: '操作人员' },
                    { itemType: 'select', prop: 'status', label: '状态', list: $store.dict.sysCommonStatus },
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
                @searchFn="table.reload()"
                @resetFn="table.reload()"
            />
        </div>

        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['system:operlog:remove', 'system:operlog:export']">
                <my-button-export :load="Export" v-hasPermi="['system:operlog:export']" />
                <my-button type="danger" :disabled="!tableSelection.length" @click.prevent="Delete" icon="Delete" v-hasPermi="['system:operlog:remove']"> 删 除 </my-button>
            </div>
            <my-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <template #default="{ page, size }">
                    <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                        <template #index="{ $index }">
                            {{ $index + 1 + (page - 1) * size }}
                        </template>
                        <!-- 表格内容插槽模块 -->
                        <template #status="{ row }">
                            {{ selectDictLabel($store.dict.sysCommonStatus, row.status) }}
                        </template>
                        <template #businessType="{ row }">
                            {{ selectDictLabel($store.dict.sysOperType, row.businessType) }}
                        </template>
                        <template #default="{ row }">
                            <my-button-text @click.prevent="(open = true), (form = row)"> 详情 </my-button-text>
                        </template>
                    </my-table>
                </template>
            </my-list-panel>
        </div>

        <!-- 操作日志详情 -->
        <el-dialog title="操作日志详情" v-model="open" width="700px" append-to-body>
            <el-form ref="forms" :model="form" label-width="100px" class="validate--bottom">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="操作模块：">
                            {{ form.title }} /
                            {{ selectDictLabel($store.dict.sysOperType, form.businessType) }}
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
                <my-button @click.prevent="open = false">关 闭</my-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Operlog">
import { pageOperlog, removeOperlog, exportOperlog } from '@a/system.js';
import { downloadBlob } from '@u/download';
const $vm = inject('$vm');
// 查询参数
let queryParams = $ref({
        likeTitle: '',
        likeOperName: '',
        businessType: '',
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
                width: '100',
            },
        ],
    }),
    tableSelection = $ref([]),
    // 是否显示弹出层
    open = $ref(false),
    // 表单参数
    form = $ref({});
$vm.$store.dict.GETsysOperType();
$vm.$store.dict.GETsysCommonStatus();

const table = $ref(null);

// 初始化表格查询逻辑
function loadData(pageNum, pageSize) {
    return pageOperlog(Object.assign({ pageNum, pageSize }, $vm.addDateRange(queryParams, 'dateRange', 'OperTime'))).then((res) => {
        state.total = res.data.total;
        state.list = res.data.rows;
    });
}

/** 删除按钮操作 */
function Delete() {
    $vm.$$confirm('此操作将永久删除选中数据, 是否继续?')
        .then(() => {
            removeOperlog({ ids: tableSelection.map((item) => item.id).join(',') }).then(() => {
                if (tableSelection.length === state.list.length) {
                    table?.prevFn?.();
                } else {
                    table.loadData();
                }
                $vm.msgSuccess('删除成功');
            });
        })
        .catch(() => {
            $vm.msgInfo('已取消删除！');
        });
}
/** 导出按钮操作 */
function Export() {
    return exportOperlog($vm.addDateRange(queryParams, 'dateRange', 'OperTime')).then((data) => {
        downloadBlob(data, '操作日志.xlsx');
    });
}
</script>

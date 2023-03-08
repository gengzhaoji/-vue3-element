<template>
    <div class="h100">
        <transition-group name="fade-transform">
            <div class="page" key="1" v-show="showKey === 1">
                <div class="p-10 system-page-background b-r-4">
                    <my-form
                        inline
                        query
                        label-width="70px"
                        :model="queryParams"
                        :formItem="[
                            { prop: 'likeDictName', label: '字典名称' },
                            { prop: 'likeDictType', label: '字典类型' },
                            {
                                itemType: 'select',
                                prop: 'status',
                                label: '状态',
                                list: $store.dict.sysNormalDisable,
                            },
                            {
                                itemType: 'date',
                                prop: 'dateRange',
                                label: '创建时间',
                                type: 'datetimerange',
                                rangeSeparator: '至',
                                startPlaceholder: '开始日期',
                                endPlaceholder: '结束日期',
                            },
                        ]"
                        @searchFn="$refs.table.reload()"
                        @resetFn="$refs.table.reload()"
                    />
                </div>
                <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
                    <div class="p-10" v-hasPermi="['system:dict:add', 'system:dict:remove', 'system:dict:export']">
                        <my-button type="primary" icon="Plus" @click.prevent="Add" v-hasPermi="['system:dict:add']"> 新 增 </my-button>
                        <el-button-group>
                            <my-button-export :load="Export" v-hasPermi="['system:dict:export']" />
                        </el-button-group>
                        <my-button type="danger" :disabled="!tableSelection.length" @click.prevent="Delete" icon="Delete" v-hasPermi="['system:dict:remove']"> 删 除 </my-button>
                    </div>
                    <my-list-panel ref="table" :loadFn="loadData" :total="state.total">
                        <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                            <template #status="{ row }">
                                <el-switch v-model="row.status" inline-prompt :active-value="0" :inactive-value="1" active-text="启" inactive-text="停" @change="statusFn(row)" />
                            </template>
                            <template #default="scope">
                                <my-button-text @click.prevent="UpdateFn(scope.row)" v-hasPermi="['system:dict:edit']">修改</my-button-text>
                                <my-button-text @click.prevent="DetailFn(scope.row)">详情</my-button-text>
                            </template>
                        </my-table>
                    </my-list-panel>
                </div>
                <!-- 添加或修改参数配置对话框 -->
                <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @closed="resetForm(form)">
                    <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom">
                        <el-form-item label="字典名称" prop="dictName">
                            <my-input v-model="dialog.form.dictName" placeholder="请输入字典名称" />
                        </el-form-item>
                        <el-form-item label="字典类型" prop="dictType">
                            <my-input v-model="dialog.form.dictType" :disabled="dialog.type === 'Update'" placeholder="请输入字典类型" />
                        </el-form-item>
                        <el-form-item label="状态" prop="status">
                            <el-radio-group v-model="dialog.form.status">
                                <el-radio v-for="dict in $store.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue * 1">
                                    {{ dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="备注" prop="remark">
                            <my-input v-model="dialog.form.remark" type="textarea" placeholder="请输入内容" />
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <my-button @click.prevent="dialog.open = false">取 消</my-button>
                        <my-button type="primary" @click.prevent="submitForm()">确 定</my-button>
                    </template>
                </el-dialog>
            </div>
            <!-- 修改、详情组件 -->
            <Details key="2" v-if="showKey === 2" @cancel="CancelFn" :routerMage="routerMage" />
        </transition-group>
    </div>
</template>

<script setup name="Dict">
import Details from './data.vue';

import { pageTypedict, addTypedict, removeTypedict, editTypedict, infoTypedict, exportTypedict } from '@/api/system';
import { downloadBlob } from '@u/download';

let queryParams = $ref({
        likeDictName: '',
        likeDictType: '',
        status: '',
        dateRange: [],
        startCreateTime: '',
        endCreateTime: '',
    }),
    state = $ref({
        total: 0,
        list: [],
        columns: [
            {
                type: 'selection',
            },
            {
                label: '字典编号',
                prop: 'id',
                width: 100,
            },
            {
                label: '字典名称',
                prop: 'dictName',
                width: 150,
            },
            {
                label: '字典类型',
                prop: 'dictType',
                width: 160,
            },
            {
                label: '状态',
                prop: 'status',
                width: 100,
            },
            {
                label: '备注',
                prop: 'remark',
                'show-overflow-tooltip': true,
            },
            {
                label: '创建时间',
                prop: 'createTime',
                width: 160,
            },
            {
                label: '操作',
                width: 120,
            },
        ],
    }),
    tableSelection = $ref([]),
    // 弹出层
    dialog = $ref({
        title: '',
        open: false,
        type: '',
        form: {
            id: undefined,
            dictName: '',
            dictType: '',
            status: 0,
            remark: '',
        },
    }),
    showKey = $ref(1),
    routerMage = $ref({});
const $vm = inject('$vm'),
    // 表单校验
    rules = {
        dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
        dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
    },
    table = $ref(null);

// 初始化表格查询逻辑
function loadData(pageNum, pageSize) {
    return pageTypedict(Object.assign({ pageNum, pageSize }, dataFn())).then((res) => {
        state.total = res.data.total;
        state.list = res.data.rows;
    });
}
/**
 * 启用、停用
 */
function statusFn(row) {
    if (row.id) {
        const text = row.status === 0 ? '启用' : '停用';
        $vm.$$confirm(`确认要—${text}（${row.dictName}）字典吗?`)
            .then(() => editTypedict(row))
            .then(() => {
                $vm.msgSuccess(text + '成功');
            })
            .catch(() => {
                row.status = row.status === 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}
/** 新增按钮操作 */
function Add() {
    dialog.type = 'Add';
    dialog.open = true;
    dialog.title = '添加字典类型';
    dialog.form.id = undefined;
}
/** 修改按钮操作 */
function UpdateFn(row) {
    infoTypedict({ id: row.id }).then((res) => {
        dialog.open = true;
        dialog.title = '修改字典类型';
        dialog.type = 'Update';
        nextTick(() => {
            dialog.form = res.data;
        });
    });
}
/** 提交按钮 */
const form = $ref(null);
function submitForm() {
    form.validate((valid) => {
        if (valid) {
            (dialog.form.id != undefined ? editTypedict : addTypedict)(dialog.form).then((res) => {
                $vm.msgSuccess(dialog.form.id != undefined ? '修改成功' : '新增成功');
                dialog.open = false;
                table.loadData();
            });
        }
    });
}
/** 删除按钮操作 */
function Delete() {
    $vm.$$confirm('此操作将永久删除选中数据, 是否继续?')
        .then(() => {
            removeTypedict({ ids: tableSelection.map((item) => item.id).join() }).then(() => {
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
    return exportTypedict(dataFn()).then((data) => {
        downloadBlob(data, '字典管理.xlsx');
    });
}
/**参数处理*/
function dataFn() {
    if (queryParams.dateRange.length) {
        queryParams.startCreateTime = queryParams.dateRange[0];
        queryParams.endCreateTime = queryParams.dateRange[1];
    } else {
        queryParams.startCreateTime = '';
        queryParams.endCreateTime = '';
    }
    const data = $vm.clone(queryParams);
    delete data.dateRange;
    return data;
}
/**字典数据详情 */
function DetailFn(row) {
    showKeyFn(2);
    routerMage = {
        name: 'detail',
        id: row.id,
    };
}
// 详情页关闭函数
function CancelFn(item = false) {
    showKeyFn(1);
    if (item) table.loadData();
}
// 动画
function showKeyFn(item) {
    showKey = null;
    setTimeout(() => {
        showKey = item;
    }, 300);
}

$vm.$store.dict.GETsysNormalDisable();
</script>

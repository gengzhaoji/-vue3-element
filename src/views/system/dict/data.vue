<template>
    <div class="page">
        <el-page-header class="m-b-10" icon="arrow-left" content="字典管理详情" @back="$emit('cancel')" />
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { itemType: 'select', prop: 'dictType', label: '字典名称', list: typeOptions, fileType: { label: 'dictName', value: 'dictType' } },
                    { prop: 'likeDictLabel', label: '字典标签' },
                    {
                        itemType: 'select',
                        prop: 'status',
                        label: '状态',
                        list: $store.dict.sysNormalDisable,
                    },
                ]"
                @searchFn="refTable.reload()"
                @resetFn="
                    queryParams.dictType = dictType;
                    refTable.reload();
                "
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10">
                <my-button type="primary" icon="Plus" @click.prevent="Add"> 新 增 </my-button>
                <my-button type="danger" @click.prevent="Delete" icon="Delete"> 删 除 </my-button>
            </div>
            <my-list-panel ref="refTable" :loadFn="loadData" :total="state.total" :isAuto="false">
                <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #status="{ row }">
                        {{ selectDictLabel($store.dict.sysNormalDisable, row.status) }}
                    </template>
                    <template #default="{ row }">
                        <my-button-text @click.prevent="Update(clone(row))">修改</my-button-text>
                        <my-button-text @click.prevent="Detail(clone(row))">详情</my-button-text>
                    </template>
                </my-table>
            </my-list-panel>
        </div>
        <!-- 添加或修改参数配置对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="500px" append-to-body @close="resetForm(dialogForm)">
            <el-form ref="dialogForm" :model="dialog.form" :rules="rules" label-width="80px" :disabled="dialog.title === '字典数据详情'" class="validate--bottom">
                <el-form-item label="字典类型">
                    <my-input v-model="dialog.form.dictType" disabled />
                </el-form-item>
                <el-form-item label="数据标签" prop="dictLabel">
                    <my-input v-model="dialog.form.dictLabel" placeholder="请输入数据标签" />
                </el-form-item>
                <el-form-item label="数据键值" prop="dictValue">
                    <my-input v-model="dialog.form.dictValue" placeholder="请输入数据键值" />
                </el-form-item>
                <el-form-item label="显示排序" prop="dictSort">
                    <my-input-number v-model="dialog.form.dictSort" :min="0" />
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
                <div class="dialog-footer">
                    <my-button type="primary" @click.prevent="submitForm"> 确 定 </my-button>
                    <my-button @click.prevent="dialog.open = false">取 消</my-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Data">
import { pageDatadict, removeDatadict, addDatadict, editDatadict, infoTypedict, pageTypedict } from '@/api/system';

const props = defineProps({
    routerMage: {
        type: Object,
        default: () => ({}),
    },
});

let typeOptions = $ref([]),
    queryParams = $ref({
        likeDictLabel: '',
        dictType: '',
        status: '',
        orderByColumn: 'dictSort',
        isAsc: 'asc',
    }),
    state = $ref({
        total: 0,
        list: [],
        columns: [
            {
                type: 'selection',
            },
            {
                label: '字典编码',
                prop: 'id',
                width: '100',
            },
            {
                label: '字典标签',
                prop: 'dictLabel',
                'show-overflow-tooltip': true,
            },
            {
                label: '字典键值',
                prop: 'dictValue',
                'show-overflow-tooltip': true,
            },
            {
                label: '字典排序',
                prop: 'dictSort',
            },
            {
                label: '状态',
                prop: 'status',
            },
            {
                label: '备注',
                prop: 'remark',
                'show-overflow-tooltip': true,
            },
            {
                label: '创建时间',
                prop: 'createTime',

                width: '200',
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
        form: {
            id: undefined,
            dictType: '',
            dictLabel: '',
            dictValue: '',
            dictSort: 0,
            status: 0,
            remark: '',
        },
    }),
    // 表单校验
    rules = {
        dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
        dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
        dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
    },
    dictType = $ref(null);
const $vm = inject('$vm'),
    refTable = $ref(null);

infoTypedict({ id: props.routerMage.id }).then((res) => {
    queryParams.dictType = res.data.dictType;
    dictType = res.data.dictType;
    refTable.loadData();
});

// 基础下拉选项数据
pageTypedict().then((res) => {
    typeOptions = res.data.rows;
});

// 初始化表格查询逻辑
function loadData(pageNum, pageSize) {
    return pageDatadict(Object.assign({ pageNum, pageSize }, queryParams)).then((res) => {
        state.total = res.data.total;
        state.list = res.data.rows;
    });
}
/**
 * 新增按钮操作
 * */
function Add() {
    dialog.open = true;
    dialog.title = '添加字典数据';
    dialog.form.dictType = dictType;
    dialog.form.id = undefined;
}
/**
 * 修改按钮操作
 * */
function Update(row) {
    dialog.open = true;
    dialog.title = '修改字典数据';
    nextTick(() => {
        dialog.form = row;
        dialog.form.dictType = dictType;
    });
}
/**
 * 详情按钮操作
 * */
function Detail(row) {
    dialog.open = true;
    dialog.title = '字典数据详情';
    nextTick(() => {
        dialog.form = row;
        dialog.form.dictType = dictType;
    });
}
/**
 * 提交按钮
 * */
const dialogForm = $ref(null);
function submitForm() {
    dialogForm.validate((valid) => {
        if (valid) {
            (dialog.form.id != undefined ? editDatadict : addDatadict)(dialog.form).then((res) => {
                $vm.msgSuccess(dialog.form.id != undefined ? '修改成功' : '新增成功');
                dialog.open = false;
                refTable.loadData();
            });
        }
    });
}
/**
 * 删除按钮操作
 * */
function Delete() {
    $vm.$$confirm('此操作将永久删除选中数据, 是否继续?')
        .then(() => {
            removeDatadict({ ids: tableSelection.map((item) => item.id).join() }).then(() => {
                if (tableSelection.length === state.list.length) {
                    if (refTable.lastcurrentPage) {
                        refTable.reload();
                    } else {
                        refTable.loadData();
                    }
                } else {
                    refTable.loadData();
                }
                $vm.msgSuccess('删除成功');
            });
        })
        .catch(() => {
            $vm.msgInfo('已取消删除！');
        });
}

$vm.$store.dict.GETsysNormalDisable();
</script>

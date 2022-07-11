<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likePostCode', label: '岗位编码' },
                    { prop: 'likePostName', label: '岗位名称' },
                    {
                        itemType: 'select',
                        prop: 'status',
                        label: '状态',
                        list: $store.dict.sysNormalDisable,
                    },
                ]"
                @searchFn="table.reload()"
                @resetFn="table.reload()"
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['system:post:add', 'system:post:remove', 'system:post:export']">
                <my-button type="primary" icon="Plus" @click.prevent="Add" v-hasPermi="['system:post:add']"> 新 增 </my-button>
                <el-button-group> <my-button-export :load="Export" v-hasPermi="['system:post:export']" /> </el-button-group>
                <my-button type="danger" v-show="tableSelection.length" @click.prevent="Delete" icon="Delete" v-hasPermi="['system:post:remove']"> 删 除 </my-button>
            </div>
            <my-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #status="{ row }">
                        <el-switch v-model="row.status" inline-prompt :active-value="0" :inactive-value="1" active-text="启" inactive-text="停" @change="statusFn(row)" />
                    </template>
                    <template #default="{ row }">
                        <my-button-text @click.prevent="Update(clone(row))" v-hasPermi="['system:post:edit']"> 修改 </my-button-text>
                    </template>
                </my-table>
            </my-list-panel>
        </div>

        <!-- 添加或修改岗位对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="500px" append-to-body @close="resetForm(dialogForm)">
            <el-form ref="dialogForm" :model="dialog.form" :rules="rules" label-width="100px" class="validate--bottom">
                <el-form-item label="岗位名称" prop="postName">
                    <my-input v-model="dialog.form.postName" placeholder="请输入岗位名称" />
                </el-form-item>
                <el-form-item label="岗位编码" prop="postCode">
                    <my-input v-model="dialog.form.postCode" placeholder="请输入编码名称" />
                </el-form-item>
                <el-form-item label="岗位顺序" prop="postSort">
                    <my-input-number v-model="dialog.form.postSort" :min="0" />
                </el-form-item>
                <el-form-item label="岗位状态" prop="status">
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
                    <my-button type="primary" @click.prevent="submitForm()"> 确 定 </my-button>
                    <my-button @click.prevent="dialog.open = false">取 消</my-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Post">
import { pagePost, removePost, addPost, editPost, infoPost, exportPost } from '@/api/system';
import { downloadBlob } from '@u/download';

// 查询参数
let queryParams = $ref({
        likePostCode: '',
        likePostName: '',
        status: '',
        orderByColumn: 'postSort',
        isAsc: '',
    }),
    state = $ref({
        total: 0,
        list: [],
        columns: [
            {
                type: 'selection',
            },
            {
                label: '岗位编号',
                width: '100',
                prop: 'id',
            },
            {
                label: '岗位编码',
                prop: 'postCode',
            },
            {
                label: '岗位名称',
                prop: 'postName',
            },
            {
                label: '岗位排序',
                prop: 'postSort',
            },
            {
                label: '状态',
                prop: 'status',
            },
            {
                label: '创建时间',
                prop: 'createTime',
            },
            {
                label: '备注',
                prop: 'remark',
            },
            {
                label: '操作',
                width: '100',
            },
        ],
    }),
    tableSelection = $ref([]),
    // 弹出层
    dialog = $ref({
        title: '',
        open: false,
        form: {
            postId: undefined,
            postName: '',
            postCode: '',
            postSort: 0,
            status: '',
            remark: '',
        },
    });

const $vm = inject('$vm'),
    // 表单校验
    rules = {
        postName: [{ required: true, message: '岗位名称不能为空', trigger: 'change' }],
        postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'change' }],
        postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'change' }],
        status: [{ required: true, message: '岗位状态不能为空', trigger: 'change' }],
    },
    table = $ref(null),
    dialogForm = $ref(null);
// 初始化表格查询逻辑
function loadData(pageNum, pageSize) {
    return pagePost(Object.assign({ pageNum, pageSize }, queryParams)).then((res) => {
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
        $vm.$$confirm(`确认要—${text}（${row.postName}）岗位吗?`)
            .then(() => editPost(row))
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
    dialog.open = true;
    dialog.title = '添加岗位';
    dialog.form.id = undefined;
}
/** 修改按钮操作 */
function Update(row) {
    infoPost({ id: row.id }).then((res) => {
        dialog.open = true;
        dialog.title = '修改岗位';
        nextTick(() => {
            dialog.form = res.data;
        });
    });
}
/** 提交按钮 */
function submitForm() {
    dialogForm.validate((valid) => {
        if (valid) {
            (dialog.form.id !== undefined ? editPost : addPost)(dialog.form).then(() => {
                $vm.msgSuccess(dialog.form.id !== undefined ? '修改成功' : '新增成功');
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
            removePost({ ids: tableSelection.map((item) => item.id).join() }).then(() => {
                if (tableSelection.length === state.list.length) {
                    if (table.lastcurrentPage) {
                        table.reload();
                    } else {
                        table.loadData();
                    }
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
    return exportPost(queryParams).then((data) => {
        downloadBlob(data, '岗位管理.xlsx');
    });
}
$vm.$store.dict.GETsysNormalDisable();
</script>

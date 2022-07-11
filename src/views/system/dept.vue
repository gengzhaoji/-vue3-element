<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeDeptName', label: '部门名称' },
                    {
                        itemType: 'select',
                        prop: 'status',
                        label: '状态',
                        list: $store.dict.sysNormalDisable,
                    },
                ]"
                @searchFn="getList()"
                @resetFn="getList()"
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['system:dep:add']">
                <my-button type="primary" icon="Plus" @click.prevent="Add" v-hasPermi="['system:dep:add']"> 新 增 </my-button>
            </div>
            <div class="f1 h0 flex-col">
                <my-table
                    :data="state.list"
                    :columns="state.columns"
                    row-key="id"
                    lazy
                    :load="(tree, treeNode, resolve) => resolve(tree.children)"
                    :expand-row-keys="expandRowkeys"
                    @expand-change="expandChangeFn"
                >
                    <template #status="{ row }">
                        <el-switch v-model="row.status" inline-prompt :active-value="0" :inactive-value="1" active-text="启" inactive-text="停" @change="statusFn(row)" />
                    </template>
                    <template #default="{ row }">
                        <my-button-text @click="Update(row)" v-hasPermi="['system:dep:edit']"> 修改 </my-button-text>
                        <my-button-text @click="Add(row)" v-hasPermi="['system:dep:add']"> 新增 </my-button-text>
                        <my-button-text @click="Delete(row)" v-hasPermi="['system:dep:remove']" v-if="!row.children.length"> 删除 </my-button-text>
                    </template>
                </my-table>
            </div>
        </div>
        <!-- 添加或修改部门对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @close="resetForm(dialogForm)">
            <el-form ref="dialogForm" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom">
                <el-row>
                    <el-col :span="24" v-if="dialog.form.parentId !== '0'">
                        <el-form-item label="上级部门" prop="parentId">
                            <my-cascader
                                v-model="dialog.form.parentId"
                                :list="deptOptions"
                                :props="{
                                    expandTrigger: 'hover',
                                    value: 'id',
                                    label: 'deptName',
                                    emitPath: false,
                                    checkStrictly: true,
                                }"
                                placeholder="选择上级部门"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门名称" prop="deptName">
                            <my-input v-model="dialog.form.deptName" placeholder="请输入部门名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示排序" prop="orderNum">
                            <my-input-number v-model="dialog.form.orderNum" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="负责人" prop="leader">
                            <my-input v-model="dialog.form.leader" placeholder="请输入负责人" maxlength="20" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="联系电话" prop="phone">
                            <my-input v-model="dialog.form.phone" placeholder="请输入联系电话" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <my-input v-model="dialog.form.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门状态" prop="status">
                            <el-radio-group v-model="dialog.form.status">
                                <el-radio v-for="dict in $store.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue * 1">
                                    {{ dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <my-button type="primary" @click="submitForm()"> 确 定 </my-button>
                    <my-button @click="dialog.open = false">取 消</my-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="dept">
import { addDept, removeDept, editDept, infoDept, pageDept } from '@/api/system';
let deptOptions = $ref([]),
    // 查询参数
    queryParams = $ref({
        likeDeptName: '',
        status: '',
    }),
    state = $ref({
        list: [],
        columns: [
            {
                label: '部门名称',
                prop: 'deptName',
            },
            {
                label: '排序',
                prop: 'orderNum',
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
                label: '操作',
                width: '200',
            },
        ],
    }),
    // 弹出层
    dialog = $ref({
        title: '',
        open: false,
        form: {
            id: '',
            parentId: '0',
            deptName: '',
            orderNum: 0,
            leader: '',
            phone: '',
            email: '',
            status: 0,
        },
    }),
    // 表单校验
    rules = {
        parentId: [
            {
                required: true,
                message: '上级部门不能为空',
                trigger: 'change',
            },
        ],
        deptName: [
            {
                required: true,
                message: '部门名称不能为空',
                trigger: ['blur', 'change'],
            },
        ],
        orderNum: [
            {
                required: true,
                message: '菜单顺序不能为空',
                trigger: 'change',
            },
        ],
        email: [
            {
                type: 'email',
                message: "'请输入正确的邮箱地址",
                trigger: 'change',
            },
        ],
        phone: [
            {
                pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                message: '请输入正确的手机号码',
                trigger: 'change',
            },
        ],
    };
const $vm = inject('$vm');

// 树形表格展开问题
let expandRowkeys = $ref([]);
function expandChangeFn(row, expanded) {
    if (expanded) {
        expandRowkeys.push(row.id);
    } else {
        expandRowkeys.splice(expandRowkeys.indexOf(row.id), 1);
    }
}

/** 查询部门列表 */
function getList() {
    pageDept(queryParams).then((res) => {
        state.list = res.data.rows;
        $vm.$store.com.deptTree = [];
    });
}
/**
 * 启用、停用
 */
function statusFn(row) {
    if (row.id) {
        const text = row.status === 0 ? '启用' : '停用';
        $vm.$$confirm(`确认要—${text}（${row.deptName}）部门吗?`)
            .then(() => editDept(row))
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
function Add(row) {
    if (row != undefined) dialog.form.parentId = row.id;
    dialog.open = true;
    dialog.form.id = undefined;
    dialog.title = '添加部门';
    pageDept().then((res) => {
        deptOptions = res.data.rows;
    });
}
/** 修改按钮操作 */
function Update(row) {
    infoDept({ id: row.id }).then((res) => {
        dialog.open = true;
        dialog.title = '修改部门';
        nextTick(() => {
            dialog.form = res.data;
        });
    });
    pageDept().then((res) => {
        deptOptions = res.data.rows;
    });
}
const dialogForm = $ref(null);
/** 提交按钮 */
function submitForm() {
    dialogForm.validate((valid) => {
        if (valid) {
            (dialog.title === '修改部门' ? editDept : addDept)(dialog.form).then((res) => {
                $vm.msgSuccess(dialog.title === '修改部门' ? '修改成功' : '新增成功');
                dialog.open = false;
                getList();
            });
        }
    });
}
/** 删除按钮操作 */
function Delete(row) {
    $vm.$$confirm('是否确认删除名称为"' + row.deptName + '"的数据项?')
        .then(() => removeDept({ ids: row.id }))
        .then(() => {
            getList();
            $vm.msgSuccess('删除成功');
        });
}
getList();
$vm.$store.dict.GETsysNormalDisable();
</script>

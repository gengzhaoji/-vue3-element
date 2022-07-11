<template>
    <div class="page" style="flex-direction: row">
        <div class="left system-page-background b-r-4">
            <div class="p-10" style="border-bottom: 1px solid var(--el-border-color)">
                <my-input placeholder="请输入部门名称" v-model="deptName">
                    <template #append>
                        <my-button icon="Search" @click.prevent="(deptName = queryParams.deptId = ''), refTree.setCurrentKey(null), refTable.reload()" />
                    </template>
                </my-input>
            </div>
            <div class="f1 h0">
                <el-tree
                    :data="$store.com.deptTree"
                    :props="defaultProps"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    highlight-current
                    node-key="id"
                    ref="refTree"
                    default-expand-all
                    @node-click="handleNodeClick"
                />
            </div>
        </div>
        <div class="right system-page-background b-r-4">
            <div class="p-10">
                <my-form
                    inline
                    query
                    label-width="70px"
                    :model="queryParams"
                    :formItem="[
                        {
                            prop: 'likeNickName',
                            label: '姓名',
                            placeholder: '请输入姓名',
                        },
                        {
                            prop: 'likePhonenumber',
                            label: '手机号码',
                            placeholder: '请输入手机号码',
                        },
                        {
                            itemType: 'select',
                            prop: 'status',
                            label: '状态',
                            type: 'GETsysNormalDisable',
                        },
                    ]"
                    @searchFn="refTable.reload()"
                    @resetFn="refTable.reload()"
                />
                <div class="m-t-10" v-hasPermi="['system:user:add', 'system:user:remove', 'system:user:export']">
                    <my-button type="primary" @click="insertFn" icon="Plus" v-hasPermi="['system:user:add']">新 增</my-button>
                    <el-button-group>
                        <my-button-export :load="Export" v-hasPermi="['system:user:export']" />
                    </el-button-group>
                    <my-button type="danger" v-show="tableSelection.length" @click="deleteFn(tableSelection)" icon="Delete" v-hasPermi="['system:user:remove']"> 删 除 </my-button>
                </div>
            </div>

            <my-list-panel ref="refTable" :loadFn="loadData" :total="state.total">
                <template #default="{ page, size }">
                    <my-table :data="state.list" :columns="state.columns" :initColumns="state.columns" @selection-change="(val) => (tableSelection = val)">
                        <template #index="{ $index }">
                            {{ $index + 1 + (page - 1) * size }}
                        </template>
                        <template #sex="{ row }">
                            {{ selectDictLabel($store.dict.sysUserSex, row.sex) }}
                        </template>
                        <template #status="{ row }">
                            <el-switch
                                v-model="row.status"
                                inline-prompt
                                :active-value="0"
                                :inactive-value="1"
                                active-text="启"
                                inactive-text="停"
                                @change="handleStatusChange(row)"
                            />
                        </template>
                        <template #default="{ row }">
                            <my-button-text @click="handleUpdate(row)" v-hasPermi="['system:user:edit']"> 修改 </my-button-text>
                            <my-button-text @click="handleResetPwd(row)" v-hasPermi="['system:user:resetPwd']"> 重置 </my-button-text>
                            <my-button-text @click="deleteFn(row)" v-hasPermi="['secrecy:user:remove']">删除</my-button-text>
                        </template>
                    </my-table>
                </template>
            </my-list-panel>
        </div>
        <!-- 添加或修改参数配置对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @close="resetForm(refDialogFrom)">
            <my-form
                ref="refDialogFrom"
                :model="dialogForm"
                :rules="rules"
                label-width="80px"
                class="validate--bottom"
                row
                :formItem="[
                    { prop: 'nickName', label: '姓名', required: true, col },
                    {
                        prop: 'deptId',
                        label: '归属部门',
                        itemType: 'cascader',
                        type: 'GETdeptTree',
                        props: {
                            expandTrigger: 'hover',
                            value: 'id',
                            label: 'deptName',
                            emitPath: false,
                            checkStrictly: true,
                        },
                        required: true,
                        col,
                    },
                    { prop: 'userName', label: '登录名', show: dialog.title === '添加用户', required: true, col },
                    { prop: 'password', label: '用户密码', show: dialog.title === '添加用户', showPassword: true, col },
                    { prop: 'phonenumber', label: '手机号码', maxlength: 11, col },
                    { prop: 'email', label: '邮箱', maxlength: 50, col },
                    {
                        prop: 'roleIds',
                        label: '角色',
                        itemType: 'select',
                        list: roleOptions,
                        fileType: { label: 'roleName', value: 'id' },
                        multiple: true,
                        required: true,
                        col,
                    },
                    { prop: 'postIds', label: '岗位', itemType: 'select', list: postOptions, fileType: { label: 'postName', value: 'id' }, multiple: true, col },
                    { prop: 'status', label: '状态', col },
                    { prop: 'remark', label: '备注', type: 'textarea', col: { span: 24 } },
                ]"
            >
                <template #status="{ model, prop }">
                    <el-radio-group v-model="model[prop]">
                        <el-radio v-for="dict in $store.dict.sysNormalDisable" :key="dict.dictValue * 1" :label="dict.dictValue * 1">
                            {{ dict.dictLabel }}
                        </el-radio>
                    </el-radio-group>
                </template>
            </my-form>
            <template #footer>
                <div class="dialog-footer">
                    <my-button type="primary" @click.prevent="submitForm"> 确 定 </my-button>
                    <my-button @click.prevent="dialog.open = false">取 消</my-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="user">
import { ElMessageBox } from 'element-plus';
import mixin from '@u/mixin';
import { MOBILE_PHONE } from '@u/regex';
import { pageUser as page, removeUser as remove, addUser, editUser, infoUser, exportUser } from '@/api/system';
import { getRole, getPost, restPassword, userChangeStatus } from '@/api/public';
import { downloadBlob } from '@u/download';

const col = { span: 12 };

let deptName = $ref(''),
    defaultProps = {
        children: 'children',
        label: 'deptName',
    },
    queryParams = $ref({
        deptId: '',
        likeNickName: '',
        likePhonenumber: '',
        status: '',
        orderByColumn: '',
        isAsc: '',
    }),
    value = $ref('100'),
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
                label: '登录名',
                prop: 'userName',
            },
            {
                label: '姓名',
                prop: 'nickName',
            },
            {
                label: '部门',
                prop: 'deptName',
            },
            {
                label: '手机号码',
                prop: 'phonenumber',
            },
            {
                label: '邮箱',
                prop: 'email',
            },
            {
                label: '性别',
                prop: 'sex',
                width: 70,
            },
            {
                label: '状态',
                prop: 'status',
                width: 70,
            },
            {
                label: '操作',
                width: 180,
            },
        ],
    }),
    // 弹出层
    dialog = $ref({
        title: '',
        open: false,
    }),
    dialogForm = $ref({
        id: '',
        userId: undefined,
        deptId: '',
        userName: '',
        nickName: '',
        password: '',
        phonenumber: '',
        email: '',
        sex: '',
        status: 0,
        remark: '',
        postIds: [],
        roleIds: [],
    }),
    // 表单校验
    rules = {
        password: [
            { required: true, message: '请输入用户密码', trigger: 'change' },
            {
                min: 6,
                max: 20,
                message: '长度在 6 到 20 个字符',
                trigger: 'change',
            },
        ],
        email: [
            {
                type: 'email',
                message: '请输入正确的邮箱地址',
                trigger: 'change',
            },
        ],
        phonenumber: [
            {
                pattern: MOBILE_PHONE,
                message: '请输入正确的手机号码',
                trigger: 'change',
            },
        ],
    },
    // 岗位选项
    postOptions = $ref([]),
    // 角色选项
    roleOptions = $ref([]),
    // 关联人员信息
    workerList = $ref([]);

const refTable = $ref(null);
let tableSelection = $ref([]);

const { $vm, getList, loadData, deleteFn } = mixin({ queryParams, state, api: { page, remove }, refTable: () => refTable });

// watch 根据名称筛选部门树
const refTree = $ref(null);
watch(
    () => deptName,
    (val) => refTree.filter(val)
);
// 初始化执行逻辑
$vm.$store.com.GETdeptTree();
$vm.$store.dict.GETsysUserSex();
if (useRoute()?.params?.type === 'insert') insertFn();

// 筛选节点
function filterNode(value, data) {
    if (!value) return true;
    return data.deptName.indexOf(value) !== -1;
}
// 节点单击事件
function handleNodeClick(data) {
    queryParams.deptId = data.id;
    refTable.reload();
}
// 用户状态修改
function handleStatusChange(row) {
    if (row.id) {
        const text = row.status === 0 ? '启用' : '停用';
        $vm.$$confirm(`确认要—${text}（${row.userName}）用户吗?`)
            .then(() => userChangeStatus({ id: row.id, status: row.status }))
            .then(() => {
                $vm.msgSuccess(text + '成功');
            })
            .catch(function () {
                row.status = row.status === 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}
/** 新增按钮操作 */
function insertFn() {
    /**
     * 重置dialogForm数据
     */
    dialog.open = true;
    dialog.title = '添加用户';
    dialogForm.id = undefined;
    dialogForm.deptId = queryParams.deptId;
    Promise.all([
        getPost().then((res) => {
            postOptions = res.data;
        }),
        getRole().then((res) => {
            roleOptions = res.data.filter((item) => item.id !== 100 && item.roleName !== '超级管理员');
        }),
    ]);
}
const refDialogFrom = $ref(null);
/** 修改按钮操作 */
function handleUpdate(row) {
    Promise.all([getPost(), getRole(), infoUser({ id: row.id })]).then((res) => {
        dialog.open = true;
        dialog.title = '修改用户';
        nextTick(() => {
            postOptions = res[0].data;
            roleOptions = res[1].data.filter((item) => item.id !== 100 && item.roleName !== '超级管理员');
            dialogForm = res[2].data;
            dialogForm.oldUserId = row.id;
        });
    });
}
/** 重置密码按钮操作 */
function handleResetPwd(row) {
    ElMessageBox.prompt('请输入"' + row.userName + '"的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
    }).then(({ value }) => {
        restPassword({ id: row.id, password: value, changePwd: 1 }).then((res) => {
            $vm.msgSuccess('修改成功!');
        });
    });
}
/** 提交按钮 */
function submitForm() {
    refDialogFrom.$refs.refMyForm.validate((valid) => {
        if (valid) {
            const data = dialog.title === '修改用户';
            (data ? editUser : addUser)(dialogForm).then((res) => {
                $vm.msgSuccess(`${data ? '修改' : '新增'}成功!`);
                dialog.open = false;
                getList();
            });
        }
    });
}
/** 导出按钮操作 */
function Export() {
    return exportUser(queryParams).then((data) => {
        downloadBlob(data, '用户管理.xlsx');
    });
}
</script>

<style scoped lang="scss">
.left {
    height: 100%;
    width: 20%;
    min-width: 350px;
    overflow: auto;
    display: flex;
    flex-direction: column;
}
.right {
    margin-left: 10px;
    height: 100%;
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    width: 0;
}
.rightAdd {
    cursor: pointer;
    color: var(--el-color-primary);
    transition: all 0.3s;
    &:hover {
        margin-right: -10px;
    }
}
</style>

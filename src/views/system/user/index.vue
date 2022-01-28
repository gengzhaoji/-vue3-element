<template>
    <div class="page">
        <div class="top-title">用户管理</div>
        <div class="first">
            <div class="left system-page-background b-r-4">
                <div class="p-10" style="border-bottom: 1px solid #dcdfe6">
                    <com-input placeholder="请输入部门名称" v-model="deptName">
                        <template #append>
                            <com-button
                                icon="el-icon-search"
                                @click.prevent="(deptName = ''), (queryParams.deptId = ''), $refs.tree.setCurrentKey(null), $refs.table.reload()"
                            ></com-button>
                        </template>
                    </com-input>
                </div>
                <div class="f1 h0">
                    <el-tree
                        :data="$store.state.com.deptTree"
                        :props="defaultProps"
                        :expand-on-click-node="false"
                        :filter-node-method="filterNode"
                        highlight-current
                        node-key="id"
                        ref="tree"
                        default-expand-all
                        @node-click="handleNodeClick"
                    />
                </div>
            </div>
            <div class="right system-page-background b-r-4">
                <div class="p-10">
                    <com-form
                        inline
                        query
                        label-width="70px"
                        :model="queryParams"
                        :formItem="[
                            {
                                prop: 'likeUserName',
                                label: '姓名',
                                placeholder: '请输入登录名/姓名',
                            },
                            {
                                prop: 'likePhonenumber',
                                label: '手机号码',
                                placeholder: '请输入手机号码/姓名',
                            },
                            {
                                itemType: 'select',
                                prop: 'status',
                                label: '状态',
                                list: $store.state.dict.sysNormalDisable,
                            },
                        ]"
                        @searchFn="$refs.table.reload()"
                        @resetFn="$refs.table.reload()"
                    />
                    <div class="m-t-10" v-hasPermi="['system:user:add', 'system:user:remove', 'system:user:export']">
                        <com-button plain class="el-button--secret" @click.prevent="insertFn" icon="el-icon-plus" v-hasPermi="['system:user:add']"> 新增 </com-button>
                        <com-button
                            plain
                            class="el-button--secret"
                            :disabled="!tableSelection.length"
                            @click.prevent="deleteFn"
                            icon="el-icon-delete"
                            v-hasPermi="['system:user:remove']"
                        >
                            删 除
                        </com-button>
                        <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:user:export']" />
                    </div>
                </div>

                <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                    <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                        <template #index="scope">
                            {{ scope.$index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                        </template>
                        <template #sex="{ row }">
                            {{ selectDictLabel($store.state.dict.sysUserSex, row.sex) }}
                        </template>
                        <template #status="{ row }">
                            <el-switch v-model="row.status" :active-value="0" :inactive-value="1" @change="handleStatusChange(row)" />
                        </template>
                        <template #default="{ row }">
                            <com-button type="text" class="caozuo" @click.prevent="handleUpdate(row)" v-hasPermi="['system:user:edit']"> 修改 </com-button>
                            <com-button type="text" class="caozuo" @click.prevent="handleResetPwd(row)" v-hasPermi="['system:user:resetPwd']"> 重置 </com-button>
                        </template>
                    </xdh-table>
                </xdh-list-panel>
            </div>

            <!-- 添加或修改参数配置对话框 -->
            <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body>
                <el-form ref="dialogForm" :model="dialogForm" :rules="rules" label-width="80px" class="validate--bottom">
                    <!-- <el-row>
                    <el-col :span="12">
                        <el-form-item label="姓名" prop="nickName">
                            <com-input v-model="dialogForm.nickName" placeholder="请输入姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="归属部门" prop="deptId">
                            <com-cascader
                                v-model="dialogForm.deptId"
                                type="GETdeptTree"
                                :props="{
                                    expandTrigger: 'hover',
                                    value: 'id',
                                    label: 'deptName',
                                    emitPath: false,
                                    checkStrictly: true,
                                }"
                                placeholder="请选择归属部门"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="手机号码" prop="phonenumber">
                            <com-input v-model="dialogForm.phonenumber" placeholder="请输入手机号码" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <com-input v-model="dialogForm.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                    </el-col>
                </el-row> -->
                    <el-row>
                        <el-col :span="12">
                            <el-form-item v-if="dialog.title === '添加用户'" label="登录名" prop="userName">
                                <com-input autocomplete="off" v-model="dialogForm.userName" placeholder="请输入登录名" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item v-if="dialog.title === '添加用户'" label="用户密码" prop="password">
                                <com-input autocomplete="off" v-model="dialogForm.password" placeholder="请输入用户密码" show-password />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <!-- <el-col :span="12">
                        <el-form-item label="用户性别" prop="sex">
                            <com-select v-model="dialogForm.sex" placeholder="请选择性别" :list="$store.state.dict.sysUserSex" :needAll="false" />
                        </el-form-item>
                    </el-col> -->
                        <el-col :span="12">
                            <el-form-item label="角色" prop="roleIds">
                                <com-select v-model="dialogForm.roleIds" multiple placeholder="请选择角色">
                                    <el-option v-for="item in roleOptions" :key="item.id" :label="item.roleName" :value="item.id" :disabled="item.status == 1"></el-option>
                                </com-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="状态" prop="status">
                                <el-radio-group v-model="dialogForm.status">
                                    <el-radio v-for="dict in $store.state.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue">
                                        {{ dict.dictLabel }}
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- <el-row>
                    <el-col :span="12">
                        <el-form-item label="岗位" prop="postIds">
                            <com-select v-model="dialogForm.postIds" multiple placeholder="请选择岗位">
                                <el-option v-for="item in postOptions" :key="item.id" :label="item.postName" :value="item.id" :disabled="item.status == 1"></el-option>
                            </com-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="角色" prop="roleIds">
                            <com-select v-model="dialogForm.roleIds" multiple placeholder="请选择角色">
                                <el-option v-for="item in roleOptions" :key="item.id" :label="item.roleName" :value="item.id" :disabled="item.status == 1"></el-option>
                            </com-select>
                        </el-form-item>
                    </el-col>
                </el-row> -->
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="备注" prop="remark">
                                <com-input v-model="dialogForm.remark" type="textarea" placeholder="请输入备注" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider></el-divider>
                    <el-row type="flex" justify="space-between" class="m-b-20">
                        <span class="el-dialog__title" style="font-weight: 600">关联人员信息</span>
                        <span class="fr rightAdd" @click="$router.push({ name: 'information', params: { type: 'insert' } })">去新增人员<i class="el-icon-arrow-right" /></span>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="姓名" prop="id">
                                <com-select :list="workerList" v-model="dialogForm.id" placeholder="请选择姓名" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="员工编号" prop="id">
                                <com-select :list="workerList" :fileType="{ label: 'jobNumber', value: 'dictValue' }" v-model="dialogForm.id" placeholder="请选择员工编号" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="性别" prop="sex">
                                <com-select disabled type="GETsysUserSex" v-model="dialogForm.sex" placeholder="请选择性别" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="所属部门" prop="deptId">
                                <com-cascader
                                    disabled
                                    type="GETdeptTree"
                                    :props="{ expandTrigger: 'hover', value: 'id', label: 'deptName', emitPath: false, checkStrictly: true }"
                                    v-model="dialogForm.deptId"
                                    placeholder="请选择所属部门"
                                />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <com-button type="primary" @click.prevent="submitForm"> 确 定 </com-button>
                        <com-button @click.prevent="cancel">取 消</com-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import { pageUser, removeUser, addUser, editUser, infoUser, exportUser } from '@/api/system';
import { getRole, getPost, restPassword, userChangeStatus } from '@/api/public';
import { relationSelGradeWorkerWorkerSecrecy } from '@/api/personnel';
import { downloadBlob } from '@u/download';

export default {
    name: 'User',
    data() {
        return {
            deptName: '',
            defaultProps: {
                children: 'children',
                label: 'deptName',
            },
            queryParams: {
                deptId: '',
                likeUserName: '',
                likePhonenumber: '',
                status: '',
                orderByColumn: '',
                isAsc: '',
            },
            value: '100',
            exportLoad: false,
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
                        label: '登录名',
                        prop: 'userName',
                    },
                    {
                        label: '姓名',
                        prop: 'nickName',
                    },
                    {
                        label: '性别',
                        prop: 'sex',
                    },
                    {
                        label: '部门',
                        prop: 'deptName',
                    },
                    {
                        label: '手机号码',
                        prop: 'phonenumber',
                    },
                    // {
                    //     label: '邮箱',
                    //     prop: 'email',
                    // },
                    {
                        label: '状态',
                        prop: 'status',
                        width: 100,
                    },
                    {
                        label: '操作',
                        width: 100,
                    },
                ],
            },
            tableSelection: [],
            // 弹出层
            dialog: {
                title: '',
                open: false,
            },
            dialogForm: {
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
            },
            // 表单校验
            rules: {
                id: [{ required: true, message: '请选择姓名', trigger: 'change' }],
                // deptId: [{ required: true, message: '请选择归属部门', trigger: 'change' }],
                userName: [{ required: true, message: '请输入登录名', trigger: 'change' }],
                // nickName: [{ required: true, message: '请输入姓名', trigger: 'change' }],
                password: [
                    { required: true, message: '请输入用户密码', trigger: 'change' },
                    {
                        min: 6,
                        max: 20,
                        message: '长度在 6 到 20 个字符',
                        trigger: 'change',
                    },
                ],
                // email: [
                //     {
                //         type: 'email',
                //         message: "'请输入正确的邮箱地址",
                //         trigger: ['change', 'change'],
                //     },
                // ],
                // phonenumber: [
                //     {
                //         pattern: MOBILE_PHONE,
                //         message: '请输入正确的手机号码',
                //         trigger: 'change',
                //     },
                // ],
                roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
            },
            // 岗位选项
            postOptions: [],
            // 角色选项
            roleOptions: [],
            // 关联人员信息
            workerList: [],
        };
    },
    watch: {
        // 根据名称筛选部门树
        deptName(val) {
            this.$refs.tree.filter(val);
        },
        //
        'dialogForm.id'(val) {
            const data = this.workerList.find((item) => item.dictValue === val);
            this.dialogForm.sex = data?.sex;
            this.dialogForm.deptId = data?.deptId;
            this.dialogForm.nickName = data?.dictLabel;
        },
    },
    created() {
        this.$store.dispatch('GETdeptTree');
        this.$store.dispatch('GETsysUserSex');
        this.$store.dispatch('GETsysNormalDisable');
        if (this.$route?.params?.type === 'insert') this.insertFn();
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageUser(Object.assign({ pageNum, pageSize }, this.queryParams)).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
                this.$store.commit('SETuseList', []);
            });
        },
        // 筛选节点
        filterNode(value, data) {
            if (!value) return true;
            return data.deptName.indexOf(value) !== -1;
        },
        // 节点单击事件
        handleNodeClick(data) {
            this.queryParams.deptId = data.id;
            this.$refs.table.reload();
        },
        // 用户状态修改
        handleStatusChange(row) {
            if (row.id) {
                const text = row.status === 0 ? '启用' : '停用';
                this.$$confirm('确认要"' + text + '""' + row.userName + '"用户吗?')
                    .then(function () {
                        return userChangeStatus({ id: row.id, status: row.status });
                    })
                    .then(() => {
                        this.msgSuccess(text + '成功');
                    })
                    .catch(function () {
                        row.status = row.status === 0 ? 1 : 0;
                    });
            }
        },
        // 取消按钮
        cancel() {
            this.dialog.open = false;
        },
        /** 新增按钮操作 */
        insertFn() {
            /**
             * 重置dialogForm数据
             */
            this.dialogForm = this.$options.data().dialogForm;
            this.dialog.open = true;
            this.dialog.title = '添加用户';
            Promise.all([
                getPost().then((res) => {
                    this.postOptions = res.data;
                }),
                getRole().then((res) => {
                    this.roleOptions = res.data.filter((item) => item.id !== 100 && item.roleName !== '超级管理员');
                }),
                this.relationSelGradeWorkerWorkerSecrecy({ operationType: 0 }),
            ]);
        },
        relationSelGradeWorkerWorkerSecrecy(data) {
            relationSelGradeWorkerWorkerSecrecy(data).then((res) => {
                this.workerList = res.data.map((item) => ({
                    dictLabel: item.sysWorkerInfoVo?.name,
                    dictValue: item.sysWorkerInfoVo?.id,
                    deptId: item.sysWorkerInfoVo?.deptId || item.sysWorkerInfoVo?.deptList[0]?.id,
                    idCode: item.sysWorkerInfoVo?.idCode,
                    jobNumber: item.sysWorkerInfoVo?.jobNumber,
                    phone: item.sysWorkerInfoVo?.phone,
                    sex: item.sysWorkerInfoVo?.sex,
                }));
            });
        },
        /** 修改按钮操作 */
        handleUpdate(row) {
            this.resetForm('dialogForm');
            Promise.all([getPost(), getRole(), infoUser({ id: row.id }), this.relationSelGradeWorkerWorkerSecrecy({ operationType: 1, oldUserId: row.id })]).then((res) => {
                this.postOptions = res[0].data;
                this.roleOptions = res[1].data.filter((item) => item.id !== 100 && item.roleName !== '超级管理员');
                this.dialogForm = res[2].data;
                this.dialogForm.oldUserId = row.id;
                this.dialog.open = true;
                this.dialog.title = '修改用户';
            });
        },
        /** 重置密码按钮操作 */
        handleResetPwd(row) {
            this.$prompt('请输入"' + row.userName + '"的新密码', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                restPassword({ id: row.id, password: value, changePwd: 1 }).then((res) => {
                    this.msgSuccess('修改成功!');
                });
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['dialogForm'].validate((valid) => {
                if (valid) {
                    if (this.dialog.title === '修改用户') {
                        editUser(this.dialogForm).then((res) => {
                            this.msgSuccess('修改成功!');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addUser(this.dialogForm).then((res) => {
                            this.msgSuccess('新增成功!');
                            this.cancel();
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        deleteFn() {
            if (this.tableSelection.length === 0) {
                this.msgInfo('请选择需要删除的数据!');
            } else {
                this.$$confirm('此操作将删除选中数据, 是否继续?')
                    .then(() => {
                        removeUser({
                            ids: this.tableSelection.map((item) => item.id).join(),
                        }).then(() => {
                            if (this.tableSelection.length === this.state.list.length) {
                                if (this.$refs.table.lastcurrentPage) {
                                    this.$refs.table.reload();
                                } else {
                                    this.getList();
                                }
                            } else {
                                this.getList();
                            }
                            this.msgSuccess('删除成功!');
                        });
                    })
                    .catch(() => {
                        this.msgInfo('已取消删除!');
                    });
            }
        },
        /** 导出按钮操作 */
        Export() {
            return exportUser(this.queryParams).then((data) => {
                downloadBlob(data, '用户管理.xlsx');
            });
        },
    },
};
</script>

<style scoped lang="scss">
.first {
    display: flex;
    height: 100%;
    background-color: var(--system-container-background);
    box-sizing: border-box;
    .left {
        height: 100%;
        width: 20%;
        min-width: 350px;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }
    .right {
        margin-left: 15px;
        height: 100%;
        flex: 1 0 auto;
        overflow: auto;
        display: flex;
        flex-direction: column;
        width: 0;
    }
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

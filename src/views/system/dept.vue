<template>
    <div class="page">
        <div class="top-title">部门管理</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
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
                        list: $store.state.dict.sysNormalDisable,
                    },
                ]"
                @searchFn="$refs.table.reload()"
                @resetFn="$refs.table.reload()"
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['system:dep:add']">
                <com-button plain class="el-button--secret" icon="el-icon-plus" @click.prevent="Add" v-hasPermi="['system:dep:add']"> 新 增 </com-button>
            </div>
            <div class="f1 h0 flex-col">
                <xdh-table
                    v-loading="loading"
                    :data="state.list"
                    :columns="state.columns"
                    ref="table"
                    row-key="id"
                    lazy
                    :load="(tree, treeNode, resolve) => resolve(tree.children)"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                >
                    <template #status="{ row }">
                        {{ selectDictLabel($store.state.dict.sysNormalDisable, row.status) }}
                    </template>
                    <template #default="scope">
                        <com-button type="text" class="caozuo" @click.prevent="Update(scope.row)" v-hasPermi="['system:dep:edit']"> 修改 </com-button>
                        <com-button type="text" class="caozuo" @click.prevent="Add(scope.row)" v-hasPermi="['system:dep:add']"> 新增 </com-button>
                        <com-button v-if="scope.row.parentId !== '0'" type="text" class="caozuo" @click.prevent="Delete(scope.row)" v-hasPermi="['system:dep:remove']">
                            删除
                        </com-button>
                    </template>
                </xdh-table>
            </div>
        </div>
        <!-- 添加或修改部门对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body>
            <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom">
                <el-row>
                    <el-col :span="24" v-if="dialog.form.parentId !== '0'">
                        <el-form-item label="上级部门" prop="parentId">
                            <com-cascader
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
                            <com-input v-model="dialog.form.deptName" placeholder="请输入部门名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示排序" prop="orderNum">
                            <com-input-number v-model="dialog.form.orderNum" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="负责人" prop="leader">
                            <com-input v-model="dialog.form.leader" placeholder="请输入负责人" maxlength="20" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="联系电话" prop="phone">
                            <com-input v-model="dialog.form.phone" placeholder="请输入联系电话" maxlength="11" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="邮箱" prop="email">
                            <com-input v-model="dialog.form.email" placeholder="请输入邮箱" maxlength="50" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="部门状态" prop="status">
                            <el-radio-group v-model="dialog.form.status">
                                <el-radio v-for="dict in $store.state.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue">
                                    {{ dict.dictLabel }}
                                </el-radio>
                            </el-radio-group>
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
</template>

<script>
import { addDept, removeDept, editDept, infoDept, pageDept } from '@/api/system';
export default {
    name: 'dept',
    data() {
        return {
            deptOptions: [],
            // 查询参数
            queryParams: {
                likeDeptName: '',
                status: '',
            },
            state: {
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
            },
            loading: false,
            // 弹出层
            dialog: {
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
            },
            // 表单校验
            rules: {
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
                        trigger: 'change',
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
                        trigger: ['change', 'change'],
                    },
                ],
                phone: [
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: '请输入正确的手机号码',
                        trigger: 'change',
                    },
                ],
            },
        };
    },
    created() {
        this.getList();
        this.$store.dispatch('GETsysNormalDisable');
    },
    methods: {
        /** 查询部门列表 */
        getList() {
            this.loading = true;
            pageDept(this.queryParams).then((res) => {
                this.state.list = res.data.rows;
                this.loading = false;
                this.$store.commit('SETdeptTree', []);
            });
        },
        // 取消按钮
        cancel() {
            this.resetForm('form');
            this.dialog.open = false;
            this.dialog.form.id = undefined;
        },
        /** 新增按钮操作 */
        Add(row) {
            this.resetForm('form');
            if (row != undefined) {
                this.dialog.form.parentId = row.id;
            }
            this.dialog.open = true;
            this.dialog.title = '添加部门';
            pageDept().then((res) => {
                this.deptOptions = res.data.rows;
            });
        },
        /** 修改按钮操作 */
        Update(row) {
            this.resetForm('form');
            infoDept({ id: row.id }).then((res) => {
                this.dialog.form = res.data;
                this.dialog.open = true;
                this.dialog.title = '修改部门';
            });
            pageDept().then((res) => {
                this.deptOptions = res.data.rows;
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.dialog.title === '修改部门') {
                        editDept(this.dialog.form).then((res) => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addDept(this.dialog.form).then((res) => {
                            this.msgSuccess('新增成功');
                            this.cancel();
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        Delete(row) {
            this.$$confirm('是否确认删除名称为"' + row.deptName + '"的数据项?')
                .then(() => removeDept({ ids: row.id }))
                .then(() => {
                    this.getList();
                    this.msgSuccess('删除成功');
                });
        },
    },
};
</script>

<template>
    <div class="page">
        <div class="top-title">角色管理</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'roleName', label: '角色名称' },
                    { prop: 'roleKey', label: '权限字符' },
                    {
                        itemType: 'select',
                        prop: 'status',
                        label: '状态',
                        list: $store.state.dict.sysNormalDisable,
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

        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:role:add', 'system:role:remove', 'system:role:export']">
                <com-button class="el-button--secret" plain icon="el-icon-plus" @click.prevent="Add" v-hasPermi="['system:role:add']"> 新 增 </com-button>
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click.prevent="Delete" icon="el-icon-delete" v-hasPermi="['system:role:remove']">
                    删 除
                </com-button>
                <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:role:export']" />
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #index="scope">{{ scope.$index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}</template>
                    <template #status="scope">
                        <el-switch v-model="scope.row.status" :active-value="0" :inactive-value="1" @change="StatusChange(scope.row)"></el-switch>
                    </template>
                    <template #default="scope">
                        <com-button type="text" class="caozuo" @click.prevent="Update(scope.row)" v-hasPermi="['system:role:edit']">修改</com-button>
                        <com-button type="text" class="caozuo" @click.prevent="DataScope(scope.row)" v-hasPermi="['system:role:data']">数据权限</com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body>
            <el-form ref="form" :model="dialog.form" :rules="rules" label-width="100px" class="validate--bottom">
                <el-form-item label="角色名称" prop="roleName">
                    <com-input v-model="dialog.form.roleName" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="权限字符" prop="roleKey">
                    <com-input v-model="dialog.form.roleKey" placeholder="请输入权限字符" />
                </el-form-item>
                <el-form-item label="角色顺序" prop="roleSort">
                    <com-input-number v-model="dialog.form.roleSort" :min="0" :maxlength="10" numberType="init" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="dialog.form.status">
                        <el-radio v-for="dict in $store.state.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单数据">
                    <el-checkbox v-model="dialog.menuExpand" @change="CheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
                    <el-checkbox v-model="dialog.menuNodeAll" @change="CheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
                    <el-checkbox v-model="dialog.form.menuStrictly" :true-label="1" :false-label="0" @change="CheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
                    <el-tree
                        accordion
                        class="tree-border"
                        :data="menuOptions"
                        show-checkbox
                        ref="menu"
                        node-key="id"
                        :check-strictly="!dialog.form.menuStrictly"
                        empty-text="加载中，请稍后"
                        :props="defaultProps"
                    />
                </el-form-item>
                <el-form-item label="备注">
                    <com-input v-model="dialog.form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <com-button type="primary" @click.prevent="submitForm">确 定</com-button>
                    <com-button @click.prevent="cancel">取 消</com-button>
                </div>
            </template>
        </el-dialog>

        <!-- 分配角色数据权限对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.openDataScope" width="600px" append-to-body>
            <el-form :model="dialog.form" label-width="100px" class="validate--bottom">
                <el-form-item label="角色名称">
                    <com-input v-model="dialog.form.roleName" disabled />
                </el-form-item>
                <el-form-item label="权限字符">
                    <com-input v-model="dialog.form.roleKey" disabled />
                </el-form-item>
                <el-form-item label="权限范围">
                    <el-select v-model="dialog.form.dataScope">
                        <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="数据权限" v-show="dialog.form.dataScope == 2">
                    <el-checkbox v-model="dialog.deptExpand" @change="CheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
                    <el-checkbox v-model="dialog.deptNodeAll" @change="CheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
                    <el-checkbox v-model="dialog.form.deptStrictly" :true-label="1" :false-label="0" @change="CheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
                    <el-tree
                        accordion
                        class="tree-border"
                        :data="deptOptions"
                        show-checkbox
                        default-expand-all
                        ref="dept"
                        node-key="id"
                        :check-strictly="!dialog.form.deptStrictly"
                        empty-text="加载中，请稍后"
                        :props="defaultProps_1"
                    ></el-tree>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <com-button type="primary" @click.prevent="submitDataScope">确 定</com-button>
                    <com-button @click.prevent="cancelDataScope">取 消</com-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { pageRole, removeRole, addRole, editRole, infoRole, exportRole } from '@/api/system';
import { changeRoleStatus, changeDataPerm, getRoleMenuList, getRoleDeptList } from '@/api/public';
import { downloadBlob } from '@u/download';

export default {
    name: 'Role',
    data() {
        return {
            tableSelection: [],
            // 菜单列表
            menuOptions: [],
            // 部门列表
            deptOptions: [],
            // 数据范围选项
            dataScopeOptions: [
                {
                    value: 1,
                    label: '全部数据权限',
                },
                {
                    value: 2,
                    label: '自定数据权限',
                },
                {
                    value: 3,
                    label: '本部门数据权限',
                },
                {
                    value: 4,
                    label: '本部门及以下数据权限',
                },
                {
                    value: 5,
                    label: '仅本人数据权限',
                },
            ],
            // 查询参数
            queryParams: {
                roleName: '',
                roleKey: '',
                status: '',
                dateRange: [],
                orderByColumn: 'roleSort',
                isAsc: 'asc',
            },
            state: {
                total: 0,
                list: [],
                columns: [
                    {
                        type: 'selection',
                    },
                    {
                        label: '角色编号',
                        prop: 'id',
                    },
                    {
                        label: '角色名称',
                        prop: 'roleName',
                    },
                    {
                        label: '权限字符',
                        prop: 'roleKey',
                    },
                    {
                        label: '显示顺序',
                        prop: 'roleSort',
                    },
                    {
                        label: '状态',
                        prop: 'status',
                    },
                    {
                        label: '创建时间',
                        prop: 'createTime',
                        width: 150,
                    },
                    {
                        label: '操作',
                        width: 150,
                    },
                ],
            },
            defaultProps: {
                children: 'children',
                label: 'menuName',
            },
            defaultProps_1: {
                children: 'children',
                label: 'deptName',
            },
            // 弹出层
            dialog: {
                title: '',
                // 角色弹窗
                open: false,
                form: {
                    id: undefined,
                    roleName: '',
                    roleKey: '',
                    roleSort: 0,
                    status: 0,
                    menuIds: [],
                    deptIds: [],
                    menuStrictly: 1,
                    deptStrictly: 1,
                    remark: '',
                },
                // 是否显示弹出层（数据权限）
                openDataScope: false,
                menuExpand: false,
                menuNodeAll: false,
                deptExpand: true,
                deptNodeAll: false,
            },
            // 表单校验
            rules: {
                roleName: [{ required: true, message: '角色名称不能为空', trigger: 'change' }],
                roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'change' }],
                roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'change' }],
            },
        };
    },
    created() {
        this.$store.dispatch('GETsysNormalDisable');
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageRole(Object.assign({ pageNum, pageSize }, this.addDateRange(this.queryParams, 'dateRange', 'CreateTime'))).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
            });
        },
        /** 查询菜单树结构 */
        getMenuTreeselect() {
            getRoleMenuList().then((res) => {
                this.menuOptions = res.data.menus;
            });
        },
        /** 查询部门树结构 */
        getDeptTreeselect() {
            deptTreeselect().then((res) => {
                this.deptOptions = res.data;
            });
        },
        // 所有菜单节点数据
        getMenuAllCheckedKeys() {
            // 目前被选中的菜单节点
            let checkedKeys = this.$refs.menu.getCheckedKeys();
            // 半选中的菜单节点
            let halfCheckedKeys = this.$refs.menu.getHalfCheckedKeys();
            checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
            return checkedKeys;
        },
        // 所有部门节点数据
        getDeptAllCheckedKeys() {
            // 目前被选中的部门节点
            let checkedKeys = this.$refs.dept.getCheckedKeys();
            // 半选中的部门节点
            let halfCheckedKeys = this.$refs.dept.getHalfCheckedKeys();
            checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
            return checkedKeys;
        },
        /** 根据角色ID查询菜单树结构 */
        getRoleMenuTreeselect(roleId) {
            return getRoleMenuList({ roleId: roleId }).then((res) => {
                this.menuOptions = res.data.menus;
                return res;
            });
        },
        /** 根据角色ID查询部门结构 */
        getRoleDeptTreeselect(roleId) {
            return getRoleDeptList({ roleId: roleId }).then((res) => {
                this.deptOptions = res.data.depts;
                return res;
            });
        },
        // 角色状态修改
        StatusChange(row) {
            if (row.id) {
                let text = row.status === 0 ? '启用' : '停用';
                this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                    .then(function () {
                        return changeRoleStatus({ id: row.id, status: row.status });
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
            this.dialog.menuExpand = false;
            this.dialog.menuNodeAll = false;
            this.dialog.deptExpand = true;
            this.dialog.deptNodeAll = false;
            this.dialog.form.id = undefined;
            this.resetForm('form');
        },
        // 取消按钮（数据权限）
        cancelDataScope() {
            this.dialog.openDataScope = false;
            this.dialog.menuExpand = false;
            this.dialog.menuNodeAll = false;
            this.dialog.deptExpand = true;
            this.dialog.deptNodeAll = false;
            this.dialog.form.id = undefined;
            this.resetForm('form');
        },
        // 树权限（展开/折叠）
        CheckedTreeExpand(value, type) {
            if (type == 'menu') {
                let treeList = this.menuOptions;
                for (let i = 0; i < treeList.length; i++) {
                    this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
                }
            } else if (type == 'dept') {
                let treeList = this.deptOptions;
                for (let i = 0; i < treeList.length; i++) {
                    this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
                }
            }
        },
        // 树权限（全选/全不选）
        CheckedTreeNodeAll(value, type) {
            if (type == 'menu') {
                this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
            } else if (type == 'dept') {
                this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
            }
        },
        // 树权限（父子联动）
        CheckedTreeConnect(value, type) {
            if (type == 'menu') {
                this.dialog.form.menuStrictly = value ? 1 : 0;
            } else if (type == 'dept') {
                this.dialog.form.deptStrictly = value ? 1 : 0;
            }
        },
        /** 新增按钮操作 */
        Add() {
            this.dialog.form = this.$options.data().dialog.form;
            this.getMenuTreeselect();
            this.dialog.open = true;
            this.dialog.title = '添加角色';
        },
        /** 修改按钮操作 */
        Update(row, type) {
            const roleId = row.id;
            const roleTreeInfo = this.getRoleMenuTreeselect(roleId);
            infoRole({ id: row.id }).then((res) => {
                this.dialog.form = res.data;
            });
            this.dialog.open = true;
            this.$nextTick(() => {
                roleTreeInfo.then((res) => {
                    this.$refs.menu.setCheckedKeys(res.data.ruleMenuIds);
                });
            });
            this.dialog.title = '修改角色';
        },
        /** 分配数据权限操作 */
        DataScope(row) {
            const roleDeptTreeselect = this.getRoleDeptTreeselect(row.id);
            infoRole({ id: row.id }).then((res) => {
                this.dialog.form = res.data;
                this.dialog.openDataScope = true;
                this.$nextTick(() => {
                    roleDeptTreeselect.then((res) => {
                        this.$refs.dept.setCheckedKeys(res.data.ruleDeptIds);
                    });
                });
                this.dialog.title = '分配数据权限';
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    this.dialog.form.menuIds = this.getMenuAllCheckedKeys();
                    if (this.dialog.form.id != undefined) {
                        editRole(this.dialog.form).then((res) => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addRole(this.dialog.form).then((res) => {
                            this.msgSuccess('新增成功');
                            this.cancel();
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 提交按钮（数据权限） */
        submitDataScope: function () {
            if (this.dialog.form.id != undefined) {
                this.dialog.form.deptIds = this.getDeptAllCheckedKeys();
                changeDataPerm(this.dialog.form).then((res) => {
                    this.msgSuccess('修改成功');
                    this.cancelDataScope();
                    this.getList();
                });
            }
        },
        submit() {
            if (this.type === 'menu') {
                this.submitForm();
            } else {
                this.submitDataScope();
            }
        },
        /** 删除按钮操作 */
        Delete() {
            const vm = this;
            if (this.tableSelection.length === 0) {
                this.msgInfo('请选择需要删除的数据！');
            } else {
                this.$$confirm('此操作将永久删除选中数据, 是否继续?')
                    .then(() => {
                        removeRole({
                            ids: vm.tableSelection.map((item) => item.id).join(),
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
                            this.msgSuccess('删除成功');
                        });
                    })
                    .catch(() => {
                        this.msgInfo('已取消删除！');
                    });
            }
        },
        /** 导出按钮操作 */
        Export() {
            return exportRole(this.queryParams).then((data) => {
                downloadBlob(data, '角色管理.xlsx');
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.tree-border {
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    border-radius: 4px;
}
</style>

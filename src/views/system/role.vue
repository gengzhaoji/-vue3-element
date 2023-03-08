<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeRoleName', label: '角色名称' },
                    { prop: 'likeRoleKey', label: '权限字符' },
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
                @searchFn="refTable.reload()"
                @resetFn="refTable.reload()"
            />
        </div>

        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:role:add', 'system:role:remove', 'system:role:export']">
                <my-button type="primary" icon="Plus" @click.prevent="Add" v-hasPermi="['system:role:add']"> 新 增 </my-button>
                <el-button-group>
                    <my-button-export :load="Export" v-hasPermi="['system:role:export']" />
                </el-button-group>
                <my-button type="danger" :disabled="!tableSelection.length" @click.prevent="Delete" icon="Delete" v-hasPermi="['system:role:remove']"> 删 除 </my-button>
            </div>
            <my-list-panel ref="refTable" :loadFn="loadData" :total="state.total">
                <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #status="{ row }">
                        <el-switch
                            v-model="row.status"
                            inline-prompt
                            :active-value="0"
                            :inactive-value="1"
                            active-text="启"
                            inactive-text="停"
                            @change="StatusChange(row)"
                        ></el-switch>
                    </template>
                    <template #default="{ row }">
                        <my-button-text @click.prevent="Update(row)" v-hasPermi="['system:role:edit']">修改</my-button-text>
                        <my-button-text @click.prevent="DataScope(row)" v-hasPermi="['system:role:data']">数据权限</my-button-text>
                    </template>
                </my-table>
            </my-list-panel>
        </div>

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @closed="resetForm(form)">
            <div>
                <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom dialog-form">
                    <el-form-item label="角色名称" prop="roleName">
                        <my-input v-model="dialog.form.roleName" placeholder="请输入角色名称" />
                    </el-form-item>
                    <el-form-item label="权限字符" prop="roleKey">
                        <my-input v-model="dialog.form.roleKey" placeholder="请输入权限字符" />
                    </el-form-item>
                    <el-form-item label="角色顺序" prop="roleSort">
                        <my-input-number v-model="dialog.form.roleSort" :min="0" :maxlength="10" numberType="init" />
                    </el-form-item>
                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model="dialog.form.status">
                            <el-radio v-for="dict in $store.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue * 1">{{ dict.dictLabel }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="菜单数据">
                        <el-checkbox v-model="dialog.menuExpand" @change="CheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
                        <el-checkbox v-model="dialog.menuNodeAll" @change="CheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
                        <el-checkbox v-model="dialog.form.menuStrictly" :true-label="1" :false-label="0" @change="CheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
                        <el-tree
                            accordion
                            class="tree-border overflow-y-auto"
                            :data="menuOptions"
                            show-checkbox
                            ref="refMenu"
                            node-key="id"
                            :check-strictly="!dialog.form.menuStrictly"
                            empty-text="加载中，请稍后"
                            :props="{ children: 'children', label: 'menuName' }"
                            style="min-height: 100px; max-height: 250px"
                        />
                    </el-form-item>
                    <el-form-item label="备注">
                        <my-input v-model="dialog.form.remark" type="textarea" placeholder="请输入内容" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <my-button @click="cancel">取 消</my-button>
                <my-button type="primary" @click="submitForm()">确 定</my-button>
            </template>
        </el-dialog>

        <!-- 分配角色数据权限对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.openDataScope" width="600px" append-to-body>
            <el-form :model="dialog.form" label-width="100px" class="validate--bottom dialog-form">
                <el-form-item label="角色名称">
                    <my-input v-model="dialog.form.roleName" disabled />
                </el-form-item>
                <el-form-item label="权限字符">
                    <my-input v-model="dialog.form.roleKey" disabled />
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
                        class="tree-border overflow-y-auto"
                        :data="deptOptions"
                        show-checkbox
                        default-expand-all
                        ref="refDept"
                        node-key="id"
                        :check-strictly="!dialog.form.deptStrictly"
                        empty-text="加载中，请稍后"
                        :props="{ children: 'children', label: 'deptName' }"
                        style="min-height: 100px; max-height: 150px"
                    ></el-tree>
                </el-form-item>
            </el-form>
            <template #footer>
                <my-button @click="cancelDataScope">取 消</my-button>
                <my-button type="primary" @click="submitDataScope()">确 定</my-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="role">
import { pageRole, removeRole, addRole, editRole, infoRole, exportRole } from '@/api/system';
import { changeRoleStatus, changeDataPerm, getRoleMenuList, getRoleDeptList } from '@/api/public';
import { downloadBlob } from '@u/download';
const $vm = inject('$vm'),
    dataScopeOptions = [
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
    rules = {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'change' }],
        roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'change' }],
        roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'change' }],
    };
let menuOptions = $ref([]),
    deptOptions = $ref([]),
    queryParams = $ref({
        likeRoleName: '',
        likeRoleKey: '',
        status: '',
        dateRange: [],
        orderByColumn: 'roleSort',
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
                width: 160,
            },
            {
                label: '操作',
                width: 150,
            },
        ],
    }),
    dialog = $ref({
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
    });

const refTable = $ref(null),
    refMenu = $ref(null),
    refDept = $ref(null),
    form = $ref(null);

let tableSelection = $ref([]);
// 本页面的查询函数
function getList() {
    refTable.loadData();
}
// 初始化表格查询逻辑
function loadData(pageNum, pageSize) {
    return pageRole(Object.assign({ pageNum, pageSize }, $vm.addDateRange(queryParams, 'dateRange', 'CreateTime'))).then((res) => {
        state.total = res.data.total;
        state.list = res.data.rows;
    });
}
/** 查询菜单树结构 */
function getMenuTreeselect() {
    getRoleMenuList().then((res) => {
        menuOptions = res.data.menus;
    });
}
/** 查询部门树结构 */
function getDeptTreeselect() {
    deptTreeselect().then((res) => {
        deptOptions = res.data;
    });
}
// 所有菜单节点数据
function getMenuAllCheckedKeys() {
    // 目前被选中的菜单节点
    let checkedKeys = refMenu.getCheckedKeys();
    // 半选中的菜单节点
    let halfCheckedKeys = refMenu.getHalfCheckedKeys();
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    return checkedKeys;
}
// 所有部门节点数据
function getDeptAllCheckedKeys() {
    // 目前被选中的部门节点
    let checkedKeys = refDept.getCheckedKeys();
    // 半选中的部门节点
    let halfCheckedKeys = refDept.getHalfCheckedKeys();
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys);
    return checkedKeys;
}
/** 根据角色ID查询菜单树结构 */
function getRoleMenuTreeselect(roleId) {
    return getRoleMenuList({ roleId: roleId }).then((res) => {
        menuOptions = res.data.menus;
        return res;
    });
}
/** 根据角色ID查询部门结构 */
function getRoleDeptTreeselect(roleId) {
    return getRoleDeptList({ roleId: roleId }).then((res) => {
        deptOptions = res.data.depts;
        return res;
    });
}
/**
 * 启用、停用
 * @param {Object} row 行数据
 */
function StatusChange(row) {
    if (row.id) {
        let text = row.status === 0 ? '启用' : '停用';
        $vm.$$confirm({ item: `确认要—${text}（${row.roleName}）角色吗?` })
            .then(() => changeRoleStatus({ id: row.id, status: row.status }))
            .then(() => {
                $vm.msgSuccess(text + '成功');
            })
            .catch(function () {
                row.status = row.status === 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}
// 取消按钮
function cancel() {
    dialog.open = false;
    dialog.menuExpand = false;
    dialog.menuNodeAll = false;
    dialog.deptExpand = true;
    dialog.deptNodeAll = false;
}
// 取消按钮（数据权限）
function cancelDataScope() {
    dialog.openDataScope = false;
    dialog.menuExpand = false;
    dialog.menuNodeAll = false;
    dialog.deptExpand = true;
    dialog.deptNodeAll = false;
}
// 树权限（展开/折叠）
function CheckedTreeExpand(value, type) {
    if (type == 'menu') {
        let treeList = menuOptions;
        for (let i = 0; i < treeList.length; i++) {
            refMenu.store.nodesMap[treeList[i].id].expanded = value;
        }
    } else if (type == 'dept') {
        let treeList = deptOptions;
        for (let i = 0; i < treeList.length; i++) {
            refDept.store.nodesMap[treeList[i].id].expanded = value;
        }
    }
}
// 树权限（全选/全不选）
function CheckedTreeNodeAll(value, type) {
    if (type == 'menu') {
        nextTick(() => {
            refMenu.setCheckedNodes(value ? menuOptions : []);
        });
    } else if (type == 'dept') {
        nextTick(() => {
            refDept.setCheckedNodes(value ? deptOptions : []);
        });
    }
}
// 树权限（父子联动）
function CheckedTreeConnect(value, type) {
    if (type == 'menu') {
        dialog.form.menuStrictly = value ? 1 : 0;
    } else if (type == 'dept') {
        dialog.form.deptStrictly = value ? 1 : 0;
    }
}

/** 新增按钮操作 */
function Add() {
    $vm.resetForm(form);
    getMenuTreeselect();
    dialog.open = true;
    dialog.title = '添加角色';
    dialog.form.id = undefined;
    nextTick(() => {
        refMenu.setCheckedKeys([]);
    });
}
/** 修改按钮操作 */
function Update(row, type) {
    const roleId = row.id;
    const roleTreeInfo = getRoleMenuTreeselect(roleId);
    Promise.all([
        infoRole({ id: row.id }).then((res) => {
            dialog.open = true;
            dialog.title = '修改角色';
            nextTick(() => {
                dialog.form = res.data;
            });
        }),
        nextTick(() => {
            roleTreeInfo.then((res) => {
                refMenu.setCheckedKeys(res.data.ruleMenuIds);
            });
        }),
    ]);
}
/** 分配数据权限操作 */
function DataScope(row) {
    const roleDeptTreeselect = getRoleDeptTreeselect(row.id);
    infoRole({ id: row.id }).then((res) => {
        dialog.openDataScope = true;
        nextTick(() => {
            dialog.form = res.data;
            roleDeptTreeselect.then((res) => {
                refDept.setCheckedKeys(res.data.ruleDeptIds);
            });
        });
        dialog.title = '分配数据权限';
    });
}
/** 提交按钮 */
function submitForm() {
    form.validate((valid) => {
        if (valid) {
            dialog.form.menuIds = getMenuAllCheckedKeys();
            if (dialog.form.id != undefined) {
                editRole(dialog.form).then((res) => {
                    $vm.msgSuccess('修改成功');
                    cancel();
                    getList();
                });
            } else {
                addRole(dialog.form).then((res) => {
                    $vm.msgSuccess('新增成功');
                    cancel();
                    getList();
                });
            }
        }
    });
}
/** 提交按钮（数据权限） */
function submitDataScope() {
    if (dialog.form.id != undefined) {
        dialog.form.deptIds = getDeptAllCheckedKeys();
        changeDataPerm(dialog.form).then((res) => {
            $vm.msgSuccess('修改成功');
            cancelDataScope();
            getList();
        });
    }
}
function submit() {
    if (type === 'menu') {
        submitForm();
    } else {
        submitDataScope();
    }
}
/** 删除按钮操作 */
function Delete() {
    $vm.$$confirm('此操作将删除选中数据, 是否继续?')
        .then(() => {
            removeRole({ ids: tableSelection.map((item) => item.id).join() }).then(() => {
                if (tableSelection.length === state.list.length) {
                    refTable?.prevFn?.();
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
/** 导出按钮操作 */
function Export() {
    return exportRole(queryParams).then((data) => {
        downloadBlob(data, '角色管理.xlsx');
    });
}
$vm.$store.dict.GETsysNormalDisable();
</script>

<style lang="scss" scoped>
.tree-border {
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    border-radius: 4px;
}
.dialog-form :deep(.el-form-item__content) {
    display: block;
}
</style>

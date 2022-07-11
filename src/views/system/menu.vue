<template>
    <div class="page">
        <!-- 条件查询部分 -->
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                :model="queryParams"
                :formItem="[
                    { prop: 'likeMenuName', label: '菜单名称' },
                    { itemType: 'select', prop: 'status', label: '菜单状态', list: $store.dict.sysNormalDisable },
                ]"
                @searchFn="loadData()"
                @resetFn="loadData()"
            />
        </div>

        <!-- 表格部分 -->
        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:menu:add']">
                <my-button icon="Plus" type="primary" @click.prevent="Add" v-hasPermi="['system:menu:add']">新 增</my-button>
            </div>
            <my-table
                :data="state.list"
                :columns="state.columns"
                lazy
                :load="(tree, treeNode, resolve) => resolve(tree.children)"
                row-key="id"
                :expand-row-keys="expandRowkeys"
                @expand-change="expandChangeFn"
            >
                <template #icon="{ row }">
                    <i :class="row.icon" />
                </template>
                <template #menuType="{ row }">
                    <el-tag>{{ row.menuType == 'M' ? '目录' : row.menuType == 'C' ? '菜单' : '按钮' }}</el-tag>
                </template>
                <template #status="{ row }">
                    <el-switch
                        v-if="['M', 'C'].includes(row.menuType)"
                        v-model="row.status"
                        inline-prompt
                        :active-value="0"
                        :inactive-value="1"
                        active-text="启"
                        inactive-text="停"
                        @change="statusFn(row)"
                    />
                    <span v-else> </span>
                </template>
                <template #visible="{ row }">
                    <el-switch
                        v-if="['M', 'C'].includes(row.menuType)"
                        v-model="row.visible"
                        inline-prompt
                        :active-value="0"
                        :inactive-value="1"
                        active-text="显"
                        inactive-text="隐"
                        @change="visibleFn(row)"
                    />
                    <span v-else> </span>
                </template>
                <template #isCache="{ row }">
                    <el-switch
                        v-if="['C'].includes(row.menuType)"
                        v-model="row.isCache"
                        inline-prompt
                        :active-value="1"
                        :inactive-value="0"
                        active-text="是"
                        inactive-text="否"
                        @change="isCacheFn(row)"
                    />
                    <span v-else> </span>
                </template>
                <template #default="{ row }">
                    <my-button type="text" class="caozuo" @click.prevent="Update(row)" v-hasPermi="['system:menu:edit']">修改</my-button>
                    <my-button type="text" class="caozuo" @click.prevent="Add(row)" v-if="row.menuType !== 'F'" v-hasPermi="['system:menu:add']">新增</my-button>
                    <my-button type="text" class="caozuo" @click.prevent="Delete(row)" v-if="!row.children.length" v-hasPermi="['system:menu:remove']">删除</my-button>
                </template>
            </my-table>
        </div>

        <!-- 添加或修改菜单对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @close="resetForm(dialogForm)">
            <el-form ref="dialogForm" :model="dialog.form" :rules="rules" label-width="100px" class="validate--bottom">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="上级菜单" prop="parentId">
                            <my-cascader
                                v-model="dialog.form.parentId"
                                :list="menuOptions"
                                :props="{
                                    expandTrigger: 'hover',
                                    value: 'id',
                                    label: 'menuName',
                                    emitPath: false,
                                    checkStrictly: true,
                                }"
                                placeholder="选择上级菜单"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item prop="menuType">
                            <template #label>
                                <el-tooltip content="目录下级可以添加（目录/菜单），菜单下级可以添加（按钮）" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                菜单类型
                            </template>
                            <el-radio-group v-model="dialog.form.menuType">
                                <el-radio label="M">目录</el-radio>
                                <el-radio label="C">菜单</el-radio>
                                <el-radio label="F">按钮</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="菜单图标" prop="icon">
                            <my-select filterable v-model="dialog.form.icon" placeholder="请选择菜单图标">
                                <template #prefix> <i :class="dialog.form.icon" /> </template>
                                <el-option v-for="item in icons" :key="item" :label="item" :value="item">
                                    <i :class="[item]"></i>
                                    <span class="fr">{{ item }}</span>
                                </el-option>
                            </my-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item prop="menuName">
                            <template #label>
                                <template v-if="dialog.form.menuType != 'F'">
                                    <el-tooltip content="子类页面（详情、新增等）需（父类菜单名称-自己的名称）" placement="top">
                                        <el-icon><QuestionFilled /></el-icon>
                                    </el-tooltip>
                                    菜单名称
                                </template>
                                <template v-else> 按钮名称 </template>
                            </template>

                            <my-input v-model="dialog.form.menuName" placeholder="请输入菜单名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="['C'].includes(dialog.form.menuType)">
                        <el-form-item prop="component">
                            <template #label>
                                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                组件路径
                            </template>
                            <el-input :size="$store.user.size" v-model.trim="dialog.form.component" placeholder="请输入组件路径" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="['C'].includes(dialog.form.menuType)">
                        <el-form-item prop="layoutPath">
                            <template #label>
                                <el-tooltip content="页面的布局路径默认为全局的Layout，或者填写ParentView，或自定义`views`目录下的路径" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                布局路径
                            </template>
                            <el-input :size="$store.user.size" v-model.trim="dialog.form.layoutPath" placeholder="请输入布局路径" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示排序" prop="orderNum">
                            <my-input-number v-model="dialog.form.orderNum" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="['C', 'F'].includes(dialog.form.menuType)">
                        <el-form-item label="权限标识" prop="perms">
                            <my-input v-model="dialog.form.perms" placeholder="请输入权限标识" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item prop="path">
                            <template #label>
                                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                路由地址
                            </template>
                            <el-input :size="$store.user.size" v-model.trim="dialog.form.path" placeholder="请输入路由地址" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item prop="visible">
                            <template #label>
                                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                显示状态
                            </template>
                            <el-radio-group v-model="dialog.form.visible">
                                <el-radio v-for="dict in $store.dict.sysShowHide" :key="dict.dictValue" :label="dict.dictValue * 1">{{ dict.dictLabel }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item prop="status">
                            <template #label>
                                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                菜单状态
                            </template>
                            <el-radio-group v-model="dialog.form.status">
                                <el-radio v-for="dict in $store.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue * 1">{{ dict.dictLabel }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType == 'C'">
                        <el-form-item prop="isCache">
                            <template #label>
                                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                                    <el-icon><QuestionFilled /></el-icon>
                                </el-tooltip>
                                是否缓存
                            </template>
                            <el-radio-group v-model="dialog.form.isCache">
                                <el-radio :label="1">缓存</el-radio>
                                <el-radio :label="0">不缓存</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <my-button type="primary" @click.prevent="submitForm">确 定</my-button>
                    <my-button @click.prevent="dialog.open = false">取 消</my-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Menu">
import { listMenu, infoMenu, removeMenu, addMenu, editMenu } from '@/api/system';
import icons from '@/config/icons';
const $vm = inject('$vm');

/**
 * 查询菜单列表
 */
// 查询参数
let queryParams = $ref({
        needCount: 0,
        likeMenuName: '',
        status: '',
    }),
    state = $ref({
        list: [],
        columns: [
            {
                label: '菜单名称',
                prop: 'menuName',
                showOverflowTooltip: true,
                width: 180,
            },
            {
                label: '图标',
                prop: 'icon',
                width: 80,
            },
            {
                label: '排序',
                prop: 'orderNum',
                width: 80,
            },
            {
                label: '路由',
                prop: 'path',
                width: 150,
            },
            {
                label: '权限标识',
                prop: 'perms',
                width: 200,
            },
            {
                label: '组件路径',
                prop: 'component',
            },
            {
                label: '菜单类型',
                prop: 'menuType',
                width: 80,
            },
            {
                label: '菜单状态',
                prop: 'status',
                width: 80,
            },
            {
                label: '显示状态',
                prop: 'visible',
                width: 80,
            },
            {
                label: '是否缓存',
                prop: 'isCache',
                width: 80,
            },
            {
                label: '创建时间',
                prop: 'createTime',
                width: 160,
            },
            {
                label: '操作',
                width: 180,
            },
        ],
    });

// 树形表格展开问题
let expandRowkeys = $ref([]);
function expandChangeFn(row, expanded) {
    if (expanded) {
        expandRowkeys.push(row.id);
    } else {
        expandRowkeys.splice(expandRowkeys.indexOf(row.id), 1);
    }
}

function loadData() {
    listMenu(queryParams).then((res) => {
        state.list = res.data;
        $vm.$store.guarder.GenerateRoutes();
    });
}
/**
 * 启用、停用
 */
function statusFn(row) {
    if (row.id) {
        const text = row.status == 0 ? '启用' : '停用';
        $vm.$$confirm(`确认要—${text}（${row.menuName}）菜单吗?`)
            .then(() => editMenu(row))
            .then(() => {
                $vm.msgSuccess(text + '成功');
                loadData();
            })
            .catch(function () {
                row.status = row.status == 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}
/**
 * 隐藏、显示
 */
function visibleFn(row) {
    if (row.id) {
        const text = row.visible == 0 ? '显示' : '隐藏';
        $vm.$$confirm(`确认要—${text}（${row.menuName}）菜单吗?`)
            .then(() => editMenu(row))
            .then(() => {
                $vm.msgSuccess(text + '成功');
                loadData();
            })
            .catch(function () {
                row.visible = row.visible == 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}
/**
 * 是否缓存
 */
function isCacheFn(row) {
    if (row.id) {
        const text = row.isCache == 0 ? '不缓存' : '缓存';
        $vm.$$confirm(`确认要—${text}（${row.menuName}）该菜单吗?`)
            .then(() => editMenu(row))
            .then(() => {
                $vm.msgSuccess('修改成功');
                loadData();
            })
            .catch(function () {
                row.isCache = row.isCache == 0 ? 1 : 0;
                $vm.msgInfo('已取消！');
            });
    }
}

/**
 * 弹出层
 */
let dialog = $ref({
        title: '',
        open: false,
        form: {
            id: undefined,
            parentId: '0',
            menuType: 'M',
            icon: '',
            menuName: '',
            orderNum: 0,
            perms: '',
            visible: 0,
            path: '',
            layoutPath: '',
            status: 0,
            isCache: 0,
        },
    }),
    // 表单校验
    rules = {
        menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'change' }],
        orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'change' }],
        path: [{ required: true, message: '路由地址不能为空', trigger: 'change' }],
    },
    menuOptions = $computed(() => (state.list.length ? [{ id: '0', menuName: '主类目', children: state.list }] : [{ id: '0', menuName: '主类目' }]));

watch(
    () => dialog.form.parentId,
    (val) => {
        if (val == 0) dialog.form.parentId = '0';
    }
);

/** 新增按钮操作 */
function Add(row) {
    if (row != null && row.id) {
        dialog.form.parentId = row.id;
    } else {
        dialog.form.parentId = '0';
    }
    dialog.open = true;
    dialog.form.id = undefined;
    dialog.title = '添加菜单';
}
/** 修改按钮操作 */
function Update(row) {
    infoMenu({ id: row.id }).then((res) => {
        dialog.open = true;
        dialog.title = '修改菜单';
        nextTick(() => {
            dialog.form = res.data;
        });
    });
}
/** 删除按钮操作 */
function Delete(row) {
    $vm.$$confirm(`是否确认删除名称为${row.menuName}的数据项?`)
        .then(() => {
            removeMenu({ ids: row.id }).then(() => {
                loadData();
                $vm.msgSuccess('删除成功');
            });
        })
        .catch((err) => {
            $vm.msgInfo('取消删除');
        });
}
const dialogForm = $ref(null);
/** 提交按钮 */
function submitForm() {
    dialogForm.validate((valid) => {
        if (valid) {
            if (dialog.form.icon == '') dialog.form.icon = '#';
            (dialog.form.id != undefined ? editMenu : addMenu)(dialog.form).then((res) => {
                $vm.msgSuccess(dialog.form.id != undefined ? '修改成功' : '新增成功');
                dialog.open = false;
                loadData();
            });
        }
    });
}

$vm.$store.dict.GETsysShowHide();
$vm.$store.dict.GETsysNormalDisable();
loadData();
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
    font-size: 13px;
}
</style>

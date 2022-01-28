<template>
    <div class="page">
        <div class="top-title">菜单管理</div>
        <!-- 条件查询部分 -->
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                :model="queryParams"
                :formItem="[
                    { prop: 'menuName', label: '菜单名称' },
                    { itemType: 'select', prop: 'status', label: '菜单状态', list: $store.state.dict.sysNormalDisable },
                ]"
                @searchFn="$refs.table.reload()"
                @resetFn="$refs.table.reload()"
            />
        </div>

        <!-- 表格部分 -->
        <div class="f1 h0 flex-col m-t-10 system-page-background b-r-4">
            <div class="p-10" v-hasPermi="['system:menu:add']">
                <com-button plain class="el-button--secret" icon="el-icon-plus" @click.prevent="Add" v-hasPermi="['system:menu:add']">新 增</com-button>
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total" :pager="false">
                <xdh-table
                    :data="state.list"
                    :columns="state.columns"
                    lazy
                    :load="(tree, treeNode, resolve) => resolve(tree.children)"
                    row-key="id"
                    :tree-props="{ children: 'lazyChildren', hasChildren: 'hasChildren' }"
                >
                    <template #icon="{ row }">
                        <i :class="row.icon" />
                    </template>
                    <template #menuType="{ row }">{{ row.menuType === 'M' ? '目录' : row.menuType === 'C' ? '菜单' : '按钮' }}</template>
                    <template #status="{ row }">{{ selectDictLabel($store.state.dict.sysNormalDisable, row.status) }}</template>
                    <template #visible="{ row }">{{ selectDictLabel($store.state.dict.sysShowHide, row.visible) }}</template>
                    <template #default="{ row }">
                        <com-button type="text" class="caozuo" @click.prevent="Update(row)" v-hasPermi="['system:menu:edit']">修改</com-button>
                        <com-button type="text" class="caozuo" @click.prevent="Add(row)" v-if="row.menuType !== 'F'" v-hasPermi="['system:menu:add']">新增</com-button>
                        <com-button type="text" class="caozuo" @click.prevent="Delete(row)" v-hasPermi="['system:menu:remove']">删除</com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>

        <!-- 添加或修改菜单对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body>
            <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="上级菜单" prop="parentId">
                            <com-cascader
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
                        <el-form-item label="菜单类型" prop="menuType">
                            <el-radio-group v-model="dialog.form.menuType">
                                <el-radio label="M">目录</el-radio>
                                <el-radio label="C">菜单</el-radio>
                                <el-radio label="F">按钮</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="菜单图标" prop="icon">
                            <com-select filterable v-model="dialog.form.icon" placeholder="请选择菜单图标">
                                <template #prefix> <i :class="dialog.form.icon" /> </template>
                                <el-option v-for="item in icons" :key="item" :label="item" :value="item">
                                    <i :class="[item]"></i>
                                    <span class="fr">{{ item }}</span>
                                </el-option>
                            </com-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="dialog.form.menuType != 'F' ? '菜单名称' : '按钮名称'" prop="menuName">
                            <com-input v-model="dialog.form.menuName" placeholder="请输入菜单名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示排序" prop="orderNum">
                            <com-input-number v-model="dialog.form.orderNum" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="['C'].includes(dialog.form.menuType)">
                        <el-form-item label="组件路径" prop="component">
                            <el-input :size="$store.state.user.size" v-model.trim="dialog.form.component" placeholder="请输入组件路径" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="['C'].includes(dialog.form.menuType)">
                        <el-form-item label="布局路径" prop="layoutPath">
                            <el-input :size="$store.state.user.size" v-model.trim="dialog.form.layoutPath" placeholder="请输入布局路径" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="['C', 'F'].includes(dialog.form.menuType)">
                        <el-form-item label="权限标识" prop="perms">
                            <com-input v-model="dialog.form.perms" placeholder="请输入权限标识" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="路由地址" prop="path">
                            <el-input :size="$store.state.user.size" v-model.trim="dialog.form.path" placeholder="请输入路由地址" maxlength="255" clearable />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="显示状态" prop="visible">
                            <el-radio-group v-model="dialog.form.visible">
                                <el-radio v-for="dict in $store.state.dict.sysShowHide" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="是否外链" prop="isFrame">
                            <el-radio-group v-model="dialog.form.isFrame">
                                <el-radio :label="1">是</el-radio>
                                <el-radio :label="0">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType != 'F'">
                        <el-form-item label="菜单状态" prop="status">
                            <el-radio-group v-model="dialog.form.status">
                                <el-radio v-for="dict in $store.state.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue">{{ dict.dictLabel }}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="dialog.form.menuType == 'C'">
                        <el-form-item label="是否缓存">
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
                    <com-button type="primary" @click.prevent="submitForm">确 定</com-button>
                    <com-button @click.prevent="cancel">取 消</com-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { pageMenu, infoMenu, removeMenu, addMenu, editMenu } from '@/api/system';
import icons from '@/config/icons';

export default defineComponent({
    name: 'Menu',
    data() {
        return {
            icons: icons,
            // 查询参数
            queryParams: {
                needCount: 0,
                likeMenuName: '',
                status: '',
            },
            state: {
                list: [],
                columns: [
                    {
                        label: '菜单名称',
                        prop: 'menuName',
                        width: 250,
                    },
                    {
                        label: '图标',
                        prop: 'icon',
                        width: 100,
                    },
                    {
                        label: '排序',
                        prop: 'orderNum',
                        width: 100,
                    },
                    {
                        label: '路由',
                        prop: 'path',
                    },
                    {
                        label: '权限标识',
                        prop: 'perms',
                    },
                    {
                        label: '组件路径',
                        prop: 'component',
                    },
                    {
                        label: '菜单类型',
                        prop: 'menuType',
                        width: 100,
                    },
                    {
                        label: '菜单状态',
                        prop: 'status',
                        width: 100,
                    },
                    {
                        label: '显示状态',
                        prop: 'visible',
                        width: 100,
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
            // 弹出层
            dialog: {
                title: '',
                open: false,
                form: {
                    id: undefined,
                    parentId: '0',
                    menuType: 'M',
                    icon: '',
                    menuName: '',
                    orderNum: 0,
                    isFrame: 0,
                    perms: '',
                    visible: 0,
                    path: '',
                    layoutPath: '',
                    status: 0,
                    isCache: 0,
                },
            },
            // 表单校验
            rules: {
                menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'change' }],
                orderNum: [{ required: true, message: '菜单顺序不能为空', trigger: 'change' }],
                path: [{ required: true, message: '路由地址不能为空', trigger: 'change' }],
            },
        };
    },
    computed: {
        menuOptions() {
            if (this.state.list.length) {
                return [{ id: '0', menuName: '主类目', children: this.state.list }];
            } else {
                return [{ id: '0', menuName: '主类目' }];
            }
        },
    },
    watch: {
        'dialog.form.parentId'(val) {
            if (val === 0) {
                this.dialog.form.parentId = '0';
            }
        },
    },
    created() {
        this.$store.dispatch('GETsysShowHide');
        this.$store.dispatch('GETsysNormalDisable');
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        /** 查询菜单列表 */
        loadData() {
            return pageMenu(this.queryParams).then((res) => {
                this.state.list = res.data.rows;
                this.loading = false;
                this.$store.dispatch('GenerateRoutes');
            });
        },
        /** 新增按钮操作 */
        Add(row) {
            this.resetForm('form');
            if (row != null && row.id) {
                this.dialog.form.parentId = row.id;
            } else {
                this.dialog.form.parentId = '0';
            }
            this.dialog.open = true;
            this.dialog.title = '添加菜单';
        },
        /** 修改按钮操作 */
        Update(row) {
            this.resetForm('form');
            infoMenu({ id: row.id }).then((res) => {
                this.dialog.form = res.data;
                this.dialog.form.parentId = res.data.parentId;
                this.dialog.open = true;
                this.dialog.title = '修改菜单';
            });
        },
        /** 删除按钮操作 */
        Delete(row) {
            this.$$confirm('是否确认删除名称为"' + row.menuName + '"的数据项?')
                .then(() => {
                    removeMenu({ ids: row.id }).then(() => {
                        this.getList();
                        this.msgSuccess('删除成功');
                    });
                })
                .catch((err) => {
                    this.msgInfo('取消删除');
                });
        },
        /** 提交按钮 */
        submitForm() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.dialog.form.icon === '') {
                        this.dialog.form.icon = '#';
                    }
                    if (this.dialog.form.id != undefined) {
                        editMenu(this.dialog.form).then((res) => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addMenu(this.dialog.form).then((res) => {
                            this.msgSuccess('新增成功');
                            this.cancel();
                            this.getList();
                        });
                    }
                }
            });
        },
        // 弹窗取消函数逻辑
        cancel() {
            this.dialog.open = false;
            this.dialog.form.id = undefined;
        },
    },
});
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
    font-size: 13px;
}
</style>

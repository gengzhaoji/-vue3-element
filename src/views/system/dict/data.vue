<template>
    <div class="page">
        <el-page-header class="m-b-10" icon="el-icon-arrow-left" content="字典管理详情" @back="$emit('cancel')" />
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { itemType: 'select', prop: 'dictType', label: '字典名称', list: typeOptions, fileType: { label: 'dictName', value: 'dictType' } },
                    { prop: 'dictLabel', label: '字典标签' },
                    {
                        itemType: 'select',
                        prop: 'status',
                        label: '状态',
                        list: $store.state.dict.sysNormalDisable,
                    },
                ]"
                @searchFn="$refs.table.reload()"
                @resetFn="
                    $refs.table.reload();
                    queryParams.dictType = dictType;
                "
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10">
                <com-button type="primary" plain icon="el-icon-plus" @click.prevent="Add"> 新 增 </com-button>
                <com-button plain type="danger" @click.prevent="Delete" icon="el-icon-delete"> 删 除 </com-button>
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total" :isAuto="false">
                <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #index="scope">
                        {{ scope.$index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                    </template>
                    <template #status="{ row }">
                        {{ selectDictLabel($store.state.dict.sysNormalDisable, row.status) }}
                    </template>
                    <template #default="{ row }">
                        <com-button type="text" class="caozuo" @click.prevent="Update(row)"> 修改 </com-button>
                        <com-button type="text" class="caozuo" @click.prevent="Detail(row)"> 详情 </com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>
        <!-- 添加或修改参数配置对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="500px" append-to-body>
            <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" :disabled="dialog.title === '字典数据详情'" class="validate--bottom">
                <el-form-item label="字典类型">
                    <com-input v-model="dialog.form.dictType" disabled />
                </el-form-item>
                <el-form-item label="数据标签" prop="dictLabel">
                    <com-input v-model="dialog.form.dictLabel" placeholder="请输入数据标签" />
                </el-form-item>
                <el-form-item label="数据键值" prop="dictValue">
                    <com-input v-model="dialog.form.dictValue" placeholder="请输入数据键值" />
                </el-form-item>
                <el-form-item label="显示排序" prop="dictSort">
                    <com-input-number v-model="dialog.form.dictSort" :min="0" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="dialog.form.status">
                        <el-radio v-for="dict in $store.state.dict.sysNormalDisable" :key="dict.dictValue" :label="dict.dictValue">
                            {{ dict.dictLabel }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <com-input v-model="dialog.form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
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
import { pageDatadict, removeDatadict, addDatadict, editDatadict, infoDatadict, infoTypedict, pageTypedict } from '@/api/system';

export default {
    name: 'Data',
    props: {
        routerMage: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            typeOptions: [],
            queryParams: {
                likeDictLabel: '',
                dictType: '',
                status: '',
                orderByColumn: 'dictSort',
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
                        width: '200',
                    },
                ],
            },
            tableSelection: [],
            // 弹出层
            dialog: {
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
            },
            // 表单校验
            rules: {
                dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
                dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
                dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
            },
        };
    },
    created() {
        infoTypedict({ id: this.routerMage.id }).then((res) => {
            this.queryParams.dictType = res.data.dictType;
            this.dictType = res.data.dictType;
            this.getList();
        });
        // // 基础下拉选项数据
        pageTypedict().then((res) => {
            this.typeOptions = res.data.rows;
        });
        this.$store.dispatch('GETsysNormalDisable');
    },
    methods: {
        // 本页面的查询函数
        getList() {
            this.$refs.table.loadData();
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageDatadict(Object.assign({ pageNum, pageSize }, this.queryParams)).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
            });
        },
        // 取消按钮
        cancel() {
            this.resetForm('form');
            this.dialog.open = false;
        },
        /** 新增按钮操作 */
        Add() {
            this.dialog.open = true;
            this.dialog.title = '添加字典数据';
            this.dialog.form = this.$options.data().dialog.form;
            this.resetForm('form');
            this.dialog.form.dictType = this.dictType;
        },
        /** 修改按钮操作 */
        Update(row) {
            this.resetForm('form');
            this.dialog.form = row;
            this.dialog.open = true;
            this.dialog.title = '修改字典数据';
            this.dialog.form.dictType = this.dictType;
        },
        /**详情按钮操作 */
        Detail(row) {
            this.resetForm('form');
            this.dialog.form = this.clone(row);
            this.dialog.open = true;
            this.dialog.title = '字典数据详情';
            this.dialog.form.dictType = this.dictType;
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.dialog.form.id != undefined) {
                        editDatadict(this.dialog.form).then((res) => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addDatadict(this.dialog.form).then((res) => {
                            this.msgSuccess('新增成功');
                            this.cancel();
                            this.getList();
                        });
                    }
                }
            });
        },
        /** 删除按钮操作 */
        Delete() {
            if (this.tableSelection.length === 0) {
                this.msgInfo('请选择需要删除的数据！');
            } else {
                this.$$confirm('此操作将永久删除选中数据, 是否继续?')
                    .then(() => {
                        removeDatadict({
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
                            this.msgSuccess('删除成功');
                        });
                    })
                    .catch(() => {
                        this.msgInfo('已取消删除！');
                    });
            }
        },
    },
};
</script>

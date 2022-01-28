<template>
    <div class="h100">
        <transition-group name="fade-transform">
            <div class="page" key="1" v-show="detail === 1">
                <div class="top-title">字典管理</div>
                <div class="p-10 system-page-background b-r-4">
                    <com-form
                        inline
                        query
                        label-width="70px"
                        :model="queryParams"
                        :formItem="[
                            { prop: 'likeDictName', label: '字典名称' },
                            { prop: 'likeDictType', label: '字典类型' },
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
                <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
                    <div class="p-10" v-hasPermi="['system:dict:add', 'system:dict:remove', 'system:dict:export']">
                        <com-button class="el-button--secret" plain icon="el-icon-plus" @click.prevent="Add" v-hasPermi="['system:dict:add']"> 新 增 </com-button>
                        <com-button
                            plain
                            class="el-button--secret"
                            :disabled="!tableSelection.length"
                            @click.prevent="Delete"
                            icon="el-icon-delete"
                            v-hasPermi="['system:dict:remove']"
                        >
                            删 除
                        </com-button>
                        <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:dict:export']" />
                    </div>
                    <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                        <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                            <template #index="{ scope }">
                                {{ scope.$index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                            </template>

                            <template #status="{ row }">
                                {{ selectDictLabel($store.state.dict.sysNormalDisable, row.status) }}
                            </template>
                            <template #default="scope">
                                <com-button type="text" class="caozuo" @click.prevent="Update(scope.row)" v-hasPermi="['system:dict:edit']"> 修改 </com-button>
                                <com-button type="text" class="caozuo" @click.prevent="Detail(scope.row)"> 详情 </com-button>
                            </template>
                        </xdh-table>
                    </xdh-list-panel>
                </div>
                <!-- 添加或修改参数配置对话框 -->
                <el-dialog :title="dialog.title" v-model="dialog.open" width="600px" append-to-body @closed="resetForm('form')">
                    <el-form ref="form" :model="dialog.form" :rules="rules" label-width="80px" class="validate--bottom">
                        <el-form-item label="字典名称" prop="dictName">
                            <com-input v-model="dialog.form.dictName" placeholder="请输入字典名称" />
                        </el-form-item>
                        <el-form-item label="字典类型" prop="dictType">
                            <com-input v-model="dialog.form.dictType" :disabled="dialog.type === 'Update'" placeholder="请输入字典类型" />
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
            <!-- 修改、详情组件 -->
            <detail key="2" v-if="detail === 2" @cancel="CancelFn" :routerMage="routerMage"></detail>
        </transition-group>
    </div>
</template>

<script>
import { pageTypedict, addTypedict, removeTypedict, editTypedict, infoTypedict, exportTypedict } from '@/api/system';
import detail from './data.vue';
import { downloadBlob } from '@u/download';

export default {
    name: 'Dict',
    components: {
        detail,
    },
    data() {
        return {
            queryParams: {
                likeDictName: '',
                likeDictType: '',
                status: '',
                dateRange: [],
                startCreateTime: '',
                endCreateTime: '',
            },
            state: {
                total: 0,
                list: [],
                columns: [
                    {
                        type: 'selection',
                    },
                    {
                        label: '字典编号',
                        prop: 'id',
                        width: 100,
                    },
                    {
                        label: '字典名称',
                        prop: 'dictName',
                        width: 150,
                    },
                    {
                        label: '字典类型',
                        prop: 'dictType',
                        width: 150,
                    },
                    {
                        label: '状态',
                        prop: 'status',
                        width: 100,
                    },
                    {
                        label: '备注',
                        prop: 'remark',
                        'show-overflow-tooltip': true,
                    },
                    {
                        label: '创建时间',
                        prop: 'createTime',
                        width: 150,
                    },
                    {
                        label: '操作',
                        width: 120,
                    },
                ],
            },
            tableSelection: [],
            // 弹出层
            dialog: {
                title: '',
                open: false,
                type: '',
                form: {
                    id: undefined,
                    dictName: '',
                    dictType: '',
                    status: 0,
                    remark: '',
                },
            },
            // 表单校验
            rules: {
                dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
                dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
            },
            detail: 1,
            routerMage: {},
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
            return pageTypedict(Object.assign({ pageNum, pageSize }, this.dataFn())).then((res) => {
                this.state.total = res.data.total;
                this.state.list = res.data.rows;
            });
        },
        // 取消按钮
        cancel() {
            this.dialog.open = false;
            this.dialog.form.id = undefined;
        },
        /** 新增按钮操作 */
        Add() {
            this.dialog.type = 'Add';
            this.dialog.open = true;
            this.dialog.title = '添加字典类型';
            this.dialog.form = this.$options.data().dialog.form;
        },
        /** 修改按钮操作 */
        Update(row) {
            infoTypedict({ id: row.id }).then((res) => {
                this.dialog.form = res.data;
                this.dialog.open = true;
                this.dialog.title = '修改字典类型';
                this.dialog.type = 'Update';
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    if (this.dialog.form.id != undefined) {
                        editTypedict(this.dialog.form).then((res) => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addTypedict(this.dialog.form).then((res) => {
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
            this.$$confirm('此操作将永久删除选中数据, 是否继续?')
                .then(() => {
                    removeTypedict({
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
        },
        /** 导出按钮操作 */
        Export() {
            return exportTypedict(this.dataFn()).then((data) => {
                downloadBlob(data, '字典管理.xlsx');
            });
        },
        /**参数处理*/
        dataFn() {
            if (this.queryParams.dateRange.length) {
                this.queryParams.startCreateTime = this.queryParams.dateRange[0];
                this.queryParams.endCreateTime = this.queryParams.dateRange[1];
            } else {
                this.queryParams.startCreateTime = '';
                this.queryParams.endCreateTime = '';
            }
            const data = this.clone(this.queryParams);
            delete data.dateRange;
            return data;
        },
        /**字典数据详情 */
        Detail(row) {
            this.showKeyFn(2);
            this.routerMage = {
                name: 'detail',
                id: row.id,
            };
        },
        // 详情页关闭函数
        CancelFn(item = false) {
            this.showKeyFn(1);
            if (item) {
                this.getList();
            }
        },
        // 动画
        showKeyFn(item) {
            this.detail = null;
            setTimeout(() => {
                this.detail = item;
            }, 300);
        },
    },
};
</script>

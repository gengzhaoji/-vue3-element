<template>
    <div class="page">
        <div class="top-title">岗位管理</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likePostCode', label: '岗位编码' },
                    { prop: 'likePostName', label: '岗位名称' },
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
            <div class="p-10" v-hasPermi="['system:post:add', 'system:post:remove', 'system:post:export']">
                <com-button class="el-button--secret" plain icon="el-icon-plus" @click.prevent="Add" v-hasPermi="['system:post:add']"> 新 增 </com-button>
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click.prevent="Delete" icon="el-icon-delete" v-hasPermi="['system:post:remove']">
                    删 除
                </com-button>
                <com-button-export plain class="el-button--secret" :load="Export" v-hasPermi="['system:post:export']" />
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <xdh-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #index="{ $index }">
                        {{ $index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                    </template>
                    <template #status="{ row }">
                        {{ selectDictLabel($store.state.dict.sysNormalDisable, row.status) }}
                    </template>
                    <template #default="{ row }">
                        <com-button type="text" class="caozuo" @click.prevent="Update(row)" v-hasPermi="['system:post:edit']"> 修改 </com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>

        <!-- 添加或修改岗位对话框 -->
        <el-dialog :title="dialog.title" v-model="dialog.open" width="500px" append-to-body @closed="resetForm('dialogForm')">
            <el-form ref="dialogForm" :model="dialog.form" :rules="rules" label-width="100px" class="validate--bottom">
                <el-form-item label="岗位名称" prop="postName">
                    <com-input v-model="dialog.form.postName" placeholder="请输入岗位名称" />
                </el-form-item>
                <el-form-item label="岗位编码" prop="postCode">
                    <com-input v-model="dialog.form.postCode" placeholder="请输入编码名称" />
                </el-form-item>
                <el-form-item label="岗位顺序" prop="postSort">
                    <com-input-number v-model="dialog.form.postSort" :min="0" />
                </el-form-item>
                <el-form-item label="岗位状态" prop="status">
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
                    <com-button type="primary" @click.prevent="submitForm()"> 确 定 </com-button>
                    <com-button @click.prevent="cancel()">取 消</com-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { pagePost, removePost, addPost, editPost, infoPost, exportPost } from '@/api/system';
import { downloadBlob } from '@u/download';

export default {
    name: 'Post',
    data() {
        return {
            // 查询参数
            queryParams: {
                needCount: 1,
                likePostCode: '',
                likePostName: '',
                status: '',
                orderByColumn: 'postSort',
                isAsc: '',
            },
            state: {
                total: 0,
                list: [],
                columns: [
                    {
                        type: 'selection',
                    },
                    {
                        label: '岗位编号',
                        width: '100',
                        prop: 'id',
                    },
                    {
                        label: '岗位编码',
                        prop: 'postCode',
                    },
                    {
                        label: '岗位名称',
                        prop: 'postName',
                    },
                    {
                        label: '岗位排序',
                        prop: 'postSort',
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
                        label: '备注',
                        prop: 'remark',
                    },
                    {
                        label: '操作',
                        width: '100',
                    },
                ],
            },
            tableSelection: [],
            // 弹出层
            dialog: {
                title: '',
                open: false,
                form: {
                    postId: undefined,
                    postName: '',
                    postCode: '',
                    postSort: 0,
                    status: '',
                    remark: '',
                },
            },
            // 表单校验
            rules: {
                postName: [{ required: true, message: '岗位名称不能为空', trigger: 'change' }],
                postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'change' }],
                postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'change' }],
                status: [{ required: true, message: '岗位状态不能为空', trigger: 'change' }],
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
            return pagePost(Object.assign({ pageNum, pageSize }, this.queryParams)).then((res) => {
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
            this.dialog.open = true;
            this.dialog.title = '添加岗位';
        },
        /** 修改按钮操作 */
        Update(row) {
            infoPost({ id: row.id }).then((response) => {
                this.dialog.form = response.data;
                this.dialog.open = true;
                this.dialog.title = '修改岗位';
            });
        },
        /** 提交按钮 */
        submitForm: function () {
            this.$refs['dialogForm'].validate((valid) => {
                if (valid) {
                    if (this.dialog.form.id !== undefined) {
                        editPost(this.dialog.form).then(() => {
                            this.msgSuccess('修改成功');
                            this.cancel();
                            this.getList();
                        });
                    } else {
                        addPost(this.dialog.form).then(() => {
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
                    removePost({
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
            return exportPost(this.queryParams).then((data) => {
                downloadBlob(data, '岗位管理.xlsx');
            });
        },
    },
};
</script>

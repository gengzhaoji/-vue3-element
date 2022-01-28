<template>
    <div class="page">
        <div class="top-title">配置管理</div>
        <div class="p-10 system-page-background b-r-4">
            <com-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeConfigName', label: '参数名称' },
                    { prop: 'likeConfigKey', label: '参数键值' },
                ]"
                @searchFn="$refs.table.reload()"
                @resetFn="$refs.table.reload()"
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['secrecy:config:add', 'secrecy:config:remove']">
                <com-button plain class="el-button--secret" @click="insertFn" icon="el-icon-plus" v-hasPermi="['secrecy:config:add']">新 增</com-button>
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click="deleteFn()" icon="el-icon-delete" v-hasPermi="['secrecy:config:remove']">
                    删 除
                </com-button>
            </div>
            <div class="f1 h0 flex-col">
                <xdh-list-panel ref="table" :total="state.total" :loadFn="loadData">
                    <xdh-table ref="xdhTable" :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                        <template #index="{ $index }">
                            {{ $index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                        </template>
                        <template #configType="{ row }"> {{ selectDictLabel($store.state.dict.sysYesNo, row.configType) }} </template>
                        <template #default="{ row }">
                            <com-button type="text" class="caozuo" @click="detailFn(row)">查看</com-button>
                            <com-button type="text" class="caozuo" @click="updateFn(row)" v-hasPermi="['secrecy:config:edit']">修改</com-button>
                            <com-button type="text" class="caozuo" @click="deleteFn(row)" v-hasPermi="['secrecy:config:remove']">删除</com-button>
                        </template>
                    </xdh-table>
                </xdh-list-panel>
            </div>
        </div>
        <!-- 添加或修改部门对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialog.open" width="500px" append-to-body @closed="resetForm('dialogForm')">
            <com-form
                ref="dialogForm"
                :model="dialog.form"
                label-width="80px"
                :disabled="['detail'].includes(dialog.name)"
                :formItem="[
                    { prop: 'configName', label: '参数名称', required: true },
                    { prop: 'configKey', label: '参数键值', required: true },
                    { prop: 'configValue', label: '参数值', required: true },
                    {
                        itemType: 'select',
                        prop: 'configType',
                        label: '系统内置',
                        list: $store.state.dict.sysYesNo,
                    },
                    { prop: 'remark', label: '备注', type: 'textarea' },
                ]"
            />
            <template #footer>
                <div class="dialog-footer">
                    <com-button type="primary" @click.prevent="dialogSubmitFn()"> 确 定 </com-button>
                    <com-button @click.prevent="cancel()">取 消</com-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { addConfig, removeConfig, editConfig, infoConfig, pageConfig } from '@/api/system';
import mixin from '@/utils/mixin';

export default {
    name: 'config',
    mixins: [mixin],
    data() {
        this.pageConfig = {
            api: {
                page: pageConfig,
                info: infoConfig,
                remove: removeConfig,
                add: addConfig,
                edit: editConfig,
            },
            id: 'id',
        };
        return {
            // 查询参数
            queryParams: {
                likeConfigName: '',
                likeConfigKey: '',
            },
            state: {
                total: 0,
                list: [],
                columns: [
                    {
                        type: 'selection',
                    },
                    {
                        label: '配置名称',
                        prop: 'configName',
                    },
                    {
                        label: '参数键值',
                        prop: 'configKey',
                    },
                    {
                        label: '参数值',
                        prop: 'configValue',
                    },
                    {
                        label: '系统内置',
                        prop: 'configType',
                        width: 80,
                    },
                    {
                        label: '创建时间',
                        prop: 'createTime',
                        width: 150,
                    },
                    {
                        label: '备注',
                        prop: 'remark',
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
                title: '参数配置',
                open: false,
                form: {
                    configName: '',
                    configKey: '',
                    configValue: '',
                    configType: '',
                    remark: '',
                },
            },
        };
    },
    created() {
        this.$store.dispatch('GETsysYesNo');
    },
};
</script>

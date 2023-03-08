<template>
    <div class="page">
        <div class="p-10 system-page-background b-r-4">
            <my-form
                inline
                query
                label-width="70px"
                :model="queryParams"
                :formItem="[
                    { prop: 'likeConfigName', label: '配置名称' },
                    { prop: 'likeConfigKey', label: '参数键值' },
                ]"
                @searchFn="refTable.reload()"
                @resetFn="refTable.reload()"
            />
        </div>
        <div class="f1 h0 flex-col system-page-background m-t-10 b-r-4">
            <div class="p-10" v-hasPermi="['secrecy:config:add', 'secrecy:config:remove']">
                <my-button type="primary" @click="insertFn()" icon="Plus" v-hasPermi="['secrecy:config:add']">新 增 </my-button>
                <my-button type="danger" :disabled="!tableSelection.length" @click="deleteFn(tableSelection)" icon="Delete" v-hasPermi="['secrecy:config:remove']">
                    删 除
                </my-button>
            </div>
            <my-list-panel ref="refTable" :total="state.total" :loadFn="loadData">
                <my-table :data="state.list" :columns="state.columns" @selection-change="(val) => (tableSelection = val)">
                    <template #configType="{ row }"> {{ selectDictLabel($store.dict.sysYesNo, row.configType) }} </template>
                    <template #default="{ row }">
                        <my-button-text @click="detailFn(row)">查看</my-button-text>
                        <my-button-text @click="updateFn(row)" v-hasPermi="['secrecy:config:edit']">修改</my-button-text>
                        <my-button-text @click="deleteFn(row)" v-hasPermi="['secrecy:config:remove']">删除</my-button-text>
                    </template>
                </my-table>
            </my-list-panel>
        </div>
        <!-- 添加或修改部门对话框 -->
        <el-dialog :title="dialogTitle" v-model="dialog.open" width="500px" append-to-body @closed="resetForm(refDialogFrom)">
            <my-form
                ref="refDialogFrom"
                :model="dialog.form"
                label-width="80px"
                :disabled="['detail'].includes(dialog.name)"
                :formItem="[
                    { prop: 'configName', label: '参数名称', required: true },
                    { prop: 'configKey', label: '参数键值', required: true, disabled: dialog.name === 'update' },
                    { prop: 'configValue', label: '参数值', required: true },
                    {
                        itemType: 'select',
                        prop: 'configType',
                        label: '系统内置',
                        list: $store.dict.sysYesNo,
                    },
                    { prop: 'remark', label: '备注', type: 'textarea' },
                    { prop: 'qian', label: '签名' },
                ]"
            >
                <template #configValue="{ model, prop }">
                    <el-input v-model="model[prop]" placeholder="请输入参数值" clearable :size="$store.user.size" />
                </template>
                <template #qian="{ model, prop }">
                    <my-button v-if="!model[prop]" @click="signatureShow = true">签名</my-button>
                    <el-image v-else class="w100" style="height: 100px" :src="model[prop]" :preview-src-list="[model[prop]]" fit="cover" />
                    <my-signature
                        v-model="signatureShow"
                        @getImg="
                            (val) => {
                                signatureShow = false;
                                model[prop] = val;
                            }
                        "
                    />
                </template>
            </my-form>
            <template #footer>
                <my-button @click.prevent="dialog.open = false">取 消</my-button>
                <my-button type="primary" @click.prevent="dialogSubmitFn()">确 定</my-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="config">
import { addConfig, removeConfig, editConfig, pageConfig } from '@/api/system';
import mixin from '@/utils/mixin';

let queryParams = $ref({
        likeConfigName: '',
        likeConfigKey: '',
    }),
    signatureShow = $ref(false),
    state = $ref({
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
                width: 160,
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
    }),
    // 弹出层
    dialog = $ref({
        title: '参数配置',
        open: false,
        name: '',
        form: {
            id: undefined,
        },
    });

const refTable = ref(null),
    refDialogFrom = ref(null);

let tableSelection = ref([]);
const { $vm, dialogTitle, loadData, insertFn, deleteFn, updateFn, detailFn, dialogSubmitFn } = mixin({
    queryParams,
    state,
    api: { page: pageConfig, remove: removeConfig, add: addConfig, edit: editConfig },
    dialog,
    refTable,
    refDialogFrom,
});
// 初始化执行逻辑
$vm.$store.dict.GETsysYesNo();
</script>

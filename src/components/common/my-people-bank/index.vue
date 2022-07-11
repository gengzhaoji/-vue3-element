<template>
    <!-- 添加习题弹窗 -->
    <el-dialog title="添加人员" width="850px" top="9vh" :close-on-click-modal="false" @closed="closeFn" append-to-body v-bind="$attrs">
        <my-tree-table
            :pageApi="pageUser"
            :tree="{
                data: $store.com.deptTree,
                props: { children: 'children', label: 'deptName' },
                nodeKey: 'id',
            }"
            treeKey="deptId"
            :formItem="[
                {
                    prop: 'likeNickName',
                    label: '姓名',
                },
                {
                    prop: 'postIds',
                    label: '岗位',
                    itemType: 'select',
                    type: 'GETpost',
                    fileType: { label: 'postName', value: 'id' },
                    multiple: true,
                },
            ]"
            :columns="columns"
            treeTitle="部门"
            @close="closeFn"
            @determine="(data) => $emit('userList', data)"
        >
            <template #postList="{ row }">
                {{ row.postList?.map((item) => item.postName).join('、') }}
            </template>
        </my-tree-table>
    </el-dialog>
</template>

<script setup name="myPeopleBank">
import { pageUser } from '@/api/system';

const $vm = inject('$vm'),
    $emit = defineEmits(['userList', 'close']),
    columns = [
        {
            type: 'selection',
        },
        {
            label: '姓名',
            prop: 'nickName',
        },
        {
            label: '登录名',
            prop: 'userName',
        },
        {
            label: '部门',
            prop: 'deptName',
        },
        {
            label: '岗位',
            prop: 'postList',
        },
    ];
// 关闭逻辑
function closeFn() {
    $emit('close', false);
}
// 初始化调用分类接口
$vm.$store.com.GETdeptTree();
</script>

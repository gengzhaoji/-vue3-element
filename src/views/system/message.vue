<template>
    <div class="page">
        <el-page-header class="m-b-10" icon="el-icon-arrow-left" content="全部消息" @back="$router.go(-1)" />
        <div class="flex-col f1 h0 system-page-background m-t-10 b-r-4">
            <!-- 列表部分 -->
            <div class="p-10">
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click="markReadFn(false)">批量已读</com-button>
                <com-button plain class="el-button--secret" :disabled="!tableSelection.length" @click="deleteFn(false)">批量删除</com-button>
                <el-dropdown style="margin-left: 10px" @command="handleMessageCommand">
                    <com-button type="primary" class="is-round"> {{ value }} <i class="el-icon-arrow-down" style="margin-left: 4px"></i> </com-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :command="allvalue">{{ allvalue }}</el-dropdown-item>
                            <el-dropdown-item :command="readValue">{{ readValue }}</el-dropdown-item>
                            <el-dropdown-item :command="unReadValue">{{ unReadValue }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                <xdh-table
                    :data="state.list"
                    :columns="state.columns"
                    :row-class-name="tableRowClassName"
                    @sort-change="sortChange"
                    @selection-change="(val) => (tableSelection = val)"
                >
                    <template #index="{ $index }">
                        {{ $index + 1 + ($refs.table.currentPage - 1) * $refs.table.pageSize }}
                    </template>

                    <template #businessCode="{ row }">
                        {{ selectDictLabel($store.state.dict.messageType, row.businessCode) }}
                    </template>
                    <template #title="{ row }">
                        <span v-html="row.title"></span>
                    </template>
                    <template #businessCode_header>
                        <el-dropdown @command="handleTypeCommand">
                            <span>消息类型 <el-icon class="el-icon-arrow-down" /> </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item command="all">全部</el-dropdown-item>
                                    <el-dropdown-item command="1000">涉密信息不完整</el-dropdown-item>
                                    <el-dropdown-item command="1001"> 设备待归还 </el-dropdown-item>
                                    <el-dropdown-item command="1002">载体待归还</el-dropdown-item>
                                    <el-dropdown-item command="1003">人员复审到期</el-dropdown-item>
                                    <el-dropdown-item command="1004">人员脱密成功</el-dropdown-item>
                                    <el-dropdown-item command="1005">人员培训未达标</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }">
                        <com-button type="text" class="caozuo" v-if="row.isRead === 0" @click="markReadFn(row)">标记已读</com-button>
                        <com-button type="text" class="caozuo" @click="deleteFn(row)">删除</com-button>
                        <com-button type="text" class="caozuo" @click="routerFn(row)" v-if="row.businessCode < 1004 && row.isRead === 0">{{
                            row.businessCode === 1000 ? '补全' : [1001, 1002].includes(row.businessCode) ? '归还' : row.businessCode === 1003 ? '复审' : ''
                        }}</com-button>
                    </template>
                </xdh-table>
            </xdh-list-panel>
        </div>
    </div>
</template>

<script>
import { pageMessage, updateReaded, removeMessage } from '@/api/system';
export default {
    name: 'message',
    data() {
        return {
            tableSelection: [],
            value: '',
            allvalue: '',
            readValue: '',
            unReadValue: '',
            state: {
                total: 0,
                list: [],
                columns: [
                    {
                        type: 'selection',
                    },
                    {
                        label: '序号',
                        type: 'index',
                    },
                    {
                        prop: 'businessCode',
                        width: 150,
                    },
                    { label: '标题', prop: 'title' },
                    {
                        label: '提醒日期',
                        prop: 'publishTimeFormat',
                        sortable: true,
                        width: 150,
                    },
                    {
                        label: '操作 ',
                        width: 180,
                    },
                ],
            },
            queryParams: {
                isRead: '',
                businessCode: '',
                needCount: 1,
                businessCodeArray: '',
            },
        };
    },
    created() {
        this.$store.dispatch('GETmessageType');
        this.value = this.allvalue;
    },
    methods: {
        // 页面查询函数
        getList() {
            this.$refs?.table?.loadData?.();
        },
        // 表格排序
        sortChange({ column, prop, order }) {
            this.orderKeysFn();
            this.queryParams[prop] = order === 'ascending'; // true为升序false为降序
            this.$refs?.table?.reload?.();
        },
        // 重置表格排序条件
        orderKeysFn() {
            for (const item of this.orderKeys) {
                this.queryParams[item] = '';
            }
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            return pageMessage({ pageNum, pageSize, ...this.queryParams }).then((res) => {
                const { total, rows, readTotal, unReadTotal } = res.data;
                this.state.total = total;
                this.state.list = rows;
                this.state.list.forEach((item) => {
                    if ([1000, 1003, 1004].includes(item.businessCode)) {
                        item.path = '/personnel/information'; // 涉密信息不完整、人员复审、人员脱密
                    } else if (item.businessCode === 1001) {
                        item.path = '/equipment/return'; // 设备归还
                    } else if (item.businessCode === 1002) {
                        item.path = '/carrier/return'; // 载体归还
                    } else {
                        item.path = '';
                    }
                });
                this.allvalue = `全部消息(${unReadTotal + readTotal})`;
                this.readValue = `未读消息(${unReadTotal})`;
                this.unReadValue = `已读消息(${readTotal})`;
                if (this.value === '') {
                    this.value = this.allvalue;
                } else if (this.value.indexOf('全部') !== -1) {
                    this.value = this.allvalue;
                } else if (this.value.indexOf('未读') !== -1) {
                    this.value = this.readValue;
                } else {
                    this.value = this.unReadValue;
                }
            });
        },
        // 删除信息
        deleteFn(data) {
            this.$$confirm(`此操作将删除数据, 是否继续?`)
                .then(() => {
                    removeMessage({ ids: data ? data.id : this.tableSelection.map((item) => item.id).join(',') }).then(() => {
                        if (1 === this.state.list.length && this.$refs?.table?.lastcurrentPage) {
                            this.$refs?.table?.reload?.();
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
        // 标记已读
        markReadFn(data, type) {
            if (data) {
                updateReaded({ ids: data.id }).then(() => {
                    if (type !== 'router') {
                        this.getList();
                    }
                    this.msgSuccess('已读成功');
                });
            } else {
                this.$$confirm(`此操作将数据标记为已读, 是否继续?`)
                    .then(() => {
                        updateReaded({ ids: this.tableSelection.map((item) => item.id).join(',') })
                            .then(() => {})
                            .finally(() => {
                                this.getList();
                            });
                    })
                    .catch(() => {
                        this.msgInfo('已取消标记！');
                    });
            }
        },
        // 已读数据样式
        tableRowClassName({ row }) {
            if (row.isRead === 1) {
                return 'read';
            }
            return '';
        },
        // 显示消息状态
        handleMessageCommand(command) {
            this.value = command;
            if (this.value.indexOf('全部') !== -1) {
                this.queryParams.isRead = '';
            } else if (this.value.indexOf('未读') !== -1) {
                this.queryParams.isRead = 0;
            } else {
                this.queryParams.isRead = 1;
            }
            this.getList();
        },
        // 显示消息类型
        handleTypeCommand(command) {
            if (command === 'all') {
                this.queryParams.businessCodeArray = '';
                this.queryParams.isRead = this.queryParams.isRead;
            } else {
                this.queryParams.businessCodeArray = command;
            }
            this.getList();
        },
        // 跳转已读
        routerFn(row) {
            this.$router.push(row.path);
            this.markReadFn(row, 'router');
        },
    },
    computed: {
        // 表格排序字段
        orderKeys() {
            let data = [];
            this.state.columns.forEach((item) => {
                if (!!item.sortable) {
                    data.push(item.prop);
                }
            });
            return data;
        },
    },
};
</script>

<style lang="scss" scoped>
:deep(.el-table) .read {
    color: #c0c4cc;
}
:deep(.el-dropdown) {
    font-size: 12px;
    color: #909399;
}
</style>

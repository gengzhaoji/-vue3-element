<template>
    <div class="page" v-loading="loading">
        <el-page-header class="m-b-10" icon="el-icon-arrow-left" content="本年培训成绩排名" @back="$emit('cancel')" />
        <el-row class="f1 h0">
            <el-col :span="12" class="h100 p-r-5">
                <div class="h100 flex-col">
                    <div class="system-page-background b-r-4">
                        <div class="fw" style="font-size: 16px; color: #5a607f; padding: 20px 10px; border-bottom: 1px solid #e6e9f4">个人成绩排名</div>
                        <!-- 条件查询部分 -->
                        <div class="p-10">
                            <com-form
                                inline
                                query
                                :model="queryParams"
                                :formItem="[
                                    {
                                        label: '姓名',
                                        prop: 'likeName',
                                    },
                                ]"
                                @searchFn="$refs.table.reload()"
                                @resetFn="$refs.table.reload()"
                            />
                        </div>
                    </div>
                    <!-- 表格部分 -->
                    <xdh-list-panel ref="table" :loadFn="loadData" :total="state.total">
                        <xdh-table :data="state.list" :columns="state.columns" @sort-change="sortChange">
                            <template #index="{ row }">
                                <img
                                    v-if="[1, 2, 3].includes(row.index)"
                                    style="width: 24px; vertical-align: middle"
                                    :src="getImgUrl(`../assets/img/homepage/${row.index === 1 ? 'jin' : row.index === 2 ? 'yin' : 'tong'}.svg`)"
                                />
                                <span v-else>{{ row.index }}</span>
                            </template>
                        </xdh-table>
                    </xdh-list-panel>
                </div>
            </el-col>
            <el-col :span="12" class="h100 flex-col p-l-5">
                <div class="h100 flex-col">
                    <div class="system-page-background b-r-4">
                        <div class="fw" style="font-size: 16px; color: #5a607f; padding: 20px 10px; border-bottom: 1px solid #e6e9f4">部门成绩排名</div>
                        <!-- 条件查询部分 -->
                        <div class="p-10">
                            <com-form
                                inline
                                query
                                :model="queryParams2"
                                :formItem="[
                                    {
                                        label: '部门',
                                        prop: 'likeDeptName',
                                    },
                                ]"
                                @searchFn="$refs.table2.$refs.table.reload()"
                                @resetFn="$refs.table2.$refs.table.reload()"
                            />
                        </div>
                    </div>
                    <!-- 表格部分 -->
                    <xdh-list-panel ref="table2" :loadFn="loadData2" :total="state2.total">
                        <xdh-table :data="state2.list" :columns="state2.columns" @sort-change="sortChange2">
                            <template #index="{ row }">
                                <img
                                    v-if="[1, 2, 3].includes(row.index)"
                                    style="width: 24px; vertical-align: middle"
                                    :src="getImgUrl(`../assets/img/homepage/${row.index === 1 ? 'jin' : row.index === 2 ? 'yin' : 'tong'}.svg`)"
                                />
                                <span v-else>{{ row.index }}</span>
                            </template>
                        </xdh-table>
                    </xdh-list-panel>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { achievementTrain, deptAchievementTrain } from '@/api/homepage.js';

export default {
    data() {
        return {
            loading: false,
            queryParams: {
                likeName: '',
                achievement: false,
            },
            queryParams2: {
                likeDeptName: '',
                achievement: false,
            },
            state: {
                columns: [
                    { label: '排名', prop: 'index', align: 'center' },
                    { label: '工号', prop: 'jobNumber', align: 'center' },
                    { label: '姓名', prop: 'name', align: 'center' },
                    { label: '平均成绩', prop: 'achievement', align: 'center', sortable: true },
                ],
                list: [],
                total: 0,
            },
            state2: {
                columns: [
                    { label: '排名', prop: 'index', align: 'center' },
                    { label: '部门', prop: 'deptName', align: 'center' },
                    { label: '平均分', prop: 'achievement', align: 'center', sortable: true },
                ],
                list: [],
                total: 0,
            },
        };
    },
    methods: {
        // 表格排序
        sortChange({ column, prop, order }) {
            this.queryParams[prop] = order === 'ascending'; // true为升序false为降序
            this.$refs?.table?.reload?.();
        },
        // 表格排序
        sortChange2({ column, prop, order }) {
            this.queryParams2[prop] = order === 'ascending'; // true为升序false为降序
            this.$refs?.table2?.reload?.();
        },
        loadData(pageNum, pageSize) {
            return achievementTrain({ pageNum, pageSize, needCount: 1, ...this.queryParams }).then((res) => {
                this.state.total = res.data?.total;
                this.state.list = res.data?.rows;
            });
        },
        loadData2(pageNum, pageSize) {
            return deptAchievementTrain({ pageNum, pageSize, needCount: 1, ...this.queryParams2 }).then((res) => {
                this.state2.total = res.data?.total;
                this.state2.list = res.data?.rows;
            });
        },
    },
};
</script>

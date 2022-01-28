<template>
    <div class="w100 h100">
        <transition-group name="fade-transform">
            <div class="page" style="overflow-y: auto" v-loading="loading" key="1" v-show="showKey === 1">
                <div class="p-t-10 p-b-20" style="font-size: 20px; font-weight: 600">
                    <span style="color: #3a3f63">首页</span>
                    <span class="m-l-5 m-r-5">/</span>
                    <span style="color: #7f88b4">你好· {{ $store.state.user.userInfo.nickName }} </span>
                </div>
                <div class="system-page-background b-r-6 m-b-10">
                    <div class="msg">消息统计</div>
                    <div class="flex p-20">
                        <div class="flex f1 w0 m-between">
                            <div v-for="item in msgList" :key="item.name">
                                <div style="color: #6a74a5">{{ item.name }}</div>
                                <xdh-number style="font-size: 20px" class="fw m-t-10" type="info" :value="dealtData[item.key]">
                                    <template #suffix>
                                        <span style="color: #6973a7">个</span>
                                    </template>
                                </xdh-number>
                            </div>
                        </div>
                        <div style="width: 380px" class="tc">
                            <img :src="getImgUrl(`../assets/img/homepage/Image.svg`)" style="margin-top: -110px" />
                        </div>
                    </div>
                </div>

                <div class="system-page-background b-r-6">
                    <div class="p-14 fw" style="border-bottom: 1px solid #e6e9f4; font-size: 16px">快捷入口</div>
                    <div class="p-10 flex m-between">
                        <div v-for="(item, i) in entrance" :key="item" class="tc f1 w0 flex-center">
                            <span class="inline pointer entrance" @click="routerFn(item.path, item.params)">
                                <img class="img" :src="getImgUrl(`../assets/img/homepage/Icon${i + 1}.svg`)" />
                                <div style="font-size: 15px; font-weight: 600; color: #3a3f63">{{ item.name }}</div>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="flex m-t-10 m-h-450">
                    <div class="left1 system-page-background b-r-6 h100 flex-col">
                        <div class="title">设备统计</div>
                        <div class="f1 h0 overflow-hidden" style="position: relative">
                            <div style="position: absolute; left: 7%; bottom: 8%">
                                <xdh-number style="font-size: 24px" class="fw m-b-10" type="info" :value="deviceData.total" suffix="个" />
                                <div style="font-size: 16px; font-weight: 500; color: #6a74a5">设备总数</div>
                            </div>
                            <xdh-echarts :options="left1Options" width="100%" height="150%" />
                        </div>
                    </div>
                    <div class="right1 system-page-background b-r-6 h100 flex-col">
                        <div class="title">载体统计</div>
                        <div class="flex m-between" style="padding: 12px 60px; border-bottom: 1px solid #e6e9f4">
                            <div v-for="item in carrierList" :key="item.name">
                                <span style="color: #6a74a5">{{ item.name }}：</span>
                                <xdh-number style="font-size: 20px" class="fw" type="default" :value="carrierData[item.key]" suffix="个" />
                            </div>
                        </div>
                        <div class="f1 h0">
                            <xdh-echarts :options="right1Options" />
                        </div>
                    </div>
                </div>

                <div class="flex m-t-10" style="min-height: 440px">
                    <div class="left2 system-page-background b-r-6 h100 flex-col">
                        <div class="title">
                            培训统计
                            <span class="fr info" @click="showKeyFn(2)">查看排名详情<i class="el-icon-caret-right" /> </span>
                        </div>
                        <div class="flex m-between" style="padding: 40px 60px 0">
                            <div v-for="item in trainList" :key="item.name">
                                <xdh-number style="font-size: 28px" class="fw" type="default" :value="homeTrainData[item.key]" :suffix="item.suffix" />
                                <div style="color: #6a74a5">{{ item.name }}</div>
                            </div>
                        </div>
                        <div class="f1 h0 flex m-between p-20">
                            <div class="h100 flex-col b-r-8" style="background: #f4f7ff; width: calc(50% - 10px)">
                                <div class="paiming">本年个人排名</div>
                                <xdh-table
                                    :columnFilter="false"
                                    :columns="[
                                        { label: '排名', prop: 'index', align: 'center' },
                                        { label: '工号', prop: 'jobNumber', align: 'center' },
                                        { label: '姓名', prop: 'name', align: 'center' },
                                        { label: '平均成绩', prop: 'achievement', align: 'center' },
                                    ]"
                                    :data="data1"
                                >
                                    <template #index="{ row }">
                                        <img
                                            style="width: 30px; vertical-align: middle"
                                            :src="getImgUrl(`../assets/img/homepage/${row.index === 1 ? 'jin' : row.index === 2 ? 'yin' : 'tong'}.svg`)"
                                        />
                                    </template>
                                </xdh-table>
                            </div>
                            <div class="h100 flex-col b-r-8" style="background: #f4f7ff; width: calc(50% - 10px)">
                                <div class="paiming">本年部门排名</div>
                                <xdh-table
                                    :columnFilter="false"
                                    :columns="[
                                        { label: '排名', prop: 'index', align: 'center' },
                                        { label: '部门', prop: 'deptName', align: 'center' },
                                        { label: '平均分', prop: 'achievement', align: 'center' },
                                    ]"
                                    :data="data2"
                                >
                                    <template #index="{ row }">
                                        <img
                                            style="width: 30px; vertical-align: middle"
                                            :src="getImgUrl(`../assets/img/homepage/${row.index === 1 ? 'jin' : row.index === 2 ? 'yin' : 'tong'}.svg`)"
                                        />
                                    </template>
                                </xdh-table>
                            </div>
                        </div>
                    </div>
                    <div class="right2 system-page-background b-r-6 h100 flex-col">
                        <div class="title">人员统计</div>
                        <div class="f1 h0 flex-col">
                            <xdh-echarts :options="right2Options" class="f1 h0" />
                            <div class="tc flex-center card">
                                <div class="f1 w0">
                                    <xdh-number style="font-size: 30px" class="fw m-b-10" type="warning" :value="workerSecrecyData.takeGradeNum">
                                        <template #suffix>
                                            <span style="color: #ffb11f">人</span>
                                        </template>
                                    </xdh-number>
                                    <div style="color: #6a74a5">脱密中人数</div>
                                </div>
                                <div class="f1 w0">
                                    <xdh-number style="font-size: 30px" class="fw m-b-10" type="danger" :value="workerSecrecyData.alreadyGradeNum">
                                        <template #suffix>
                                            <span style="color: #1ec6b8">人</span>
                                        </template>
                                    </xdh-number>
                                    <div style="color: #6a74a5">已脱密人数</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <train key="2" v-if="showKey === 2" @cancel="showKeyFn(1)" />
        </transition-group>
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { homeDealt, homeDevice, homeCarrier, homeWorkerSecrecy, homeTrain, achievementTrain, deptAchievementTrain } from '@/api/homepage';

export default {
    data() {
        return {
            loading: false,
            showKey: 1,
            msgList: [
                {
                    name: '涉密信息待补全',
                    key: 'classifiedCompleteNum',
                },
                {
                    name: '人员待复审',
                    key: 'workerReviewNum',
                },
                {
                    name: '设备待归还',
                    key: 'deviceToBeReturnedNum',
                },
                {
                    name: '载体待归还',
                    key: 'carrierToBeReturnedNum',
                },
                {
                    name: '本月脱密成功',
                    key: 'monthDeclassifiedNum',
                },
            ],
            dealtData: {
                classifiedCompleteNum: 0, //涉密信息待办补全
                workerReviewNum: 0, //人员待复审
                deviceToBeReturnedNum: 0, //设备待归还
                carrierToBeReturnedNum: 0, //载体待规划
                monthDeclassifiedNum: 0, //本月脱密成功
            },
            entrance: [
                { name: '新建人员', path: '/personnel/information', params: { type: 'insert' } },
                { name: '新建培训', path: '/personnel/train', params: { type: 'insert' } },
                { name: '新增设备', path: '/equipment/Einformation', params: { type: 'insert' } },
                { name: '制作载体', path: '/carrier/Cinformation', params: { type: 'production' } },
                { name: '接收载体', path: '/carrier/Cinformation', params: { type: 'receive' } },
                { name: '创建移交单', path: '/carrier/transfer', params: { type: 'insert' } },
                { name: '销毁申请登记', path: '/carrier/destroy', params: { type: 'insert' } },
                { name: '新建用户', path: '/system/user', params: { type: 'insert' } },
            ],
            carrierList: [
                {
                    name: '载体总数',
                    key: 'total',
                },
                {
                    name: '自制载体数',
                    key: 'makeNum',
                },
                {
                    name: '接收载体数',
                    key: 'receiveNum',
                },
            ],
            trainList: [
                {
                    name: '至今培训次数',
                    key: 'frequency',
                    suffix: '次',
                },
                {
                    name: '至今培训总时长',
                    key: 'duration',
                    suffix: '小时',
                },
                {
                    name: '本年培训次数',
                    key: 'thisYearFrequency',
                    suffix: '次',
                },
                {
                    name: '平均培训时长',
                    key: 'thisYearDuration',
                    suffix: '小时',
                },
            ],
            data1: [],
            data2: [],
            // 设备统计
            deviceData: {
                total: 0,
                libraryNum: 0,
                lendNum: 0,
                deactivateNum: 0,
                destroyNum: 0,
            },
            // 载体统计
            carrierData: {
                total: 0,
                libraryNum: 0,
                lendNum: 0,
                inTransferNum: 0,
                overTransferNum: 0,
                inDestroyNum: 0,
                inDestroyIngNum: 0,
                overDestroyNum: 0,
                abnormalNum: 0,
                makeNum: 0,
                receiveNum: 0,
            },
            // 人员统计
            workerSecrecyData: {
                notGradeNum: 0, //非密
                ingGradeNum: 0, // 一般
                finishGradeNum: 0, //重要
                onTheJobNum: 0, //在职
                takeGradeNum: 0, //脱密中
                alreadyGradeNum: 0, //已脱密
            },
            // 培训次数统计
            homeTrainData: {
                frequency: 0, //至今培训次数
                duration: 0, //至今培训时长
                thisYearFrequency: 0, //本年培训次数
                thisYearDuration: 0, //本年培训时长
            },
        };
    },
    components: {
        train: defineAsyncComponent(() => import('./train.vue')),
    },
    computed: {
        left1Options() {
            const { total, libraryNum, lendNum, deactivateNum, destroyNum } = this.deviceData;
            const data = [
                {
                    name: '归库数',
                    value: libraryNum,
                },
                {
                    name: '停用数',
                    value: deactivateNum,
                },
                {
                    name: '借出数',
                    value: lendNum,
                },
                {
                    name: '销毁数',
                    value: destroyNum,
                },
            ];
            const color = ['#FFAF65', '#4441DE', '#60C695', '#F34F80'];
            let arrName = this.getArrayValue(data, 'name');
            let objData = this.array2obj(data, 'name');
            let series = [];
            data.forEach((item, i) => {
                series.push({
                    name: '设备统计',
                    type: 'pie',
                    startAngle: 180,
                    clockWise: true, //顺时加载
                    hoverAnimation: false, //鼠标移入变大
                    radius: [90 - i * 15 + '%', 85 - i * 15 + '%'],
                    center: ['50%', '50%'],
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    itemStyle: {
                        borderRadius: 100,
                    },
                    data: [
                        {
                            value: data[i].value,
                            name: data[i].name,
                        },
                        {
                            value: total * 2 - data[i].value,
                            name: '',
                            itemStyle: {
                                color: 'rgba(0,0,0,0)',
                                borderWidth: 0,
                            },
                            tooltip: {
                                show: false,
                            },
                            hoverAnimation: true,
                        },
                    ],
                });
                series.push({
                    name: '',
                    type: 'pie',
                    startAngle: 180,
                    silent: true,
                    z: 1,
                    clockWise: true, //顺时加载
                    radius: [88 - i * 15 + '%', 87 - i * 15 + '%'],
                    center: ['50%', '50%'],
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    itemStyle: {
                        borderCap: 'round',
                    },
                    data: [
                        {
                            value: 5,
                            itemStyle: {
                                color: '#EEEEEE',
                                borderWidth: 0,
                            },
                            tooltip: {
                                show: false,
                            },
                            hoverAnimation: false,
                        },
                        {
                            value: 5,
                            name: '',
                            itemStyle: {
                                color: 'rgba(0,0,0,0)',
                                borderWidth: 0,
                            },
                            tooltip: {
                                show: false,
                            },
                            hoverAnimation: false,
                        },
                    ],
                });
            });
            return {
                legend: [
                    {
                        show: true,
                        icon: 'roundRect',
                        orient: 'vertical',
                        top: '52%',
                        left: '40%',
                        data: arrName.filter((item, index) => index <= 1),
                        formatter: function (name) {
                            if (name === '归库数') {
                                return '{title|' + name + '} {value1|' + objData[name].value + '个}';
                            } else {
                                return '{title|' + name + '} {value2|' + objData[name].value + '个}';
                            }
                        },
                        textStyle: {
                            rich: {
                                title: {
                                    fontSize: 14,
                                    color: '#6A74A5',
                                },
                                value1: {
                                    fontSize: 20,
                                    color: color[0],
                                },
                                value2: {
                                    fontSize: 20,
                                    color: color[1],
                                },
                            },
                        },
                    },
                    {
                        show: true,
                        orient: 'vertical',
                        icon: 'roundRect',
                        top: '52%',
                        right: '7%',
                        data: arrName.filter((item, index) => index > 1),
                        formatter: function (name) {
                            if (name === '借出数') {
                                return '{title|' + name + '} {value1|' + objData[name].value + '个}';
                            } else {
                                return '{title|' + name + '} {value2|' + objData[name].value + '个}';
                            }
                        },
                        textStyle: {
                            rich: {
                                title: {
                                    fontSize: 14,
                                    color: '#6A74A5',
                                },
                                value1: {
                                    fontSize: 20,
                                    color: color[2],
                                },
                                value2: {
                                    fontSize: 20,
                                    color: color[3],
                                },
                            },
                        },
                    },
                ],
                tooltip: {
                    trigger: 'item',
                },
                color: color,
                series,
            };
        },
        right1Options() {
            const { libraryNum, lendNum, inTransferNum, overTransferNum, inDestroyNum, inDestroyIngNum, overDestroyNum, abnormalNum } = this.carrierData;
            const data = [
                { value: libraryNum, name: '归库' },
                { value: inTransferNum, name: '移交中' },
                { value: overTransferNum, name: '已移交' },
                { value: lendNum, name: '使用中' },
                { value: inDestroyNum, name: '待销毁' },
                { value: inDestroyIngNum, name: '销毁中' },
                { value: overDestroyNum, name: '已销毁' },
                { value: abnormalNum, name: '异常' },
            ];
            let arrName = this.getArrayValue(data, 'name');
            let objData = this.array2obj(data, 'name');
            return {
                legend: [
                    {
                        show: true,
                        icon: 'circle',
                        orient: 'vertical',
                        top: '25%',
                        left: '50%',
                        itemGap: 40,
                        data: arrName.filter((item, index) => index <= 3),
                        formatter: function (name) {
                            return '{title|' + name + '} {value|' + objData[name].value + '个}';
                        },
                        textStyle: {
                            rich: {
                                title: {
                                    fontSize: 14,
                                    color: '#6A74A5',
                                    width: 50,
                                },
                                value: {
                                    fontSize: 20,
                                    color: '#3A3E64',
                                },
                            },
                        },
                    },
                    {
                        show: true,
                        orient: 'vertical',
                        icon: 'circle',
                        top: '25%',
                        left: '75%',
                        itemGap: 40,
                        data: arrName.filter((item, index) => index > 3),
                        formatter: function (name) {
                            return '{title|' + name + '} {value|' + objData[name].value + '个}';
                        },
                        textStyle: {
                            rich: {
                                title: {
                                    fontSize: 14,
                                    color: '#6A74A5',
                                    width: 50,
                                },
                                value: {
                                    fontSize: 20,
                                    color: '#3A3E64',
                                },
                            },
                        },
                    },
                ],
                tooltip: {
                    trigger: 'item',
                },
                color: ['#4C78FF', '#16DBCC', '#FF82AC', '#FFBB38', '#94FFF7', '#0098FF', '#FFF34C', '#FF0076'],
                series: [
                    {
                        name: '载体统计',
                        type: 'pie',
                        radius: ['25%', '80%'],
                        center: ['25%', '50%'],
                        roseType: 'radius',
                        label: {
                            show: false,
                        },
                        data: data,
                    },
                ],
            };
        },
        right2Options() {
            let { finishGradeNum, ingGradeNum, notGradeNum, onTheJobNum } = this.workerSecrecyData;
            const data = [
                { value: finishGradeNum, name: '重要' },
                { value: notGradeNum, name: '非涉密' },
                { value: ingGradeNum, name: '一般' },
            ];
            return {
                title: {
                    text: onTheJobNum + '人',
                    left: 'center',
                    top: '42%',
                    textStyle: {
                        color: '#3A3F63',
                        fontSize: 20,
                        fontWeight: 700,
                    },
                },
                graphic: {
                    type: 'text',
                    left: 'center',
                    top: '52%',
                    style: {
                        text: '在职人数',
                        textAlign: 'center',
                        fill: '#6A74A5',
                        fontSize: 14,
                    },
                },
                tooltip: {
                    trigger: 'item',
                },
                color: ['#4458FE', '#d6dcef', '#C2D1FF'],
                series: [
                    {
                        name: '人员统计',
                        type: 'pie',
                        minAngle: 20,
                        radius: ['30%', '70%'],
                        center: ['50%', '50%'],
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 5,
                        },
                        label: {
                            show: true,
                            formatter: '{c|{c}人}\n {b|{b}}',
                            rich: {
                                b: {
                                    fontSize: 14,
                                    color: '#3A3F63',
                                    lineHeight: 20,
                                },
                                c: {
                                    fontWeight: 'bold',
                                    lineHeight: 20,
                                    fontSize: 18,
                                    color: '#6A74A5',
                                },
                            },
                        },
                        data,
                    },
                ],
            };
        },
    },
    methods: {
        showKeyFn(item) {
            this.showKey = null;
            setTimeout(() => {
                this.showKey = item;
            }, 300);
        },
        getArrayValue(array, key) {
            var key = key || 'value';
            var res = [];
            if (array) {
                array.forEach((t) => {
                    res.push(t[key]);
                });
            }
            return res;
        },
        array2obj(array, key) {
            var resObj = {};
            for (var i = 0, len = array.length; i < len; i++) {
                resObj[array[i][key]] = array[i];
            }
            return resObj;
        },
        homeDealt() {
            homeDealt().then((res) => {
                this.dealtData = res?.data || this.dealtData;
            });
        },
        homeDevice() {
            homeDevice().then((res) => {
                this.deviceData = res?.data || this.deviceData;
            });
        },
        homeCarrier() {
            homeCarrier().then((res) => {
                this.carrierData = res?.data || this.carrierData;
            });
        },
        homeWorkerSecrecy() {
            homeWorkerSecrecy().then((res) => {
                this.workerSecrecyData = res?.data || this.workerSecrecyData;
            });
        },
        homeTrain() {
            homeTrain().then((res) => {
                this.homeTrainData = res?.data || this.homeTrainData;
            });
        },
        achievementTrain() {
            achievementTrain({ pageNum: 1, pageSize: 3, achievement: false }).then((res) => {
                this.data1 = res?.data?.rows || [];
            });
        },
        deptAchievementTrain() {
            deptAchievementTrain({ pageNum: 1, pageSize: 3, achievement: false }).then((res) => {
                this.data2 = res?.data?.rows || [];
            });
        },
        // 路由跳转
        routerFn(path, params) {
            if (this.$store.state.guarder.RoutersList.some((item) => item === path)) {
                this.$router.push({ name: path.split('/').pop(), params });
            } else {
                this.msgInfo('暂无权限！');
            }
        },
    },
    created() {
        this.loading = true;
        Promise.race([
            this.homeDealt(),
            this.homeDevice(),
            this.homeCarrier(),
            this.homeWorkerSecrecy(),
            this.homeTrain(),
            this.achievementTrain(),
            this.deptAchievementTrain(),
        ]).finally(() => {
            this.loading = false;
        });
    },
};
</script>

<style lang="scss" scoped>
.is_fixed {
    width: 100%;
    position: fixed;
    top: 0;
    z-index: 999;
}
.msg {
    display: inline-block;
    padding: 6px 14px;
    margin-left: 10px;
    background: #2510d7;
    border-radius: 0px 0px 10px 10px;
    font-weight: 600;
    color: #ffffff;
    font-size: 16px;
}
// .entrance {
//     .img {
//         transition: all 0.3s;
//     }
//     &:hover {
//         .img {
//             transform: translateY(-5px);
//         }
//     }
// }
.title {
    font-weight: 600;
    padding: 10px 14px;
    color: #131523;
    border-bottom: 1px solid #e6e9f4;
    font-size: 16px;
    .info {
        font-size: 14px;
        color: #5769fe;
        cursor: pointer;
        transition: all 0.3s;
        &:hover {
            transform: translateX(10px);
        }
    }
}
.left1 {
    width: calc(40% - 10px);
    margin-right: 10px;
}
.right1 {
    width: 60%;
}

.left2 {
    width: 60%;
}
.right2 {
    width: calc(40% - 10px);
    margin-left: 10px;
}
.paiming {
    height: 24px;
    font-size: 14px;
    font-weight: 600;
    color: #ffc146;
    line-height: 24px;
    background: linear-gradient(360deg, #ffc146 0%, #ec0000 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    padding: 10px;
}
:deep() {
    .el-table {
        background-color: transparent;
        &::before {
            height: 0;
        }
        th.el-table__cell {
            background-color: #ecf1ff;
        }
        tr {
            background-color: transparent;
        }
    }
}
.card {
    box-shadow: 0px 4px 16px 0px rgb(179 192 231 / 32%);
    border-radius: 8px;
    width: 80%;
    margin: 0 auto 20px;
    padding: 14px;
    > div:first-child {
        border-right: 1px solid #e6e9f4;
    }
}
</style>

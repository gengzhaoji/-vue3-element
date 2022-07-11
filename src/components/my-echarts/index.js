import myEcharts from './my-echarts.vue';

myEcharts.install = function (Vue) {
    Vue.component(myEcharts.name, myEcharts);
};
export default myEcharts;

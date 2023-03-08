import MyPrint from './my-print.vue';

MyPrint.install = function (Vue) {
    Vue.component('MyPrint', MyPrint);
};
export default MyPrint;

import myPrint from './xdh-print.vue';

myPrint.install = function (Vue) {
    Vue.component(myPrint.name, myPrint);
};
export default myPrint;

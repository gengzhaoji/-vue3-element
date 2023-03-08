import MyNumber from './my-number.vue';

MyNumber.install = function (Vue) {
    Vue.component('MyNumber', MyNumber);
};

export default MyNumber;

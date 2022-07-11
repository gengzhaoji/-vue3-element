import myNumber from './my-number.vue';

myNumber.install = function (Vue) {
    Vue.component(myNumber.name, myNumber);
};

export default myNumber;

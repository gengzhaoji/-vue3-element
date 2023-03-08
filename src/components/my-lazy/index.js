import MyLazy from './my-lazy.vue';

MyLazy.install = function (Vue) {
    Vue.component('MyLazy', MyLazy);
};
export default MyLazy;

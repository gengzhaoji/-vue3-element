import MyHeader from './my-header.vue';

MyHeader.install = function (Vue) {
    Vue.component('MyHeader', MyHeader);
};
export default MyHeader;

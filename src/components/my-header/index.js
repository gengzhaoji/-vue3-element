import MyHeader from './my-header.vue';

MyHeader.install = function (Vue) {
    Vue.component(MyHeader.name, MyHeader);
};
export default MyHeader;

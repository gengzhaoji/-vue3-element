import MyButtonExport from './my-button-export.vue';

MyButtonExport.install = function (Vue) {
    Vue.component('MyButtonExport', MyButtonExport);
};

export default MyButtonExport;

import MyTable from './my-table.vue';

MyTable.install = function (Vue) {
    Vue.component('MyTable', MyTable);
};

export default MyTable;

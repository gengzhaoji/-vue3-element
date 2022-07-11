import myTable from './my-table.vue';

myTable.install = function (Vue) {
    Vue.component(myTable.name, myTable);
};

export default myTable;

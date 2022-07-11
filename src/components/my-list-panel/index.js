import myListPanel from './my-list-panel.vue';

myListPanel.install = function (Vue) {
    Vue.component(myListPanel.name, myListPanel);
};
export default myListPanel;

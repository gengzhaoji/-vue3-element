import MyPanel from './my-panel2.vue';

MyPanel.install = function (Vue) {
    Vue.component(MyPanel.name, MyPanel);
};
export default MyPanel;

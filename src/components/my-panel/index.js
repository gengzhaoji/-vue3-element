import MyPanel from './my-panel.vue';

MyPanel.install = function (Vue) {
    Vue.component('MyPanel', MyPanel);
};
export default MyPanel;

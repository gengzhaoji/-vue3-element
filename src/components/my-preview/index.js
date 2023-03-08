import MyPreview from './my-preview.vue';

MyPreview.install = function (Vue) {
    Vue.component('MyPreview', MyPreview);
};
export default MyPreview;

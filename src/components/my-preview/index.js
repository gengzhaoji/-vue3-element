import MyPreview from './my-preview.vue';

MyPreview.install = function (Vue) {
    Vue.component(MyPreview.name, MyPreview);
};
export default MyPreview;

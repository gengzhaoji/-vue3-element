import myImgUpload from './my-img-upload.vue';

myImgUpload.install = function (Vue) {
    Vue.component(myImgUpload.name, myImgUpload);
};
export default myImgUpload;

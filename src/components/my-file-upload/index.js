import myFileUpload from './my-file-upload.vue';

myFileUpload.install = function (Vue) {
    Vue.component(myFileUpload.name, myFileUpload);
};
export default myFileUpload;

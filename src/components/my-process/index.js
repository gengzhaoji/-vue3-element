import MyProcess from './my-process.vue';

MyProcess.install = function (Vue) {
    Vue.component('MyProcess', MyProcess);
};

export default MyProcess;

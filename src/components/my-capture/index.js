import myCapture from './my-capture.vue';

myCapture.install = function (Vue) {
    Vue.component(myCapture.name, myCapture);
};

export default myCapture;

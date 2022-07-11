import MyTimer from './my-timer.vue';

MyTimer.install = function (Vue) {
    Vue.component(MyTimer.name, MyTimer);
};

export default MyTimer;

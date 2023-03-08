import MyTimer from './my-timer.vue';

MyTimer.install = function (Vue) {
    Vue.component('MyTimer', MyTimer);
};

export default MyTimer;

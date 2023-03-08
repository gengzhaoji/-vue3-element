import MyMarquee from './my-marquee.vue';

MyMarquee.install = function (Vue) {
    Vue.component('MyMarquee', MyMarquee);
};

export default MyMarquee;

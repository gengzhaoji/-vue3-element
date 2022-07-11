import MyMarquee from './my-marquee.vue';

MyMarquee.install = function (Vue) {
    Vue.component(MyMarquee.name, MyMarquee);
};

export default MyMarquee;

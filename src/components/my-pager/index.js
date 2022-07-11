import myPager from './my-pager.vue';

myPager.install = function (Vue) {
    Vue.component(myPager.name, myPager);
};
export default myPager;

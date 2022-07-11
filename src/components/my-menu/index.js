import myMenu from './my-menu.vue';

myMenu.install = function (Vue) {
    Vue.component(myMenu.name, myMenu);
};
export default myMenu;

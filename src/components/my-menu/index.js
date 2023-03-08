import MyMenu from './my-menu.vue';

MyMenu.install = function (Vue) {
    Vue.component('MyMenu', MyMenu);
};
export default MyMenu;

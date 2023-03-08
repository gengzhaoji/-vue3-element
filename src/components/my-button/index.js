import MyButton from './my-button.vue';

MyButton.install = function (Vue) {
    Vue.component('MyButton', MyButton);
};

export default MyButton;

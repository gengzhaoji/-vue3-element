import MyEditor from './my-editor.vue';

MyEditor.install = function (Vue) {
    Vue.component('MyEditor', MyEditor);
};

export default MyEditor;

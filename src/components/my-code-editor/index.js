import MyCodeEditor from './my-code-editor.vue';

MyCodeEditor.install = function (Vue) {
    Vue.component('MyCodeEditor', MyCodeEditor);
};

export default MyCodeEditor;

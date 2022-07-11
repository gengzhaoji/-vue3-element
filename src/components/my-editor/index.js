import myEditor from './my-editor.vue';

myEditor.install = function (Vue) {
    Vue.component(myEditor.name, myEditor);
};

export default myEditor;

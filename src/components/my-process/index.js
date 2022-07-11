// import workflowBpmnModeler from './index.vue'

// workflowBpmnModeler.install = Vue => Vue.component(workflowBpmnModeler.name, workflowBpmnModeler) // 给组件配置install方法

// export default workflowBpmnModeler
import myProcess from './my-process.vue';

myProcess.install = function (Vue) {
    Vue.component(myProcess.name, myProcess);
};

export default myProcess;

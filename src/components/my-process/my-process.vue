<template>
    <div v-loading="isView" :class="['flow-containers', { 'view-mode': isView }]">
        <div class="h100 flex-col">
            <div style="border-bottom: 1px solid rgb(218 218 218)" class="p-10">
                <el-tooltip effect="dark" content="新建" placement="bottom">
                    <my-button icon="circle-plus" @click="newDiagram" />
                </el-tooltip>
                <el-tooltip effect="dark" content="自适应屏幕" placement="bottom">
                    <my-button icon="Rank" @click="fitViewport" />
                </el-tooltip>
                <el-tooltip effect="dark" content="放大" placement="bottom">
                    <my-button icon="zoom-in" @click="zoomViewport(true)" />
                </el-tooltip>
                <el-tooltip effect="dark" content="缩小" placement="bottom">
                    <my-button icon="zoom-out" @click="zoomViewport(false)" />
                </el-tooltip>
                <el-tooltip effect="dark" content="后退" placement="bottom">
                    <my-button icon="Back" @click="modeler.get('commandStack').undo()" />
                </el-tooltip>
                <el-tooltip effect="dark" content="前进" placement="bottom">
                    <my-button icon="Right" @click="modeler.get('commandStack').redo()" />
                </el-tooltip>
                <el-tooltip effect="dark" content="查看xml" placement="bottom">
                    <my-button icon="View" @click="showXML" />
                </el-tooltip>
                <el-tooltip effect="dark" content="下载xml" placement="bottom">
                    <my-button icon="Download" @click="saveXML(true)" />
                </el-tooltip>
                <el-tooltip effect="dark" content="下载svg" placement="bottom">
                    <my-button icon="Picture" @click="saveImg('svg', true)" />
                </el-tooltip>
                <my-button type="primary" @click="save">保存模型</my-button>
            </div>
            <el-container style="align-items: stretch">
                <el-main style="padding: 0">
                    <div ref="canvas" class="canvas" />
                </el-main>
                <el-aside style="width: 500px; background-color: #f0f2f5; border-left: 1px solid var(--el-border-color)" class="h100">
                    <my-panel fit shadow="always" :title="nodeName" size="large" theme="bg-right" icon="Menu">
                        <!-- bpmn:UserTask(用户任务) -->
                        <my-form
                            label-width="90px"
                            :model="formData"
                            :formItem="[
                                { label: 'ID', prop: 'id', required: true },
                                { label: '名称', prop: 'name', required: true },
                                { label: '分组', prop: 'group', show: formData.$type === 'bpmn:Process', required: true },
                                { label: '审批方式', prop: 'userType', show: formData.$type === 'bpmn:UserTask', required: true },
                                { label: '用户', prop: 'keys', show: formData.$type === 'bpmn:UserTask' && formData.userType == '1', required: true },
                                { label: '岗位', prop: 'keys', show: formData.$type === 'bpmn:UserTask' && formData.userType == '2', required: true },
                                { label: '审批类型', prop: 'approveType', show: formData.$type === 'bpmn:UserTask', required: true },
                                { label: '表达式', prop: 'expressions', show: formData.$type === 'bpmn:SequenceFlow' },
                                { itemType: 'number', label: '优先级', prop: 'priority', show: formData.$type === 'bpmn:SequenceFlow', required: true },
                                {
                                    itemType: 'select',
                                    label: '服务类型',
                                    prop: 'class',
                                    list: [{ dictLabel: '抄送', dictValue: 'com.rundow.goffice.model.delegate.CopyDelegate' }],
                                    show: formData.$type === 'bpmn:ServiceTask',
                                    required: true,
                                },
                                { label: '抄送人', prop: 'fileIds', show: formData.class == 'com.rundow.goffice.model.delegate.CopyDelegate', required: true },
                            ]"
                        >
                            <template #approveType>
                                <el-radio-group v-model="formData.approveType">
                                    <el-radio label="1" size="large">或签(一名成员同意即可)</el-radio>
                                    <el-radio label="2" size="large">会签(须所有成员同意即可)</el-radio>
                                </el-radio-group>
                            </template>
                            <template #userType>
                                <el-radio-group v-model="formData.userType" @change="formData.keys = []">
                                    <el-radio label="1" size="large">指定成员</el-radio>
                                    <el-radio label="2" size="large">指定岗位负责人</el-radio>
                                </el-radio-group>
                            </template>
                            <template #keys>
                                <template v-if="formData.userType == '1'">
                                    <el-tree-select
                                        v-model="formData.keys"
                                        :data="$store.com.deptUserListFilter"
                                        :render-after-expand="false"
                                        multiple
                                        :props="{
                                            children: 'children',
                                            label: 'deptName',
                                            value: 'id',
                                            isLeaf: 'leaf',
                                        }"
                                    />
                                </template>
                                <template v-if="formData.userType == '2'">
                                    <my-select v-model="formData.keys" :list="postList" multiple show-checkbox />
                                </template>
                            </template>
                            <template #fileIds>
                                <!-- 选择抄送人 -->
                                <el-tree-select
                                    v-model="formData.users"
                                    :data="$store.com.deptUserListFilter"
                                    :render-after-expand="false"
                                    multiple
                                    :props="{
                                        children: 'children',
                                        label: 'deptName',
                                        value: 'id',
                                        isLeaf: 'leaf',
                                    }"
                                />
                            </template>
                        </my-form>
                    </my-panel>
                </el-aside>
            </el-container>
        </div>
    </div>
</template>

<script setup name="my-process">
import Modeler from 'bpmn-js/lib/Modeler';
import FlowModeler from './flow';
import BpmData from './BpmData';
import { guid } from '@u/util';
import { parse } from '@u/url';
import { NodeName } from './flow/lang/translations';
import { computed, inject, onMounted, watch } from 'vue';
import { listPost } from '@a/system';
const $vm = inject('$vm');
const $emit = defineEmits(['showXML', 'save']);
const props = defineProps({
    xml: {
        type: String,
        default: '',
    },
    users: {
        type: Array,
        default: () => [],
    },
    groups: {
        type: Array,
        default: () => [],
    },
    categorys: {
        type: Array,
        default: () => [],
    },
    isView: {
        type: Boolean,
        default: false,
    },
    taskList: {
        type: Array,
        default: () => [],
    },
});
let formData = $ref({});
let modeler = $ref(null);
let element = null;
let _element = $ref(null);
let zoom = 1;

watchEffect(() => {
    if (props.xml) createNewDiagram(props.xml);
});
watchEffect(() => {
    if (formData.name) updateProperties({ name: formData.name });
});
watchEffect(() => {
    if (formData.approveType) updateProperties({ approveType: formData.approveType });
});
watchEffect(() => {
    if (formData.userType) updateProperties({ approveType: formData.userType });
});
watchEffect(() => {
    if (formData.keys?.length) updateProperties({ keys: formData.keys.join(',') });
});
watchEffect(() => {
    if (formData.class) updateProperties({ class: formData.class });
});
watchEffect(() => {
    if (formData.users?.length) updateProperties({ fileIds: `users=${formData.users.join(',')}` });
});

let nodeName = computed(() => {
    if (_element) {
        const bizObj = _element.businessObject;
        const type = bizObj?.eventDefinitions ? bizObj.eventDefinitions[0].$type : bizObj.$type;
        return NodeName[type] || type;
    }
    return '';
});
let getComponent = computed(() => {
    const type = _element?.type;
    if (['bpmn:IntermediateThrowEvent', 'bpmn:StartEvent', 'bpmn:EndEvent'].includes(type)) {
        return 'startEndPanel';
    }
    if (
        [
            'bpmn:UserTask',
            'bpmn:Task',
            'bpmn:SendTask',
            'bpmn:ReceiveTask',
            'bpmn:ManualTask',
            'bpmn:BusinessRuleTask',
            'bpmn:ServiceTask',
            'bpmn:ScriptTask',
            // 'bpmn:CallActivity',
            // 'bpmn:SubProcess'
        ].includes(type)
    )
        return 'taskPanel';

    if (type === 'bpmn:SequenceFlow') return 'sequenceFlowPanel';

    if (['bpmn:InclusiveGateway', 'bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:EventBasedGateway'].includes(type)) return 'gatewayPanel';

    if (type === 'bpmn:Process') return 'processPanel';

    return null;
});
const canvas = $ref(null);
onMounted(() => {
    const flowModeler = new FlowModeler({
        container: canvas,
    });
    // 删除 bpmn logo  bpmn.io官方要求不给删或者隐藏，否则侵权
    document.querySelector('.bjs-powered-by').remove();
    flowModeler.createDiagram();
    modeler = flowModeler;

    flowModeler.on('root.added', (e) => {
        if (e.element.type === 'bpmn:Process') {
            const elementRegistry = flowModeler.get('elementRegistry');
            element = e.element ? elementRegistry.get(e.element.id) : e.shape;
            _element = e.element ? elementRegistry.get(e.element.id) : e.shape; // 响应式
            formData = commonParse(element);
        }
    });
    flowModeler.on('element.click', (e) => {
        const elementRegistry = modeler.get('elementRegistry');
        element = e.element ? elementRegistry.get(e.element.id) : e.shape;
        _element = e.element ? elementRegistry.get(e.element.id) : e.shape; // 响应式
        nextTick(() => {
            formData = commonParse(element);
        });
    });
    // flowModeler.on('element.changed', (e) => {
    //     const elementRegistry = modeler.get('elementRegistry');
    //     element = e.element ? elementRegistry.get(e.element.id) : e.shape;
    //     _element = e.element ? elementRegistry.get(e.element.id) : e.shape; // 响应式
    //     formData = commonParse(element);
    // });
    // 新增流程定义
    if (!props.xml) {
        newDiagram();
    } else {
        // 将字符串转换成图显示出来
        createNewDiagram(props.xml);
    }
});
// 新建 开始节点
function newDiagram() {
    const ID = guid();
    createNewDiagram(`<? xml version = "1.0" encoding = "UTF-8" ?>
          <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="sid-38422fae-e03e-43a3-bef4-bd33b32041b2" targetNamespace="http://bpmn.io/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="5.1.2">
            <process id="Process_1" isExecutable="false">
              <startEvent id="StartEvent_1y45yut" name="开始">
                <outgoing>SequenceFlow_0h21x7r</outgoing>
              </startEvent>
              <task id="Task_1hcentk">
                <incoming>SequenceFlow_0h21x7r</incoming>
              </task>
              <sequenceFlow id="SequenceFlow_0h21x7r" sourceRef="StartEvent_1y45yut" targetRef="Task_1hcentk" />
            </process>
            <bpmndi:BPMNDiagram id="BpmnDiagram_1">
              <bpmndi:BPMNPlane id="BpmnPlane_1" bpmnElement="Process_1">
                <bpmndi:BPMNShape id="StartEvent_1y45yut_di" bpmnElement="StartEvent_1y45yut">
                  <omgdc:Bounds x="152" y="102" width="36" height="36" />
                  <bpmndi:BPMNLabel>
                    <omgdc:Bounds x="160" y="145" width="22" height="14" />
                  </bpmndi:BPMNLabel>
                </bpmndi:BPMNShape>
                <bpmndi:BPMNShape id="Task_1hcentk_di" bpmnElement="Task_1hcentk">
                  <omgdc:Bounds x="240" y="80" width="100" height="80" />
                </bpmndi:BPMNShape>
                <bpmndi:BPMNEdge id="SequenceFlow_0h21x7r_di" bpmnElement="SequenceFlow_0h21x7r">
                  <omgdi:waypoint x="188" y="120" />
                  <omgdi:waypoint x="240" y="120" />
                </bpmndi:BPMNEdge>
              </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
          </definitions>`);
}
function commonParse(element) {
    const result = {
        ...element.businessObject,
        ...element.businessObject.$attrs,
    };

    // 服务类型（抄送人员数据回显）
    if ('fileIds' in result) {
        result.users = parse(result.fileIds, ';').users.split(',');
    }
    // 用户id字符串 转 数组
    if ('keys' in result) {
        result.keys = result.keys.split(',');
    }
    if ('$type' in result) {
        const type = result.$type;
        result.type = NodeName[type] || type;
    }
    if ('flowElements' in result) {
        delete result['flowElements'];
    }
    result.taskListener = extensionElementsParse(element, result, 'flowable:taskListener');
    result.executionListener = extensionElementsParse(element, result, 'flowable:ExecutionListener');
    return result;
}
function updateProperties(properties) {
    const modeling = modeler.get('modeling');
    modeling.getHandlers();
    modeling.updateProperties(element, properties);
}
function extensionElementsParse(element, result, type) {
    return (
        element.businessObject.extensionElements?.values
            .filter((item) => item.$type === type)
            .map((item) => {
                return {
                    event: item.event,
                    class: item['class'],
                    params:
                        item.fields?.map((field) => {
                            return {
                                name: field.name,
                                stringValue: field['stringValue'],
                            };
                        }) ?? [],
                };
            }) ?? []
    );
}
// 让图能自适应屏幕
function fitViewport() {
    zoom = modeler.get('canvas').zoom('fit-viewport');
    const bbox = document.querySelector('.flow-containers .viewport').getBBox();
    const currentViewbox = modeler.get('canvas').viewbox();
    const elementMid = {
        x: bbox.x + bbox.width / 2 - 65,
        y: bbox.y + bbox.height / 2,
    };
    modeler.get('canvas').viewbox({
        x: elementMid.x - currentViewbox.width / 2,
        y: elementMid.y - currentViewbox.height / 2,
        width: currentViewbox.width,
        height: currentViewbox.height,
    });
    zoom = (bbox.width / currentViewbox.width) * 1.8;
}
// 放大缩小
function zoomViewport(zoomIn = true) {
    zoom = modeler.get('canvas').zoom();
    zoom += zoomIn ? 0.1 : -0.1;
    modeler.get('canvas').zoom(zoom);
}
// 将字符串转换成图显示出来
async function createNewDiagram(data) {
    data = data.replace(/<!\[CDATA\[(.+?)]]>/g, function (match, str) {
        return str.replace(/</g, '&lt;');
    });
    try {
        await modeler.importXML(data);
        adjustPalette();
        fitViewport();
        if (props.taskList !== undefined && props.taskList.length > 0) fillColor();
    } catch (err) {
        console.error(err.message, err.warnings);
    }
}
// 调整左侧工具栏排版
function adjustPalette() {
    try {
        // 获取 bpmn 设计器实例
        const djsPalette = canvas && canvas?.children[0]?.children[1]?.children[4];
        if (djsPalette) {
            const djsPalStyle = {
                width: '130px',
                padding: '5px',
                background: 'white',
                left: '20px',
                borderRadius: 0,
            };
            for (var key in djsPalStyle) {
                djsPalette.style[key] = djsPalStyle[key];
            }
            const palette = djsPalette.children[0];
            const allGroups = palette.children;
            allGroups[0].style['display'] = 'none';
            // 修改控件样式
            for (var gKey in allGroups) {
                const group = allGroups[gKey];
                for (var cKey in group.children) {
                    const control = group.children[cKey];
                    const controlStyle = {
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        padding: '5px',
                    };
                    if (control.className && control.dataset && control.className.indexOf('entry') !== -1) {
                        const controlProps = new BpmData().getControl(control.dataset.action);
                        control.innerHTML = `<div style='font-size: 14px;font-weight:500;margin-left:15px;'>${controlProps['title']}</div>`;
                        for (var csKey in controlStyle) {
                            control.style[csKey] = controlStyle[csKey];
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}
function fillColor() {
    const canvas = modeler.get('canvas');
    modeler._definitions.rootElements[0].flowElements.forEach((n) => {
        const completeTask = props.taskList.find((m) => m.key === n.id);
        const todoTask = props.taskList.find((m) => !m.completed);
        const endTask = props.taskList[props.taskList.length - 1];
        if (n.$type === 'bpmn:UserTask') {
            if (completeTask) {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo');
                n.outgoing?.forEach((nn) => {
                    const targetTask = props.taskList.find((m) => m.key === nn.targetRef.id);
                    if (targetTask) {
                        if (todoTask && completeTask.key === todoTask.key && !todoTask.completed) {
                            canvas.addMarker(nn.id, todoTask.completed ? 'highlight' : 'highlight-todo');
                            canvas.addMarker(nn.targetRef.id, todoTask.completed ? 'highlight' : 'highlight-todo');
                        } else {
                            canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                            canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                        }
                    }
                });
            }
        }
        // 排他网关
        else if (n.$type === 'bpmn:ExclusiveGateway') {
            if (completeTask) {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo');
                n.outgoing?.forEach((nn) => {
                    const targetTask = props.taskList.find((m) => m.key === nn.targetRef.id);
                    if (targetTask) {
                        canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                        canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                    }
                });
            }
        }
        // 并行网关
        else if (n.$type === 'bpmn:ParallelGateway') {
            if (completeTask) {
                canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo');
                n.outgoing?.forEach((nn) => {
                    debugger;
                    const targetTask = props.taskList.find((m) => m.key === nn.targetRef.id);
                    if (targetTask) {
                        canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                        canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo');
                    }
                });
            }
        } else if (n.$type === 'bpmn:StartEvent') {
            n.outgoing.forEach((nn) => {
                const completeTask = props.taskList.find((m) => m.key === nn.targetRef.id);
                if (completeTask) {
                    canvas.addMarker(nn.id, 'highlight');
                    canvas.addMarker(n.id, 'highlight');
                    return;
                }
            });
        } else if (n.$type === 'bpmn:EndEvent') {
            if (endTask.key === n.id && endTask.completed) {
                canvas.addMarker(n.id, 'highlight');
                return;
            }
        }
    });
}
// 对外 api
function getProcess() {
    const element = getProcessElement();
    return {
        id: element.id,
        name: element.name,
        category: element.$attrs['flowable:processCategory'],
    };
}
function getProcessElement() {
    const rootElements = modeler.getDefinitions().rootElements;
    for (let i = 0; i < rootElements.length; i++) {
        if (rootElements[i].$type === 'bpmn:Process') return rootElements[i];
    }
}
async function saveXML(download = false) {
    try {
        const { xml } = await modeler.saveXML({ format: true });
        if (download) {
            downloadFile(`${getProcessElement().name}.bpmn20.xml`, xml, 'application/xml');
        }
        return xml;
    } catch (err) {
        console.log(err);
    }
}
async function showXML() {
    try {
        const { xml } = await modeler.saveXML({ format: true });
        $emit('showXML', xml);
    } catch (err) {
        console.log(err);
    }
}
async function saveImg(type = 'svg', download = false) {
    try {
        const { svg } = await modeler.saveSVG({ format: true });
        if (download) {
            downloadFile(getProcessElement().name, svg, 'image/svg+xml');
        }
        return svg;
    } catch (err) {
        console.log(err);
    }
}
async function save() {
    const process = getProcess();
    const xml = await saveXML();
    const svg = await saveImg();
    const result = { process, xml, svg };
    $emit('save', result);
    window.parent.postMessage(result, '*');
}
function downloadFile(filename, data, type) {
    var a = document.createElement('a');
    var url = window.URL.createObjectURL(new Blob([data], { type: type }));
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}
init();
let postList = $ref();
function init() {
    $vm.$store.com.GETdeptTree();
    listPost().then((res) => {
        postList = res.data.map((item) => {
            return { dictLabel: item.postName, dictValue: item.id };
        });
    });
}
$vm.$store.com.GETdeptUserList();
</script>

<style lang="scss">
/*左边工具栏以及编辑节点的样式*/
@import 'bpmn-js/dist/assets/diagram-js.css';
@import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
@import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
@import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

.view-mode {
    .el-header,
    .el-aside,
    .djs-palette,
    .bjs-powered-by {
        display: none;
    }

    .el-loading-mask {
        background-color: initial;
    }

    .el-loading-spinner {
        display: none;
    }
}

.flow-containers {
    width: 100%;
    height: 100%;

    .canvas {
        width: 100%;
        height: 100%;
    }

    .panel {
        position: absolute;
        right: 0;
        top: 50px;
        width: 300px;
    }

    .load {
        margin-right: 10px;
    }

    .el-form-item__label {
        font-size: 13px;
    }

    .djs-palette {
        left: 0px !important;
        top: 0px;
        border-top: none;
        height: 100%;

        .two-column.open {
            width: 50px !important;
        }
    }

    .djs-direct-editing-parent {
        border-radius: 10px;
    }

    .djs-context-pad.open {
        display: block;
        background-color: var(--context-pad-entry-background-color);
    }

    .djs-container svg {
        min-height: 650px;
    }

    .highlight.djs-shape .djs-visual > :nth-child(1) {
        fill: green !important;
        stroke: green !important;
        fill-opacity: 0.2 !important;
    }

    .highlight.djs-shape .djs-visual > :nth-child(2) {
        fill: green !important;
    }

    .highlight.djs-shape .djs-visual > path {
        fill: green !important;
        fill-opacity: 0.2 !important;
        stroke: green !important;
    }

    .highlight.djs-connection > .djs-visual > path {
        stroke: green !important;
    }

    // .djs-connection > .djs-visual > path {
    //   stroke: orange !important;
    //   stroke-dasharray: 4px !important;
    //   fill-opacity: 0.2 !important;
    // }
    // .djs-shape .djs-visual > :nth-child(1) {
    //   fill: orange !important;
    //   stroke: orange !important;
    //   stroke-dasharray: 4px !important;
    //   fill-opacity: 0.2 !important;
    // }
    .highlight-todo.djs-connection > .djs-visual > path {
        stroke: orange !important;
        stroke-dasharray: 4px !important;
        fill-opacity: 0.2 !important;
    }

    .highlight-todo.djs-shape .djs-visual > :nth-child(1) {
        fill: orange !important;
        stroke: orange !important;
        stroke-dasharray: 4px !important;
        fill-opacity: 0.2 !important;
    }

    .overlays-div {
        font-size: 10px;
        color: red;
        width: 100px;
        top: -20px !important;
    }
}

#helper-svg  {
    display: none;
}
</style>

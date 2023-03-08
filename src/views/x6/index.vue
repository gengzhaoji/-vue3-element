<template>
    <div class="h100 flex-col">
        <div style="border-bottom: 1px solid rgb(218 218 218)" class="p-10">
            <el-tooltip effect="dark" content="自适应屏幕" placement="bottom">
                <my-button icon="Rank" @click="fitViewport" />
            </el-tooltip>
            <el-tooltip effect="dark" content="放大" placement="bottom">
                <my-button icon="zoom-in" @click="graph.zoom(0.1)" />
            </el-tooltip>
            <el-tooltip effect="dark" content="缩小" placement="bottom">
                <my-button icon="zoom-out" @click="graph.zoom(-0.1)" />
            </el-tooltip>
            <el-tooltip effect="dark" content="后退" placement="bottom">
                <my-button icon="Back" @click="graph.history.undo()" />
            </el-tooltip>
            <el-tooltip effect="dark" content="前进" placement="bottom">
                <my-button icon="Right" @click="graph.history.redo()" />
            </el-tooltip>
            <my-button type="primary" @click="saveFn">保存模型</my-button>
            <my-button type="primary" @click="importNodeList">回显模型</my-button>
        </div>
        <el-container style="align-items: stretch">
            <el-main style="padding: 0" class="flex">
                <div ref="stencilRef" class="stencil" />
                <div ref="canvas" class="canvas" />
            </el-main>
            <el-aside style="width: 400px; background-color: #f0f2f5; border-left: 1px solid var(--el-border-color)" class="h100">
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
</template>

<script setup name="x6">
import { Graph, Shape, Addon, Node, Path, Cell } from '@antv/x6';

let formData = $ref({}),
    graph = $ref({}),
    nodeName = $ref('流程图');

onMounted(() => {
    initGraph();
});
onUnmounted(() => {
    graph.dispose();
});
const canvas = ref(null);
// 初始化流程图画布
function initGraph() {
    // 创建画布
    graph = new Graph({
        container: canvas.value,
        grid: {
            size: 10,
            visible: true,
            type: 'dot',
            args: {
                color: '#a05410', // 网格线/点颜色
                thickness: 1, // 网格线宽度/网格点大小
            },
        },
        background: {
            color: '#fffbe6', // 设置画布背景颜色
        },
        panning: true, // 拖拽平移
        connecting: {
            anchor: 'center',
            connectionPoint: 'anchor',
            allowBlank: false,
            allowLoop: false,
            highlight: true,
            router: 'manhattan',
            connector: 'rounded',
            snap: true,
            createEdge() {
                return new Shape.Edge({
                    label: 'edge',
                    attrs: {
                        line: {
                            stroke: '#A2B1C3',
                            strokeWidth: 2,
                            targetMarker: 'classic',
                        },
                    },
                    zIndex: 0,
                });
            },
            validateConnection({ targetMagnet }) {
                return !!targetMagnet;
            },
        },
        highlighting: {
            magnetAdsorbed: {
                name: 'stroke',
                args: {
                    attrs: {
                        fill: '#fff',
                        stroke: '#31d0c6',
                        strokeWidth: 4,
                    },
                },
            },
        },
        mousewheel: true, // 鼠标滚轮缩放，默认禁用。
        resizing: true,
        rotating: false,
        //点选，默认禁用。
        selecting: {
            enabled: true,
            showEdgeSelectionBox: false,
        },
        snapline: true, // 对齐线，默认禁用。
        keyboard: true, // 键盘快捷键，默认禁用。
        clipboard: true,
        history: true,
        scroller: true, // 滚动画布，默认禁用。
    });
    // 控制连接桩显示/隐藏
    graph.on('node:mouseenter', () => {
        const ports = canvas.value?.querySelectorAll('.x6-port-body');
        if (ports) showPorts(ports, true);
    });
    graph.on('node:mouseleave', () => {
        const ports = canvas.value?.querySelectorAll('.x6-port-body');
        if (ports) showPorts(ports, false);
    });
    keyBindFn();
    stencilFn();
}
// 按钮绑定
function keyBindFn() {
    // 点击事件
    graph.on('node:click', ({ e, x, y, node, view }) => {
        node.data = { name: 'ceshi' };
    });
    graph.on('edge:click', ({ e, x, y, edge, view }) => {
        edge.data = { name: 'ceshi' };
        edge.setLabels(['经理审批']);
    });
    // 后退 前进
    graph.bindKey(['meta+z', 'ctrl+z'], () => {
        if (graph.history.canUndo()) graph.history.undo();
        return false;
    });
    graph.bindKey(['meta+y', 'ctrl+y'], () => {
        if (graph.history.canRedo()) graph.history.redo();
        return false;
    });
    // 复制 剪切 粘贴
    graph.bindKey(['meta+c', 'ctrl+c'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) graph.copy(cells);
        return false;
    });
    graph.bindKey(['meta+x', 'ctrl+x'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) graph.cut(cells);
        return false;
    });
    graph.bindKey(['meta+v', 'ctrl+v'], () => {
        if (!graph.isClipboardEmpty()) {
            const cells = graph.paste({ offset: 32 });
            graph.cleanSelection();
            graph.select(cells);
        }
        return false;
    });
    //delete
    graph.bindKey(['delete', 'backspace'], () => {
        const cells = graph.getSelectedCells();
        if (cells.length) graph.removeCells(cells);
    });
}
// 添加菜单
let stencil,
    stencilRef = ref(null);
function stencilFn() {
    stencil = new Addon.Stencil({
        title: '流程图',
        target: graph,
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        collapsable: true,
        groups: [
            {
                title: '基础流程图',
                name: 'group1',
            },
            {
                title: '系统设计图',
                name: 'group2',
                graphHeight: 250,
                layoutOptions: {
                    rowHeight: 70,
                },
            },
        ],
        layoutOptions: {
            columns: 2,
            columnWidth: 80,
            rowHeight: 55,
        },
    });
    stencilRef.value.appendChild(stencil.container);
    nodeFn();
}
// 初始化图形
const ports = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
    items: [
        {
            group: 'top',
        },
        {
            group: 'right',
        },
        {
            group: 'bottom',
        },
        {
            group: 'left',
        },
    ],
};
function nodeFn() {
    Graph.registerNode(
        'custom-rect',
        {
            inherit: 'rect',
            width: 66,
            height: 36,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                },
                text: {
                    fontSize: 12,
                    fill: '#262626',
                },
                data: {},
            },
            ports: { ...ports },
        },
        true
    );
    Graph.registerNode(
        'custom-polygon',
        {
            inherit: 'polygon',
            width: 66,
            height: 36,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                },
                text: {
                    fontSize: 12,
                    fill: '#262626',
                },
                data: {},
            },
            ports: { ...ports },
        },
        true
    );
    Graph.registerNode(
        'custom-circle',
        {
            inherit: 'circle',
            width: 45,
            height: 45,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                },
                text: {
                    fontSize: 12,
                    fill: '#262626',
                },
                data: {},
            },
            ports: { ...ports },
        },
        true
    );
    Graph.registerNode(
        'custom-image',
        {
            inherit: 'rect',
            width: 52,
            height: 52,
            markup: [
                {
                    tagName: 'rect',
                    selector: 'body',
                },
                {
                    tagName: 'image',
                },
                {
                    tagName: 'text',
                    selector: 'label',
                },
            ],
            attrs: {
                body: {
                    stroke: '#5F95FF',
                    fill: '#5F95FF',
                },
                image: {
                    width: 26,
                    height: 26,
                    refX: 13,
                    refY: 16,
                },
                label: {
                    refX: 3,
                    refY: 2,
                    textAnchor: 'left',
                    textVerticalAnchor: 'top',
                    fontSize: 12,
                    fill: '#fff',
                },
                data: {},
            },
            ports: { ...ports },
        },
        true
    );
    const r1 = graph.createNode({
        shape: 'custom-rect',
        label: '开始',
        attrs: {
            body: {
                rx: 20,
                ry: 26,
            },
        },
    });
    const r2 = graph.createNode({
        shape: 'custom-rect',
        label: '过程',
    });
    const r3 = graph.createNode({
        shape: 'custom-rect',
        attrs: {
            body: {
                rx: 6,
                ry: 6,
            },
        },
        label: '可选过程',
    });
    const r4 = graph.createNode({
        shape: 'custom-polygon',
        attrs: {
            body: {
                refPoints: '0,10 10,0 20,10 10,20',
            },
        },
        label: '决策',
    });
    const r5 = graph.createNode({
        shape: 'custom-polygon',
        attrs: {
            body: {
                refPoints: '10,0 40,0 30,20 0,20',
            },
        },
        label: '数据',
    });
    const r6 = graph.createNode({
        shape: 'custom-circle',
        label: '连接',
    });
    stencil.load([r1, r2, r3, r4, r5, r6], 'group1');
    const imageShapes = [
        {
            label: 'Client',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg',
        },
        {
            label: 'Http',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg',
        },
        {
            label: 'Api',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg',
        },
        {
            label: 'Sql',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg',
        },
        {
            label: 'Clound',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg',
        },
        {
            label: 'Mq',
            image: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
        },
    ];
    const imageNodes = imageShapes.map((item) =>
        graph.createNode({
            shape: 'custom-image',
            label: item.label,
            attrs: {
                image: {
                    'xlink:href': item.image,
                },
            },
        })
    );
    stencil.load(imageNodes, 'group2');
}
// 控制连接桩显示/隐藏
function showPorts(ports, show) {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
}
//自适应屏幕
function fitViewport() {
    const num = 1 - graph.zoom();
    num > 1 ? graph.zoom(num * -1) : graph.zoom(num);
    graph.centerContent();
}
// 保存
function saveFn() {
    localStorage.setItem('geng', JSON.stringify(graph.toJSON({ diff: true })));
}
// 回显
function importNodeList() {
    graph.fromJSON(JSON.parse(localStorage.getItem('geng')));
}
</script>

<style lang="scss" scoped>
.stencil {
    position: relative;
    width: 200px;
}
.canvas {
    height: 100%;
    flex: 1;
}
@keyframes ant-line {
    to {
        stroke-dashoffset: -1000;
    }
}
</style>
<style lang="scss">
.x6-edge:hover path:nth-child(2) {
    stroke: #1890ff;
    stroke-width: 2px;
}
.x6-edge-selected path:nth-child(2) {
    stroke: #1890ff;
    stroke-width: 2px !important;
}
.x6-widget-transform {
    margin: -1px 0 0 -1px;
    padding: 0px;
    border: 1px solid #239edd;
}
.x6-widget-transform > div {
    border: 1px solid #239edd;
}
.x6-widget-transform > div:hover {
    background-color: #3dafe4;
}
.x6-widget-transform-active-handle {
    background-color: #3dafe4;
}
.x6-widget-transform-resize {
    border-radius: 0;
}
.x6-widget-selection-inner {
    border: 1px solid #239edd;
}
</style>

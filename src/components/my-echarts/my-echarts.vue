<template>
    <div class="echarts" ref="myEcharts" :style="styles"></div>
</template>

<script setup name="MyEcharts">
import { useResizeObserver } from '@vueuse/core';

/**
 * ECharts组件, 提供Vue组件封装，异步加载echarts库,
 * @module widgets/my-echarts
 * @author 耿朝继
 */
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core';

/** 引入柱状图and折线图图表，图表后缀都为 Chart  */
import { MapChart, ScatterChart, EffectScatterChart, HeatmapChart, BarChart, LineChart } from 'echarts/charts';

// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import { VisualMapComponent, GeoComponent, TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LegendComponent } from 'echarts/components';

// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';

// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

import EVENTS from './EVENTS';

// 注册必须的组件
echarts.use([
    LineChart,
    BarChart,
    HeatmapChart,
    MapChart,
    ScatterChart,
    EffectScatterChart,
    GeoComponent,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    VisualMapComponent,
]);

const FULLSCREEN =
    'path://M909 959H780a30 30 0 0 1 0-60h99a20 20 0 0 0 20-20v-99a30 30 0 0 1 60 0v129a50 50 0 0 1-50 50z m20-685a30 30 0 0 1-30-30v-99a20 20 0 0 0-20-20h-99a30 30 0 0 1 0-60h129a50 50 0 0 1 50 50v129a30 30 0 0 1-30 30z m-157 28v420a50 50 0 0 1-50 50H302a50 50 0 0 1-50-50V302a50 50 0 0 1 50-50h420a50 50 0 0 1 50 50z m-60 30a20 20 0 0 0-20-20H332a20 20 0 0 0-20 20v360a20 20 0 0 0 20 20h360a20 20 0 0 0 20-20V332zM244 125h-99a20 20 0 0 0-20 20v99a30 30 0 0 1-60 0V115a50 50 0 0 1 50-50h129a30 30 0 0 1 0 60zM95 750a30 30 0 0 1 30 30v99a20 20 0 0 0 20 20h99a30 30 0 0 1 0 60H115a50 50 0 0 1-50-50V780a30 30 0 0 1 30-30z';
const CANCEL_FULLSCREEN =
    'path://M582.6 441.4v-320h50V356l274-274 35.4 35.4-274 274h234.6v50h-320zM117.4 942l274-274v234.6h50v-320h-320v50H356l-274 274 35.4 35.4zM132 132h302V82H82v352h50V132z m760 760H590v50h352V590h-50v302z';

function createToggleFeature(isFullscreen, clickHandler) {
    return {
        show: true,
        title: isFullscreen ? '取消全屏' : '全屏',
        icon: isFullscreen ? CANCEL_FULLSCREEN : FULLSCREEN,
        onclick: function () {
            clickHandler && clickHandler(isFullscreen);
        },
    };
}

const $emit = defineEmits(EVENTS);
/**
 * 参数属性
 * @property {Object} [geo] 需要注册的地图geoJson， 目录 /widgets/my-echarts/map 下包含全国各地的地图
 * @property {String} [map] 需要注册的地图名称， map 和 geo 需要同时设置
 * @property {Object|function} [options] echarts 配置项
 * @property {String} [width=100%] 图表的宽度
 * @property {String} [height=100%] 图表的高度
 * @property {Boolean} [loading=true] 是否显示loading效果
 * @property {String|Number} [group] 分组标识
 * @property {Boolean} [toggle=false] 是否开启全屏/取消全屏切换功能
 */
const props = defineProps({
    geo: {
        type: Object,
    },
    map: {
        type: String,
    },
    options: {
        type: [Object, Function],
    },
    width: {
        type: String,
        default: '100%',
    },
    height: {
        type: String,
        default: '100%',
    },
    loading: {
        type: Boolean,
        default: true,
    },
    group: {
        type: [String, Number],
    },
    toggle: {
        type: Boolean,
        default: false,
    },
});
/**
 *  当前图表是否活动状态
 */
let active = true,
    isFullscreen = false,
    chart;
const styles = computed(() => ({ width: props.width, height: props.height }));
watch(
    () => props.options,
    (val) => {
        setOption(val);
    },
    { deep: true }
);
watch(
    () => props.loading,
    (val) => {
        setLoading(val);
    }
);
watch(
    () => isFullscreen,
    (val) => {
        setOption(props.options);
    }
);

/**
 * 注册地图
 * @function registerMap
 */
function registerMap() {
    if (props.map && props.geo && !echarts.getMap(props.map)) {
        echarts.registerMap(props.map, props.geo);
    }
}
/**
 * 初始化图表，实例化ECharts
 */
function init(el) {
    chart = echarts.init(el || myEcharts.value);
    props.group && setGroup(props.group);
    setLoading(props.loading);
    EVENTS.forEach((name) => {
        chart.on(name, (params) => {
            $emit(name, params);
        });
    });
}
/**
 * 设置图表实例的配置项以及数据，万能接口，所有参数和数据的修改都可以通过setOption完成，ECharts 会合并新的参数和数据，然后刷新图表。
 * 如果开启动画的话，ECharts 找到两组数据之间的差异然后通过合适的动画去表现数据的变化。
 * @function setOption
 * @param {object} options 配置项，与echarts的配置项一致
 */
function setOption(options) {
    setLoading(true);
    let opts = typeof options === 'function' ? options(echarts) || {} : options;
    if (props.toggle) {
        if (!opts?.toolbox) {
            opts.toolbox = {};
        }
        if (!opts?.toolbox?.feature) {
            opts.toolbox.feature = {};
        }
        opts.toolbox.feature.myToggle = createToggleFeature(isFullscreen, props.toggleFullscreen);
    }
    clear();
    chart?.setOption?.(opts || {});
    setLoading(false);
}
/**
 * 显示/关闭loading效果
 * @function setLoading
 * @param {boolean} loading 是否显示loading
 */
function setLoading(loading) {
    if (!chart) return;
    loading ? chart.showLoading() : chart.hideLoading();
}
/**
 * 改变图表尺寸，在容器大小发生改变时将会自动调用。
 * @function resize
 */
function resize() {
    if (active) chart && chart.resize();
}
/**
 * 清空当前实例，会移除实例中所有的组件和图表。清空后调用 getOption 方法返回一个{}空对象。
 * @function clear
 */
function clear() {
    chart?.clear?.();
}
/**
 * 图表的分组，用于联动
 * @function setGroup
 * @param {string|number} name
 */
function setGroup(name) {
    if (chart) chart.group = name;
}
function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    isFullscreen ? showFullscreen() : closeFullscreen();
}
let copyDiv, copyWrapper, copyChart;
function showFullscreen() {
    const div = document.createElement('div');
    const wrapper = document.createElement('div');
    const style = {
        left: 0,
        top: 0,
        zIndex: 3000,
        position: 'fixed',
        height: '100%',
        width: '100%',
        background: '#fff',
    };
    Object.keys(style).forEach((key) => {
        wrapper.style[key] = style[key];
        div.style[key] = style[key];
    });
    copyDiv = div;
    copyWrapper = wrapper;
    copyChart = chart;
    wrapper.appendChild(div);
    document.body.appendChild(wrapper);
    init(div);
    setOption(props.options);
}
function closeFullscreen() {
    if (copyDiv) {
        chart?.dispose();
        chart = copyChart;
    }
    if (copyWrapper) copyWrapper.parentNode.removeChild(copyWrapper);
}
// 初始化逻辑
const myEcharts = ref(null);
useResizeObserver(myEcharts, resize);

registerMap();
onMounted(() => {
    init();
    setOption(props.options);
});
onBeforeUnmount(() => {
    chart?.dispose?.();
});
onActivated(() => {
    active = true;
});
onDeactivated(() => {
    active = false;
});
</script>

<style lang="scss" scoped>
.echarts {
    width: 100%;
    height: 100%;
}
</style>

<template>
    <div class="my-pager f0" v-show="visible" :id="myPagerId">
        <el-pagination
            :small="small"
            ref="pager"
            :background="background"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page"
            :page-sizes="sizes"
            :page-size="size"
            :layout="currentLayout"
            :total="total"
            v-bind="$attrs"
        >
            <slot>
                <span>{{ page }} / {{ pageCount }}</span>
            </slot>
        </el-pagination>
    </div>
</template>

<script setup name="myPager">
/**
 * pager 分页组件
 * @module components/my-pager
 * @example
 *
 * // 使用说明
 * <my-pager :total="100" @size-change="pageSCHandle" @current-change="pageCCHandle"></my-pager>
 * <my-pager :total="100" :small="true"></my-pager>
 */
/**
 * 插槽
 * @member slot
 * @property {string} [default] 自定义页码内容
 */
import { addResizeListener, removeResizeListener } from '@u/dom';
import { throttle } from '@u/util';
import { guid } from '@u/util';

const $emit = defineEmits(['size-change', 'update:page', 'current-change']),
    myPagerId = `myPagerId${guid()}`;
/**
 * 属性参数
 * @property {Array} [sizes = [10, 20, 50, 100]] 每页显示个数选择器的选项设置
 * @property {String} [layout = 'total,sizes, ->, prev, pager, next, jumper'] 分页组件布局（需要显示那些功能模块），子组件名用逗号分隔，或者用‘full’(默认),'small','mini','simple'来设定分页器功能
 * @property {String} [layout.layout['full']] 分页组件的子组件如下： total:总条数， sizes:每页显示条数选择器， prev:前一页，pager:分页页码， next:后一页， jump:跳至第n页
 * @property {Number} [size = 10] 分页显示的条数， 默认10条
 * @property {Number} [total] 需要进行分页的列表的总条数
 * @property {Number} [page = 1] 组件创建时打开第n页，默认值为1
 * @property {Boolean} [autoLayout = true] 控制分页器 可以自动根据组件当前的长度来显示隐藏部分子组件（如分页器变窄时，可以自动隐藏 'pager'组件）
 * @property {Boolean} [background = true] 控制 分页器的 页码按钮 是否有 背景色
 */
const layouts = {
    full: 'total,sizes, ->, prev, pager, next, jumper',
    small: 'total,sizes, ->, prev, next, jumper',
    mini: 'total,sizes,->,prev,pager, next',
    simple: 'prev, pager, next',
    tiny: 'prev,slot,next',
};
const props = defineProps({
    sizes: {
        type: Array,
        default() {
            return [5, 10, 20, 30, 50, 100];
        },
    },
    layout: {
        type: String,
        default: 'total,sizes, ->, prev, pager, next, jumper',
    },
    size: {
        type: Number,
        default: 20,
    },
    total: {
        type: Number,
        default: 0,
    },
    page: {
        type: Number,
        default: 1,
    },
    autoLayout: {
        type: Boolean,
        default: false,
    },
    background: {
        type: Boolean,
        default: true,
    },
    small: {
        type: Boolean,
        default: false,
    },
});
// 是否显示
let visible = computed(() => props.total * 1 > 0);
// 计算总页数
let pageCount = computed(() => (props.total > 0 ? Math.ceil(props.total / props.size) : 0));
// 布局配置
let currentLayout = $ref(layouts[props.layout] || props.layout);
watch(
    () => props.layout,
    (val) => {
        currentLayout = layouts[val] || val;
    }
);
/**
 * 分页器单页显示数量改变的事件 （@size-change）
 * @event size-change
 * @property {number} [val] 新的单页显示的条数
 */
function handleSizeChange(val) {
    $emit('size-change', val);
}
/**
 * 分页器控制跳转页码时的事件 （@current-change）
 * @event current-change
 * @property {number} [val] 当前跳转到的页码
 */
function handleCurrentChange(val) {
    $emit('update:page', val);
    $emit('current-change', val);
}
const changeLayout = throttle(() => {
    const rect = document.getElementById(myPagerId)?.getBoundingClientRect();
    if (rect?.width >= 800) {
        currentLayout = layouts.full;
    } else {
        currentLayout = layouts.mini;
    }
}, true);
onMounted(() => {
    /**
     * 组件生成后，若‘autoLayout’开启，将 el-pagination组件内部的‘proxyChangeLayout’方法指向自己定义的‘changeLayout()’方法，并监听组建的resize事件（调用ele-ui内部的‘addResizeListener’方法）
     * @member mounted
     */
    if (props.autoLayout) addResizeListener(document.getElementById(myPagerId), changeLayout);
});
onBeforeUnmount(() => {
    if (props.autoLayout) removeResizeListener(document.getElementById(myPagerId), changeLayout);
});
</script>

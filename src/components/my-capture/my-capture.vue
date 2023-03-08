<template>
    <span class="my-capture" @click.prevent="capture">
        <slot name="button">
            <el-button circle icon="View"></el-button>
        </slot>
    </span>
</template>

<script setup name="MyCapture">
/**
 * capture 截取屏幕元素组件
 * @module components/my-capture
 */
/**
 * 插槽
 * @member slot
 * @property {string} [button] 放置button 按钮的 slot
 */
import { downloadByData } from '@/utils/download';
import date from '@/utils/date';
const $emit = defineEmits(['on-capture', 'on-output']),
    h2cImport = () => import('html2canvas'),
    /**
     * 参数属性
     * @member props
     * @property {String} [fileName] 保存的图片名称，默认为当前时间
     * @property {HTMLElement} [dom = d.body] 需要截取的Dom节点， 默认为document.body
     * @property {Function} [beforeCapture] 截图前与执行函数，返回 Promise对象
     * @property {Object} [options] html2canvas的配置项
     */
    props = defineProps({
        fileName: {
            type: String,
            default: () => date(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        },
        dom: {
            default() {
                return document.body;
            },
        },
        options: {
            type: Object,
            default: () => ({}),
        },
        beforeCapture: {
            type: Function,
            default: () => Promise.resolve(),
        },
    }),
    h2cOpt = computed(() => ({
        logging: false,
        allowTain: true,
        useCORS: true,
        ...props.options,
    }));

let h2c = null;
function capture() {
    /**
     * 点击抓取时派发的事件
     * @event on-capture
     * @param {HTMLElement} [dom] 抓取的dom节点
     */
    props.beforeCapture().then(() => {
        $emit('on-capture', props.dom);
        if (h2c) {
            _renderImg(h2c);
        } else {
            h2cImport().then((res) => {
                if (res) {
                    h2c = res?.default;
                    _renderImg(h2c);
                }
            });
        }
    });
}
/**
 * 内部渲染函数
 * @Function _renderImg
 * @param h2c {Function} html2canvas的功能函数
 */
function _renderImg(h2c) {
    const opt = h2cOpt.value;
    h2c(props.dom, opt).then((canvas) => {
        const imgData = canvas.toDataURL();
        downloadByData(null, `${props.fileName}.png`, imgData);
        /**
         * 图片下载时派发的事件
         * @event on-output
         * @param {string} imgData 生成图片的Base64字符串
         */
        $emit('on-output', imgData);
    });
}
</script>

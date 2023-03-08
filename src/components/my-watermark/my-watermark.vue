<template>
    <div :class="classes" :style="styles">
        <slot></slot>
        <canvas ref="canvasRef" :width="width" :height="height" style="display: none"></canvas>
        <div v-if="mask" class="my-watermark__mask" :style="maskStyle"></div>
    </div>
</template>

<script setup name="MyWatermark">
/**
 * 水印组件
 * @module components/my-watermark
 */
/**
 * 属性参数
 * @member props
 * @property {String|Array} text 水印文字, 多行文本可以传数组
 * @property {Number} [lineHeight=10] 行距，多行文本有效
 * @property {Number} [width=200] 画布的宽度 默认：300
 * @property {Number} [height=200] 画布的高度 默认：300
 * @property {String} [font] 水印文字的字体 默认：20px 黑体
 * @property {Number} [rotate] 文字旋转角度，默认：-20
 * @property {String} [color] 水印文字字体颜色 默认：rgba(100, 100, 100, 0.2)
 * @property {Number} [x] 文字在画布的坐标x 默认：0
 * @property {Number} [y] 文字在画布的坐标y 默认：100
 * @property {Boolean} [mask] mask 遮罩模式  默认：true
 */
const props = defineProps({
        disabled: Boolean,
        text: {
            type: [String, Array],
            default: '',
        },
        lineHeight: {
            type: Number,
            default: 10,
        },
        width: {
            type: Number,
            default: 300,
        },
        height: {
            type: Number,
            default: 300,
        },
        font: {
            type: String,
            default: '20px 黑体',
        },
        rotate: {
            type: Number,
            default: -20,
        },
        color: {
            type: String,
            default: 'rgba(100, 100, 100, 0.2)',
        },
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 100,
        },
        mask: {
            type: Boolean,
            default: true,
        },
    }),
    classes = computed(() => ({
        'my-watermark': true,
        'is-mask': props.mask,
        'is-disabled': props.disabled,
    })),
    styles = computed(() => {
        if (!dataUrl.value || props.mask || props.disabled) return null;

        return {
            backgroundImage: `url(${dataUrl.value})`,
        };
    }),
    maskStyle = computed(() => {
        if (!dataUrl.value || !props.mask || props.disabled) return null;

        return {
            backgroundImage: `url(${dataUrl.value})`,
        };
    });
watch(
    () => props.text,
    () => {
        reset();
        draw();
    }
);

let dataUrl = ref(null),
    canvasRef = shallowRef();

function draw() {
    if (!props.text) return;
    const textArray = [].concat(props.text);
    const ctx = unref(canvasRef).getContext('2d');
    const rotate = (props.rotate * Math.PI) / 180;
    ctx.clearRect(0, 0, props.width, props.height);
    ctx.rotate(rotate);
    ctx.font = props.font;
    ctx.fillStyle = props.color;
    const fontSize = parseInt(ctx.font) || 20;
    textArray.forEach((text, index) => {
        const y = props.y + (fontSize + props.lineHeight) * index;
        ctx.fillText(text, props.x, y);
    });
    dataUrl.value = ctx.canvas.toDataURL();
}
function reset() {
    const ctx = unref(canvasRef).getContext('2d');
    ctx.clearRect(0, 0, props.width, props.height);
    const rotate = (props.rotate * Math.PI) / 180;
    ctx.rotate(-rotate);
}

onMounted(() => {
    !props.disabled && draw();
});
</script>

<style lang="scss" scoped>
@import '@/style/BEM.scss';

@include b(watermark) {
    pointer-events: none;
    width: 100%;
    height: 100%;

    @include when(mask) {
        position: relative;
        pointer-events: auto;
    }

    @include e(mask) {
        position: absolute;
        z-index: 99999;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        pointer-events: none;
    }
}
</style>

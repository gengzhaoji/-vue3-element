<template>
    <canvas ref="canvas" :width="width" :height="height" />
</template>

<script setup name="dvStarry">
/**
 * 星空动效
 * @module @c/Large/dv-starry
 */
import Starry from '@u/Starry';
/**
 * 属性参数
 * @member props
 * @property {number} [amount=300] 星星数量
 */
defineProps({
    amount: {
        type: Number,
        default: 500,
    },
    width: {
        default: 1920,
    },
    height: {
        default: 1080,
    },
});

let canvas = $ref(null),
    starry;
onMounted(() => {
    starry = new Starry(canvas, { amount });
    starry.run();
});
onBeforeUnmount(() => {
    starry && starry.destroy();
});
</script>

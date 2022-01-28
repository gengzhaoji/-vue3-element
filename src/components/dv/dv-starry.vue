<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>
<script>
/**
 * 星空动效
 * @module @c/Large/dv-starry
 */
import Starry from '@u/Starry';

export default {
    name: 'dvStarry',
    /**
     * 属性参数
     * @member props
     * @property {number} [amount=300] 星星数量
     */
    props: {
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
    },
    mounted() {
        this.starry = new Starry(this.$refs.canvas, this);
        this.starry.run();
    },
    beforeUnmount() {
        this.starry && this.starry.destroy();
    },
};
</script>

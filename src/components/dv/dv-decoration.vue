<template>
    <div class="dv-decoration-9" ref="decoration-9" :style="{ width: `${scale * 100}px`, height: `${scale * 100}px` }">
        <svg width="100px" height="100px" :style="`transform:scale(${scale});`">
            <defs>
                <polygon :id="polygonId" points="15, 46.5, 21, 47.5, 21, 52.5, 15, 53.5" />
            </defs>

            <circle cx="50" cy="50" r="45" fill="transparent" :stroke="mergedColor[1]" stroke-width="10" stroke-dasharray="80, 100, 30, 100">
                <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" :dur="`${dur}s`" repeatCount="indefinite" />
            </circle>

            <circle cx="50" cy="50" r="45" fill="transparent" :stroke="mergedColor[0]" stroke-width="6" stroke-dasharray="50, 66, 100, 66">
                <animateTransform attributeName="transform" type="rotate" values="0 50 50;-360 50 50" :dur="`${dur}s`" repeatCount="indefinite" />
            </circle>

            <circle cx="50" cy="50" r="38" fill="transparent" :stroke="mergedColor[1]" stroke-width="1" stroke-dasharray="5, 1" />

            <use
                v-for="(foo, i) in new Array(20).fill(0)"
                :key="i"
                :xlink:href="`#${polygonId}`"
                :stroke="mergedColor[1]"
                :fill="Math.random() > 0.4 ? 'transparent' : mergedColor[0]"
            >
                <animateTransform attributeName="transform" type="rotate" values="0 50 50;360 50 50" :dur="`${dur}s`" :begin="`${(i * dur) / 20}s`" repeatCount="indefinite" />
            </use>

            <circle cx="50" cy="50" r="26" fill="transparent" :stroke="mergedColor[1]" stroke-width="1" stroke-dasharray="5, 1" />
        </svg>
        <slot></slot>
    </div>
</template>

<script setup name="DvDecoration">
import { guid } from '@u/util';
/**
 * dur:动画时间
 */
defineProps({
    dur: {
        type: Number,
        default: 3,
    },
    scale: {
        type: Number,
        default: 1,
    },
});
const polygonId = `decoration-9-polygon-${guid()}`,
    defaultColor = ['rgba(3, 166, 224, 0.8)', 'rgba(3, 166, 224, 0.5)'],
    mergedColor = ['rgba(3, 166, 224, 0.8)', 'rgba(3, 166, 224, 0.5)'];
</script>

<style lang="scss" scoped>
.dv-decoration-9 {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        position: absolute;
        left: 0px;
        top: 0px;
        transform-origin: left top;
    }
}
</style>

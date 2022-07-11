<template>
    <div class="my-marquee" :class="classes" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
        <div class="my-marquee__scroll" :style="scrollStyle">
            <div ref="contentRef" class="my-marquee__content">
                <slot></slot>
            </div>
            <div class="my-marquee__copy-content" v-html="copyHtml"></div>
        </div>
    </div>
</template>

<script setup name="MyMarquee">
/**
 * 无缝滚动
 * @module $ui/components/my-marquee
 */
import { requestAnimationFrame, cancelAnimationFrame } from '@/utils/util';
/**
 * 插槽
 * @member slots
 * @property {string} default 默认插槽，放置滚动内容
 */

/**
 * 属性参数
 * @member props
 * @property {Array} [data] 滚动数据，用作监听数据变更，更新html
 * @property {Boolean} [disabled] 禁用
 * @property {string} [direction=up] 滚动方向，可选'up', 'down', 'left', 'right'
 * @property {boolean} [auto=true] 自动开始
 * @property {number} [speed=1] 滚动速度，数值越大速度越快
 * @property {number} [waitTime=3000] 间隔滚动停顿等待时间
 * @property {number} [scrollLength=0] 间隔滚动，每次滚动的长度，单位px
 *
 */
const props = defineProps({
    // 滚动数据
    data: {
        type: Array,
        default() {
            return [];
        },
    },
    disabled: Boolean,
    // 滚动方向
    direction: {
        type: String,
        default: 'up',
        validator(val) {
            return ['up', 'down', 'left', 'right'].includes(val);
        },
    },
    // 自动开始
    auto: {
        type: Boolean,
        default: true,
    },
    // 滚动速度，数值越大速度越快
    speed: {
        type: Number,
        default: 1,
    },
    // 间隔滚动停顿等待时间
    waitTime: {
        type: Number,
        default: 3000,
    },
    // 间隔滚动，每次滚动的长度，单位px
    scrollLength: Number,
});
let timerId = null,
    resumeId = null,
    copyHtml = $ref(''),
    contentWidth = $ref(0),
    contentHeight = $ref(0),
    scrollPosition = $ref(0),
    isPause = false;

const isHorizontal = $computed(() => ['left', 'right'].includes(props.direction)),
    classes = $computed(() => ({ 'my-marquee--horizontal': isHorizontal, 'is-disabled': props.disabled })),
    scrollStyle = $computed(() => ({
        transform: isHorizontal ? `translate3d(-${scrollPosition}px, 0, 0)` : `translate3d(0, -${scrollPosition}px, 0)`,
        width: isHorizontal ? `${2 * contentWidth}px` : '100%',
    }));
const $emit = defineEmits(['resize']),
    contentRef = ref();
watch(
    () => props.data,
    () => {
        nextTick(renderCopyHtml());
    }
);
watch(
    () => props.disabled,
    (val) => {
        stop();
        if (val) {
            copyHtml = '';
            scrollPosition = 0;
        } else {
            nextTick(renderCopyHtml());
            props.auto && start();
        }
    }
);

onMounted(() => {
    renderCopyHtml();
    nextTick(() => props.auto && !props.disabled && start());
});

onBeforeUnmount(() => {
    stop();
    copyHtml = '';
});

function renderCopyHtml() {
    if (!contentRef.value || props.disabled) return;
    copyHtml = contentRef.value.innerHTML;
    setTimeout(() => {
        updateView();
    }, 500);
}
function updateView() {
    if (!contentRef.value) return;
    const { height, width } = contentRef.value.getBoundingClientRect();
    // 内容必须要撑开高度宽度
    contentHeight = height;
    contentWidth = width;
    $emit('resize', { height, width });
}
/**
 * 开始滚动
 * @method start
 */
function start() {
    isPause = false;
    switch (props.direction) {
        case 'up':
            scrollPosition = scrollPosition || 0;
            scrollUp();
            break;
        case 'down':
            scrollPosition = scrollPosition || contentHeight;
            scrollDown();
            break;
        case 'left':
            scrollPosition = scrollPosition || 0;
            scrollLeft();
            break;
        case 'right':
            scrollPosition = scrollPosition || contentWidth;
            scrollRight();
            break;
    }
}
/*
 * 停止
 * @method stop
 */
function stop() {
    timerId && cancelAnimationFrame(timerId);
    resumeId && clearTimeout(resumeId);
}
/**
 * 暂停
 * @method pause
 */
function pause() {
    isPause = true;
}
function scrollUp() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition += props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition >= contentHeight) {
            scrollPosition = 0;
        }
        scrollUp();
    });
}
function scrollDown() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition -= props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition <= 0) {
            scrollPosition = contentHeight;
        }
        scrollDown();
    });
}
function scrollLeft() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition += props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition >= contentWidth) {
            scrollPosition = 0;
        }
        scrollLeft();
    });
}
function scrollRight() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition -= props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition <= 0) {
            scrollPosition = contentWidth;
        }
        scrollRight();
    });
}
function resume() {
    const value = Math.floor(scrollPosition) % props.scrollLength;
    const match = value === 0;
    if (match) {
        resumeId && clearTimeout(resumeId);
        resumeId = setTimeout(start, waitTime);
    }
    return match;
}
function handleMouseEnter() {
    stop();
    isPause = true;
}
function handleMouseLeave() {
    start();
}
</script>

<style lang="scss" scoped>
@import '@/style/BEM.scss';
@include b(marquee) {
    overflow: hidden;
    @include e(scroll) {
        width: 100%;
        height: 100%;
    }
    @include m(horizontal) {
        @include e(content) {
            display: inline-block;
            white-space: nowrap;
        }
        @include e(copy-content) {
            display: inline-block;
            white-space: nowrap;
        }
    }
}
</style>

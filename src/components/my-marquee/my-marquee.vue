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
 * @module components/my-marquee
 */
import { requestAnimationFrame, cancelAnimationFrame } from '@u/util';
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
 * @property {String} [direction=up] 滚动方向，可选'up', 'down', 'left', 'right'
 * @property {Boolean} [auto=true] 自动开始
 * @property {Number} [speed=1] 滚动速度，数值越大速度越快
 * @property {Number} [waitTime=3000] 间隔滚动停顿等待时间
 * @property {Number} [scrollLength=0] 间隔滚动，每次滚动的长度，单位px
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
    }),
    $emit = defineEmits(['resize']),
    contentRef = ref();

let timerId = null,
    resumeId = null,
    copyHtml = ref(''),
    contentWidth = ref(0),
    contentHeight = ref(0),
    scrollPosition = ref(0),
    isPause = false;

let isHorizontal = computed(() => ['left', 'right'].includes(props.direction)),
    classes = computed(() => ({ 'my-marquee--horizontal': unref(isHorizontal), 'is-disabled': props.disabled })),
    scrollStyle = computed(() => ({
        transform: unref(isHorizontal) ? `translate3d(-${scrollPosition.value}px, 0, 0)` : `translate3d(0, -${scrollPosition.value}px, 0)`,
        width: unref(isHorizontal) ? `${2 * unref(contentWidth)}px` : '100%',
    }));

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
            copyHtml.value = '';
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
    copyHtml.value = '';
});

function renderCopyHtml() {
    if (!contentRef.value || props.disabled) return;
    copyHtml.value = contentRef.value.innerHTML;
    setTimeout(() => {
        updateView();
    }, 500);
}
function updateView() {
    if (!contentRef.value) return;
    const { height, width } = contentRef.value.getBoundingClientRect();
    // 内容必须要撑开高度宽度
    contentHeight.value = height;
    contentWidth.value = width;
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
            scrollPosition.value = scrollPosition.value || 0;
            scrollUp();
            break;
        case 'down':
            scrollPosition.value = scrollPosition.value || contentHeight.value;
            scrollDown();
            break;
        case 'left':
            scrollPosition.value = scrollPosition.value || 0;
            scrollLeft();
            break;
        case 'right':
            scrollPosition.value = scrollPosition.value || contentWidth.value;
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
        scrollPosition.value += props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition.value >= contentHeight.value) {
            scrollPosition.value = 0;
        }
        scrollUp();
    });
}
function scrollDown() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition.value -= props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition.value <= 0) {
            scrollPosition.value = contentHeight.value;
        }
        scrollDown();
    });
}
function scrollLeft() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition.value += props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition.value >= contentWidth.value) {
            scrollPosition.value = 0;
        }
        scrollLeft();
    });
}
function scrollRight() {
    timerId = requestAnimationFrame(() => {
        if (isPause) return;
        scrollPosition.value -= props.speed;
        if (resume()) {
            isPause = true;
            return;
        }
        if (scrollPosition.value <= 0) {
            scrollPosition.value = contentWidth.value;
        }
        scrollRight();
    });
}
function resume() {
    const value = Math.floor(scrollPosition.value) % props.scrollLength;
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

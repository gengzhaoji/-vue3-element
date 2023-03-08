<template>
    <div :class="classes">
        <slot :value="displayValue">
            {{ displayValue }}
        </slot>
    </div>
</template>

<script setup name="MyTimer">
/**
 * 计时器组件
 * @module components/my-timer
 */

import Dayjs from 'dayjs';
/**
 * 属性参数
 * @member props
 * @property {String|Number} [target] 设定值，String为时间格式，Number是秒数，  countdown为true， 是开始值， countdown为false时结束值
 * @property {String} [format=HH:mm:ss] 显示格式
 * @property {Boolean} [countdown=false] 倒数模式
 * @property {String} [type] 颜色,可选值 'primary', 'success', 'warning', 'danger', 'info'
 * @property {Boolean} [auto=false] 自动运行
 * @property {Number} [interval=1000] 执行时间隔 单位 ms
 */
const props = defineProps({
        // 设定值，String为时间格式，Number是秒数，  countdown为true， 是开始值， countdown为false时结束值
        target: [String, Number],
        // 显示格式
        format: {
            type: String,
            default: 'HH:mm:ss',
        },
        // 倒数模式
        countdown: Boolean,
        // 颜色
        type: {
            type: String,
            validator(val) {
                return ['primary', 'success', 'warning', 'danger', 'info'].includes(val);
            },
        },
        // 自动开始
        auto: Boolean,
        // 执行时间隔 单位 ms
        interval: {
            type: Number,
            default: 1000,
        },
    }),
    $emits = defineEmits(['start', 'stop', 'reset', 'finish', 'tick']);

// 属性、方法抛出
defineExpose({ start, stop, reset });

watch(
    () => props.target,
    () => {
        init();
    }
);

let timerId = null,
    dayjs = ref(null),
    targetDayjs = null,
    minDayjs = null,
    isFinish = ref(false);

const classes = computed(() => ({
        'my-timer': true,
        [`is-${props.type}`]: !!props.type,
        'is-finish': isFinish.value,
    })),
    displayValue = computed(() => (dayjs.value ? dayjs.value.format(props.format) : ''));

function init() {
    reset();
    props.auto && start();
}
function getTarget() {
    if (!props.target) return getMax();

    if (typeof props.target === 'number') return getMin().second(props.target);

    if (typeof props.target === 'string') return Dayjs(`${getMin().format('YYYY-MM-DD')} ${props.target}`);
}
function getMin() {
    return Dayjs().hour(0).minute(0).second(0).millisecond(0);
}
function getMax() {
    return Dayjs().hour(23).minute(59).second(59);
}
/**
 * 开始运行
 * @method start
 */
function start() {
    if (!dayjs.value) return;
    clearInterval(timerId);
    timerId = setInterval(() => {
        tick();
    }, props.interval);
    /**
     * 开始运行时触发
     * @event start
     * @param {Dayjs} dayjs 时间对象
     */
    $emits('start', dayjs.value);
}
/**
 * 停止运行
 * @method stop
 */
function stop() {
    clearInterval(timerId);
    /**
     * 停止时触发
     * @event stop
     * @param {Dayjs} dayjs 时间对象
     */
    $emits('stop', dayjs.value);
}
/**
 * 重置
 * @method reset
 */
function reset() {
    isFinish.value = false;
    clearInterval(timerId);
    minDayjs = Object.freeze(getMin());
    targetDayjs = Object.freeze(getTarget());
    dayjs.value = props.countdown ? Object.freeze(getTarget()) : Object.freeze(getMin());
    /**
     * 重置时触发
     * @event reset
     * @param {Dayjs} dayjs 时间对象
     */
    $emits('reset', dayjs.value);
}
function tick() {
    if (!dayjs.value) return;
    if (props.countdown) {
        dayjs.value = Object.freeze(dayjs.value.subtract(props.interval, 'millisecond'));
        if (dayjs.value.valueOf() === minDayjs.valueOf()) isFinish.value = true;
    } else {
        dayjs.value = Object.freeze(dayjs.value.add(props.interval, 'millisecond'));
        if (dayjs.value.valueOf() === targetDayjs.valueOf()) isFinish.value = true;
    }
    if (isFinish.value) {
        clearInterval(timerId);
        /**
         * 完成时触发
         * @event finish
         * @param {Dayjs} dayjs 时间对象
         */
        $emits('finish', dayjs.value);
    } else {
        /**
         * 时间跳动时触发
         * @event tick
         * @param {Dayjs} dayjs 时间对象
         */
        $emits('tick', dayjs.value);
    }
}
onMounted(() => {
    init();
});
onBeforeUnmount(() => {
    clearInterval(timerId);
});
</script>

<style lang="scss" scoped>
.my-timer {
    display: inline-block;
    font-family: DS-DIGI, Arial, Helvetica, sans-serif;
}
.is-primary {
    color: var(--el-color-primary);
}
.is-success {
    color: var(--el-color-success);
}
.is-warning {
    color: var(--el-color-warning);
}
.is-danger {
    color: var(--el-color-danger);
}
.is-info {
    color: var(--el-color-info);
}
</style>

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
 * @module $ui/components/my-timer
 */

import Dayjs from 'dayjs';
/**
 * 属性参数
 * @member props
 * @property {string|number} [target] 设定值，String为时间格式，Number是秒数，  countdown为true， 是开始值， countdown为false时结束值
 * @property {string} [format=HH:mm:ss] 显示格式
 * @property {boolean} [countdown=false] 倒数模式
 * @property {string} [type] 颜色,可选值 'primary', 'success', 'warning', 'danger', 'info'
 * @property {boolean} [auto=false] 自动运行
 * @property {boolean} [interval=1000] 执行时间隔 单位 ms
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
    $emit = defineEmits(['start', 'stop', 'reset', 'finish', 'tick']);
// 属性、方法抛出
defineExpose({ start });

watch(
    () => props.target,
    () => {
        init();
    }
);

let timerId = null,
    dayjs = $ref(null),
    targetDayjs = $ref(null),
    minDayjs = $ref(null),
    isFinish = $ref(false);

const classes = computed(() => ({
        'my-timer': true,
        [`is-${props.type}`]: !!props.type,
        'is-finish': isFinish,
    })),
    displayValue = computed(() => (dayjs ? dayjs.format(props.format) : ''));

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
    if (!dayjs) return;
    clearInterval(timerId);
    timerId = setInterval(() => {
        tick();
    }, props.interval);
    /**
     * 开始运行时触发
     * @event start
     * @param {Dayjs} dayjs 时间对象
     */
    $emit('start', dayjs);
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
    $emit('stop', dayjs);
}
/**
 * 重置
 * @method reset
 */
function reset() {
    isFinish = false;
    clearInterval(timerId);
    minDayjs = Object.freeze(getMin());
    targetDayjs = Object.freeze(getTarget());
    dayjs = props.countdown ? Object.freeze(getTarget()) : Object.freeze(getMin());
    /**
     * 重置时触发
     * @event reset
     * @param {Dayjs} dayjs 时间对象
     */
    $emit('reset', dayjs);
}
function tick() {
    if (!dayjs) return;
    if (props.countdown) {
        dayjs = Object.freeze(dayjs.subtract(props.interval, 'millisecond'));
        if (dayjs.valueOf() === minDayjs.valueOf()) isFinish = true;
    } else {
        dayjs = Object.freeze(dayjs.add(props.interval, 'millisecond'));
        if (dayjs.valueOf() === targetDayjs.valueOf()) isFinish = true;
    }
    if (isFinish) {
        clearInterval(timerId);
        /**
         * 完成时触发
         * @event finish
         * @param {Dayjs} dayjs 时间对象
         */
        $emit('finish', dayjs);
    } else {
        /**
         * 时间跳动时触发
         * @event tick
         * @param {Dayjs} dayjs 时间对象
         */
        $emit('tick', dayjs);
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

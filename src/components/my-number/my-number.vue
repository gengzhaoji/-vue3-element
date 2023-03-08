<template>
    <div :class="{ 'my-number': true, 'is-pointer': $attrs.click }" v-bind="$attrs">
        <span v-if="prefix || $slots.prefix" class="my-number__prefix" :class="supClass">
            <slot name="prefix">{{ prefix }}</slot>
        </span>
        <span class="my-number__value" :class="{ [`is-${type}`]: !!type }" ref="container">
            <slot :value="value" :displayValue="displayValue">
                {{ displayValue }}
            </slot>
        </span>
        <span v-if="suffix || $slots.suffix" class="my-number__suffix" :class="supClass">
            <slot name="suffix">{{ suffix }}</slot>
        </span>
        <span v-if="trend || $slots.trend" class="my-number__trend" :class="trendClasses">
            <slot name="trend" :trend="trend">
                <component :is="trendIcon" />
            </slot>
        </span>
    </div>
</template>

<script setup name="MyNumber">
/**
 * 数字组件
 * @module components/my-number
 */
import { CountUp } from 'countup.js';

/**
 * 插槽
 * @member slots
 * @property {string} default 默认插槽，定义显示内容，参数：value 原始值值，displayValue 显示值
 * @property {string} prefix 前缀内容
 * @property {string} suffix 后缀内容
 * @property {string} trend 个性化趋势显示，参数：trend 趋势方向
 */
const $emit = defineEmits(['complete']);
/**
 * 属性参数
 * @member props
 * @property {Number} [value] 原始值
 * @property {Number} [defaultValue=0] 默认值，即value无效时取defaultValue, 如果 defaultValue为null，显示空白
 * @property {Object} [countUp] CountUp配置参数对象
 * @property {Boolean} [countUp.auto=true] 是否自动开始计数，默认为自动开始
 * @property {Number} [countUp.startVal=0] 计数初始值，不限正负数，默认值为0
 * @property {Number} [countUp.duration=2] 计数器动画持续时间，即计数器从开始到结束的时间，单位为秒，默认值为2秒
 * @property {Boolean} [countUp.useEasing=true] 是否显示渐入渐出效果。默认值为显示
 * @property {String} [trend] 趋势, 可选值：'up', 'down', '-'
 * @property {Number} [precision=0] 精度，保留几位小数
 * @property {String} [separator=,] 分隔值的符号，默认值为‘,’（英文逗号）
 * @property {String} [prefix] 前缀内容，也可以用插槽定义
 * @property {String} [suffix] 后缀内容，也可以用插槽定义
 * @property {Boolean} [percentage] 按百分比计算显示, 如value=0.2, 显示为 20%
 * @property {String} [type] 颜色类型, 可选值： 'primary', 'success', 'warning', 'danger', 'info'
 * @property {Boolean} [sup] 前缀 和 后缀采用下标显示
 */
const props = defineProps({
    // 数字
    value: [Number, String],
    // 默认值
    defaultValue: {
        type: [Number, String],
        default: 0,
    },
    // CountUp配置参数对象
    countUp: {
        type: Object,
        default: () => {},
    },
    // 趋势
    trend: {
        type: String,
        validator(val) {
            return ['up', 'down', '-'].includes(val);
        },
    },
    // 精度，保留几位小数
    precision: {
        type: Number,
        default: 0,
    },
    // 分隔符
    separator: {
        type: String,
        default: ',',
    },
    // 前缀
    prefix: {
        type: String,
    },
    // 后缀
    suffix: String,
    // 按百分比计算显示
    percentage: Boolean,
    // 颜色类型
    type: {
        type: String,
        default: '',
        validator(val) {
            return ['', 'primary', 'success', 'warning', 'danger', 'info'].includes(val);
        },
    },
    // 前缀 和 后缀采用下标显示
    sup: Boolean,
});

// 计算属性
const displayValue = computed(() => {
        if (!isNumber(props.value)) return props.defaultValue ? getPercent(props.defaultValue) : '';
        if (props.percentage) return getPercent(props.value);
        return format(props.value, props.precision, props.separator);
    }),
    trendIcon = computed(() => {
        if (!props.trend) return null;
        const classes = {
            up: 'Top',
            down: 'Bottom',
            '-': 'Minus',
        };
        return classes[props.trend];
    }),
    // 趋势样式
    trendClasses = computed(() => {
        if (!props.trend) return;
        if (props.trend === '-') {
            return 'is-default';
        }
        return `is-${props.trend}`;
    }),
    // 样式
    classes = computed(() => ({
        'my-number': true,
        'is-pointer': useAttrs().click,
        [`is-${props.type}`]: !!props.type,
    })),
    // 角标样式
    supClass = computed(() => ({
        'my-number__sup': !!props.sup,
    })),
    // countUp配置参数
    countUpOptions = computed(() => ({
        auto: true, // 是否自动开始计数，默认为自动开始
        startVal: 0, // 计数初始值，不限正负数，默认值为0
        decimalPlaces: 0, // 计数器数值精度。默认值为0
        duration: 2, // 计数器动画持续时间，即计数器从开始到结束的时间，单位为秒，默认值为2秒
        useEasing: true, // 是否显示渐入渐出效果。默认值为显示
        useGrouping: true, // 计数器是否采用带格式的值，如10,000和10000两种格式（分隔符用separator来定义），默认值为使用
        separator: ',', // 分隔值的符号，默认值为‘,’（英文逗号）
        separator: props.separator,
        decimalPlaces: props.precision,
        ...props.countUp,
    }));

// 监听
watch(
    () => props.value,
    (val) => {
        update(val);
    }
);
watch(
    () => countUpOptions.value,
    (val) => {
        if (!countUpOptions.value) return;
        init();
    }
);

function isNumber(n) {
    const val = Number.parseFloat(n);
    return !Number.isNaN(val) && Number.isFinite(val);
}
function getPercent(val) {
    return props.percentage ? `${(Number.parseFloat(val) * 100).toFixed(props.precision)}%` : val;
}
/**
 * 数字显示分隔符
 * @param val
 * @param n
 * @param separator
 * @return {string}
 */
function format(val, n, separator) {
    const s = Number.parseFloat(String(val).replace(/[^\d.-]/g, '')).toFixed(n) + '';
    const l = s.split('.')[0].split('').reverse();
    const r = s.split('.')[1];
    let t = '';
    for (let i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 === 0 && i + 1 !== l.length ? `${separator}` : '');
    }
    return t.split('').reverse().join('') + (r ? `.${r}` : '');
}

let counter;
const container = ref(null);
/**
 * 生成计数器
 */
function setCountUp() {
    if (counter) counter = null;
    counter = new CountUp(unref(container), props.value, countUpOptions.value);
}
/**
 * 重新启动计数器
 */
function restart() {
    setCountUp();
    start();
}
/**
 * 启动计数器
 */
function start() {
    reset();
    counter?.start(onComplete);
}
/**
 * 切换暂停/恢复计数器
 */
function pauseResume() {
    counter?.pauseResume();
}
/**
 * 重置计数器
 */
function reset() {
    counter?.reset();
}
/**
 * 更新计数器的结束时间
 * @param num 计数结束值
 */
function update(num) {
    counter?.update(num || props.value);
}
/**
 * 计数器计数完成的回调方法
 */
function onComplete() {
    $emit('complete');
}
/**
 * 初始化逻辑
 */
function init() {
    setCountUp();
    if (countUpOptions.value.auto) start();
}
onMounted(() => {
    if (!props.percentage) init();
});
onBeforeUnmount(() => {
    counter = null;
});
</script>

<style lang="scss" scoped>
.my-number {
    display: inline-flex;
    > span {
        vertical-align: middle;
    }
    &__sup {
        font-size: 14px;
    }
    &__trend {
        width: 1.5rem;
    }
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
.is-up {
    color: #f5222d;
}
.is-down {
    color: #52c41a;
}
.is-default {
    color: var(--el-color-primary);
}
</style>

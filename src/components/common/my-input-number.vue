<template>
    <el-input ref="input" v-model="fieldValue" :clearable="clearable" :size="$store.user.size" :maxlength="20" v-bind="$attrs">
        <template #prefix v-if="$slots.prefix">
            <slot name="prefix"></slot>
        </template>
        <template #suffix v-if="$slots.suffix">
            <slot name="suffix"></slot>
        </template>
        <template #prepend v-if="$slots.prepend">
            <slot name="prepend"></slot>
        </template>
        <template #append v-if="$slots.append">
            <slot name="append"></slot>
        </template>
    </el-input>
</template>

<script setup name="my-input-number">
const emits = defineEmits(['update:modelValue']),
    /***
     * 参数属性
     * @property {} modelValue 默认值
     * @property {String} numberType 数据类型（整型，浮点型）默认为整型，float-n，n为保留小数点后几位
     */
    props = defineProps({
        modelValue: null,
        numberType: {
            type: [String],
            default: 'init',
            validator: function (val) {
                const data = val.split('-');
                return ['init', 'float'].includes(data[0]);
            },
        },
        numberLength: Number,
        clearable: {
            type: Boolean,
            default: true,
        },
    }),
    type = computed(() => props.numberType.split('-')[0]),
    digit = computed(() => props.numberType.split('-')[1]);

let fieldValue = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emits('update:modelValue', setNum(val));
    },
});

// 数字最终结果逻辑
const attrs = useAttrs();
function setNum(val) {
    if (type.value === 'float') {
        val = val.replace(/[^\d.]/g, '').replace(/^\./, ''); //只保留数字和点(".")，其余的字符都去掉,以.开始的也去掉
        val = val.replace(/\.{2,}/g, '.'); //只保留第一个点("."),有两个点(".")只保留一个
        val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); //把点(".")进行转换防止被正则表达式抹掉
        val = val.replace(new RegExp(`^(\\-)*(\\d+)\\.(\\d{${digit.value}}).*$`), '$1$2.$3'); //限制只能输入几位小数
        if (val.indexOf('.') < 0 && val != '') {
            //限制首位不能是0
            val = parseFloat(val);
        }
    } else if (type.value === 'init') {
        val = val.replace(/[^0-9]/gi, '');
        if (props.numberLength) {
            val = val.slice(0, props.numberLength);
        }
    }
    // 判断最大值逻辑
    if (attrs.max && Number(val) > Number(attrs.max)) return attrs.max;
    // 判断最小值逻辑
    if (attrs.min && Number(val) < Number(attrs.min)) return attrs.min;
    return val;
}
</script>

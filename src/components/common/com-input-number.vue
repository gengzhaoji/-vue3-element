<template>
    <el-input ref="input" v-model="fieldValue" :clearable="clearable" :size="$store.state.user.size" :maxlength="20" v-bind="$attrs">
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

<script>
export default {
    name: 'com-input-number',
    emits: ['update:modelValue'],
    /***
     * 参数属性
     * @property {} modelValue 默认值
     * @property {String} numberType 数据类型（整型，浮点型）默认为整型，float-n，n为保留小数点后几位
     */
    props: {
        modelValue: null,
        numberType: {
            type: [String],
            default: 'init',
            validator: function (val) {
                const data = val.split('-');
                return ['init', 'float'].includes(data[0]);
            },
        },
        clearable: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        fieldValue: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit('update:modelValue', this.setNum(val));
            },
        },
        type() {
            return this.numberType.split('-')[0];
        },
        digit() {
            return this.numberType.split('-')[1];
        },
    },
    methods: {
        setNum(val) {
            if (this.type === 'float') {
                val = val.replace(/[^\d.]/g, ''); //只保留数字和点(".")，其余的字符都去掉
                val = val.replace(/\.{2,}/g, '.'); //只保留第一个点("."),有两个点(".")只保留一个
                val = val.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); //把点(".")进行转换防止被正则表达式抹掉
                val = val.replace(new RegExp(`^(\\-)*(\\d+)\\.(\\d{${this.digit}}).*$`), '$1$2.$3'); //限制只能输入两位小数
                if (val.indexOf('.') < 0 && val != '') {
                    //限制首位不能是0
                    val = parseFloat(val);
                }
            } else if (this.type === 'init') {
                val = val.replace(/[^0-9]/gi, '');
            }
            // 判断最大值最小值逻辑
            if (this.$attrs.max && val > this.$attrs.max) {
                return this.$attrs.max;
            }
            if (this.$attrs.min && val < this.$attrs.min) {
                return this.$attrs.min;
            }
            return val;
        },
    },
};
</script>

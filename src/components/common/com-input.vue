<template>
    <el-input v-model="fieldValue" :maxlength="$attrs.type === 'textarea' ? 255 : 100" clearable :size="$store.state.user.size" v-bind="$attrs">
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
    name: 'com-input',
    emits: ['update:modelValue'],
    props: {
        modelValue: {
            type: String,
        },
    },
    computed: {
        fieldValue: {
            get() {
                return this.modelValue;
            },
            set(val) {
                // 文本编辑框可以输入空格和回车以及/
                this.$emit('update:modelValue', this.$attrs.type === 'textarea' ? val : val.replace(/\//gi, '').trim());
            },
        },
    },
};
</script>

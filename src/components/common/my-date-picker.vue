<template>
    <el-date-picker
        ref="elDatePicker"
        class="com"
        v-model="fieldValue"
        :shortcuts="shortcuts"
        :value-format="valueFormat"
        :format="valueFormat"
        :size="$store.user.size"
        clearable
        :editable="false"
        unlink-panels
        v-bind="$attrs"
    />
</template>

<script setup name="my-date-picker">
import date from '@u/date';
const emits = defineEmits(['update:modelValue']),
    /***
     * props
     * @property {String} modelValue 默认值
     * @property {Boolean} now 是否默认为当前时间——默认为false
     * @property {Boolean} autoshortcuts 是否添加默认规则的autoshortcuts，默认为true
     */
    props = defineProps({
        modelValue: {
            type: [String, Array, Date],
        },
        now: {
            type: Boolean,
            defaut: false,
        },
        autoshortcuts: {
            type: Boolean,
            default: true,
        },
    }),
    isArray = $ref(null),
    attrs = useAttrs();

let valueFormat = $computed(() => {
        if (attrs['value-format']) {
            return attrs['value-format'];
        } else {
            if (new RegExp('time', 'gi').test(attrs.type)) {
                return 'YYYY-MM-DD HH:mm:ss';
            } else if (new RegExp('year', 'gi').test(attrs.type)) {
                return 'YYYY';
            } else if (new RegExp('month', 'gi').test(attrs.type)) {
                return 'YYYY-MM';
            } else {
                return 'YYYY-MM-DD';
            }
        }
    }),
    fieldValue = $computed({
        get() {
            if (isArray === '') {
                isArray = Array.isArray(props.modelValue) || new RegExp('range', 'gi').test(attrs.type);
            }
            if (isArray && ['string', 'undefined'].includes(typeof props.modelValue)) {
                return props.modelValue ? [props.modelValue] : [];
            } else {
                return props.modelValue;
            }
        },
        set(val) {
            if (val == null) {
                emits('update:modelValue', isArray ? [] : '');
            } else {
                emits('update:modelValue', val);
            }
        },
    }),
    shortcuts = $computed(() => {
        if (props.autoshortcuts) {
            if (['datetimerange', 'daterange'].includes(attrs.type)) {
                return [
                    {
                        text: '最近一周',
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            return [start, end];
                        },
                    },
                    {
                        text: '最近一个月',
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start, end];
                        },
                    },
                    {
                        text: '最近三个月',
                        value: () => {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            return [start, end];
                        },
                    },
                ];
            } else {
                return [
                    {
                        text: '今天',
                        value: () => {
                            return new Date();
                        },
                    },
                    {
                        text: '昨天',
                        value: () => {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            return date;
                        },
                    },
                    {
                        text: '一周前',
                        value: () => {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            return date;
                        },
                    },
                ];
            }
        } else {
            return attrs['shortcuts'];
        }
    });

// 初始化执行逻辑
if (props.now) fieldValue = date(new Date(), valueFormat);
</script>

<style scoped lang="scss">
.el-date-editor.el-input {
    width: 100%;
}
</style>

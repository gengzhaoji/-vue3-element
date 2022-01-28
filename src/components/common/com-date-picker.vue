<template>
    <el-date-picker
        ref="elDatePicker"
        class="com"
        v-model="fieldValue"
        :shortcuts="s_shortcuts"
        :value-format="valueFormat"
        :size="$store.state.user.size"
        clearable
        :editable="false"
        unlink-panels
        v-bind="$attrs"
    />
    <!-- prefix-icon="icon-date" -->
</template>

<script>
import date from '@u/date';

export default {
    name: 'com-date-picker',
    emits: ['update:modelValue'],
    /***
     * props
     * @property {String} modelValue 默认值
     * @property {Boolean} now 是否默认为当前时间——默认为false
     * @property {Boolean} autoshortcuts 是否添加默认规则的autoshortcuts，默认为true
     */
    props: {
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
    },
    computed: {
        valueFormat: function () {
            if (this.$attrs['value-format']) {
                return this.$attrs['value-format'];
            } else {
                if (new RegExp('time', 'gi').test(this.$attrs.type)) {
                    return 'YYYY-MM-DD HH:mm:ss';
                } else if (new RegExp('year', 'gi').test(this.$attrs.type)) {
                    return 'YYYY';
                } else if (new RegExp('month', 'gi').test(this.$attrs.type)) {
                    return 'YYYY-MM';
                } else {
                    return 'YYYY-MM-DD';
                }
            }
        },
        fieldValue: {
            get() {
                if (this.isArray === '') {
                    this.isArray = Array.isArray(this.modelValue) || new RegExp('range', 'gi').test(this.$attrs.type);
                }
                if (this.isArray && typeof this.modelValue === 'string') {
                    return [this.modelValue];
                } else {
                    return this.modelValue;
                }
            },
            set(val) {
                if (val == null) {
                    this.$emit('update:modelValue', this.isArray ? [] : '');
                } else {
                    this.$emit('update:modelValue', val);
                }
            },
        },
        s_shortcuts() {
            if (this.autoshortcuts) {
                if (['datetimerange', 'daterange'].includes(this.$attrs.type)) {
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
                return this.$attrs['shortcuts'];
            }
        },
    },
    data() {
        return {
            isArray: '',
        };
    },
    created() {
        if (this.now) {
            this.fieldValue = date(new Date(), this.valueFormat);
        }
    },
};
</script>

<style scoped lang="scss">
.el-date-editor.el-input {
    width: 100%;
}
</style>

<template>
    <el-select v-model="fieldValue" :size="$store.state.user.size" clearable filterable @change="selectChange" v-bind="$attrs">
        <slot>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
        </slot>
        <template #prefix v-if="$slots.prefix">
            <slot name="prefix"></slot>
        </template>
        <template #empty v-if="$slots.empty">
            <slot name="empty"></slot>
        </template>
    </el-select>
</template>

<script>
export default {
    name: 'com-select',
    emits: ['update:modelValue', 'getLabel'],
    /***
     * 参数属性
     * @property {Object[]} modelValue 默认值
     * @property {list[]} list 下拉列表数据
     * @property {Boolean} needAll 是否需要全部选项，默认为false
     * @property {Object} fillType 数据格式默认为{'label':'label','value':'value'}
     * @property {String} this.type store.dispatch的方法名
     *
     */
    props: {
        modelValue: {
            type: [String, Number, Boolean, Array],
        },
        list: {
            type: Array,
            default: () => [],
        },
        needAll: {
            type: Boolean,
            default: false,
        },
        fileType: {
            type: Object,
            default: function () {
                return { label: 'dictLabel', value: 'dictValue' };
            },
        },
        type: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            options: [],
            catchDispatch: false,
        };
    },
    computed: {
        /**
         * 多个同一请求同一时间在执行时被取消的逻辑
         * this.$store.getters[this.type.replace("Get", "")]获取最前面执行的那一个请求的结果 因为可能为数组所以使用watch监听赋值
         */
        catchOptions() {
            if (this.catchDispatch) {
                return this.$store?.state?.dict[this.type.replace('GET', '')] || this.$store.state?.com[this.type.replace('GET', '')];
            } else {
                return [];
            }
        },
        fieldValue: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit('update:modelValue', val);
            },
        },
    },
    watch: {
        list: {
            handler(val) {
                this.initialization(val);
            },
            deep: true,
            immediate: true,
        },
        type(val) {
            if (val !== '') {
                this.$store.dispatch(val).then((data) => {
                    this.options = this.fileTypeFn(data);
                    if (this.needAll) {
                        this.options = this.needAllFn(this.options);
                    }
                });
            } else {
                this.initialization();
            }
        },
        /**
         * 监听computed所返回的数组数据--并赋值
         */
        catchOptions: {
            handler(val) {
                if (this.catchDispatch) {
                    this.options = this.fileTypeFn(val);
                    if (this.needAll) {
                        this.options = this.needAllFn(this.options);
                    }
                }
            },
            deep: true,
        },
    },
    mounted() {
        if (this.type) {
            this.$store
                .dispatch(this.type)
                .then((data) => {
                    this.options = this.fileTypeFn(data);
                    if (this.needAll) {
                        this.options = this.needAllFn(this.options);
                    }
                })
                .catch(() => {
                    this.catchDispatch = true;
                });
        } else {
            this.initialization();
        }
    },
    methods: {
        // 获取label
        selectChange(val) {
            if (typeof val === 'string') {
                this.$emit('getLabel', this.options.filter((item) => item.value === val)[0].label);
            }
        },
        initialization(list = this.list) {
            this.options = this.fileTypeFn(list);
            if (this.needAll) {
                this.options = this.needAllFn(this.options);
            }
        },
        fileTypeFn(data, fileType = this.fileType) {
            return data.map((val, i) => ({
                label: val[fileType.label],
                value: val[fileType.value],
                disabled: val[fileType.disabled] || false,
            }));
        },
        needAllFn(data) {
            const num = JSON.stringify(data).includes(JSON.stringify({ label: '全部', value: '' }));
            if (!num) {
                data.unshift({ label: '全部', value: '' });
            }
            return data;
        },
    },
};
</script>

<style lang="scss" scoped>
:deep(.el-select) {
    width: 100%;
}
</style>

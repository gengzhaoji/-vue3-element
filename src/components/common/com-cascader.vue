<template>
    <el-cascader
        ref="cascader"
        v-model="fieldValue"
        :options="options"
        :props="{
            expandTrigger: 'hover',
            value: 'id',
            emitPath: false,
            checkStrictly: true,
        }"
        :show-all-levels="false"
        filterable
        clearable
        :size="$store.state.user.size"
        @change="cascaderChange"
        v-bind="$attrs"
    />
</template>

<script>
export default {
    name: 'com-cascader',
    emits: ['update:modelValue', 'getLabel'],
    props: {
        type: '',
        modelValue: null,
        list: {
            type: Array,
            default: () => [],
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
         * this.$store.state.com[this.type.replace("Get", "")]获取最前面执行的那一个请求的结果 因为可能为数组所以使用watch监听赋值
         */
        catchOptions() {
            if (this.catchDispatch) {
                return this.$store.state.com[this.type.replace('Get', '')];
            } else {
                return [];
            }
        },
        fieldValue: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$refs.cascader.popperVisible = false;
                this.$emit('update:modelValue', val);
            },
        },
    },
    watch: {
        list: {
            handler(val) {
                this.options = val;
            },
            deep: true,
            immediate: true,
        },
        /**
         * 监听computed所返回的数组数据--并赋值
         */
        catchOptions: {
            handler(val) {
                if (this.catchDispatch) {
                    this.options = val;
                }
            },
            deep: true,
        },
    },
    methods: {
        cascaderChange(item) {
            this.$emit('getLabel', this.$refs.cascader.getCheckedNodes()[0]?.label || '');
        },
    },
    created() {
        /**
         * GetnameList 用户树
         * GetdeptList 部门数
         * GeteqptNameTree 设备树
         */
        if (this.type) {
            this.$store
                .dispatch(this.type)
                .then((data) => {
                    this.options = data;
                })
                .catch(() => {
                    this.catchDispatch = true;
                });
        }
    },
};
</script>

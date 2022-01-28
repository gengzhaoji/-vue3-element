<template>
    <el-popover placement="bottom" trigger="hover" popper-class="xdh-table-column-filter__popper">
        <template #reference>
            <i class="el-icon-setting" />
        </template>
        <template v-if="checkboxList.length">
            <el-checkbox-group v-model="fieldValue" class="flex-col">
                <el-checkbox v-for="(col, index) in checkboxList" :key="col.prop || index" :disabled="col.display === 'always'" :label="col.prop">{{ col.label }} </el-checkbox>
            </el-checkbox-group>
            <div class="m-t-5 flex m-around">
                <el-button type="primary" v-if="filterReset" size="mini" @click="filterResetClick">重 置</el-button>
                <el-button type="success" v-if="filterConfirm" size="mini" @click="filterConfirmClick">确 定</el-button>
            </div>
        </template>
        <div v-else>没有可显示的列</div>
    </el-popover>
</template>

<script>
export default {
    emits: ['update:modelValue', 'column-change-confirm'],
    props: {
        columns: {
            type: Array,
            default() {
                return [];
            },
        },
        modelValue: {
            type: Array,
            default() {
                return [];
            },
        },
        filterConfirm: {
            type: Boolean,
            default: false,
        },
        filterReset: {
            type: Boolean,
            default: true,
        },
    },
    computed: {
        checkboxList() {
            return this.columns.filter((col) => !!col.prop && !col.type);
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
    methods: {
        filterConfirmClick() {
            this.$emit('column-change-confirm');
        },
        filterResetClick() {
            this.$emit('update:modelValue', this.modelValueProxy);
        },
    },
    created() {
        this.modelValueProxy = [...this.modelValue];
    },
};
</script>

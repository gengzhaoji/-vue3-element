<template>
    <el-popover placement="bottom" trigger="hover" popper-class="my-table-column-filter__popper">
        <template #reference>
            <el-icon>
                <Setting />
            </el-icon>
        </template>
        <template v-if="checkboxList.length">
            <el-checkbox-group v-model="fieldValue" class="flex-col">
                <el-checkbox v-for="(col, index) in checkboxList" :key="col.prop || index" :disabled="col.display === 'always'" :label="col.prop">{{ col.label }} </el-checkbox>
            </el-checkbox-group>
            <div class="m-t-5 flex m-around">
                <el-button type="primary" v-if="filterReset" size="small" @click="filterResetClick">重 置</el-button>
                <el-button type="success" v-if="filterConfirm" size="small" @click="filterConfirmClick">确 定</el-button>
            </div>
        </template>
        <div v-else>没有可显示的列</div>
    </el-popover>
</template>

<script setup name="ColumnFilter">
const emits = defineEmits(['update:modelValue', 'column-change-confirm']),
    props = defineProps({
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
    }),
    checkboxList = computed(() => props.columns.filter((col) => !!col.prop && !col.type)),
    fieldValue = computed({
        get() {
            return props.modelValue;
        },
        set(val) {
            emits('update:modelValue', val);
        },
    }),
    modelValueProxy = props.columns
        .filter((col) => {
            if (!col.prop || col.type) return false;
            return col.display !== false;
        })
        .map((col) => col.prop);

function filterConfirmClick() {
    emits('column-change-confirm');
}
function filterResetClick() {
    emits('update:modelValue', modelValueProxy);
}
</script>

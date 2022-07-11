<template>
    <el-menu v-bind="$attrs">
        <menu-list :list="props.data"></menu-list>
    </el-menu>
</template>

<script setup name="myMenu">
/**
 * 菜单组件
 * @module components/my-menu
 */
const props = defineProps({
    // 菜单数据
    data: {
        type: Array,
        required: true,
        default() {
            return [];
        },
    },
});
</script>

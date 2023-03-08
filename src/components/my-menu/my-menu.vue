<template>
    <el-menu v-bind="$attrs">
        <menu-list :list="data"></menu-list>
    </el-menu>
</template>

<script setup name="MyMenu">
import MenuList from './MenuList.vue';
/**
 * 菜单组件
 * @module components/my-menu
 */
defineProps({
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

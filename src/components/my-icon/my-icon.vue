<template>
    <el-icon v-if="ElIcon" v-bind="$attrs">
        <component :is="icon" />
    </el-icon>
    <i :class="icon" v-bind="$attrs" v-else />
</template>

<script setup name="MyIcon">
/**
 * 图标组件
 * @module components/my-icon
 */

/**
 * 属性参数
 * @member props
 * @property {string} [icon] 图标名称，className 支持 Element 和 IconFont。
 * @property {Boolean} [ElIcon] 是否是 ElIcon 组件图标
 */
defineProps({
    icon: String,
    ElIcon: {
        type: Boolean,
        default: true,
    },
});
</script>

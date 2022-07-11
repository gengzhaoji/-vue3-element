<template>
    <el-tooltip class="item" effect="dark" :content="isFullscreen ? '退出全屏' : '全屏'">
        <el-icon @click="toggle">
            <full-screen />
        </el-icon>
    </el-tooltip>
</template>

<script setup name="screen">
import { useFullscreen } from '@vueuse/core';
const { isFullscreen, toggle } = useFullscreen();
</script>

<style lang="scss" scoped>
.el-icon {
    cursor: pointer;
    &:focus {
        outline: none;
    }
}
</style>

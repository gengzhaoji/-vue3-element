<template>
    <el-tooltip class="item" effect="dark" :content="isFullscreen ? '退出全屏' : '全屏'">
        <i class="sfont el-icon-full-screen" @click="toggle" />
    </el-tooltip>
</template>

<script>
import { defineComponent } from 'vue';
import { useFullscreen } from '@vueuse/core';

export default defineComponent({
    name: 'screen',
    setup() {
        const { isFullscreen, toggle } = useFullscreen();
        return {
            isFullscreen,
            toggle,
        };
    },
});
</script>

<style lang="scss" scoped>
i {
    cursor: pointer;
    font-size: 18px;
    &:focus {
        outline: none;
    }
}
</style>

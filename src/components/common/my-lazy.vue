<template>
    <div ref="lazyRef">
        <slot v-if="lazyShow"></slot>
    </div>
</template>

<script setup name="myLazy">
import { useIntersectionObserver } from '@vueuse/core';
let lazyShow = $ref(false),
    lazyRef = $ref(null);

onMounted(() => {
    const { stop } = useIntersectionObserver(lazyRef, ([{ isIntersecting }]) => {
        // 如果元素可以，发送请求获取数据，并停止检测避免重复发送请求
        if (isIntersecting) {
            lazyShow = true;
            stop();
        }
    });
});
</script>

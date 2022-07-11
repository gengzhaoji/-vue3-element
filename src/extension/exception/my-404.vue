<template>
    <my-exception description="很抱歉，你访问的页面不存在" :img="img" />
</template>

<script setup name="404">
import myException from './components/my-exception.vue';
import img from './img/404.svg';
</script>

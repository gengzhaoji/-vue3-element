<template>
    <my-exception description="很抱歉，服务器出错了" :img="img" />
</template>

<script setup name="500">
import myException from './components/my-exception.vue';
import img from './img/500.svg';
</script>

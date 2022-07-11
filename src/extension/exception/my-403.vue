<template>
    <my-exception description="很抱歉，你无权访问该页面" :img="img" />
</template>

<script setup name="403">
import myException from './components/my-exception.vue';
import img from './img/403.svg';
</script>

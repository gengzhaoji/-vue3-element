<template>
    <el-button ref="elButton" :size="$store.state.user.size" v-bind="$attrs">
        <slot></slot>
    </el-button>
</template>

<script>
export default {
    name: 'com-button',
};
</script>

<template>
    <el-button
        ref='elButton'
        v-preventReClick
        v-bind="$attrs"
        :size='$attrs.size || $store.getters.size'
    >
        <slot></slot>
    </el-button>
</template>
 
<script>
export default {
  name: "com-button"
};
</script>
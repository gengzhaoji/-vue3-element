<template>
    <el-button ref="elButton" link class="caozuo" type="primary" :size="$store.user.size" v-bind="$attrs">
        <template #default v-if="$slots.default">
            <slot name="default"></slot>
        </template>
    </el-button>
</template>

<script setup name="my-button-text"></script>

<style lang="scss">
.caozuo + .caozuo {
    > span {
        border-left: 1px solid #e6e9f4;
        padding-left: 10px;
    }
}
</style>

<template>
    <el-button ref="elButton" :size="$store.user.size" v-bind="$attrs">
        <template #default v-if="$slots.default">
            <slot name="default"></slot>
        </template>
    </el-button>
</template>

<script setup name="my-button"></script>

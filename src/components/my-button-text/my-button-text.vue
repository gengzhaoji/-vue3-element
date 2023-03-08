<template>
    <my-button ref="elButton" link class="caozuo" type="primary" v-bind="$attrs">
        <template #default v-if="$slots.default">
            <slot name="default"></slot>
        </template>
    </my-button>
</template>

<script setup name="MyButtonText"></script>

<style lang="scss">
.caozuo + .caozuo {
    margin-left: 0;
    > span {
        border-left: 1px solid #e6e9f4;
        padding-left: 10px;
    }
}
</style>

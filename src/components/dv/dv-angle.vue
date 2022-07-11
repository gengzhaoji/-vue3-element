<template>
    <div class="angle">
        <div class="jiao"></div>
        <div class="jiao2"></div>
        <div class="padding-10 h100 flex-col">
            <slot />
        </div>
    </div>
</template>

<script setup name="DvAngle"></script>
<style scoped lang="scss">
$jiao-width: 14px;
$jiao-color: #168ae4;
.angle {
    position: relative;
    background: rgba(4, 7, 17, 0.7);
    border: 1px solid rgba(0, 116, 255, 0.2);
    box-shadow: 0px 0px 40px 10px rgba(0, 116, 255, 0.2) inset;
    .jiao {
        display: inline-block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        &:before {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border: 1px solid $jiao-color;
            border-right: 0;
            border-bottom: 0;
            position: absolute;
            top: 0;
            left: 0;
        }
        &:after {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border: 1px solid $jiao-color;
            border-left: 0;
            border-bottom: 0;
            position: absolute;
            top: 0;
            right: 0;
        }
    }
    .jiao2 {
        display: inline-block;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        &:before {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border: 1px solid $jiao-color;
            border-right: 0;
            border-top: 0;
            position: absolute;
            bottom: 0;
            left: 0;
        }
        &:after {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border: 1px solid $jiao-color;
            border-left: 0;
            border-top: 0;
            position: absolute;
            bottom: 0;
            right: 0;
        }
    }
}
</style>

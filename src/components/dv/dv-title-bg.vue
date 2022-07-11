<template>
    <div class="title-bg">
        <div class="tiao"></div>
        <div class="title">
            <span></span>
            <div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.title-bg {
    height: 34px;
    line-height: 34px;
    font-size: 18px;
    color: #ffffff;
    display: flex;
    .tiao {
        width: 5px;
        height: 100%;
        background: #1f4ca2;
        opacity: 0.59;
    }
    .title {
        margin-left: 5px;
        background: linear-gradient(270deg, rgba(31, 76, 162, 0) 0%, rgba(31, 76, 162, 0.59) 100%);
        > span {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #ffffff;
            border-radius: 50%;
            margin: 0 10px 2px;
        }
        > div {
            display: inline-block;
            min-width: 210px;
        }
    }
}
</style>

<template>
    <div class="my-corner-mark" :class="classes" :id="MyCornerMarkId">
        <div class="my-corner-mark_wrapper">
            <slot></slot>
        </div>
    </div>
</template>

<script setup name="MyCornerMark">
import { guid } from '@u/util';
/**
 * 角标
 * @module components/my-corner-mark
 */
/**
 * 插槽
 * @member slots
 * @property {string} default 内容
 */
const MyCornerMarkId = `MyCornerMarkId${guid()}`,
    /**
     *属性参数
     * @member props
     * @property {string} [type=primary] 颜色，支持'primary', 'success', 'warning', 'danger','info'
     * @property {string} [size] 尺寸，支持 'large', '', 'small',
     * @property {string} [target] 添加到目标的选择器
     */
    props = defineProps({
        type: {
            type: String,
            default: 'primary',
            validator(val) {
                return ['primary', 'success', 'warning', 'danger', 'info'].includes(val);
            },
        },
        size: {
            type: String,
            default: '',
            validator(val) {
                return ['large', '', 'small'].includes(val);
            },
        },
        target: [String, HTMLElement],
    });
const classes = computed(() => ({
    [`is-${props.size}`]: !!props.size,
    [`is-${props.type}`]: !!props.type,
}));
let targetEl, $el;
onMounted(() => {
    $el = document.getElementById(MyCornerMarkId);
    targetEl = typeof props.target === 'string' ? document.querySelector(props.target) : props.target;
    if (targetEl) targetEl.appendChild($el);
});
onBeforeUnmount(() => {
    if (targetEl) targetEl.removeChild($el);
});
</script>

<style lang="scss" scoped>
.my-corner-mark {
    width: 100px;
    height: 100px;
    transform: translate(50%, -50%);
    position: absolute;
    right: 20px;
    top: 20px;
    overflow: hidden;
    z-index: 10;
    .my-corner-mark_wrapper {
        height: 24px;
        line-height: 24px;
        background: var(--el-color-primary);
        color: var(--el-color-primary-light-9);
        text-align: center;
        box-shadow: var(--el-box-shadow-base);
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translateY(-50%) rotate(45deg);
    }
}
.is-success .my-corner-mark_wrapper {
    background: var(--el-color-success);
    color: var(--el-color-success-light-9);
}
.is-warning .my-corner-mark_wrapper {
    background: var(--el-color-warning);
    color: var(--el-color-warning-light-9);
}
.is-danger .my-corner-mark_wrapper {
    background: var(--el-color-danger);
    color: var(--el-color-danger-light-9);
}
.is-info .my-corner-mark_wrapper {
    background: var(--el-color-info);
    color: var(--el-color-info-light-9);
}
.is-large {
    width: 130px;
    right: 30px;
    top: 30px;
    .my-corner-mark_wrapper {
        height: 30px;
        line-height: 30px;
        font-size: 16px;
    }
}
.is-small {
    width: 80px;
    right: 14px;
    top: 14px;
    .my-corner-mark_wrapper {
        height: 20px;
        line-height: 20px;
        font-size: 12px;
    }
}
</style>

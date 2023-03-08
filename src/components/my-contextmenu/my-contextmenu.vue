<template>
    <Teleport to="body">
        <div class="my-contextmenu" v-show="visible" :class="classes" :style="styles">
            <CornerMenu v-if="visible" ref="menu" :items="data" />
        </div>
    </Teleport>
</template>

<script setup name="MyContextmenu">
/**
 * 右键菜单组件
 * @module $ui/components/my-contextmenu
 */
import { on, off } from '@u/dom';
import CornerMenu from './src/CornerMenu.vue';

/**
 * 点击菜单项时触发
 * @event click
 * @param {Object} item 菜单项数据
 * @param {Object} vm 菜单项实例
 */
const emit = defineEmits(['click']),
    /**
     * 属性参数
     * @member props
     * @property {String} [theme=light] 主题配色，可选 'light', 'dark'
     * @property {Array} [data] 菜单项数据，[{icon, label, info, disabled, divider, children}]
     * @property {String} [data.icon] 图标
     * @property {String} [data.label] 标题文本
     * @property {String} [data.info] 附加信息文本
     * @property {Boolean} [data.disabled] 禁用
     * @property {Boolean} [data.divider] 分割线
     * @property {Array} [data.children] 子菜单项
     * @property {Boolean} [disabled] 禁用菜单
     * @property {Number} [zIndex=1000] 显示层级
     * @property {String|HTMLElement|Function} [target=document.body] 触发菜单容器，支持选择器和函数，默认 document.body
     * @property {Boolean} [manual] 手动模式，需要自行调用show 、hide 方法
     */
    props = defineProps({
        // 主题风格
        theme: {
            type: String,
            default: 'light',
            validator(val) {
                return ['light', 'dark'].includes(val);
            },
        },
        // 数据 [{icon, label, info, disabled, divider, children}]
        data: {
            type: Array,
            default() {
                return [];
            },
        },
        disabled: Boolean,
        zIndex: {
            type: Number,
            default: 1000,
        },
        target: {
            type: [String, Function], // HTMLElement 文档打包报错，使用时添加即可
            default() {
                return document.body;
            },
        },
        // 手动控制菜单显示
        manual: Boolean,
    }),
    styles = computed(() => ({
        left: `${x.value}px`,
        top: `${y.value}px`,
        zIndex: props.zIndex,
    })),
    classes = computed(() => ({
        [`is-${props.theme}`]: !!props.theme,
    }));

let visible = ref(false),
    x = ref(0),
    y = ref(0);

// 获取监听的dom
function getTarget() {
    let el = document.body;
    if (typeof props.target === 'string') el = document.querySelector(props.target);
    if (typeof props.target === 'function') el = props.target();
    return el;
}
function handleContextMenu(e) {
    if (props.disabled) return;
    e.preventDefault();
    if (!props.manual) show({ pageX: e.pageX, pageY: e.pageY });
    return false;
}
const menu = shallowRef();
function getPlacement(x, y) {
    const targetRect = triggerTarget.value.getBoundingClientRect();
    if (unref(menu).rect.height + y - Math.abs(targetRect.top) >= targetRect.height) {
        y -= unref(menu).rect.height;
    }
    if (unref(menu).rect.width + x - Math.abs(targetRect.left) >= targetRect.width) {
        x -= unref(menu).rect.width;
    }
    return { x, y };
}

function show({ pageX, pageY }) {
    visible.value = true;
    nextTick(() => {
        nextTick(() => {
            const placement = getPlacement(pageX, pageY);
            x.value = placement.x;
            y.value = placement.y;
        });
    });
}
function hide() {
    visible.value = false;
}

let triggerTarget = shallowRef();
onMounted(() => {
    triggerTarget.value = getTarget();
    on(triggerTarget.value, 'contextmenu', handleContextMenu);
    on(document.body, 'click', hide);
});
onUnmounted(() => {
    off(triggerTarget.value, 'contextmenu', handleContextMenu);
    off(document.body, 'click', hide);
    triggerTarget.value = null;
});
provide('wrapper', {
    show,
    hide,
    triggerTarget,
    visible,
    emit,
});
defineExpose({ visible });
</script>

<style lang="scss">
@import '@/style/BEM.scss';

@include b(contextmenu) {
    position: absolute;
    z-index: 1000;
    font-size: 14px;
    left: 0;
    top: 0;

    @include e(menu) {
        display: block;
        box-shadow: var(--el-box-shadow);
        list-style: none;
        margin: 0;
        padding: 4px 0;
        min-width: 100px;
        border-radius: var(--el-border-radius-small);
        background: var(--el-bg-color-page);
    }

    @include e(item) {
        position: relative;
        padding: 0 8px;
        height: 30px;
        line-height: 30px;
        cursor: pointer;
        clear: both;
        color: var(--el-text-color-primary);
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;
        &:hover {
            background: var(--el-color-primary);
            color: var(--el-color-primary-light-9);
        }

        @include when(disabled) {
            color: var(--el-text-color-secondary);
            cursor: not-allowed;
            &:hover {
                background: inherit;
            }
        }

        @include when(has-child) {
            @include e(info) {
                padding-right: 0;
            }
        }

        > .my-contextmenu__menu {
            position: absolute;
            left: 100%;
            top: -4px;
            white-space: nowrap;
            @include when(left) {
                left: 0;
                transform: translateX(-100%);
            }
            @include when(bottom) {
                bottom: 0;
                top: initial;
            }
        }
    }

    @include e(divider) {
        height: 0;
        border-top: 1px solid var(--el-border-color);
        margin: 2px 0;
        clear: both;
    }

    @include e(label) {
        margin-right: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        vertical-align: top;
    }

    @include e(icon) {
        width: 20px;
        display: inline-block;
        vertical-align: top;
        .my-icon.is-svg {
            vertical-align: middle;
            transform: translateY(-2px);
        }
    }

    @include e(info) {
        padding-right: 10px;
        opacity: 0.7;
    }
    @include e(arrow) {
        margin-right: -4px;
    }

    @include when(dark) {
        @include e(menu) {
            background: var(--el-color-black);
        }
        @include e(item) {
            color: var(--el-color-white);
            @include when(disabled) {
                color: var(--el-color-primary-light-9);
                cursor: not-allowed;
                &:hover {
                    background: transparent;
                }
            }
        }

        @include e(divider) {
            border-top: 1px solid var(--el-border-color-dark);
        }
    }
}
</style>

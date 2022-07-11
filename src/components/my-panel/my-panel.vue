<template>
    <el-card class="my-panel" :shadow="shadow" :class="classes" :bodyStyle="cardBodyStyle">
        <template v-if="header" #header>
            <div class="my-panel__header" :style="headerStyle">
                <slot name="header">
                    <my-header :title="title" :icon="icon" :theme="titleTheme" :size="size" :background="titleBackground">
                        <template #title>
                            <slot name="title"></slot>
                        </template>
                        <template #handle>
                            <slot name="handle"></slot>
                        </template>
                    </my-header>
                </slot>
            </div>
        </template>

        <div class="my-panel__body" :class="{ 'is-fit': fit }" :style="bodyStyle">
            <slot></slot>
        </div>
    </el-card>
</template>

<script setup name="MyPanel">
/**
 * 面板容器组件
 * @module components/my-panel
 */

/**
 * 插槽
 * @member slots
 * @property {string} default 默认插槽，定义容器放置的内容
 * @property {string} header 自定义头部内容，如果自定义头部，title 和 handle 插槽将失效
 * @property {string} title 定义标题内容
 * @property {string} handle 定义右上角的操作区
 */

/**
 * 属性参数
 * @member props
 * @property {boolean} [header=true] 是否显示头部
 * @property {string} [shadow=always] 设置阴影显示时机，可选值：'always', 'hover', 'never'
 * @property {string} [title] 标题文本，如果需要设置复制的标题，可以使用title插槽
 * @property {string} [icon] 标题左侧的图标
 * @property {string} [theme] 风格设置，可选值：['', 'background', 'flag', 'border-left', 'border-top', 'border-bottom', 'bg-icon', 'bg-down', 'bg-right']
 * @property {boolean} [fit=false] 设置自适应父节点的高度
 * @property {string} [size] 设置尺寸，可选值：'', 'large', 'medium', 'small'
 * @property {boolean} [border=true] 设置是否显示边框
 * @property {Object} [bodyStyle] 主体内容设置样式
 * @property {Object} [headerStyle] 头部设置样式
 */
const props = defineProps({
    // 显示头部
    header: {
        type: Boolean,
        default: true,
    },
    // 设置阴影显示时机
    shadow: {
        type: String,
        default: 'always',
        validator(val) {
            return ['always', 'hover', 'never'].includes(val);
        },
    },
    // 标题文本
    title: String,
    // 标题 icon
    icon: [String, Object, Function],
    // 主题风格
    theme: {
        type: String,
        validator(val) {
            return ['', 'background', 'flag', 'border-left', 'border-top', 'border-bottom', 'bg-icon', 'bg-down', 'bg-right'].includes(val);
        },
    },
    // 充满夫容器
    fit: Boolean,
    // 尺寸
    size: String,
    // body样式
    bodyStyle: Object,
    // 头部样式
    headerStyle: Object,
    // 显示边框
    border: {
        type: Boolean,
        default: true,
    },
});
const titleBackground = computed(() => props.theme === 'background'),
    titleTheme = computed(() => {
        if (props.theme === 'flag') return 'bg-down';
        if (props.theme === 'border-left') return 'border-left';
        return props.theme;
    }),
    classes = computed(() => ({
        [`my-panel--${props.theme}`]: !!props.theme,
        'is-no-border': !props.border,
        'is-fit': props.fit,
        [`is-${props.size}`]: !!props.size,
    })),
    cardBodyStyle = computed(() => {
        if (!props.fit) return null;
        return {
            flex: 1,
            height: 0,
        };
    });
</script>

<style scoped lang="scss">
@import '@/style/BEM.scss';

$default-padding: 1.2rem;
$large-padding: 1rem;
$medium-padding: 0.8rem;
$small-padding: 0.5rem;
$--border-radius-base: 4px;
@include b(panel) {
    box-sizing: border-box;
    position: relative;

    > :deep(.el-card__header) {
        padding: 0;
    }
    > :deep(.el-card__body) {
        padding: 0;
    }

    @include e(header) {
        > .my-header {
            margin-bottom: 0;
        }
    }

    @include e(handle) {
        position: absolute;
        right: $default-padding;
        top: calc($default-padding/2);
    }

    @include e(body) {
        padding: $default-padding;
        box-sizing: border-box;
        @include when(fit) {
            overflow: auto;
            height: 100%;
        }
    }

    @include when(no-border) {
        border-color: transparent;
    }
    @include when(fit) {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    @include m(flag) {
        > :deep(.el-card__header) {
            border-bottom: 0;

            .my-title__content {
                left: 1rem;
            }
        }
    }
    @include m(bg-right) {
        > :deep(.el-card__header) {
            border-bottom: 0;
        }
    }

    @include m(background) {
        > :deep(.el-card__header) {
            border-bottom: 0;
        }
    }

    @include m(border-top) {
        &::before {
            content: '';
            border-top: $--border-radius-base solid var(--el-color-primary);
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            border-radius: $--border-radius-base $--border-radius-base 0 0;
        }

        > :deep(.el-card__header) {
            border-bottom: 0;
        }
    }

    @include when(large) {
        @include e(body) {
            padding: $large-padding;
        }
        @include e(handle) {
            right: $large-padding;
            top: $large-padding;
        }
    }

    @include when(medium) {
        @include e(body) {
            padding: $medium-padding;
        }
        @include e(handle) {
            right: $medium-padding;
            top: calc($medium-padding/2);
        }
    }

    @include when(small) {
        @include e(body) {
            padding: $small-padding;
        }
        @include e(handle) {
            right: $small-padding;
            top: calc($small-padding/2);
        }
    }
}
</style>

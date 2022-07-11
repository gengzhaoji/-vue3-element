<template>
    <div class="my-header" :class="classes">
        <div class="my-header__content">
            <el-icon v-if="icon" class="my-header__icon">
                <component :is="icon" />
            </el-icon>
            <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="$slots.handle" class="my-header__handle">
            <slot name="handle"></slot>
        </div>
    </div>
</template>

<script setup name="MyHeader">
/**
 * 标题组件
 * @module components/my-header
 */

/**
 * 插槽
 * @member slots
 * @property {string} [title] 定义标题内容
 * @property {string} [handle] 定义操作功能区内容
 */
/**
 * 属性参数
 * @member props
 * @property {string} [title] 标题文本
 * @property {string} [icon] 标题文本左侧的图标
 * @property {boolean} [background] 是否显示背景
 * @property {string} [size] 显示尺寸，可选值：'', 'large', 'medium', 'small'
 * @property {string} [theme=default] 风格主题，可选值：'default','border-left','border-top','border-bottom','bg-icon','bg-down','bg-right'
 */
const props = defineProps({
        // 标题文字
        title: String,

        // 文字旁边的Icon
        icon: [String, Object, Function],

        // 是否是否显示背景
        background: Boolean,

        // 显示尺寸
        size: {
            type: String,
            default: '',
            validator(val) {
                return ['', 'large', 'medium', 'small'].includes(val);
            },
        },

        // 风格主题
        theme: {
            type: String,
            default: 'default',
            validator(val) {
                return ['default', 'border-left', 'border-top', 'border-bottom', 'bg-icon', 'bg-down', 'bg-right'].includes(val);
            },
        },
    }),
    classes = computed(() => [
        {
            [`my-header--${props.theme}`]: !!props.theme,
            'is-background': props.background,
            'my-header--border-top': props.theme === 'bg-icon',
            [`is-${props.size}`]: !!props.size,
        },
    ]);
</script>

<style scoped lang="scss">
@import '@/style/BEM.scss';

$large: 3.5rem;
// 默尺寸
$default: 3rem;
$medium: 2.5rem;
$small: 2rem;
$border-left-width: 0.3rem;
$border-top-width: 0.2rem;
$border-radius: 0.4rem;

@mixin sizeCenter {
    @include when(large) {
        @include e(content) {
            line-height: calc($large - $border-top-width);
        }
    }

    @include when(medium) {
        @include e(content) {
            line-height: calc($medium - $border-top-width);
        }
    }

    @include when(small) {
        @include e(content) {
            line-height: calc($small - $border-top-width);
        }
    }
}

@mixin iconCenter {
    @include when(large) {
        @include e(icon) {
            height: calc($large - 0.8rem);
            line-height: calc($large - 0.8rem - $border-top-width);
        }
        @include e(content) {
            line-height: calc($large - 0.8rem);
        }
    }
    @include when(medium) {
        @include e(icon) {
            height: calc($medium - 0.4rem);
            line-height: calc($medium - 0.4rem - $border-top-width);
        }
        @include e(content) {
            line-height: calc($medium - 0.4rem);
        }
    }

    @include when(small) {
        @include e(icon) {
            height: calc($small - 0.3rem);
            line-height: calc($small - 0.3rem - $border-top-width);
        }
        @include e(content) {
            line-height: calc($small - 0.3rem);
        }
    }
}

@mixin bg-down($name, $size, $offset) {
    @include when($name) {
        @include e(content) {
            margin-left: calc(($size - $offset - $border-radius) / 3);
            height: calc($size - $offset);
            line-height: calc($size - $offset);
            &::after {
                right: -(calc(($size - $offset - $border-radius) / 3));
                border-width: calc(($size - $offset - $border-radius)) calc(($size - $offset - $border-radius) / 3) 0 0;
                border-color: var(--el-color-primary) transparent transparent transparent;
                transform: translateX(-1px);
            }

            &::before {
                left: -(calc(($size - $offset - $border-radius) / 3));
                border-width: 0 calc(($size - $offset - $border-radius) / 3) calc(($size - $offset - $border-radius)) 0;
                border-color: transparentvar(--el-color-primary) transparent transparent;
                transform: translateX(1px);
            }
        }
    }
}

@mixin bg-right($name, $size, $offset) {
    @include when($name) {
        @include e(content) {
            height: calc($size - $offset);
            line-height: calc($size - $offset);
            top: $offset;
            &::after {
                right: -(calc(($size - $offset - $border-radius) / 3));
                border-width: calc(($size - $offset - $border-radius)) 0 0 calc(($size - $offset - $border-radius) / 3);
                border-color: transparent transparent transparentvar(--el-color-primary);
            }
        }
    }
}

@include b(header) {
    position: relative;
    height: $default;
    color: var(--el-color-black);
    font-size: var(--el-font-size-base);
    box-sizing: border-box;

    @include m(border-left) {
        @include e(content) {
            border-left: $border-left-width solid var(--el-color-primary);
        }
    }

    @include m(border-top) {
        border-top: 1px solid var(--el-color-primary);

        @include e(content) {
            border-top: $border-top-width solid var(--el-color-primary);
            height: 100%;
            margin-top: -1px;
            line-height: calc($default - $border-top-width);
        }

        @include sizeCenter;
    }

    @include m(border-bottom) {
        border-bottom: 1px solid var(--el-color-primary);

        @include e(content) {
            border-bottom: $border-top-width solid var(--el-color-primary);
            height: 100%;
            line-height: calc($default - $border-top-width);
        }

        @include sizeCenter;
    }

    @include m(bg-icon) {
        @include e(content) {
            padding-left: 3rem;
        }
        @include e(icon) {
            background: var(--el-color-primary);
            color: var(--el-color-primary-light-9);
            display: inline-block;
            height: calc($default - 0.5rem);
            position: absolute;
            left: 0;
            line-height: calc($default - 0.5rem - $border-top-width);
            margin-top: -1px;
            padding: 0 0.5rem;
            border-radius: 0 0 1rem 1rem;
            margin-left: 0.5rem;
        }
        @include iconCenter;
        @include e(content) {
            border-top: 0;
            line-height: calc($default - 0.5rem);
        }
    }

    @include m(bg-down) {
        border-top: 1px solid var(--el-color-primary);
        @include e(icon) {
            color: var(--el-color-primary-light-9);
            padding-left: 0;
        }
        @include e(content) {
            color: var(--el-color-primary-light-9);
            background: var(--el-color-primary);
            border-radius: 0 0 $border-radius $border-radius;
            height: $default - 0.8rem;
            top: 0;
            left: 1rem;
            transform: none;
            line-height: calc($default - 0.8rem);
            position: relative;
            display: inline-block;
            margin-left: calc(($default - 0.8rem - $border-radius) / 3);
            padding-left: 1rem;
            &::after {
                content: '';
                display: inline-block;
                position: absolute;
                top: 0;
                right: -(calc(($default - 0.8rem - $border-radius) / 3));
                width: 0;
                height: 0;
                border-style: solid;
                border-width: calc(($default - 0.8rem - $border-radius)) calc(($default - 0.8rem - $border-radius) / 3) 0 0;
                border-color: var(--el-color-primary) transparent transparent transparent;
            }
            &::before {
                content: '';
                display: inline-block;
                position: absolute;
                left: -(calc(($default - 0.8rem - $border-radius) / 3));
                top: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 calc(($default - 0.8rem - $border-radius) / 3) calc($default - 0.8rem - $border-radius) 0;
                border-color: transparent var(--el-color-primary) transparent transparent;
            }
        }

        @include bg-down(large, $large, 1rem);
        @include bg-down(medium, $medium, 0.6rem);
        @include bg-down(small, $small, 0.5rem);
    }

    @include m(bg-right) {
        border-bottom: 1px solid var(--el-color-primary);
        @include e(icon) {
            color: var(--el-color-primary-light-9);
            padding-left: 0;
        }
        @include e(content) {
            color: var(--el-color-primary-light-9);
            background: var(--el-color-primary);
            border-radius: 0 $border-radius 0 0;
            height: calc($default - 0.8rem);
            top: 0.8rem;
            left: 0;
            transform: none;
            line-height: calc($default - 0.8rem);
            position: relative;
            display: inline-block;
            padding-left: 1rem;
            &::after {
                content: '';
                display: inline-block;
                position: absolute;
                right: -(calc(($default - 0.8rem - $border-radius) / 3));
                bottom: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: calc($default - 0.8rem - $border-radius) 0 0 calc(($default - 0.8rem - $border-radius) / 3);
                border-color: transparent transparent transparent var(--el-color-primary);
            }
        }

        @include bg-right(large, $large, 1rem);
        @include bg-right(medium, $medium, 0.6rem);
        @include bg-right(small, $small, 0.5rem);
    }

    @include when(background) {
        background: var(--el-fill-color-lighter, var(--el-border-color-lighter));
    }

    @include when(large) {
        height: $large;
        font-size: var(--el-font-size-medium);
    }

    @include when(medium) {
        height: $medium;
        font-size: var(--el-font-size-base);
    }

    @include when(small) {
        height: $small;
        font-size: var(--el-font-size-extra-small);
    }

    @include e(content) {
        position: absolute;
        left: 0;
        top: 50%;
        padding: 0 1rem;
        transform: translateY(-50%);
        box-sizing: border-box;
        line-height: 1.3em;
    }

    @include e(icon) {
        color: var(--el-color-primary);
        padding-right: 0.5rem;
    }

    @include e(handle) {
        color: var(--el-color-primary);
        line-height: 1.3em;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        padding-right: 1rem;
    }
}
</style>

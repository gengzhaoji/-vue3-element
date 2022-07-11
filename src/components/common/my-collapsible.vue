<template>
    <div>
        <div class="p-10 fw border_title back-f">
            {{ title }}
            <slot name="title" v-if="$slots.title"></slot>
            <button class="el-button m-l-20 el-button--text el-button--medium" @click.stop.prevent="currentCollapsed = !currentCollapsed">
                <span>
                    {{ currentCollapsed ? '展开' : '收起' }}
                    <el-icon>
                        <arrow-down v-show="currentCollapsed" />
                        <arrow-up v-show="!currentCollapsed" />
                    </el-icon>
                </span>
            </button>
        </div>
        <transition name="el-fade-in-linear">
            <div v-show="!currentCollapsed">
                <slot></slot>
            </div>
        </transition>
    </div>
</template>

<script setup name="my-collapsible">
const emits = defineEmits(['collapse']),
    /**
     * 属性参数
     * @member props
     * @property {Boolean} [collapsible] 支持表单项展开、收起
     * @property {boolean} [collapsed=true] 初始收起表单项目，collapsible=true是才有效
     * @property {String} [title] 名称
     * @property {Boolean} [fit] 默认插槽是否占满父类，默认为false不占满
     */
    props = defineProps({
        collapsed: {
            type: Boolean,
            default: false,
        },
        title: String,
        fit: {
            type: Boolean,
            default: false,
        },
    }),
    // 当前的折叠状态
    currentCollapsed = props.collapsed;
</script>

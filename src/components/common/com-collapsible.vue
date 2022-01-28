<template>
    <div>
        <div class="p-10 fw border_title back-f">
            {{ title }}
            <slot name="title" v-if="$slots.title"></slot>
            <button class="el-button m-l-20 el-button--text el-button--medium" @click.stop.prevent="toggleCollapsed">
                <span>
                    {{ currentCollapsed ? '展开' : '收起' }}
                    <i :class="currentCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
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

<script>
export default {
    name: 'com-collapsible',
    emits: ['collapse'],
    /**
     * 属性参数
     * @member props
     * @property {Boolean} [collapsible] 支持表单项展开、收起
     * @property {boolean} [collapsed=true] 初始收起表单项目，collapsible=true是才有效
     * @property {String} [title] 名称
     * @property {Boolean} [fix] 默认插槽是否占满父类，默认为false不占满
     */
    props: {
        collapsed: {
            type: Boolean,
            default: false,
        },
        title: String,
        fix: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // 当前的折叠状态
            currentCollapsed: false,
        };
    },
    watch: {
        collapsed: {
            immediate: true,
            handler(val) {
                this.currentCollapsed = val;
            },
        },
    },
    methods: {
        toggleCollapsed() {
            this.currentCollapsed = !this.currentCollapsed;
            this.$emit('collapse', this.currentCollapsed, this);
        },
    },
};
</script>

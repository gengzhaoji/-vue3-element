<template>
    <el-menu v-bind="$attrs">
        <menu-list :list="data"></menu-list>
    </el-menu>
</template>

<script>
import MenuList from './MenuList.vue';

/**
 * 菜单组件
 * @module widgets/xdh-menu
 * @example
 *
 * // 使用说明
 */
export default {
    name: 'XdhMenu',
    components: {
        MenuList,
    },
    /**
     * 属性参数
     * @property {Array} [data = []] data 构成菜单内容的数组
     */
    props: {
        // 菜单数据
        data: {
            type: Array,
            default() {
                return [];
            },
        },
    },
};
</script>

<style lang="scss" scoped>
:deep() {
    .el-menu-item,
    .el-submenu {
        background-color: var(--system-menu-background) !important;
    }
    .el-menu-item i,
    .el-menu-item-group__title,
    .el-submenu__title i {
        color: var(--system-menu-text-color);
    }
    .el-menu-item,
    .el-submenu__title {
        &.is-active {
            background-color: var(--system-primary-color) !important;
            color: var(--system-primary-text-color) !important;
            i {
                color: var(--system-primary-text-color) !important;
            }
            &:hover {
                background-color: var(--system-primary-color) !important;
                color: var(--system-primary-text-color) !important;
            }
        }
        &:hover {
            background-color: var(--system-menu-hover-background) !important;
        }
    }
    .el-submenu {
        &.is-active {
            > .el-submenu__title,
            > .el-submenu__title i {
                color: var(--system-menu-submenu-active-color) !important;
            }
        }
        .el-menu-item {
            background-color: var(--system-menu-children-background) !important;
            &.is-active {
                background-color: var(--system-primary-color) !important;
                color: var(--system-primary-text-color) !important;
                &:hover {
                    background-color: var(--system-primary-color) !important;
                    color: var(--system-primary-text-color) !important;
                }
            }
            &:hover {
                background-color: var(--system-menu-hover-background) !important;
            }
        }
        .el-submenu {
            .el-submenu__title {
                background-color: var(--system-menu-children-background) !important;
                &:hover {
                    background-color: var(--system-menu-hover-background) !important;
                }
            }
        }
    }
}
</style>

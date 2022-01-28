<template>
    <div class="tabs">
        <el-scrollbar class="scroll-container tags-view-container" ref="scrollbarDom">
            <el-tabs type="card" v-model="activeMenu" tab-position="top" stretch @tab-remove="removeTab" @tab-click="clickTab">
                <el-tab-pane v-for="tab in menuTabsList" :key="tab.meta.title" :name="tab.meta.title" :label="tab.meta.title" :closable="!tab.meta.hideClose" lazy />
            </el-tabs>
        </el-scrollbar>
        <el-dropdown class="handle" placement="bottom-end">
            <div class="el-dropdown-link"><i class="el-icon-arrow-down" /></div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item icon="el-icon-back" @click="close('Left')"> 关闭左侧 </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-right" @click="close('Right')"> 关闭右侧 </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-close" @click="close('Other')"> 关闭其他 </el-dropdown-item>
                    <el-dropdown-item icon="el-icon-circle-close" @click="close('All')" divided> 关闭全部 </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import { clone } from '@u/convert';
export default defineComponent({
    setup() {
        const store = useStore();
        const route = useRoute();
        const router = useRouter();
        const defaultMenu = {
            path: '/index',
            meta: { title: '首页', hideClose: true },
        };
        // 选中的菜单
        let activeMenu = ref('首页');
        // Tabs 数组数据
        let menuTabsList = ref(store.state.user.menuTabsList);
        watch(
            menuTabsList,
            (val) => {
                store.commit('SET_menuTabsList', val);
            },
            { deep: true }
        );
        if (menuTabsList.value.length === 0) {
            // 判断之前有没有调用过
            addMenu(defaultMenu);
        }
        // 新增tabs
        watch(
            route,
            (val) => {
                addMenu(val);
            },
            { immediate: true }
        );
        // 选中当前标签
        function clickTab() {
            const index = menuTabsList.value.findIndex((item) => item.meta.title === activeMenu.value);
            router.push(menuTabsList.value[index].path);
        }
        // 关闭当前标签
        function removeTab(name) {
            const index = menuTabsList.value.findIndex((item) => item.meta.title === name),
                { length } = menuTabsList.value,
                last = index === length - 1;
            menuTabsList.value.splice(index, 1);
            const data = menuTabsList.value[last ? index - 1 : index];
            activeMenu.value = data.meta.title;
            router.push(data.path);
        }
        function close(type) {
            const i = menuTabsList.value.findIndex((item) => item.meta.title === activeMenu.value);
            menuTabsList.value = clone(menuTabsList.value).filter((item, index) => {
                switch (type) {
                    case 'Left':
                        return index >= i || index === 0;
                        break;
                    case 'Right':
                        return index <= i || index === 0;
                        break;
                    case 'Other':
                        return index === i || index === 0;
                        break;
                    default:
                        return index === 0;
                }
            });
        }
        // 添加新的菜单项
        function addMenu(menu) {
            let { path, meta, name } = menu;
            if (meta.hideTabs) return;
            activeMenu.value = meta.title;
            if (!menuTabsList.value.some((obj) => obj.path === path)) {
                menuTabsList.value.push({
                    path,
                    meta,
                    name,
                });
            }
        }
        return {
            activeMenu,
            menuTabsList,
            clickTab,
            removeTab,
            close,
        };
    },
});
</script>

<style lang="scss" scoped>
$--height: 40px;
.tabs {
    width: 100%;
    display: flex;
    height: $--height;
    background: var(--system-header-background);
    border-top: 1px solid var(--system-header-border-color);
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
    .el-dropdown-link {
        border-left: 1px solid var(--system-header-border-color);
        height: $--height;
        line-height: $--height;
        text-align: center;
        width: 40px;
        i {
            color: var(--system-header-text-color);
        }
    }

    :deep() {
        .el-tabs__nav-next,
        .el-tabs__nav-prev {
            line-height: $--height !important;
            color: var(--system-header-text-color) !important;
        }
    }
}
.tags-view-container {
    height: 100%;
    width: calc(100% - 46px);
    display: flex;
    :deep() {
        .el-tabs__header {
            margin: 0px;
        }
        .el-tabs--card > .el-tabs__header .el-tabs__nav {
            border-top: none;
            border-radius: 0;
            .el-tabs__item {
                height: 39px;
            }
        }
    }
    :deep(.el-scrollbar__bar.is-vertical) {
        display: none !important;
    }
}
</style>

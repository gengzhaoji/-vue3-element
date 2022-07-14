<template>
    <div id="layout">
        <el-container>
            <!-- header -->
            <el-header :class="[{ 'header-sidebar': !['sidebar'].includes(theme.layout) }, 'header']">
                <el-aside
                    class="title pointer header-sidebar"
                    :class="{ 'title-sidebar': ['sidebar'].includes(theme.layout) }"
                    :width="`${aside_width}px`"
                    @click="$router.push('/')"
                >
                    <div class="flex-center">
                        <img src="@/assets/img/logo.png" v-show="theme.logo" alt="logo" />
                        <transition name="el-zoom-in-center">
                            <span class="m-l-10" v-show="!collapse">{{ TITLE }}</span>
                        </transition>
                    </div>
                </el-aside>
                <el-main class="f1 w0 flex p-0 top-r overflow-hidden">
                    <i v-if="theme.collapsible && ['sidebar'].includes(theme.layout)" @click="collapse = !collapse" :class="[collapse ? 'icon-menu2' : 'icon-menu', 'btn']" />
                    <div class="message flex">
                        <div class="li f1 w0">
                            <my-menu
                                v-if="['navbar'].includes(theme.layout)"
                                :data="$store.guarder.Menus"
                                :default-active="$store.user.activeMenu"
                                :props="{ id: 'path', route: 'path' }"
                                @select="menuTopSelect"
                                mode="horizontal"
                                unique-opened
                            />
                            <my-menu
                                v-if="['both'].includes(theme.layout)"
                                id="both"
                                :data="bothTopMenus"
                                :default-active="moduleName"
                                :props="{ id: 'path', route: 'path' }"
                                @select="menuTopSelect"
                                mode="horizontal"
                                unique-opened
                            />
                        </div>
                        <div class="li flex-center navbar-icon-action">
                            <el-dropdown style="margin-top: -6px">
                                <span style="font-size: 18px">
                                    {{ userInfo.nickName }}
                                    <el-icon><arrow-down /></el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="$router.push('/profile')"> 个人中心 </el-dropdown-item>
                                        <el-dropdown-item @click="logout" divided> 退出登录 </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                        <div class="flex-center navbar-icon-action pointer" @click="$router.push('/msgcenter')">
                            <el-badge :max="99" :value="messageNum">
                                <img src="@/assets/img/bell.png" :class="messageNum !== 0 ? 'animation' : ''" />
                            </el-badge>
                        </div>
                        <div class="li navbar-icon-action">
                            <Screen />
                        </div>
                        <div class="li navbar-icon-action">
                            <el-switch v-model="$store.user.theme.type" inline-prompt active-value="light" inactive-value="dark" active-icon="Sunny" inactive-icon="Moon" />
                        </div>
                        <div class="li navbar-icon-action" @click="settingVisible = true">
                            <el-tooltip class="item" effect="dark" content="系统设置">
                                <el-icon><tools /></el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                </el-main>
            </el-header>
            <el-container class="p-0 h0">
                <el-aside class="menu" :width="`${aside_width}px`" v-if="['sidebar'].includes(theme.layout) || (['both'].includes(theme.layout) && bothRightMenus.length)">
                    <transition name="el-zoom-in-center">
                        <my-menu
                            :data="theme.layout === 'sidebar' ? $store.guarder.Menus : bothRightMenus"
                            :collapse="collapse"
                            :default-active="$store.user.activeMenu"
                            @select="menuRightSelect"
                            unique-opened
                        />
                    </transition>
                    <div v-if="theme.collapsible && ['both'].includes(theme.layout)" class="sidebar__trigger" @click="collapse = !collapse">
                        <i :class="[collapse ? 'icon-menu2' : 'icon-menu', 'btn']" />
                    </div>
                </el-aside>
                <el-container>
                    <el-header height="40px" v-if="theme.showTabs" class="header">
                        <Tabs />
                    </el-header>
                    <el-main class="main" id="ContentArea">
                        <!--内容区-->
                        <router-view v-slot="{ Component }">
                            <transition name="fade-transform" mode="out-in" appear>
                                <keep-alive :include="$store.guarder.cachedComponents">
                                    <component :is="Component" :key="$route.path" />
                                </keep-alive>
                            </transition>
                        </router-view>
                    </el-main>
                </el-container>
            </el-container>
        </el-container>

        <el-drawer title="设置" size="320px" append-to-body direction="rtl" v-model="settingVisible">
            <div class="h100">
                <Setting />
            </div>
        </el-drawer>
    </div>
</template>

<script setup name="layout">
import { find } from '@u/tree';
import myMenu from '@c/my-menu';
import Tabs from './Tabs.vue';
import Screen from './Screen.vue';
import Setting from './Setting.vue';
import { TITLE } from '@/config';
import { useWindowSize } from '@vueuse/core';
const { width: screenWidth } = useWindowSize();

const $vm = inject('$vm'),
    $route = useRoute(),
    { theme, userInfo } = $vm.$store.user;

let collapse = $ref(false),
    moduleName = $ref(''),
    screenOne = $ref(true),
    settingVisible = $ref(false),
    bothRightData = reactive({});
// 监听属性
watch(
    () => theme.layout,
    (val) => {
        if (val === 'both') {
            let [one, two] = $route?.matched;
            moduleName = one.path === '/' ? two.path : one.path;
        }
    },
    { immediate: true }
);
// 计算属性
const width = computed(() => {
        let data = screenWidth.value * 0.15;
        if (data < 200) {
            data = 200;
        } else if (data > 250) {
            data = 250;
        }
        return data;
    }),
    aside_width = computed(() => {
        if (screenWidth.value < 1300 && screenOne) {
            screenOne = false;
            collapse = true;
        } else {
            screenOne = true;
        }
        return collapse ? 64 : width.value;
    }),
    // 上下+左右布局 时的上面的菜单数据
    bothTopMenus = computed(() => {
        const data = $vm.clone($vm.$store.guarder.Menus).map((item) => {
            bothRightData[item.path] = item.children;
            delete item.children;
            return item;
        });
        return data;
    }),
    // 上下+左右布局 时的左边的菜单数据
    bothRightMenus = computed(() => bothRightData[moduleName] || []);

// 选中的菜单
watch(
    useRoute(),
    (val) => {
        if (find($vm.$store.guarder.Menus, true, (item, i, data) => item.path === val.path) !== null) {
            $vm.$store.user.activeMenu = val.path;
        }
    },
    { immediate: true }
);
// 主题切换
watch(
    () => $vm.$store.user.theme.type,
    () => {
        $vm.$store.user.stateChange($vm.$store.user.theme);
    },
    { immediate: true }
);

// 退出登录
function logout() {
    $vm.$$confirm('确定注销并退出系统吗？').then(() => {
        $vm.$store.user.LogOut().then(() => {
            $vm.$router.push('/login');
        });
    });
}
// 左边菜单选中事件
function menuRightSelect(id, path) {
    $vm.$router.push(id);
}
// 头部菜单选中事件
function menuTopSelect(id) {
    if (moduleName !== id) {
        moduleName = id;
        // 有左边菜单栏的默认显示第一个菜单
        let data = bothRightData[moduleName];
        let pathFn = function (Array) {
            Array.forEach((item, index) => {
                if (index === 0) {
                    if (item.children && item.children.length) {
                        pathFn(item.children);
                    } else {
                        id = item.path;
                    }
                }
            });
        };
        if (data && data.length) {
            pathFn(data);
        }
        $vm.$router.push(id);
    }
}

// 消息提醒
let messageNum = $ref(0);
</script>

<style lang="scss" scoped>
:deep(.el-aside) {
    transition: all 0.3s;
}
#layout {
    height: 100%;
    width: 100%;
    display: flex;

    .header {
        display: flex;
        border-bottom: 1px solid var(--el-menu-border-color);
        .title {
            transition: all 0.3s;
            text-align: center;
            height: calc(var(--el-header-height) - 1px);
            line-height: calc(var(--el-header-height) - 1px);
            > div {
                position: relative;
                height: 100%;
                overflow: hidden;
                text-overflow: clip;
                white-space: nowrap;
                img {
                    height: 30px;
                    vertical-align: middle;
                }
                .m-l-10 {
                    font-family: 'five';
                    font-size: 28px;
                    font-weight: bold;
                    display: inline-block;
                    transition: all 0.3s;
                }
            }
        }
        .title-sidebar {
            border-right: 1px solid var(--el-menu-border-color);
        }
        .top-r {
            .btn {
                font-size: 20px;
                line-height: calc(var(--el-header-height) - 1px);
                cursor: pointer;
                margin: 0 20px;
            }

            .message {
                flex: 1 0 auto;
                width: 0;
                height: calc(var(--el-header-height) - 1px);
                text-align: right;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;

                .li {
                    cursor: pointer;
                    height: calc(var(--el-header-height) - 1px);
                    line-height: calc(var(--el-header-height) - 1px);
                }

                .navbar-icon-action {
                    font-size: 18px;
                    padding: 0 10px;
                    .animation {
                        animation: zy 2.5s 0.15s linear infinite;
                        -moz-animation: zy 2.5s 0.15s linear infinite;
                        -o-animation: zy 2.5s 0.15s linear infinite;
                        -ms-animation: zy 2.5s 0.15s linear infinite;
                        -webkit-animation: zy 2.5s 0.15s linear infinite;
                    }
                }
            }
        }
        .el-tabs__nav-next,
        .el-tabs__nav-prev {
            line-height: 80px;
            font-size: 16px;
            color: #b4b4b4;
        }
    }
    .header-sidebar {
        color: var(--el-menu-text-color);
        background-color: var(--el-menu-bg-color);
    }

    :deep(.el-dropdown) {
        color: var(--el-text-color-regular);
    }

    :deep(.el-aside) {
        overflow-x: hidden;
        z-index: 1;
    }

    .menu {
        background-color: var(--el-menu-bg-color);
        border-right: 1px solid var(--el-menu-border-color);
        height: 100%;
        display: flex;
        flex-direction: column;
        & > .el-menu--vertical {
            flex: 1;
            height: 0;
        }
        .sidebar__trigger {
            position: relative;
            text-align: center;
            height: 40px;
            line-height: 40px;
            background: var(--el-menu-hover-bg-color);
            color: var(--el-menu-text-color);
            cursor: pointer;
            font-size: 18px;
            &:hover {
                color: var(--el-menu-active-color);
            }
        }
    }

    .main {
        padding: 0px;
        position: relative;
        overflow: hidden;
        background-color: var(--el-bg-color-page);
    }

    @keyframes zy {
        10% {
            transform-origin: top;
            transform: rotate(20deg);
        }

        20% {
            transform: rotate(-15deg);
        }

        30% {
            transform: rotate(5deg);
        }

        40% {
            transform: rotate(-5deg);
        }

        50%,
        100% {
            transform: rotate(0deg);
        }
    }
}
</style>

<template>
    <div id="layout" :class="$store.state.user.theme.fixedTop ? 'overflow-hidden' : 'overflow-auto'">
        <el-container>
            <!-- header -->
            <el-header>
                <el-aside class="title pointer" :width="aside_width" @click="$router.push('/index')">
                    <transition name="sidebarLogoFade" mode="out-in">
                        <div v-if="collapse" key="collapse" class="flex-center">
                            <img class="m-t-10" src="@/assets/img/logo.png" alt />
                        </div>
                        <div v-else key="expand" class="flex-center">
                            <img src="@/assets/img/logo.png" class="m-t-10" v-show="$store.state.user.theme.logo" alt />
                            <span class="m-l-10" style="margin-top: -6px">{{ TITLE }}</span>
                        </div>
                    </transition>
                </el-aside>
                <el-main class="f1 w0 flex p-0 top-r">
                    <i
                        v-if="$store.state.user.theme.collapsible && ['sidebar', 'both'].includes($store.state.user.theme.layout)"
                        @click.prevent="collapse = !collapse"
                        :class="[collapse ? 'icon-menu2' : 'icon-menu', 'btn']"
                    />
                    <div class="message flex">
                        <div class="li f1 w0">
                            <xdh-menu
                                v-if="['navbar'].includes($store.state.user.theme.layout)"
                                background-color="var(--system-menu-background)"
                                text-color="var(--system-menu-text-color)"
                                active-text-color="var(--system-primary-color)"
                                :data="menus"
                                :default-active="activeMenu"
                                :props="{ id: 'path', route: 'path' }"
                                @select="menuTopSelect"
                                mode="horizontal"
                                unique-opened
                            />
                            <xdh-menu
                                v-if="['both'].includes($store.state.user.theme.layout)"
                                id="both"
                                background-color="var(--system-menu-background)"
                                text-color="var(--system-menu-text-color)"
                                active-text-color="var(--system-primary-color)"
                                :data="bothTopMenus"
                                :default-active="moduleName"
                                :props="{ id: 'path', route: 'path' }"
                                @select="menuTopSelect"
                                mode="horizontal"
                                unique-opened
                            />
                        </div>
                        <div class="li navbar-icon-action">
                            <Screen />
                        </div>
                        <div class="flex-center navbar-icon-action" @mouseenter="mouseEnterFn()">
                            <el-popover :width="360" trigger="hover" :show-after="300" popper-class="proppper-class">
                                <template #reference>
                                    <el-badge :max="99" :value="messageNum">
                                        <img src="@/assets/img/bell.png" :class="messageNum !== 0 ? 'animation' : ''" />
                                    </el-badge>
                                </template>
                                <Messagelist :data="list" :loadFn="mouseEnterFn" />
                            </el-popover>
                        </div>
                        <div class="li navbar-icon-action">
                            <el-dropdown>
                                <span class="el-dropdown-link">
                                    {{ $store.state.user.userInfo.nickName }}
                                    <i class="el-icon-caret-bottom" />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="$router.push('/system/profile')"> 个人中心 </el-dropdown-item>
                                        <el-dropdown-item @click="logout" divided> 退出登录 </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                        <div class="li navbar-icon-action" @click="settingVisible = true">
                            <el-tooltip class="item" effect="dark" content="系统设置">
                                <i class="el-icon-setting" />
                            </el-tooltip>
                        </div>
                    </div>
                </el-main>
            </el-header>
            <el-container class="p-0 h0">
                <el-aside
                    :width="aside_width"
                    v-if="['sidebar'].includes($store.state.user.theme.layout) || (['both'].includes($store.state.user.theme.layout) && bothRightMenus.length)"
                >
                    <!-- 菜单 -->
                    <xdh-menu
                        background-color="var(--system-menu-background)"
                        text-color="var(--system-menu-text-color)"
                        active-text-color="var(--system-primary-color)"
                        :data="$store.state.user.theme.layout === 'sidebar' ? menus : bothRightMenus"
                        :collapse="collapse"
                        :default-active="activeMenu"
                        @select="menuRightSelect"
                        unique-opened
                    />
                </el-aside>
                <el-container>
                    <el-header height="40px" v-if="$store.state.user.theme.showTabs">
                        <Tabs />
                    </el-header>
                    <el-main class="main">
                        <!--内容区-->
                        <router-view v-slot="{ Component }">
                            <transition name="fade-transform" mode="out-in" appear>
                                <keep-alive v-if="$route.meta.keepAlive">
                                    <component :is="Component" :key="$route" />
                                </keep-alive>
                                <component :is="Component" :key="$route" v-else />
                            </transition>
                        </router-view>
                    </el-main>
                </el-container>
            </el-container>
        </el-container>

        <el-drawer title="设置" size="320px" append-to-body direction="rtl" v-model="settingVisible">
            <Setting />
        </el-drawer>
    </div>
</template>

<script>
import XdhMenu from '@c/xdh-menu';
import Breadcrumb from './Breadcrumb.vue';
import Tabs from './Tabs.vue';
import Screen from './Screen.vue';
import Setting from './Setting.vue';
import Messagelist from './Messagelist.vue';
import { TITLE } from '@/config';
import { pageMessage, unReadCount } from '@/api/system';

export default {
    name: 'layout',
    components: {
        XdhMenu,
        Breadcrumb,
        Tabs,
        Screen,
        Setting,
        Messagelist,
    },
    inject: ['screenWidth'],
    data() {
        return {
            TITLE,
            collapse: false,
            moduleName: '',
            screenOne: true,
            settingVisible: false,
            bothRightData: {},
            timer: null,
            list: [],
            messageNum: '',
        };
    },
    watch: {
        '$store.state.user.theme.layout': {
            handler(val) {
                if (val === 'both') {
                    let [one, two] = this.$route.matched;
                    this.moduleName = one.path === '/' ? two.path : one.path;
                }
            },
            immediate: true,
        },
    },
    created() {
        this.unReadCount();
        this.timer = setInterval(() => {
            this.unReadCount();
        }, 5 * 60 * 1000);
    },
    computed: {
        menus() {
            return this.$store.state.guarder.Menus;
        },
        width() {
            let width = this.screenWidth() * 0.17;
            if (width < 250) {
                width = 250;
            } else if (width > 300) {
                width = 300;
            }
            return width;
        },
        aside_width() {
            let collapse = this.collapse;
            if (this.screenWidth() < 1300) {
                if (this.screenOne) {
                    this.screenOne = false;
                    this.collapse = true;
                    return '65px';
                }
            } else {
                this.screenOne = true;
            }
            return collapse ? '65px' : `${this.width}px`;
        },
        activeMenu() {
            let { meta, path, name } = this.$route;
            return path;
        },
        // 上下+左右布局 时的上面的菜单数据
        bothTopMenus() {
            return this.clone(this.menus).map((item) => {
                this.bothRightData[item.path] = item.children;
                delete item.children;
                return item;
            });
        },
        // 上下+左右布局 时的左边的菜单数据
        bothRightMenus() {
            return this.bothRightData[this.moduleName] || [];
        },
    },
    methods: {
        logout() {
            this.$confirm('确定注销并退出系统吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$store.dispatch('LogOut').then(() => {
                    this.$router.push({
                        path: '/login',
                    });
                });
            });
        },
        menuRightSelect(id, path) {
            this.$router.push(id);
        },
        menuTopSelect(id) {
            if (this.moduleName !== id) {
                this.moduleName = id;
                // 有左边菜单栏的默认显示第一个菜单
                let data = this.bothRightData[this.moduleName];
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
                this.$router.push(id);
            }
        },
        mouseEnterFn() {
            pageMessage({ isRead: 0, needCount: 0 }).then((res) => {
                let data = res.data.rows;
                this.messageNum = res.data.unReadTotal;
                data.forEach((item) => {
                    if (item.businessCode === 1000) {
                        item.path = '/personnel/information';
                        item.link = '补全 >';
                    } else if (item.businessCode === 1001) {
                        item.path = '/equipment/return';
                        item.link = '归还 >';
                    } else if (item.businessCode === 1002) {
                        item.path = '/carrier/Creturn';
                        item.link = '归还 >';
                    } else if (item.businessCode === 1003) {
                        item.path = '/personnel/information';
                        item.link = '复审 >';
                    } else {
                        item.path = '';
                        item.link = '';
                    }
                });
                this.list = data;
            });
        },
        // 未读消息数量
        unReadCount() {
            unReadCount().then((res) => {
                this.messageNum = res.data;
            });
        },
    },
    beforeUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    },
};
</script>

<style lang="scss" scoped>
$--line-height: var(--el-header-height);

:deep(.el-aside) {
    transition: all 0.3s;
}
#layout {
    height: 100%;
    width: 100%;
    display: flex;

    :deep(.el-header) {
        display: flex;

        .title {
            transition: all 0.3s;
            text-align: center;
            height: $--line-height;
            line-height: $--line-height;
            background: var(--system-logo-background);
            color: var(--system-logo-color);
            > div {
                position: relative;
                height: 100%;
                overflow: hidden;
                text-overflow: clip;
                white-space: nowrap;
                img {
                    height: 58px;
                    vertical-align: middle;
                }

                .m-l-10 {
                    font-family: 'five';
                    margin: 0;
                    font-size: 28px;
                    font-weight: bold;
                    display: inline-block;
                    letter-spacing: 5px;
                }
            }
        }

        .top-r {
            background: var(--system-header-background);
            color: var(--system-header-text-color);
            .btn {
                font-size: 20px;
                line-height: $--line-height;
                cursor: pointer;
                margin: 0 20px;
            }

            .message {
                flex: 1 0 auto;
                width: 0;
                height: $--line-height;
                text-align: right;
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;

                .li {
                    display: inline-block;
                    cursor: pointer;
                    height: $--line-height;
                    line-height: $--line-height;
                    vertical-align: middle;
                }

                .navbar-icon-action {
                    padding: 0 10px;
                    color: var(--system-header-breadcrumb-text-color);
                    &:hover {
                        background-color: var(--system-header-item-hover-color);
                    }
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

    :deep(.el-aside) {
        background-color: var(--system-menu-background);
        overflow-x: hidden;
        z-index: 1;
    }

    .main {
        padding: 0px;
        position: relative;
        background-color: var(--system-container-background);
        overflow: hidden;
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

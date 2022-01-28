<template>
    <el-config-provider :locale="locale">
        <div id="app" @mousemove="handleTime()">
            <router-view v-slot="{ Component }">
                <transition name="fade-transform">
                    <component :is="Component" v-if="isRouter" />
                </transition>
            </router-view>
        </div>
    </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import { debounce, throttle } from '@u/util';
import { whiteList } from '@/helper/guarder';

export default {
    name: 'APP',
    components: {
        ElConfigProvider,
    },
    data() {
        return {
            locale: zhCn,
            isRouter: true,
            screenWidth: document.documentElement.clientWidth, //屏幕宽度
            screenHeight: document.documentElement.clientHeight, //屏幕高度
            timeOut: 30 * 60 * 1000, // 设置超时时间:30分钟
            _beforeUnload_time: null,
            _gap_time: null,
        };
    },
    provide() {
        return {
            screenWidth: () => this.screenWidth,
            screenHeight: () => this.screenHeight,
            reload_$root: this.reload,
        };
    },
    watch: {
        screenWidth: {
            // 通过handler来监听属性变化, 初次调用 newValue为""空字符串， oldValue为 undefined
            handler(newValue, oldValue) {
                let size = '';
                if (newValue > 1920) {
                    size = 'medium';
                } else if (newValue > 1200 && newValue <= 1920) {
                    size = 'small';
                } else {
                    size = 'mini';
                }
                if (this.$ELEMENT.size !== size) {
                    this.$ELEMENT.size = size;
                }
                this.$store.commit('SET_SIZE', size);
            },
            // 配置立即执行属性
            immediate: true,
        },
    },
    created() {
        // 项目白名单之外页面无操作30分钟之后自动退出
        this.handleTime = debounce(
            function () {
                if (!whiteList.includes(this.$route.path)) {
                    if (this.$store.state.user.token) {
                        this.$store.dispatch('LogOut').then(() => {
                            this.$router.push({
                                path: '/login',
                                query: {
                                    redirect: this.$route.fullPath,
                                },
                            });
                        });
                    }
                }
            },
            this.timeOut,
            false,
            this
        );
    },
    mounted() {
        // 定义窗口大小变更通知事件
        window.onresize = throttle(
            () => {
                this.screenWidth = document.documentElement.clientWidth; //窗口宽度
                this.screenHeight = document.documentElement.clientHeight; //窗口宽度
            },
            this,
            true
        );
        // 关闭窗口自动退出功能
        window.addEventListener('beforeunload', (e) => this.beforeunloadHandler(e));
        window.addEventListener('unload', (e) => this.unloadHandler(e));
    },
    methods: {
        reload() {
            this.isRouter = false;
            this.$nextTick(function () {
                this.isRouter = true;
            });
        },
        LogOut() {
            if (this._gap_time <= 5) {
                this.$store.dispatch('LogOutSET');
            }
        },
        beforeunloadHandler() {
            this._beforeUnload_time = new Date().getTime();
        },
        unloadHandler() {
            this._gap_time = new Date().getTime() - this._beforeUnload_time;
            this.LogOut();
        },
    },
    beforeUnmount() {
        window.removeEventListener('beforeunload', (e) => this.beforeunloadHandler(e));
        window.removeEventListener('unload', (e) => this.unloadHandler(e));
        this.$store.getters.socketPrint.destroy();
    },
};
</script>

<style scoped lang="scss">
#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>

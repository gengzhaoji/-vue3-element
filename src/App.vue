<template>
    <el-config-provider :locale="zhCn">
        <div id="refApp" @mousemove="handleTime()">
            <router-view v-slot="{ Component }">
                <transition name="fade-transform">
                    <component :is="Component" />
                </transition>
            </router-view>
        </div>
    </el-config-provider>
</template>

<script setup name="App">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import { debounce } from '@u/util';
import { whiteList } from '@/helper/guarder';
// 窗口大小
import { useWindowSize } from '@vueuse/core';
const { width } = useWindowSize();
watch(width, (val) => ($store.user.size = val > 1024 ? 'default' : 'small'));

/**
 * 全局挂载方法的注入和使用
 */
let {
    appContext: {
        app: {
            config: {
                globalProperties: { $$confirm, $confirm, $router, $store, addDateRange, clone, cloneDeep, getImgUrl, msgError, msgInfo, msgSuccess, resetForm, selectDictLabel },
            },
        },
    },
} = getCurrentInstance();

provide('$vm', {
    $$confirm,
    $confirm,
    $router,
    $store,
    addDateRange,
    clone,
    cloneDeep,
    getImgUrl,
    msgError,
    msgInfo,
    msgSuccess,
    resetForm,
    selectDictLabel,
});

// 页面无操作30分钟自动退出功能
const timeOut = 30 * 60 * 1000; // 设置超时时间:30分钟
let _beforeUnload_time = null;
let _gap_time = null;
const handleTime = debounce(
    function () {
        if (!whiteList.includes($route.path)) {
            if ($store.user.token) {
                $store.user.LogOut().then(() => {
                    $router.push({
                        path: '/login',
                        query: {
                            redirect: $route.fullPath,
                        },
                    });
                });
            }
        }
    },
    timeOut,
    false
);
function LogOut() {
    if (_gap_time <= 5) {
        const hash = window.location.hash;
        if (!['/myPracticedetail', '/myCourse', '/myEdetail'].includes(hash.slice(1, hash.indexOf('?')))) {
            $store.user.LogOutSET();
        }
    }
}
function beforeunloadHandler() {
    _beforeUnload_time = new Date().getTime();
}
function unloadHandler() {
    _gap_time = new Date().getTime() - _beforeUnload_time;
    LogOut();
}
// dom创建完成
onMounted(() => {
    // 关闭窗口自动退出功能
    window.addEventListener('beforeunload', (e) => beforeunloadHandler(e));
    window.addEventListener('unload', (e) => unloadHandler(e));
});
// 组件销毁
onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', (e) => beforeunloadHandler(e));
    window.removeEventListener('unload', (e) => unloadHandler(e));
});
</script>

<style scoped lang="scss">
#refApp {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--el-bg-color);
}
</style>

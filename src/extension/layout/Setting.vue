<template>
    <div class="p-l-15 p-r-15">
        <el-divider content-position="left">主题色</el-divider>
        <div class="theme-box">
            <theme-color v-for="(item, key) in themeColorArr" v-model:active="state.primaryColor" :key="key" :color="item.color" :tip="item.tip" />
        </div>
        <el-divider content-position="left">布局</el-divider>
        <el-radio-group class="three-columns" v-model="state.layout" :size="$store.user.size">
            <el-radio-button label="sidebar">左右</el-radio-button>
            <el-radio-button label="navbar">上下</el-radio-button>
            <el-radio-button label="both">上下 + 左右</el-radio-button>
        </el-radio-group>
        <el-divider content-position="left">配色</el-divider>
        <el-radio-group class="three-columns" v-model="state.menuType" :size="$store.user.size">
            <el-radio-button label="simplicity">简约</el-radio-button>
            <el-radio-button label="science">科技</el-radio-button>
            <el-radio-button label="major">专业</el-radio-button>
        </el-radio-group>

        <el-divider content-position="left">其他设置</el-divider>
        <el-form label-width="240px" label-position="left" :size="$store.user.size">
            <el-form-item label="开启折叠">
                <el-switch v-model="state.collapsible"></el-switch>
            </el-form-item>
            <el-form-item label="开启导航Tab">
                <el-switch v-model="state.showTabs"></el-switch>
            </el-form-item>
            <el-form-item label="显示logo">
                <el-switch v-model="state.logo"></el-switch>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup name="Setting">
import themeColor from './theme/theme-color.vue';
const $vm = inject('$vm'),
    themeColorArr = [
        { color: '#4458FE', tip: '默认蓝' },
        { color: '#d60f20', tip: '玫瑰红' },
        { color: '#ac25e6', tip: '优雅紫' },
        { color: '#4dc86f', tip: '故事绿' },
        { color: '#13c2c2', tip: '明青' },
        { color: '#333', tip: '极客黑' },
    ];
// 只取值，不做computed
const state = $vm.$store.user.theme;
// 监听数据的变化
watch(
    () => state,
    (newVal) => {
        $vm.$store.user.stateChange(newVal);
    },
    { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.theme-box {
    padding: 0 10px;
    display: flex;
    justify-content: space-around;
}
.three-columns {
    width: 100%;
    display: flex;
    :deep(.el-radio-button) {
        flex: 1;
        width: 0;
        .el-radio-button__inner {
            width: 100%;
        }
    }
}
</style>

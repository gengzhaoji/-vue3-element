<template>
    <template v-for="(item, index) of list" :key="index">
        <el-sub-menu :index="item.path" v-if="item.children">
            <template #title>
                <i :class="[item?.meta?.icon]"></i>
                <span>{{ item.meta.title }}</span>
            </template>
            <menu-list :list="item.children"></menu-list>
            <!--递归调用-->
        </el-sub-menu>
        <el-menu-item :index="item.path" v-else-if="item.menuType !== 'M'">
            <i :class="[item.meta.icon]"></i>
            <span>{{ item.meta.title }}</span>
        </el-menu-item>
    </template>
</template>

<script setup name="MenuList">
defineProps({
    list: {
        type: Array,
        required: true,
    },
});
</script>

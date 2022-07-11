<template>
    <div class="date">
        <span class="margin-right-10">{{ dateTime }}</span>
        <span>{{ week }}</span>
    </div>
</template>

<script setup name="DvDate">
import date from '@u/date';
let dateTime = $ref(''),
    week = $ref('');

dateTime = date(new Date(), 'yyyy年MM月dd日 hh:mm:ss'); // 修改数据date
week = `星期${['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]} `;

const timer = setInterval(() => {
    dateTime = date(new Date(), 'yyyy年MM月dd日 hh:mm:ss'); // 修改数据dateTime
    week = `星期${['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]} `;
}, 1000);

onBeforeUnmount(() => {
    if (timer) clearInterval(timer); // 在Vue实例销毁前，清除定时器
});
</script>

<style lang="scss" scoped>
.date {
    font-size: 18px;
    display: inline-block;
    color: #1091f1;
    padding: 18px;
}
</style>

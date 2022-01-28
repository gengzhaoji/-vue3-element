<template>
    <xdh-exception description="很抱歉，服务器出错了" :img="img" />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import img from './img/500.svg';
export default {
    name: 'Xdh405',
    components: {
        XdhException: defineAsyncComponent(() => import('./components/xdh-exception.vue')),
    },
    data() {
        return {
            img,
        };
    },
};
</script>

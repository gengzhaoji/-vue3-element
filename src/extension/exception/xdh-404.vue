<template>
    <xdh-exception description="很抱歉，你访问的页面不存在" :img="img" />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import img from './img/404.svg';
export default {
    name: 'Xdh404',
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

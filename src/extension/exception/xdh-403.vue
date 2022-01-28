<template>
    <xdh-exception description="很抱歉，你无权访问该页面" :img="img" />
</template>

<script>
import { defineAsyncComponent } from 'vue';
import img from './img/403.svg';
export default {
    name: 'Xdh403',
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

<template>
    <div class="particles-js-box">
        <div id="particles-js"></div>
    </div>
</template>

<script>
import particlesJS from './particles.js';
import particlesConfig from './particles.json';
export default {
    data() {
        return {};
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            setTimeout(() => {
                particlesJS('particles-js', particlesConfig);
            }, 1000);
        },
    },
};
</script>
<style scoped lang="scss">
.particles-js-box {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
}
#particles-js {
    width: 100%;
    height: 100%;
}
</style>

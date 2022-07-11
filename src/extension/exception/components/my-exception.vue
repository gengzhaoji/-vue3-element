<template>
    <div class="my-exception">
        <div class="my-exception__img tc">
            <img :src="img" alt="" />
        </div>
        <div class="my-exception__content">
            <div class="my-exception__text" v-if="text">{{ text }}</div>

            <div class="my-exception__desc" v-if="description">
                {{ description }}
            </div>

            <div class="my-exception__actions">
                <slot name="actions"> {{ time }}秒后自动<my-button text @click.prevent="backHome">返回</my-button>首页 </slot>
            </div>
        </div>
    </div>
</template>

<script setup name="myException">
/**
 * 异常页面
 * @module extensions/my-exception
 */
/**
 * 插槽
 * @member slots
 * @property {string} actions 操作栏
 */
/**
 * 属性参数
 * @property {String} [img] 左侧显示的图片
 * @property {String} [text] 显示的报错码
 * @property {String} [description] 显示的报错码对应的详细内容
 */
defineProps({
    img: {
        type: String,
    },
    text: {
        type: String,
    },
    description: {
        type: String,
    },
});
let time = $ref(3);
function backHome() {
    location.href = location.origin;
}
function setTimeout_backHome() {
    setTimeout(() => {
        if (time < 1) {
            backHome();
        } else {
            time--;
            setTimeout_backHome();
        }
    }, 1000);
}
// 初始化执行
setTimeout_backHome();
</script>

<style lang="scss" scoped>
.my-exception {
    height: 100%;
    background: #f8fafb;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &__img {
        &--block {
            width: 40%;
            display: inline-block;
        }
    }

    &__text {
        color: #434e59;
        font-size: 72px;
        line-height: 72px;
        margin: 40px 0 20px;
        text-align: center;
    }

    &__desc {
        color: #242424;
        font-size: 20px;
        line-height: 28px;
        margin: 40px 0 20px;
        text-align: center;
    }
    &__actions {
        text-align: center;
        color: #555555;
        font-size: 16px;
        .el-button--text {
            font-size: 16px;
            text-decoration: underline;
        }
    }
}
</style>

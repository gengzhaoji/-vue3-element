<template>
    <div class="xdh-exception">
        <div class="xdh-exception__img tc">
            <img :src="img" alt="" />
        </div>
        <div class="xdh-exception__content">
            <div class="xdh-exception__text" v-if="text">{{ text }}</div>

            <div class="xdh-exception__desc" v-if="description">
                {{ description }}
            </div>

            <div class="xdh-exception__actions">
                <slot name="actions"> {{ time }}秒后自动<com-button type="text" @click.prevent="backHome">返回</com-button>首页 </slot>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * 异常页面
 * @module extensions/xdh-exception
 */

/**
 * 插槽
 * @member slots
 * @property {string} actions 操作栏
 */

/**
 * @export
 */
export default {
    name: 'XdhException',
    /**
     * 属性参数
     * @property {String} [img] 左侧显示的图片
     * @property {String} [text] 显示的报错码
     * @property {String} [description] 显示的报错码对应的详细内容
     */
    props: {
        img: {
            type: String,
        },
        text: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    data() {
        return {
            time: 3,
        };
    },
    methods: {
        backHome() {
            location.href = location.pathname;
        },
        setTimeout_backHome() {
            setTimeout(() => {
                if (this.time < 1) {
                    this.backHome();
                } else {
                    --this.time;
                    this.setTimeout_backHome();
                }
            }, 1000);
        },
    },
    created() {
        this.setTimeout_backHome();
    },
};
</script>

<style lang="scss" scoped>
.xdh-exception {
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

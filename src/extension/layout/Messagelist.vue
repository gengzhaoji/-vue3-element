<template>
    <div class="message">
        <div class="header">
            <el-badge is-dot><span class="text">消息</span></el-badge>
        </div>
        <template v-if="data.length > 0">
            <div class="message-box">
                <div class="message-list" v-for="(item, index) in data" :key="index">
                    <img v-if="[1000, 1003, 1004].includes(item.businessCode)" src="@/assets/img/message-1.png" />
                    <img v-else-if="item.businessCode === 1001" src="@/assets/img/message-2.png" />
                    <img v-else-if="item.businessCode === 1002" src="@/assets/img/message-3.png" />
                    <img v-else src="@/assets/img/message-4.png" />
                    <div class="content flex-col">
                        <el-tooltip placement="top" :disabled="isDisabled" :show-after="1000">
                            <template #content>
                                <span v-html="item.title"></span>
                            </template>
                            <div class="name" @mouseover="isShowTootip" v-html="item.title"></div>
                        </el-tooltip>
                        <div class="flex m-between">
                            <span>{{ item.publishTimeFormat }}</span>
                            <span @click="routerFn(item)" class="link">{{ item.link }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <el-empty v-else :image-size="160" description="暂无数据"></el-empty>
        <div class="footer flex-center" v-if="data.length > 0">
            <div class="flex-center" @click="$router.push('/system/message')"><span>查看全部</span> <i class="icon-jump"></i></div>
        </div>
    </div>
</template>

<script setup name="Messagelist">
import { updateReaded } from '@/api/system';
const $vm = inject('$vm');
// 路由跳转
const props = defineProps({
    data: {
        type: Array,
    },
    loadFn: {
        type: Function,
    },
});
function routerFn(item) {
    $vm.$router.push(item.path);
    // 增加延时防止路由跳转时接口请求失败
    setTimeout(() => {
        updateReaded({ ids: item.id }).then(() => {
            props.loadFn();
        });
    });
}
// 文本超出出tip e.target.clientWidth; 文本可视宽度 e.target.scrollWidth; 文本实际宽度
let isDisabled = $ref(true);
function isShowTootip(e) {
    isDisabled = e.target.scrollWidth <= e.target.clientWidth;
}
</script>

<style lang="scss" scoped>
.message {
    .header {
        padding: 4px;
        border-bottom: 1px solid #dcdfe6;
        .text {
            color: #3a3e64;
            font-weight: 700;
            margin-left: 12px;
        }
    }
    .message-box {
        height: 300px;
        overflow: auto;
        .message-list {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            padding-left: 12px;
            height: 50px;
            line-height: 50px;

            &:hover {
                background: #f4f7ff;
            }
            .icon {
                display: inline-block;
                width: 50px;
                height: 50px;
            }
            .content {
                padding: 0 12px 0 12px;
                flex: 1;
                width: 0;
                flex-grow: 1;
                .name {
                    font-size: 14px;
                    color: #5a5f80;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                div {
                    height: 24px;
                    line-height: 24px;
                    flex-grow: 1;
                }
                div:nth-child(2) {
                    font-size: 12px;
                    font-weight: 400;
                    color: #858dbf;
                    .link {
                        color: #4458fe;
                        &:hover {
                            cursor: pointer;
                            text-decoration: underline #4458fe;
                        }
                    }
                }
            }
        }
    }
    .footer {
        height: 44px;
        line-height: 44px;
        background: #fcfcfc;
        div:hover {
            cursor: pointer;
            color: #4a5dfe;
        }
        i {
            font-size: 16px;
            margin-left: 4px;
        }
    }
}
</style>

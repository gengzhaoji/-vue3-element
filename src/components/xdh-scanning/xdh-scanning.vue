<template>
    <!-- 高拍仪扫描弹窗 -->
    <el-dialog ref="dialog" :model-value="true" title="扫描载体条形码" width="900px" append-to-body top="10vh" :close-on-click-modal="false" @closed="closeFn" v-bind="$attrs">
        <div class="Camera flex" v-loading="loading" style="height: 385px">
            <div class="f1 w0">
                <div class="w100 h100 tc" style="position: relative">
                    <img :src="httpImg" alt="" style="max-width: 100%; max-height: 100%" />
                    <div class="scanning">
                        <div class="jiao1" />
                        <div class="jiao2" />
                        <el-button class="juzhong_transform" size="medium" type="success" icon="el-icon-check" circle v-show="!scanning && video" />
                        <img :src="transion" class="transion" v-show="scanning && video" />
                    </div>
                    <div class="bag" />
                </div>
            </div>
            <div class="right flex-col" style="width: 40%; margin-left: 8px; border: 1px solid var(--el-border-color-base)">
                <xdh-table :data="list" :columns="columns" :columnFilter="false">
                    <template #index="{ $index }">
                        {{ $index + 1 }}
                    </template>
                    <template #default="{ $index }">
                        <com-button type="text" @click="list.splice($index, 1)">删除</com-button>
                    </template>
                </xdh-table>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <com-button type="primary" @click.prevent="cameraSubmitFn" round>保 存</com-button>
                <com-button @click.prevent="closeFn" round>取 消</com-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import axios from 'axios';
import { getStateCarrier } from '@/api/carrier';
import transion from './transion.png';

export default {
    emits: ['close', 'cameraFile'],
    /**
     * 参数属性
     * @property {Number(state)} [state] 扫码成功之后的函数逻辑中的状态
     */
    props: {
        state: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            transion,
            video: false,
            scanning: true,
            loading: false,
            httpImg: '',
            columns: [
                {
                    label: '序号',
                    prop: 'index',
                    width: 50,
                },
                {
                    label: '载体编号',
                    prop: 'code',
                },
                {
                    label: '操作',
                    width: 50,
                },
            ],
            list: [],
        };
    },
    created() {
        this.loading = true;
        this.$store.dispatch('GETCameraUrl').then((data) => {
            this.CameraUrl = data;
            // 打开主摄像头
            this.httpImg = `${data}/video=stream&camidx=0&T=${new Date().getTime()}`;
            // 获取设备状态
            axios
                .post(`${data}/video=status`)
                .then((res) => {
                    this.video = true;
                    this.loop = setTimeout(() => {
                        this.getcode();
                    }, 2000);
                })
                .catch(() => {
                    this.msgError('连接失败，请检查是否打开高拍仪！');
                })
                .finally(() => {
                    this.loading = false;
                });
        });
    },
    methods: {
        // 条码识别
        getcode() {
            axios
                .post(`${this.CameraUrl}/barcode=get`, JSON.stringify({ time: '20' }))
                .then((res) => {
                    if (res.data?.code === '0') {
                        this.scanning = false;
                        const tasks = [];
                        for (let i = 0; i < res?.data?.data?.length; i++) {
                            const barcodedata = res.data.data[i].barcodedata;
                            if (!this.list.some((item) => item.code === barcodedata)) {
                                tasks.push(
                                    new Promise((resolve, reject) => {
                                        // 扫描成功载体状态校验逻辑
                                        getStateCarrier({ code: barcodedata, state: this.state })
                                            .then((res) => {
                                                if (!!res.data.yesNoState) {
                                                    this.list.push(res.data);
                                                } else {
                                                    this.msgInfo('该载体不符合该业务载体状态，请更换载体重新扫描！');
                                                }
                                                resolve();
                                            })
                                            .catch(() => {
                                                reject();
                                            });
                                    })
                                );
                            } else {
                                this.msgInfo('该载体已添加，请更换载体扫描！');
                            }
                        }
                        // 检验全部完成重新开始扫码
                        Promise.all(tasks).then(() => {
                            this.scanning = true;
                            this.loop = setTimeout(() => {
                                this.getcode();
                            }, 8000);
                        });
                    } else {
                        this.msgError('扫码失败！');
                        this.loop = setTimeout(() => {
                            this.getcode();
                        }, 8000);
                    }
                })
                .catch(() => {
                    this.msgError('请关闭当前页面，稍后重试！');
                });
        },
        cameraSubmitFn() {
            this.$emit('cameraFile', this.clone(this.list));
            this.closeFn();
        },
        closeFn() {
            this.$refs?.dialog?.handleClose();
            setTimeout(() => {
                this.$emit('close', false);
            }, 300);
        },
    },
    beforeUnmount() {
        clearTimeout(this.loop);
        // 关闭主摄像头
        axios.post(`${this.CameraUrl}/video=close`, JSON.stringify({ camidx: '0' }));
    },
};
</script>

<style lang="scss" scoped>
$jiao-width: 24px;
$jiao-color: rgba(255, 255, 255, 0.9);
.bag {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
}
.scanning {
    z-index: 10;
    position: absolute;
    top: 10%;
    left: 10%;
    width: 80%;
    height: 80%;
    border: 1px solid #ffffff;
    border-radius: 8px;
    .jiao1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        &:before {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border: 4px solid $jiao-color;
            border-radius: 8px 0 0 0;
            border-right: 0;
            border-bottom: 0;
            position: absolute;
            top: -2px;
            left: -2px;
        }
        &:after {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border-radius: 0 8px 0 0;
            border: 4px solid $jiao-color;
            border-left: 0;
            border-bottom: 0;
            position: absolute;
            top: -2px;
            right: -2px;
        }
    }
    .jiao2 {
        display: inline-block;
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        &:before {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border-radius: 0 0 0 8px;
            border: 4px solid $jiao-color;
            border-right: 0;
            border-top: 0;
            position: absolute;
            bottom: -2px;
            left: -2px;
        }
        &:after {
            content: '';
            display: inline-block;
            width: $jiao-width;
            height: $jiao-width;
            border-radius: 0 0 8px 0;
            border: 4px solid $jiao-color;
            border-left: 0;
            border-top: 0;
            position: absolute;
            bottom: -2px;
            right: -2px;
        }
    }
    .transion {
        width: 80%;
        position: absolute;
        top: -60px;
        left: 10%;
        animation: transion 3s linear infinite;
    }
}
@keyframes transion {
    0% {
        top: -60px;
    }

    100% {
        top: calc(100% - 85px);
    }
}
</style>

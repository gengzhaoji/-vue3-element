<template>
    <!-- 高拍仪拍照弹窗 -->
    <el-dialog ref="dialog" :model-value="true" title="高拍仪拍摄" width="700px" top="9vh" append-to-body :close-on-click-modal="false" @closed="closeFn" v-bind="$attrs">
        <div class="Camera flex" v-loading="loading">
            <div class="left flex-col">
                <div v-for="item in CameraOperation" :key="item.name" class="left-item pointer" @click="CameraOperationFn(item.fn)">
                    <span class="block">
                        <span class="p-5 inline">
                            <i :class="item.icon" />
                        </span>
                    </span>
                    <span class="block">{{ item.name }}</span>
                </div>
            </div>
            <div class="center">
                <div class="w100 h100">
                    <cropper ref="cropper" v-bind="option" />
                </div>
            </div>
            <div class="right">
                <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange"> 存储PDF </el-checkbox>
                <el-checkbox-group v-model="pdfList" @change="handleCheckedChange">
                    <draggable v-model="rightList" item-key="id">
                        <transition-group type="transition" name="flip-list">
                            <div v-for="(item, index) in rightList" :key="item.name" class="imgList">
                                <div class="tc">
                                    <i class="el-icon-close close" @click="imgDelete(index)" />
                                    <img :src="item.src" alt="" style="width: 70%; vertical-align: middle" />
                                    <div class="tl">
                                        <el-checkbox :label="item.name" class="checkbox" />
                                    </div>
                                </div>
                            </div>
                        </transition-group>
                    </draggable>
                </el-checkbox-group>
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
import { base64FileType, TYPE_MAP } from '@u/download';
import date from '@u/date';
import Cropper from './cropper/cropper.vue';
import 'vue-cropper/dist/index.css';
import VueCropperPng2 from './cropper/VueCropper2.png';
import VueCropperPng from './cropper/VueCropper.png';
import { VueDraggableNext } from 'vue-draggable-next';
/**
 * api接口
 */
import { rdfileBatchUpload, rdfileBatchUploadToPdf } from '@a/public';

export default {
    emits: ['close', 'cameraFile'],
    components: {
        draggable: VueDraggableNext,
        Cropper,
    },
    data() {
        return {
            loading: false,
            angle: 0,
            // 图片裁剪配置
            option: {
                cropperImg: '', //裁剪图片的地址
                httpImg: '', //高拍仪视频地址
                img: VueCropperPng2, //默认裁剪图片的地址
                outputSize: 1, //裁剪生成图片的质量(可选0.1 - 1)
                outputType: 'jpeg', //裁剪生成图片的格式（jpeg || png || webp）
                info: true, //图片大小信息
                canScale: true, //图片是否允许滚轮缩放
                autoCrop: true, //是否默认生成截图框
                autoCropWidth: 383, //默认生成截图框宽度
                autoCropHeight: 516, //默认生成截图框高度
                fixed: false, //是否开启截图框宽高固定比例
                full: false, //false按原比例裁切图片，不失真
                fixedBox: false, //固定截图框大小，不允许改变
                canMove: false, //上传图片是否可以移动
                canMoveBox: true, //截图框能否拖动
                original: false, //上传图片按照原始比例渲染
                centerBox: false, //截图框是否被限制在图片里面
                height: true, //是否按照设备的dpr 输出等比例图片
                infoTrue: false, //true为展示真实输出图片宽高，false展示看到的截图框宽高
                maxImgSize: 1000, //限制图片最大宽度和高度
                enlarge: 1, //图片根据截图框输出比例倍数
                mode: '403px 536px', //图片默认渲染方式
            },
            // 高拍仪拍照弹窗数据
            imgMessage: {},
            CameraUrl: '',
            dialogCamera: false,
            CameraOperation: [
                {
                    icon: 'el-icon-camera',
                    name: '拍  照',
                    fn: 'scan',
                },
                {
                    icon: 'el-icon-zoom-in',
                    name: '放  大',
                    fn: 'zoomIn',
                },
                {
                    icon: 'el-icon-zoom-out',
                    name: '缩  小',
                    fn: 'zoomOut',
                },
                {
                    icon: 'el-icon-refresh-left',
                    name: '左  旋',
                    fn: 'refreshLeft',
                },
                {
                    icon: 'el-icon-refresh-right',
                    name: '右  旋',
                    fn: 'refreshRight',
                },
            ],
            rightList: [],
            imgList: [],
            checkAll: true,
            pdfList: [],
            isIndeterminate: false,
        };
    },
    watch: {
        angle(val) {
            // 横向
            this.loading = true;
            if ((val / 90) % 2 === 0) {
                this.option.img = VueCropperPng2;
            } else {
                this.option.img = VueCropperPng;
            }
            this.$nextTick(() => {
                this.loading = false;
            });
        },
    },
    created() {
        this.loading = true;
        this.$store.dispatch('GETCameraUrl').then((data) => {
            this.CameraUrl = data;
            // 打开主摄像头
            this.option.httpImg = `${data}/video=stream&camidx=0&T=${new Date().getTime()}`;
            // 判断设备是否连接
            axios
                .post(`${data}/device=isconnect`)
                .catch(() => {
                    this.msgError('连接失败，请检查是否打开高拍仪！');
                })
                .finally(() => {
                    this.loading = false;
                });
        });
    },
    methods: {
        // 拍照弹窗提交
        cameraSubmitFn() {
            let imgData = new FormData(),
                pdfData = new FormData(),
                imgExistence = false,
                pdfExistence = false;
            this.rightList.forEach((item) => {
                if (this.pdfList.includes(item.name)) {
                    pdfExistence = true;
                    pdfData.append('files', item.file);
                } else {
                    imgData.append('files', item.file, item.name);
                    imgExistence = true;
                }
            });
            this.loading = true;
            let promise = [],
                cameraFile = [];
            if (imgExistence)
                promise.push(
                    rdfileBatchUpload(imgData).then((res) => {
                        res.data.forEach((item) => {
                            cameraFile.push({
                                id: `${item.id}`,
                                fileSuffix: item.fileSuffix,
                                url: item.downloadUrl,
                                fileName: item.fileName.split('.')[0],
                            });
                        });
                    })
                );
            if (pdfExistence)
                promise.push(
                    rdfileBatchUploadToPdf(pdfData).then((res) => {
                        cameraFile.push({
                            id: `${res.data.id}`,
                            fileSuffix: res.data.fileSuffix,
                            url: res.data.downloadUrl,
                            fileName: res.data.fileName.split('.')[0],
                        });
                    })
                );
            Promise.all(promise)
                .then((res) => {
                    this.$emit('cameraFile', this.clone(cameraFile));
                })
                .finally(() => {
                    this.loading = false;
                    this.closeFn();
                });
        },
        // 高拍仪操作
        CameraOperationFn(fn) {
            this[fn]();
        },
        zoomIn() {
            this.$refs.cropper.changeSize('button', 0.05);
        },
        zoomOut() {
            this.$refs.cropper.changeSize('button', -0.05);
        },
        // 拍照
        scan() {
            let data = {
                filepath: 'base64',
                rotate: '0',
                cutpage: '0',
                camidx: '0',
                ColorMode: '0',
                quality: '0',
            };
            axios.post(`${this.CameraUrl}/video=grabimage`, JSON.stringify(data)).then((res) => {
                if (res.data.code == '0') {
                    this.add_image(res.data.photoBase64);
                    this.msgSuccess('拍照成功！');
                } else {
                    this.msgError('拍照失败，请重新拍摄！');
                }
            });
        },
        /**
         * @param {base64图片} img_base64
         */
        add_image(img_base64) {
            const type = base64FileType(img_base64);
            const src = (TYPE_MAP[type] || '') + img_base64;
            this.option.cropperImg = src;
            setTimeout(() =>
                this.$refs.cropper.getCropBlob((blob) => {
                    const name = date(new Date(), 'yyyyMMddhhmmsssss') + '.' + this.option.outputType;
                    this.rightList.push({ file: blob, src: URL.createObjectURL(blob), name });
                    this.pdfList = this.rightList.map((item) => item.name);
                })
            );
        },
        /**
         * @param {rightList中删除图片的下标} i
         */
        imgDelete(i) {
            const data = this.rightList.splice(i, 1)[0];
            this.pdfList.splice(
                this.pdfList.findIndex((item) => item === data.name),
                1
            );
        },
        closeFn() {
            this?.$refs?.dialog?.handleClose();
            setTimeout(() => {
                this.$emit('close', false);
            }, 300);
        },
        //---------------------------------------------pdf-----------------------------------------
        /**
         * checkboxAll
         * @param {全选为pdf} val
         */
        handleCheckAllChange(val) {
            this.pdfList = val ? this.rightList.map((item) => item.name) : [];
            this.isIndeterminate = false;
        },
        /**
         * checkbox-group
         * @param {选为pdf的值} value
         */
        handleCheckedChange(value) {
            const checkedCount = value.length;
            this.checkAll = checkedCount === this.rightList.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.rightList.length;
        },
        refreshLeft() {
            this.rotate(-90);
        },
        refreshRight() {
            this.rotate(90);
        },
        // 旋转
        rotate(angle) {
            this.angle += angle;
            let data = { camidx: '0', rotate: String(angle) };
            axios.post(`${this.CameraUrl}/video=rotate`, JSON.stringify(data));
        },
    },
    beforeUnmount() {
        this.rotate(-this.angle);
        // 关闭主摄像头
        axios.post(`${this.CameraUrl}/video=close`, JSON.stringify({ camidx: '0' }));
    },
};
</script>

<style scoped lang="scss">
.Camera {
    height: 536px;
    .left {
        width: 10%;
        text-align: center;
        min-width: 60px;
        max-width: 100px;
        .left-item {
            > span:nth-child(1) {
                span {
                    font-size: 30px;
                    border: 2px solid;
                    border-radius: 5px;
                }
            }
            > span:nth-child(2) {
                color: #000;
                font-weight: 900;
            }
            &:hover {
                > span:nth-child(1) {
                    span {
                        color: rgba(68, 88, 254, 0.7);
                    }
                }
                > span:nth-child(2) {
                    color: rgba(68, 88, 254, 0.7);
                }
            }
        }
        .left-item + .left-item {
            margin-top: 15px;
        }
    }
    .center {
        flex: 1;
        margin: 0 15px;
        > div {
            overflow: hidden;
            border: 1px solid;
            position: relative;
            box-sizing: border-box;
            > img,
            .vue-cropper {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: none;
            }
        }
    }
    .right {
        width: 20%;
        min-width: 170px;
        max-width: 200px;
        overflow-y: auto;
        height: 100%;
        .imgList {
            cursor: move;
            > div {
                background: rgba(244, 247, 255, 1);
                padding: 4px;
                position: relative;
                .close {
                    cursor: pointer;
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    font-size: 16px;
                }
            }
        }
        .imgList + .imgList {
            margin-top: 10px;
        }
        :deep(.el-checkbox) {
            --el-checkbox-font-size: 12px !important;
        }
        .flip-list-move {
            transition: transform 0.5s;
        }
    }
}
</style>

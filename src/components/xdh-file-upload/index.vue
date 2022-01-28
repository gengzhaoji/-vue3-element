<template>
    <div class="upload-file" v-loading="loading">
        <el-upload
            v-if="!exportShow"
            ref="file"
            action
            class="avatar-uploader"
            auto-upload
            :http-request="fileUpload"
            :show-file-list="false"
            :on-exceed="exceedFn"
            v-bind="$attrs"
        >
            <template #trigger>
                <com-button plain icon="icon-upload m-r-5" class="m-r-10">上传文件</com-button>
            </template>
            <com-button plain icon="icon-photograph m-r-5" @click="dialogCamera = true">拍照上传</com-button>
            <template #tip>
                <div class="el-upload__tip" v-if="showTip">
                    请上传
                    <template v-if="fileSize">
                        不超过
                        <span>{{ fileSize }}MB</span>
                    </template>
                    <template v-if="fileType.length">
                        格式为
                        <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
                    </template>
                    的文件
                </div>
            </template>
        </el-upload>
        <!-- 上传的文件列表 -->
        <div v-if="fileList.length" class="fileList">
            <transition-group appear name="fade-transform">
                <div class="fileList_item" v-for="(file, index) in fileList" :key="file.id + index" @click.prevent="previewFn(file, index)">
                    <i class="icon-file" />
                    <el-tooltip :content="`${file.fileName}${file.fileSuffix}`" placement="top" :disabled="isDisabled">
                        <span class="name flex" v-if="editIndex === index">
                            <el-input autofocus v-model="file.fileName" size="mini" class="editInput f1 w0" @keyup.enter="editFn(file)" @blur="editFn(file)" />
                            <span class="inline">{{ file.fileSuffix }}</span>
                        </span>
                        <span class="name" v-else @mouseover="isShowTootip">{{ file.fileName }}{{ file.fileSuffix }}</span>
                    </el-tooltip>
                    <span class="button">
                        <el-tooltip effect="dark" content="保存" placement="top">
                            <i class="el-icon-circle-check pointer m-l-5" @click.stop.prevent="editFn(file)" v-show="editIndex === index" />
                        </el-tooltip>
                        <el-tooltip effect="dark" content="编辑" placement="top">
                            <i class="icon-edit pointer m-l-5" @click.stop.prevent="editIndex = index" v-show="editIndex !== index && !exportShow" />
                        </el-tooltip>
                        <el-tooltip effect="dark" content="下载" placement="top">
                            <i class="icon-download pointer m-l-5" @click.stop.prevent="downloadFn(file)" v-show="editIndex !== index" />
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top">
                            <i class="icon-close pointer m-l-5" @click.stop.prevent="closeFn(index)" v-show="editIndex !== index && !exportShow" />
                        </el-tooltip>
                    </span>
                </div>
            </transition-group>
        </div>
        <!-- 高拍仪拍照弹窗 -->
        <xdh-cropper v-if="dialogCamera" @cameraFile="(val) => fileList.push(...val)" @close="dialogCamera = false" />
        <!-- 图片预览 -->
        <el-dialog v-model="dialogVisible" title="图片预览">
            <img style="max-height: 500px; max-width: 500px; display: block; margin: 0 auto" :src="dialogImageUrl" alt />
        </el-dialog>
        <!-- PDF图片预览 -->
        <el-dialog v-model="dialogVisiblePdf" title="PDF图片预览" fullscreen>
            <iframe :src="dialogImageUrl" width="100%" height="100%" />
        </el-dialog>
    </div>
</template>

<script>
/**
 * 请求接口
 */
import { downloadGet } from '@u/axios';
import { rdfileDataUpload, rdfileRename } from '@a/public';
import { elFormKey, elFormItemKey } from 'element-plus';
import { inject } from 'vue';

export default {
    name: 'FileUpload',
    emits: ['update:modelValue'],
    /***
     * props
     * @property {Array} modelValue v-model绑定的值，
     * @property {Number} fileSize 上传文件大小的限制（默认为10M）
     * @property {Array} fileType 可以上传的文件类型，默认为[]（就是不校验文件类型）
     * @property {Boolean} isShowTip 是否显示上传框的提示（默认为true）
     * @property {Boolean} download 是否允许下载文件（默认为true）
     * @property {Boolean} disabled 是否允许操作（上传文件等操作，如果不传默认按照form表单的disabled值）
     */
    props: {
        modelValue: [Array],
        fileSize: {
            type: Number,
            default: 100,
        },
        fileType: {
            type: Array,
            default: () => [],
        },
        isShowTip: {
            type: Boolean,
            default: true,
        },
        download: {
            type: Boolean,
            default: true,
        },
        disabled: Boolean,
    },
    data() {
        return {
            dialogCamera: false,
            // 文件上传弹窗数据
            dialogImageUrl: '',
            dialogVisible: false,
            dialogVisiblePdf: false,
            fileList: [],
            loading: false,
            editIndex: null,
            isDisabled: true,
        };
    },
    setup() {
        const elForm = inject(elFormKey, {});
        const elFormItem = inject(elFormItemKey, {});
        return { elForm, elFormItem };
    },
    watch: {
        modelValue: {
            handler(val) {
                if (val) {
                    this.fileList = val;
                } else {
                    this.fileList = [];
                }
            },
            deep: true,
            immediate: true,
        },
    },
    computed: {
        // 是否显示提示
        showTip() {
            return this.isShowTip && (this.fileType || this.fileSize);
        },
        // 是否禁用上传功能
        exportShow() {
            return this.disabled || this.elForm?.disabled;
        },
    },
    methods: {
        // 文件超出个数限制时的钩子
        exceedFn(files, fileList) {
            this.msgInfo(`最多只能上传${this.$attrs.limit}条数据！`);
        },
        // 文件上传
        fileUpload(data) {
            if (data.file) {
                if (this.handleBeforeUpload(data.file)) {
                    this.loading = true;
                    let formdata = new FormData();
                    formdata.append('file', data.file);
                    rdfileDataUpload(formdata)
                        .then((res) => {
                            this.fileList.push({
                                id: `${res.data.id}`,
                                fileSuffix: res.data.fileSuffix,
                                downloadUrl: res.data.downloadUrl,
                                fileName: res.data.fileName.split('.')[0],
                            });
                            this.updateFn();
                            this.loading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                }
            }
        },
        // 上传前校检格式和大小
        handleBeforeUpload(file) {
            // 校检文件类型
            if (this.fileType.length) {
                let fileExtension = '';
                if (file.name.lastIndexOf('.') > -1) {
                    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
                }
                const isTypeOk = this.fileType.some((type) => {
                    if (file.type.indexOf(type) > -1) return true;
                    if (fileExtension && fileExtension.indexOf(type) > -1) return true;
                    return false;
                });
                if (!isTypeOk) {
                    this.$message.error(`文件格式不正确, 请上传${this.fileType.join('/')}格式文件!`);
                    return false;
                }
            }
            // 校检文件大小
            if (this.fileSize) {
                const isLt = file.size / 1024 / 1024 < this.fileSize;
                if (!isLt) {
                    this.$message.error(`上传文件大小不能超过 ${this.fileSize} MB!`);
                    return false;
                }
            }
            return true;
        },
        // 文件名修改
        editFn(file) {
            rdfileRename({ id: file.id, fileName: file.fileName }).then((res) => {
                this.msgSuccess('修改成功！');
                this.$emit('update:modelValue', this.fileList);
                this.editIndex = null;
            });
        },
        // 文件预览
        previewFn(file, index) {
            if (this.editIndex !== index) {
                if (['.png', '.jpg', '.jpeg'].includes(file.fileSuffix)) {
                    this.dialogImageUrl = file.downloadUrl;
                    this.dialogVisible = true;
                } else if (['.pdf'].includes(file.fileSuffix)) {
                    this.dialogVisiblePdf = true;
                    this.dialogImageUrl = file.downloadUrl;
                }
            }
        },
        // 文件下载
        downloadFn(data) {
            this.loading = true;
            downloadGet({ url: data.downloadUrl, fileName: data.fileName + data.fileSuffix }).finally(() => {
                this.loading = false;
            });
        },
        // 删除文件
        closeFn(index) {
            this.$$confirm('此操作将删除该数据, 是否继续?')
                .then(() => {
                    this.fileList.splice(index, 1);
                    this.updateFn();
                    this.msgSuccess('删除成功');
                })
                .catch(() => {
                    this.msgInfo('已取消删除！');
                });
        },
        updateFn() {
            this.$emit('update:modelValue', this.fileList);
            this.elForm.validateField(this.elFormItem.prop);
        },
        // 文本超出出tip e.target.clientWidth; 文本可视宽度 e.target.scrollWidth; 文本实际宽度
        isShowTootip(e) {
            this.isDisabled = e.target.scrollWidth <= e.target.clientWidth;
        },
    },
};
</script>

<style scoped lang="scss">
:deep() {
    .el-upload__tip {
        color: #858ebd;
        margin-top: 0;
    }
    .el-dialog.is-fullscreen {
        display: flex;
        flex-direction: column;
        .el-dialog__body {
            height: 0;
            flex: 1;
        }
    }
}
.fileList {
    max-height: 92px;
    overflow-y: auto;
    overflow-x: hidden;
    background: rgba(76, 105, 255, 0.05);
    border-radius: 4px;
    padding: 4px;
    box-sizing: border-box;
    transition: all 0.3s;
    &_item {
        display: flex;
        padding: 4px;
        height: 20px;
        line-height: 20px;
        border-radius: 4px;
        cursor: pointer;
        box-sizing: content-box !important;
        .icon-file {
            color: #6d6d6d;
            font-size: 12px;
            margin: 4px 4px 0 0;
        }
        .name {
            flex: 1;
            width: 0;
            text-align: left;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            color: rgba(58, 63, 99, 1);
            .editInput {
                height: 20px;
                line-height: 20px;
                :deep(.el-input__inner) {
                    height: 19px;
                    line-height: 20px;
                    padding: 0 5px;
                }
            }
        }
        .button {
            display: none;
        }
        &:hover {
            background: #fff;
            box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
            transition: 0.3s;
            .button {
                font-size: 14px;
                display: inline-block;
                .icon-download {
                    color: rgba(68, 88, 254, 1);
                }
                .icon-edit,
                .el-icon-circle-check {
                    color: rgba(0, 208, 181, 1);
                }
                .icon-close {
                    color: rgba(255, 60, 101, 1);
                }
            }
        }
    }
}
</style>

<template>
    <div class="upload-file w100">
        <el-upload
            v-if="!exportShow"
            ref="upload"
            action
            class="avatar-uploader"
            auto-upload
            :limit="limit"
            :file-list="fileList"
            :on-change="handleChange"
            :show-file-list="false"
            :on-exceed="exceedFn"
            v-bind="$attrs"
        >
            <my-button icon="Upload" plain class="m-r-10">上传文件</my-button>
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
            <transition-group name="fade-transform" mode="out-in" appear>
                <div class="fileList_item" v-for="(file, index) in fileList" :key="file.id + index" @click.prevent="previewFn(file, index)">
                    <Files style="height: 1em; margin-right: 8px; margin-top: 3px" />
                    <el-tooltip :content="`${file.fileName}${file.fileSuffix}`" placement="top" :disabled="isDisabled">
                        <span class="name flex" v-if="editIndex === index">
                            <el-input autofocus v-model="file.fileName" size="small" class="editInput f1 w0" @keyup.enter="editFn(file)" @blur="editFn(file)" />
                            <span class="inline">{{ file.fileSuffix }}</span>
                        </span>
                        <span class="name" v-else @mouseover="isShowTootip">{{ file.fileName }}{{ file.fileSuffix }}</span>
                    </el-tooltip>
                    <span class="button">
                        <el-tooltip effect="dark" content="保存" placement="top">
                            <el-icon class="pointer m-l-5" @click.stop.prevent="editFn(file)" v-show="editIndex === index">
                                <circle-check />
                            </el-icon>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="编辑" placement="top">
                            <el-icon class="pointer m-l-5" @click.stop.prevent="editIndex = index" v-show="editIndex !== index && !exportShow">
                                <edit />
                            </el-icon>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="下载" placement="top">
                            <el-icon class="pointer m-l-5" @click.stop.prevent="downloadFn(file)" v-show="editIndex !== index">
                                <download />
                            </el-icon>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top">
                            <el-icon class="pointer m-l-5" @click.stop.prevent="closeFn(index)" v-show="editIndex !== index && !exportShow">
                                <close />
                            </el-icon>
                        </el-tooltip>
                    </span>
                </div>
            </transition-group>
        </div>
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

<script setup name="myFileUpload">
/**
 * 请求接口
 */
import { downloadGet } from '@u/axios';
import { rdfileDataUpload, rdfileRename } from '@a/public';
import { formContextKey as elFormKey, formItemContextKey as elFormItemKey, genFileId } from 'element-plus';

const emits = defineEmits(['update:modelValue']),
    elForm = inject(elFormKey, {}),
    elFormItem = inject(elFormItemKey, {}),
    $vm = inject('$vm'),
    /***
     * props
     * @property {Array} modelValue v-model绑定的值，
     * @property {Number} fileSize 上传文件大小的限制（默认为10M）
     * @property {Array} fileType 可以上传的文件类型，默认为[]（就是不校验文件类型）
     * @property {Boolean} isShowTip 是否显示上传框的提示（默认为true）
     * @property {Boolean} download 是否允许下载文件（默认为true）
     * @property {Boolean} disabled 是否允许操作（上传文件等操作，如果不传默认按照form表单的disabled值）
     * @property {Number} limit 上传附件数量
     */
    props = defineProps({
        modelValue: [Array, String],
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
        limit: {
            type: Number,
            default: 1,
        },
    });
// 文件上传弹窗数据
let dialogImageUrl = $ref(''),
    dialogVisible = $ref(false),
    dialogVisiblePdf = $ref(false),
    fileList = $ref([]),
    editIndex = $ref(null),
    isDisabled = $ref(true);
// 是否显示提示
let showTip = $computed(() => props.isShowTip && (props.fileType ?? props.fileSize)),
    // 是否禁用上传功能
    exportShow = $computed(() => props.disabled || elForm?.disabled);
watch(
    () => props.modelValue,
    (val) => {
        if (val)
            fileList =
                val?.map((item) => ({
                    id: item.id,
                    downloadUrl: item.downloadUrl,
                    fileName: item.fileName,
                    fileSizeFormat: item.fileSizeFormat,
                    fileSize: item.fileSize,
                    fileSuffix: item.fileSuffix,
                })) || [];
    },
    { deep: true, immediate: true }
);
// 文件超出个数限制时的钩子
const attrs = useAttrs();
let upload = $ref();
function exceedFn(files, fileList) {
    upload.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    upload.handleStart(file);
}
// 文件上传
function handleChange(data) {
    if (data.raw) {
        if (handleBeforeUpload(data.raw)) {
            let formdata = new FormData();
            formdata.append('file', data.raw);
            rdfileDataUpload(formdata).then((res) => {
                if (props.limit === 1) fileList = [];
                nextTick(() => {
                    fileList.push({
                        id: res.data.id,
                        downloadUrl: res.data.downloadUrl,
                        fileName: res.data.fileName.split('.')[0],
                        fileSizeFormat: res.data.fileSizeFormat,
                        fileSize: res.data.fileSize,
                        fileSuffix: res.data.fileSuffix,
                    });
                    updateFn();
                });
            });
        } else {
            if (props.limit === 1) fileList = [];
            updateFn();
        }
    }
}
// 上传前校检格式和大小
function handleBeforeUpload(file) {
    // 校检文件类型
    if (props.fileType.length) {
        let fileExtension = '';
        if (file.name.lastIndexOf('.') > -1) {
            fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
        }
        const isTypeOk = props.fileType.some((type) => {
            if (file.type.indexOf(type) > -1) return true;
            if (fileExtension && fileExtension.indexOf(type) > -1) return true;
            return false;
        });
        if (!isTypeOk) {
            $vm.msgError(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`);
            return false;
        }
    }
    // 校检文件大小
    if (props.fileSize) {
        const isLt = file.size / 1024 / 1024 < props.fileSize;
        if (!isLt) {
            $vm.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
            return false;
        }
    }
    return true;
}
// 文件名修改
function editFn(file) {
    rdfileRename({ id: file.id, fileName: file.fileName }).then((res) => {
        $vm.msgSuccess('修改成功！');
        emits('update:modelValue', fileList);
        editIndex = null;
    });
}
// 文件预览
function previewFn(file, index) {
    if (editIndex !== index) {
        if (['.png', '.jpg', '.jpeg'].includes(file.fileSuffix)) {
            dialogImageUrl = file.downloadUrl;
            dialogVisible = true;
        } else if (['.pdf'].includes(file.fileSuffix)) {
            dialogVisiblePdf = true;
            dialogImageUrl = file.downloadUrl;
        }
    }
}
// 文件下载
function downloadFn(data) {
    downloadGet({ url: data.downloadUrl, fileName: data.fileName + data.fileSuffix });
}
// 删除文件
function closeFn(index) {
    $vm.$$confirm('此操作将删除该数据, 是否继续?')
        .then(() => {
            upload.clearFiles();
            if (props.limit === 1) {
                fileList = [];
            } else {
                const index = fileList.findIndex((item) => item.id === file.id);
                fileList.splice(index, 1);
            }
            updateFn();
            $vm.msgSuccess('删除成功');
        })
        .catch(() => {
            $vm.msgInfo('已取消删除！');
        });
}
function updateFn() {
    emits('update:modelValue', fileList);
    elForm.validateField(elFormItem.prop);
}
// 文本超出出tip e.target.clientWidth; 文本可视宽度 e.target.scrollWidth; 文本实际宽度
function isShowTootip(e) {
    isDisabled = e.target.scrollWidth <= e.target.clientWidth;
}
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

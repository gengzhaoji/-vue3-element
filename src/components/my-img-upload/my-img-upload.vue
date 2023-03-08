<template>
    <div class="upload-file">
        <el-upload
            ref="upload"
            action
            list-type="picture-card"
            auto-upload
            :limit="limit"
            :on-exceed="exceedFn"
            :on-change="handleChange"
            :disabled="myImgUploadDisabled"
            :file-list="fileList"
            accept=".png,.jpg,.jpeg"
            v-bind="$attrs"
        >
            <el-icon><Plus /></el-icon>
            <!-- 缩略图模板的内容 -->
            <template #file="{ file }">
                <el-image
                    :src="file.downloadUrl"
                    :preview-src-list="fileList.map((item) => item.downloadUrl)"
                    :initial-index="fileList.findIndex((item) => item.downloadUrl === file.downloadUrl)"
                    fit="cover"
                    preview-teleported
                />
                <span class="el-upload-list__item-actions" v-if="!myImgUploadDisabled">
                    <span class="el-upload-list__item-delete" @click="handleDownload(file)">
                        <el-icon><Download /></el-icon>
                    </span>
                    <span class="el-upload-list__item-delete" @click="handleRemove(file)">
                        <el-icon><Delete /></el-icon>
                    </span>
                </span>
            </template>
            <!-- 提示说明文字 -->
            <template #tip v-if="!myImgUploadDisabled">
                <div style="color: #858ebd">单张图片不超过 {{ fileSize }} M</div>
            </template>
        </el-upload>
    </div>
</template>

<script setup name="MyImgUpload">
/**
 * 请求接口
 */
import { downloadGet } from '@u/axios';
import { rdfileDataUpload } from '@a/public';
import { formContextKey as elFormKey, formItemContextKey as elFormItemKey, genFileId } from 'element-plus';

const emits = defineEmits(['update:modelValue']),
    elForm = inject(elFormKey, {}),
    elFormItem = inject(elFormItemKey, {}),
    $vm = inject('$vm'),
    upload = ref(null),
    fileType = ['png', 'jpg', 'jpeg'],
    /***
     * props
     * @property {Array} modelValue v-model绑定的值，
     * @property {Number} fileSize 上传文件大小的限制（默认为10M）
     * @property {Boolean} download 是否允许下载文件（默认为true）
     * @property {Number} limit 上传附件数量
     */
    props = defineProps({
        modelValue: [Array],
        fileSize: {
            type: Number,
            default: 10,
        },
        download: {
            type: Boolean,
            default: true,
        },
        limit: {
            type: Number,
        },
        disabled: Boolean,
    });

// 是否禁用上传功能
let myImgUploadDisabled = computed(() => props.disabled || elForm?.disabled),
    fileList = computed(() => {
        return (
            props.modelValue.map((item) => ({
                id: item.id,
                downloadUrl: item.downloadUrl,
                fileName: item.fileName,
                fileSizeFormat: item.fileSizeFormat,
                fileSize: item.fileSize,
                fileSuffix: item.fileSuffix,
            })) || []
        );
    });
watch(
    () => fileList,
    (val) => {
        emits('update:modelValue', val);
        elForm.validateField(elFormItem.prop);
    }
);
// 文件超出个数限制时的钩子
function exceedFn(files) {
    unref(upload).clearFiles();
    const file = files[0];
    file.uid = genFileId();
    unref(upload).handleStart(file);
}
// 文件上传
function handleChange(data) {
    if (data.raw) {
        if (handleBeforeUpload(data.raw)) {
            let formdata = new FormData();
            formdata.append('file', data.raw);
            rdfileDataUpload(formdata).then((res) => {
                if (props.limit === 1) fileList.value = [];
                nextTick(() => {
                    fileList.value.push({
                        id: res.data.id,
                        downloadUrl: res.data.downloadUrl,
                        fileName: res.data.fileName.split('.')[0],
                        fileSizeFormat: res.data.fileSizeFormat,
                        fileSize: res.data.fileSize,
                    });
                });
            });
        } else {
            if (props.limit === 1) fileList.value = [];
        }
    }
}
// 上传前校检格式和大小
function handleBeforeUpload(file) {
    // 校检文件类型
    let fileExtension = '';
    if (file.name.lastIndexOf('.') > -1) {
        fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1);
    }
    const isTypeOk = fileType.some((type) => {
        if (file.type.indexOf(type) > -1) return true;
        if (fileExtension && fileExtension.indexOf(type) > -1) return true;
        return false;
    });
    if (!isTypeOk) {
        $vm.msgError(`文件格式不正确, 请上传${fileType.join('/')}格式文件!`);
        return false;
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
// 文件下载
function handleDownload(data) {
    downloadGet({ url: data.downloadUrl, fileName: data.fileName });
}
// 删除文件
function handleRemove(file) {
    $vm.$$confirm('此操作将删除该数据, 是否继续?')
        .then(() => {
            unref(upload).clearFiles();
            if (props.limit === 1) {
                fileList.value = [];
            } else {
                const index = fileList.value.findIndex((item) => item.id === file.id);
                fileList.value.splice(index, 1);
            }
            $vm.msgSuccess('删除成功');
        })
        .catch(() => {
            $vm.msgInfo('已取消删除！');
        });
}
</script>

<style lang="scss" scoped>
.upload-file {
    width: 100%;
    overflow-x: auto;
    > div {
        width: 100%;
    }
    :deep() {
        .is-disabled .el-upload--picture-card {
            display: none !important;
        }
        .el-upload-list--picture-card {
            flex-wrap: nowrap;
            width: 100%;
            overflow: auto;
            .el-upload-list__item,
            .el-upload--picture-card {
                flex-grow: 0;
                -webkit-box-flex: 0;
                -webkit-flex-grow: 0;
                -ms-flex-positive: 0;
                flex-grow: 0;
                -webkit-flex-shrink: 0;
                -ms-flex-negative: 0;
                flex-shrink: 0;
            }
        }
    }
}
</style>

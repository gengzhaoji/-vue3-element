<template>
    <el-dialog custom-class="MyPreview" v-model="dialogVisible" title="文件预览" :fullscreen="type !== 'image'" v-bind="$attrs">
        <template v-if="type === 'image'">
            <!-- 图片预览 -->
            <el-image :src="url" fit="contain" preview-teleported />
        </template>
        <template v-if="type === 'pdf'">
            <!-- PDF图片预览 -->
            <iframe :src="url" width="100%" height="100%" />
        </template>
        <template v-if="type === 'word'">
            <!-- docx预览 -->
            <div class="w100 h100" ref="fileRef" />
        </template>
        <template v-if="type === 'excel'">
            <el-tabs v-model="activeSheet" class="demo-tabs">
                <el-tab-pane v-for="(item, index) in xlsxSheetsNames" :label="item" :name="index" :key="index">
                    <div class="xlsx-preview" v-html="xlsxSheetsHtml[item]" />
                </el-tab-pane>
            </el-tabs>
        </template>
    </el-dialog>
</template>

<script setup name="MyPreview">
import axios from 'axios';
import { getFileType } from '@u/url';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

/**
 * 预览组件
 * @module components/my-preview
 * 使用demo
 * <!-- 文件预览组件 -->
 * <my-preview :url="previewUrl" @close="previewUrl = ''" />
 */

/**
 * 属性参数
 * @member props
 * @property {String} [url] 文件地址
 */
const props = defineProps({
    // 显示头部
    url: {
        type: [String],
        required: true,
    },
});
let // 文件类型
    type = $ref(''),
    dialogVisible = $ref(false),
    fileRef = $ref(null);

// excal文件预览
let xlsxSheetsNames = $ref([]),
    activeSheet = $ref(0),
    xlsxSheetsHtml = $ref({});

watch(
    () => props.url,
    (val) => {
        if (val) {
            type = getFileType(val);
            dialogVisible = true;
            if (['word', 'excel'].includes(type)) {
                axios
                    .get(val, {
                        responseType: 'blob',
                    })
                    .then((res) => {
                        if (['word'].includes(type)) {
                            renderAsync(res.data, fileRef); // 渲染到页面
                        } else {
                            const fileReader = new FileReader();
                            fileReader.onload = (e) => {
                                if (e.target?.result) {
                                    let workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' }); // 解析数据
                                    activeSheet = 0;
                                    xlsxSheetsNames = workbook.SheetNames; //该文件每个工作表名字
                                    for (const key in workbook.Sheets) {
                                        if (Object.hasOwnProperty.call(workbook.Sheets, key)) {
                                            xlsxSheetsHtml[key] = XLSX.utils.sheet_to_html(workbook.Sheets[key]);
                                        }
                                    }
                                }
                            };
                            fileReader.readAsArrayBuffer(res.data);
                        }
                    });
            }
        }
    }
);
</script>

<style lang="scss" scoped>
.xlsx-preview {
    :deep(tr:nth-child(1)) {
        background: gainsboro;
    }
    :deep(table) {
        border-right: 1px solid black;
        border-bottom: 1px solid black;
        width: 100%;
    }
    :deep(td) {
        border-left: 1px solid black;
        border-top: 1px solid black;
    }
}
</style>

<style lang="scss">
.MyPreview {
    display: flex;
    flex-direction: column;
    .el-dialog__body {
        flex: 1;
        height: 0;
    }
}
</style>

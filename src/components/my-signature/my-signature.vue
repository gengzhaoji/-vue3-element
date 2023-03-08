<template>
    <el-dialog title="签名" :width="`${width + 30}px`" @open="init" append-to-body draggable v-bind="$attrs">
        <canvas v-bind="{ height, width }" ref="refCanvas" />
        <template #footer>
            <my-button @click="clearFn">重新签名</my-button>
            <my-button type="primary" @click="submitFn">确认签名</my-button>
        </template>
    </el-dialog>
</template>

<script setup name="MySignature">
/**
 * 签名组件
 * @module components/my-signature
 * 使用demo
 * <!-- 签名组件 -->
 * <my-signature v-model="signatureShow" @getImg="(val) => {signatureShow = false; model[prop] = val;} "/>
 */
import { rdfileUpload } from '@a/public';
import { base64ToFile } from '@u/download';
import SignaturePad from 'signature_pad';

const $vm = inject('$vm');
const $emits = defineEmits(['getImg']);
/***
 * 参数属性
 * @property {Number} [height = 200] 签字版的高度
 * @property {Number} [width = 470] 签字版的宽度
 * @property {Object} signatureObj SignaturePad的配置属性
 */
const props = defineProps({
    height: {
        type: Number,
        default: 200,
    },
    width: {
        type: Number,
        default: 470,
    },
    signatureObj: {
        type: Object,
        default: () => ({ backgroundColor: '#b1b3b8' }),
    },
});

let signature,
    refCanvas = ref(null);
function init() {
    nextTick(() => {
        if (refCanvas.value) signature = new SignaturePad(refCanvas.value, props.signatureObj);
    });
}

// 清除画板
function clearFn() {
    signature.clear();
}

// 确认画板
function submitFn() {
    let formdata = new FormData();
    formdata.append('file', base64ToFile(signature.toDataURL('image/png')));
    rdfileUpload(formdata)
        .then((res) => {
            if (res?.data) {
                $emits('getImg', res.data);
                signature.clear();
                $vm.msgSuccess('保存成功！');
            }
        })
        .catch(() => {
            $vm.msgError('保存失败');
        });
}
</script>

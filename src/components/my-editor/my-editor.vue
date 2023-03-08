<template>
    <div style="z-index: 100">
        <Toolbar :editorId="editorId" :editor="editorRef" :defaultConfig="toolbarConfig" style="border: 1px solid var(--el-border-color)" />
        <Editor
            :editorId="editorId"
            :defaultConfig="editorConfig"
            v-model="modelContent"
            @onCreated="handleCreated"
            :style="{ border: '1px solid var(--el-border-color)', 'border-top': 0, height }"
        />
    </div>
</template>

<script setup name="MyEditor">
import { formContextKey as elFormKey, formItemContextKey as elFormItemKey } from 'element-plus';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { h } from 'snabbdom';
import { Boot } from '@wangeditor/editor';
import { rdfileDataUpload } from '@a/public';
import '@wangeditor/editor/dist/css/style.css';
import { guid } from '@u/util';

/**
 * 新增自定义类型  封装为模块
 */
const key = `MYAudio_${guid()}`;
class MyMenu {
    constructor() {
        this.iconSvg =
            '<svg t="1651131626313" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2073" width="200" height="200"><path d="M123.5 438.5h131.3v310.7H123.5zM769.2 438.5h131.3v310.7H769.2z" fill="#D1D2D4" p-id="2074"></path><path d="M859.8 398.8h-48.3c-7.9 0-15.4 1.6-22.5 3.9v-32.4c0-125.2-101.9-227.1-227.1-227.1h-99.7c-125.2 0-227.1 101.9-227.1 227.1v32.4c-7.1-2.3-14.6-3.9-22.5-3.9h-48.3c-40.9 0-74.2 33.3-74.2 74.2v243c0 40.9 33.3 74.2 74.2 74.2h48.3c40.9 0 74.2-33.3 74.2-74.2V370.3c0-96.7 78.7-175.4 175.4-175.4h99.7c96.7 0 175.4 78.7 175.4 175.4V716c0 40.9 33.3 74.2 74.2 74.2h48.3c40.9 0 74.2-33.3 74.2-74.2V473c-0.1-40.9-33.3-74.2-74.2-74.2zM235.1 716c0 12.4-10.1 22.5-22.5 22.5h-48.3c-12.4 0-22.5-10.1-22.5-22.5V473c0-12.4 10.1-22.5 22.5-22.5h48.3c12.4 0 22.5 10.1 22.5 22.5v243z m647.2 0c0 12.4-10.1 22.5-22.5 22.5h-48.3c-12.4 0-22.5-10.1-22.5-22.5V473c0-12.4 10.1-22.5 22.5-22.5h48.3c12.4 0 22.5 10.1 22.5 22.5v243z" fill="" p-id="2075"></path><path d="M531.3 652.3c-1.7 0-3.3-0.1-5-0.4-10.2-1.7-18.7-8.3-22.7-17.8l-41.1-95.4-37 43.8c-8.1 9.6-19.9 15.1-32.5 15.1h-71.9V546h67.6l56.6-67.1c6.8-8.1 17-12 27.5-10.4 10.4 1.5 19.1 8.2 23.3 17.9l41.6 96.7 21.9-24c8-8.8 19.5-13.9 31.4-13.9h102.4v51.7H595l-41.6 45.7c-5.6 6.2-13.7 9.7-22.1 9.7z" fill="" p-id="2076"></path></svg>';
        this.title = '音频';
        this.tag = 'button';
    }
    getValue(editor) {
        return ``;
    }
    isActive(editor) {
        return false;
    }
    isDisabled(editor) {
        return false;
    }
    exec(editor, value) {
        // 添加 file input（每次重新创建 input）
        const $body = document.getElementsByTagName('body')[0];
        // <input type="file" accept= multiple/>
        const $inputFile = document.createElement(`input`);
        $inputFile.type = 'file';
        $inputFile.style.display = 'none';
        $inputFile.accept = '.mp3,audio/*';
        $body.appendChild($inputFile);
        $inputFile.click();
        // 选中文件
        $inputFile.onchange = (e) => {
            AudioUpload(editor, e.target.files[0]); // 上传文件
        };
    }
}
Boot.registerModule({
    renderElems: [
        {
            type: 'audio', // 节点 type ，重要！！！
            // 渲染函数 elem 即当前节点 children 是下级节点 editor 即编辑器实例
            renderElem: function (elem, children) {
                const vnode = h('audio', { controls: true }, [h('source', { src: elem.src }, children)]); // type: 'renderAudio' 节点，即渲染为 <audio> 标签
                return vnode;
            },
        },
    ],
    elemsToHtml: [
        {
            type: 'audio', // 节点 type ，重要！！！
            // 生成 html 的函数
            elemToHtml: function paragraphToHtml(elem, childrenHtml) {
                return `<audio controls><source src=${elem.src}></audio>`;
            },
        },
    ],
    parseElemsHtml: [
        {
            selector: 'audio', // CSS 选择器，以匹配“链接”的 html tag
            /**
             * 将 html 转换为 slate elem
             * @param $elem 由 html 生成的 DOM 节点（Dom7 封装，类似于 jquery）
             * @param children 子节点
             * @param editor editor
             * @returns slate element
             */
            parseElemHtml: function parseHtml($elem, children, editor) {
                // 返回 slate elem ，链接类型
                return {
                    type: 'audio',
                    src: $elem.children[0].src,
                    children: [{ text: '' }],
                };
            },
        },
    ],
    menus: [
        {
            key,
            factory() {
                return new MyMenu();
            },
        },
    ],
});

//【注意】编辑器 id ，要全局唯一
const editorId = `w-e-${Math.random().toString().slice(-5)}`,
    // 工具栏配置
    defaultToolbar = {
        simple: [
            'headerSelect',
            'fontSize',
            'lineHeight',
            'bold',
            'underline',
            'italic',
            'color',
            'bgColor',
            'bulletedList',
            'numberedList',
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
                key: 'group-justify',
                menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
                title: '对齐',
            },
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
                key: 'group-indent',
                menuKeys: ['indent', 'delIndent'],
                title: '缩进',
            },
            'undo',
            'redo',
            'fullScreen',
        ],
        classic: [
            'headerSelect',
            'blockquote',
            '|',
            'bold',
            'underline',
            'italic',
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
                key: 'group-more-style',
                menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle'],
                title: '更多',
            },
            'color',
            'bgColor',
            '|',
            'fontSize',
            'fontFamily',
            'lineHeight',
            '|',
            'bulletedList',
            'numberedList',
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
                key: 'group-justify',
                menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
                title: '对齐',
            },
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
                key: 'group-indent',
                menuKeys: ['indent', 'delIndent'],
                title: '缩进',
            },
            '|',
            'insertLink',
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
                key: 'group-image',
                menuKeys: ['insertImage', 'uploadImage'],
                title: '图片',
            },
            {
                iconSvg:
                    '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
                key: 'group-video',
                menuKeys: ['insertVideo', 'uploadVideo'],
                title: '视频',
            },
            key,
            'insertTable',
            'divider',
            '|',
            'undo',
            'redo',
            '|',
            'fullScreen',
        ],
        document: [
            [
                'headerSelect',
                'blockquote',
                '|',
                'bold',
                'underline',
                'italic',
                {
                    iconSvg:
                        '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
                    key: 'group-more-style',
                    menuKeys: ['through', 'code', 'sup', 'sub', 'clearStyle'],
                    title: '更多',
                },
                'color',
                'bgColor',
                '|',
                'fontSize',
                'fontFamily',
                'lineHeight',
                '|',
                'bulletedList',
                'numberedList',
                'todo',
                {
                    iconSvg:
                        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
                    key: 'group-justify',
                    menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
                    title: '对齐',
                },
                {
                    iconSvg:
                        '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
                    key: 'group-indent',
                    menuKeys: ['indent', 'delIndent'],
                    title: '缩进',
                },
                '|',
                'emotion',
                'insertLink',
                {
                    iconSvg:
                        '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
                    key: 'group-image',
                    menuKeys: ['insertImage', 'uploadImage'],
                    title: '图片',
                },
                {
                    iconSvg:
                        '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
                    key: 'group-video',
                    menuKeys: ['insertVideo', 'uploadVideo'],
                    title: '视频',
                },
                'insertTable',
                'codeBlock',
                'divider',
                '|',
                'undo',
                'redo',
                '|',
                'fullScreen',
            ],
        ],
    },
    $emit = defineEmits(['update:modelValue', 'on-change']),
    elForm = inject(elFormKey, {}),
    elFormItem = inject(elFormItemKey, {}),
    $vm = inject('$vm'),
    /**
     * 属性参数
     * @property {string} [modelValue] 编辑器值
     * @property {string|array} [toolbar=classic] 工具条，支持：simple、classic、document
     * @property {Object} [config] CKEditor 实例化配置参数
     * @property {String} [height] 编辑器高度，如果不设置，即根据输入内容适应
     */
    props = defineProps({
        // 内容
        modelValue: {
            type: String,
            default: '',
        },
        // simple classic document
        toolbar: {
            type: [String, Array],
            default: 'classic',
            validator(val) {
                return Array.isArray(val) || ['simple', 'classic', 'document'].includes(val);
            },
        },
        // 编辑器配置
        config: {
            type: Object,
        },
        height: {
            type: String,
            default: '300px',
        },
    }),
    readonly = computed(() => useAttrs().disabled ?? elForm?.disabled),
    editorRef = shallowRef(),
    // 数据双向绑定
    modelContent = computed({
        get: () => props.modelValue,
        set(val) {
            $emit('update:modelValue', val);
            elForm.validateField(elFormItem.prop);
            /**
             * 内容变化时触发
             * @event on-change
             * @param {string} val 新内容
             */
            $emit('on-change', val);
        },
    }),
    editorConfig = computed(() => ({
        mode: 'default',
        placeholder: '请输入内容...',
        readOnly: readonly.value,
        MENU_CONF: {
            // 图片上传配置
            uploadImage: {
                // 小于该值就插入 base64 格式（而不上传），默认为 0
                // base64LimitSize: 5 * 1024, // 5kb
                // 自定义上传
                customUpload(file, insertFn) {
                    fileUpload(file, insertFn, 'image');
                },
            },
            uploadVideo: {
                // 自定义上传
                customUpload(file, insertFn) {
                    fileUpload(file, insertFn, 'video');
                },
            },
        },
        ...props.config,
    })),
    toolbarConfig = computed(() => ({ mode: 'default', toolbarKeys: defaultToolbar[props.toolbar] || props.toolbar }));

function AudioUpload(editor, file) {
    let formdata = new FormData();
    formdata.append('file', file);
    rdfileDataUpload(formdata)
        .then((res) => {
            const { downloadUrl } = res.data;
            const node = {
                type: 'audio',
                src: downloadUrl,
                children: [{ text: '' }], // void node 要有一个空 text
            };
            Promise.resolve().then(() => {
                editor.insertNode(node);
            });
        })
        .catch(() => {
            $vm.msgError('上传失败！');
        });
}
// 文件上传
function fileUpload(data, insertFn, type) {
    if (data) {
        let formdata = new FormData();
        formdata.append('file', data);
        rdfileDataUpload(formdata)
            .then((res) => {
                const { downloadUrl, fileName } = res.data;
                if (type === 'image') {
                    // 最后插入图片
                    insertFn(downloadUrl, fileName, downloadUrl);
                } else {
                    // 最后插入图片
                    insertFn(downloadUrl);
                }
            })
            .catch(() => {
                $vm.msgError('上传失败！');
            });
    }
}
// 编辑器回调函数
function handleCreated(editor) {
    editorRef.value = editor; // 记录 editor 实例，重要！
}
// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
    if (editorRef.value == null) return;
    editorRef.value.destroy();
});
</script>

<style>
.w-e-full-screen-container [data-w-e-textarea='true'] {
    max-height: none !important;
}
</style>

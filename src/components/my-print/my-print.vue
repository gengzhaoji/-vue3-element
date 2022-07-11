<!-- 页面打印组件 -->
<template>
    <span @click="handlePrint">
        <slot>
            <my-button>打印</my-button>
        </slot>
    </span>
</template>

<script setup name="myPrint">
import { addClass, removeClass, hasClass, setStyle } from 'element-plus/lib/utils/dom/style';
/**
 * MyPrint
 * @module widgets/XdhPrint
 * @example
 *
 * // 使用说明
 *  <my-print print-range=".pring-range1">
 *  </my-print>
 *
 * // ----------或使用slot-------
 *  <my-print print-range=".pring-range1">
 *    <el-button type="primary" icon="Tickets" #button></el-button>
 *  </my-print>
 */
/**
 * 作用域插槽
 * @member slot
 * @property {string} [button] 自定义按钮
 */
/**
 * 属性参数
 * @member
 * @property {String} [printRange] 打印区域，css选择器，该参数为必须
 * @property {String} [containerClass = 'my-print-page-container'] 打印内容的容器className
 * @property {Function | HTMLElement | String} [parentDom] 作为父容器的dom对象，或者返回dom对象的方法,dom中必须包含container-class指定的className
 * @property {Object} [rootStyle] 顶层容器的样式,请不要设置position为absolute,relative或static, 否则分页效果会不起作用
 * @property {Function} [beforePrint] 在复制打印区域前执行，须返回promise对象
 * @property {Function} [afterPrint] 在打印完成之后执行
 * @property {String} [removeSelector] 打印时需要删除的元素选择器
 * @property {Array} [styleArray] 打印时须改变的样式数组，示例:[{selector: '.selector', style: {height: 'auto'}}]
 * @property {Function} [domTransfer] 自定义修改打印内容的方法
 * @property {Boolean} [disableDefaultStyle] 禁用默认样式数组，只使用style-array参数
 * @property {Boolean} [preview] 打印后不删除页面打印内容
 */
const props = defineProps({
        printRange: {
            type: String,
            default: '',
            required: true,
        },
        containerClass: {
            type: String,
            default: 'my-print-page-container',
        },
        parentDom: [HTMLElement, Function, String],
        rootStyle: {
            type: Object,
            default: () => {
                return {};
            },
        },
        beforePrint: Function,
        afterPrint: Function,
        removeSelector: {
            type: String,
            default: '',
        },
        styleArray: {
            type: Array,
            default() {
                return [];
            },
        },
        domTransfer: Function,
        disableDefaultStyle: Boolean,
        preview: Boolean,
    }),
    defaultStyles = [
        {
            selector: '.el-table',
            style: {
                height: 'auto',
            },
        },
        {
            selector: '.el-table__body-wrapper',
            style: {
                height: 'auto',
            },
        },
    ];
let handle = null;
let $tDoms = $ref(null);
function handlePrint() {
    if (typeof props.beforePrint === 'function') {
        props.beforePrint().then(() => {
            cloneDom();
        });
    } else {
        cloneDom();
    }
}
function domTransferDefault(tDom) {
    // 顶层容器默认的样式，请不要设置position为absolute,relative或static, 否则分页效果会不起作用
    let style = {
        width: '100%',
        'max-width': '1200px',
        'background-color': '#fff',
        padding: '0 80px 0 0',
        'box-sizing': 'border-box',
    };
    // 使用者自行传入的样式，如果有同名样式，会覆盖掉
    if (props.rootStyle) {
        style = Object.assign(style, props.rootStyle);
    }
    setStyle(tDom, style);
    // 在打印之前可能需要删除某些元素，可通过removeSelector传入选择器将其删除
    if (props.removeSelector) {
        const removeDoms = tDom.querySelectorAll(props.removeSelector);
        for (let i = 0; i < removeDoms.length; i++) {
            const item = removeDoms[i];
            if (item) {
                item.parentNode.removeChild(item);
            }
        }
    }
    // 在打印之前可能需要改变某些元素的样式，可以将一个数组通过styleArray传进来
    // 数组格式为 [{selector: '.selector-name',style: {height: 'auto'}}]
    let selectors;
    if (!props.disableDefaultStyle) {
        selectors = defaultStyles.concat(props.styleArray).concat([
            {
                selector: props.printRange,
                style: {
                    height: 'auto',
                },
            },
        ]);
    } else {
        selectors = props.styleArray;
    }
    // 迭代改变每个打印区域的每个dom元素
    for (let i = 0; i < selectors.length; i++) {
        const elems = tDom.querySelectorAll(selectors[i].selector);
        for (let j = 0; j < elems.length; j++) {
            setStyle(elems[j], selectors[i].style);
        }
    }
    // 如果使用者需要编写自己的转换逻辑，则使用domTransfer参数传递一个处理方法
    let tDomTransfered;
    if (typeof props.domTransfer === 'function') {
        tDomTransfered = props.domTransfer(tDom);
    } else {
        tDomTransfered = tDom;
    }
    if (tDomTransfered) {
        return tDomTransfered;
    } else {
        throw new Error('domTransfer方法须返回正确的dom元素');
    }
}
function removePrintPreview() {
    // 将打印区域外的元素重新显示
    const rootElems = document.querySelectorAll('body>*');
    for (let i = 0; i < rootElems.length; i++) {
        removeClass(rootElems[i], 'my-print-displaynone');
        removeClass(rootElems[i], 'my-print-hide');
    }
    // 删除打印区域
    document.body.removeChild($tDoms);
    $tDoms = null;
}
function createDom(innerHTML) {
    const con = document.createElement('div');
    con.innerHTML = innerHTML.toString();
    return con.childNodes[0];
}
function prependDom(parent, elem) {
    parent.innerHTML = elem.outerHTML + parent.innerHTML;
    return parent;
}
function closeAfterPrint() {
    handle = document.execCommand('print');
    if (handle) {
        // 如果不保留打印预览，则直接删除打印区域
        removePrintPreview();
        props?.afterPrint?.();
    } else {
        setTimeout(() => {
            closeAfterPrint();
        }, 300);
    }
}
function cloneDom() {
    if (props.printRange) {
        // 将打印区域筛选出来用一个div包裹起来
        const contents = document.querySelectorAll(props.printRange);
        const con = document.createElement('div');
        for (let i = 0; i < contents.length; i++) {
            const cloneElem = contents[i].cloneNode(true);
            // 处理canvas元素，使用原来canvas对象的toDataURL方法生成base64,替换复制dom中的canvas
            const canvas = contents[i].querySelectorAll('canvas');
            const canvasClone = cloneElem.querySelectorAll('canvas');
            for (let j = 0; j < canvas.length; j++) {
                const imgSrc = canvas[j].toDataURL();
                const img = document.createElement('img');
                img.src = imgSrc;
                canvasClone[j].parentNode.replaceChild(img, canvasClone[j]);
            }
            // 添加分页符样式，最后一页不加分页符，否则如果最后一页占满了，会多出一页空白页
            if (i !== contents.length - 1) {
                addClass(cloneElem, 'my-print-page-break');
            }
            // 将复制的打印区域添加到容器中
            con.appendChild(cloneElem);
        }
        // 使用一个容器再包裹，方便后面移除
        const tDom = document.createElement('div');
        // tDom.id = 'body-print-range';
        // 在顶层容器和打印内容之间可以添加DOM元素，但需指定打印内容所在的class名称
        if (props.parentDom) {
            let parentDom;
            let parentCon;
            if (props.parentDom instanceof HTMLElement) {
                parentDom = props.parentDom;
            } else if (props.parentDom instanceof Function) {
                parentDom = props.parentDom();
            } else if (typeof props.parentDom === 'string') {
                parentDom = createDom(props.parentDom);
            } else {
                throw new Error('parent-dom必须为dom元素');
            }
            if (!(parentDom instanceof HTMLElement)) {
                throw new Error('parent-dom参数格式错误，无法生成合法的dom');
            }
            // 如果parentDom包含有container-class指定的类，则本身作为容器，否则查找内部是否有该类
            if (hasClass(parentDom, props.containerClass)) {
                parentCon = parentDom;
            } else {
                parentCon = parentDom.querySelector('.' + props.containerClass);
            }
            if (parentCon) {
                parentCon.appendChild(con);
                tDom.appendChild(parentDom);
            } else {
                throw new Error('没找到父容器，检查是否缺少container-class参数');
            }
        } else {
            tDom.className = props.containerClass;
            tDom.appendChild(con);
        }
        if (tDom) {
            const tDomTransfered = domTransferDefault(tDom);
            // body 下的元素都添加my-print-hide样式，打印时隐藏
            const rootElems = document.querySelectorAll('body>*');
            for (let i = 0; i < rootElems.length; i++) {
                addClass(rootElems[i], 'my-print-hide');
            }
            $tDoms = tDomTransfered;
            // 打印内容添加到body下
            document.body.appendChild(tDomTransfered);
        }
        // 添加打印预览头部
        const previewTitle = createDom(`<div class="my-print-preview-title my-print-hide">
                          <span class="title">打印预览</span>
                          <div class="my-print-preview-close" onclick="handlePrint()">打印</div>
                          <div class="my-print-preview-close" onclick="closePrintPreview()">关闭</div>
                      </div>`);
        prependDom(tDom, previewTitle);

        // 如果尚未注册打印方法，则注册一个
        window.closePrintPreview = () => {
            removePrintPreview();
        };
        window.handlePrint = () => {
            print();
        };
        // 隐藏除打印区域外的内容
        const rootElems = document.querySelectorAll('body>*');
        for (let i = 0; i < rootElems.length; i++) {
            if (rootElems[i] !== tDom) {
                addClass(rootElems[i], 'my-print-hide');
                if (props.preview) addClass(rootElems[i], 'my-print-displaynone');
            }
        }
        addClass(tDom, 'my-print-visible');
        if (!props.preview) addClass(tDom, 'my-print-displaynone');

        // 如果不预览直接打印
        if (!props.preview) print();
    }
}
function print() {
    if (props.printRange) {
        setTimeout(() => {
            closeAfterPrint();
        }, 20);
    } else {
        window.print();
    }
}
</script>

<style lang="scss">
.my-print-preview-title {
    text-align: center;
    .title {
        line-height: 50px;
        font-weight: 600;
        font-size: 18px;
    }
    .my-print-preview-close {
        float: right;
        margin-top: 10px;
        margin-right: 20px;
        color: #888;
        cursor: pointer;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 5px 10px;
    }
}
.my-print-displaynone {
    display: none;
}
@media print {
    @page {
        size: 0;
        margin: 0;
        /**是否显示标题 和链接 ，不显示改为0**/
    }
    .my-print-page-break {
        page-break-after: always;
    }
    .my-print-hide {
        display: none;
    }
    .my-print-visible {
        display: block;
    }
}
</style>

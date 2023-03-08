// 如果没有超过宽度，既 子<父 则移除tooltip
const compareWidth = (el) => {
    if (el.querySelector('.ellipse-text')?.offserWidth < el.offserWidth) {
        // 获取目标节点的父类
        const copyEl = el.parentNode;
        // 获取到目标节点的子节点
        const copySpan = el.children;
        // 移除带有el-tooltip组件的节点
        el.parentNode.removeChild(el);
        // 将纯粹的子节点添加到目标节点的父亲节点
        copyEl.appendChild(copySpan);
    }
};
/**
 * v-showTip超过宽度使用el-tooltip显示
 * @module utils/directives/showTip
 */
export default {
    onMounted(el, binding) {
        compareWidth(el);
    },
    updated(el, binding) {
        compareWidth(el);
    },
};

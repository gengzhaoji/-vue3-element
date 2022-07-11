import { throttle } from '@u/util';
/**
 * el-select 滚动加载数据指令
 * @module utils/directives/loadmore
 */
export default {
    created(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap');
        // 页数
        let pageNum = 1,
            pageSize = 10;
        if (SELECTWRAP_DOM) {
            // 执行逻辑
            const bindingFn = throttle(function () {
                const CONDITION = SELECTWRAP_DOM.scrollHeight - SELECTWRAP_DOM.scrollTop <= SELECTWRAP_DOM.clientHeight;
                if (CONDITION) {
                    pageNum++;
                    binding?.value?.(pageNum, pageSize);
                }
            }, false);
            // 监听滚动事件
            SELECTWRAP_DOM.addEventListener('scroll', bindingFn);
        }
        // 初始化调用一次
        binding?.value?.(pageNum, pageSize);
    },
};

/**
 * 常用辅助函数
 * @module utils/util
 */

import _isEqual from 'lodash/isEqual';
import { clone } from './convert';
/**
 * 判断两个对象是否相等
 * @param {*} object
 * @param {*} other
 * @return {boolean}
 */
export function isEqual(object, other) {
    return _isEqual(object, other);
}

/**
 * 防抖函数
 * @param {function} fn 事件处理函数
 * @param {number} [delay=20] 延迟时间
 * @param {boolean} [isImmediate=false] 是否立刻执行
 * @param {object} [context=this] 上下文对象
 * @returns {Function} 事件处理函数
 */
export function debounce(fn, delay = 20, isImmediate = false, context = this) {
    // 使用闭包，保存执行状态，控制函数调用顺序
    let timer;

    return function () {
        const _args = [].slice.call(arguments);

        clearTimeout(timer);

        const _fn = function () {
            timer = null;
            if (!isImmediate) fn.apply(context, _args);
        };

        // 是否滚动时立刻执行
        const callNow = !timer && isImmediate;

        timer = setTimeout(_fn, delay);

        if (callNow) fn.apply(context, _args);
    };
}

const raFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    };

/**
 * 动画延时函数
 * @function
 * @param {function} callback 动画回调函数
 * @return {number} id
 */
export const requestAnimationFrame = raFrame;

/**
 * 清除动画延时
 * @function
 * @param {number} id
 */
export const cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (id) {
        window.clearTimeout(id);
    };

/**
 * 节流函数
 * @param {function} fn 事件处理函数
 * @param {object} [context=this] 上下文对象
 * @param {boolean} [isImmediate=false] 是否立刻执行
 * @returns {Function} 事件处理函数
 */
export function throttle(fn, context = this, isImmediate = false) {
    let isLocked;
    return function () {
        const _args = arguments;

        if (isLocked) return;

        isLocked = true;
        raFrame(function () {
            isLocked = false;
            fn.apply(context, _args);
        });

        isImmediate && fn.apply(context, _args);
    };
}

/**
 * 保留有效数字并且4舍5入
 * @param {*} v 表示要转换的值 表示要保留的位数
 * @param {*} e 表示要保留的位数
 * @returns
 */
export function round(v, e) {
    var t = 1;
    for (; e > 0; t *= 10, e--);
    for (; e < 0; t /= 10, e++);
    return Math.round(v * t) / t;
}

/**
 * 回显数据字典
 * @param {*} datas 数组原始数据
 * @param {*} value 需要查找的值
 * @param {*} param2 需要对应的 val和key
 * @returns
 */
export function selectDictLabel(datas, value, { dictValue = 'dictValue', dictLabel = 'dictLabel' } = {}) {
    var actions = [];
    Object.keys(datas).some((key) => {
        if (datas[key][dictValue] == value) {
            actions.push(datas[key][dictLabel]);
            return true;
        }
    });
    return actions.join('');
}

/**
 * 回显数据字典（字符串数组）
 * @param {*} datas 数组原始数据
 * @param {*} value 需要查找的值 多个时按照separator拼接
 * @param {*} separator 多个值时拼接的标识（默认为 , ）
 * @param {*} param2 需要对应的 val和key
 * @returns
 */
export function selectDictLabels(datas, value, separator = ',', { dictValue = 'dictValue', dictLabel = 'dictLabel' } = {}) {
    var actions = [];
    var temp = value.split(separator);
    Object.keys(value.split(separator)).some((val) => {
        Object.keys(datas).some((key) => {
            if (datas[key][dictValue] == '' + temp[val]) {
                actions.push(datas[key][dictLabel] + separator);
            }
        });
    });
    return actions.join('').substring(0, actions.join('').length - 1);
}

// 添加日期范围
export function addDateRange(params, dateRange, propName) {
    let search = clone(params);

    const str = typeof dateRange === 'string';

    let startTime, endTime;

    [startTime = '', endTime = ''] = str ? search[dateRange] : dateRange;

    if (typeof propName === 'undefined') {
        search['startTime'] = startTime;
        search['endTime'] = endTime;
    } else {
        search['start' + propName] = startTime;
        search['end' + propName] = endTime;
    }

    if (str) delete search[dateRange];

    return search;
}

/**
 * 判断是否为ie浏览器
 */
export function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf('Edge') > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
    if (isIE) {
        var reIE = new RegExp('MSIE (\\d+\\.\\d+);');
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp['$1']);
        if (fIEVersion == 7) {
            return 7;
        } else if (fIEVersion == 8) {
            return 8;
        } else if (fIEVersion == 9) {
            return 9;
        } else if (fIEVersion == 10) {
            return 10;
        } else {
            return 6; //IE版本<=7
        }
    } else if (isEdge) {
        return 'edge'; //edge
    } else if (isIE11) {
        return 11; //IE11
    } else {
        return false; //不是ie浏览器
    }
}
/**
 * js code128条形码生成
 */
export function code128(data) {
    if (data === undefined) {
        throw new Error('code128 data is required!');
    } else {
        return `SIZE 60 mm, 40 mm\r\n
        CODEPAGE UTF-8\r\n
        CLS\r\n
        TEXT 379,90,"4",180,1,1,"${data}"\r\n
        BARCODE 460,210,"128",102,0,180,3,6,"${data}"\r\n
        PRINT 1,1\r\n
        SOUND 1,100\r\n
        OUT "ABCDE"\r\n`;
    }
}

/**
 *  载体模块 api
 *  @module api/carrier
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 新增载体信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addCarrier = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrier/add'
})

/**
 * 更新载体信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editCarrier = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/carrier/edit'
})

/**
 * 删除载体信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeCarrier = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/carrier/remove'
})

/**
 * 获取载体信息管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageCarrier = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrier/page'
})

/**
 * 获取载体信息管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoCarrier = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrier/info'
})

/**
 * 载体信息管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueCarrier = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrier/unique'
})

/**
 * 载体信息管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const downloadCarrier = (data) => axios({
	method: 'post',
	responseType: 'blob',
	data: data,
	url: API_HOST + 'secrecy/carrier/download'
})

/**
 * 载体信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const detailCarrier = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrier/detail'
})

/**
 * 载体接收
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const receiveCarrier = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrier/receive'
})

/**
 * 载体批量制作
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addCarrierCarrier = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrier/addCarrier'
})

/**
 * 载体借出接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const lendCarrierBorrow = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/lend'
})

/**
 * 载体归还接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const stillCarrierBorrow = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/still'
})

/**
 * 获取载体借还接口分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageCarrierBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/page'
})

/**
 * 获取载体借还接口单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoCarrierBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/info'
})

/**
 * 异常登记接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const abnormalCarrier = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/carrier/abnormal'
})

/**
 * 获取载体移交单分页分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageTransfer = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/transfer/page'
})

/**
 * 获取载体移交单分页单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoTransfer = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/transfer/info'
})

/**
 * 删除载体移交单分页
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeTransfer = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/transfer/remove'
})

/**
 * 载体移交单新增
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addTransfer = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/transfer/addTransfer'
})

/**
 * 获取载体销毁申请分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDestroyApply = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/destroyApply/page'
})

/**
 * 删除载体销毁申请
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeDestroyApply = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/destroyApply/remove'
})

/**
 * 更新载体销毁申请
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editDestroyApply = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/destroyApply/edit'
})

/**
 * 载体移交单登记
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const updateTransfer = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/transfer/updateTransfer'
})

/**
 * 载体销毁申请新增
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const saveApply = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/destroyApply/saveApply'
})

/**
 * 载体销毁详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const detailsDestroy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/destroy/details'
})

/**
 * 获取载体销毁单分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDestroy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/destroy/page'
})

/**
 * 删除载体销毁单
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeDestroy = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/destroy/remove'
})

/**
 * 更新载体销毁单
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editDestroy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/destroy/edit'
})

/**
 * 获取载体销毁单单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoDestroy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/destroy/info'
})

/**
 * 载体状态校验接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getStateCarrier = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/carrier/getState'
})

/**
 * 载体销毁单新增
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addDestroy = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/destroy/addDestroy'
})

/**
 * 载体销毁单登记
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const compDestroy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/destroy/compDestroy'
})

/**
 * 持有载体信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const listCarrierBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/carrierList'
})
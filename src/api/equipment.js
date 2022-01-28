/**
 *  设备模块 api
 *  @module api/equipment
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 新增设备信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addDevice = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/device/add'
})

/**
 * 更新设备信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editDevice = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/device/edit'
})

/**
 * 删除设备信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeDevice = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/device/remove'
})

/**
 * 获取设备信息管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDevice = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/device/page'
})

/**
 * 获取设备信息管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoDevice = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/device/info'
})

/**
 * 设备信息管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueDevice = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/device/unique'
})

/**
 * 设备信息管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const downloadDevice = (data) => axios({
	method: 'post',
	responseType: 'blob',
	data: data,
	url: API_HOST + 'secrecy/device/download'
})

/**
 * 设备借出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const lendDeviceBorrow = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/lend'
})

/**
 * 设备变更
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const deviceChangeDevice = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/device/deviceChange'
})

/**
 * 设备销毁
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const destroyDevice = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/device/destroy'
})

/**
 * 设备启停
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const startStopDevice = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/device/startStop'
})

/**
 * 获取设备归还列表分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDeviceBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/page'
})

/**
 * 设备归还
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const stillDeviceBorrow = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/still'
})

/**
 * 设备归还详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoDeviceBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/info'
})

/**
 * 设备信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const listDeviceBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/deviceList'
})
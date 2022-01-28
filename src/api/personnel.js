/**
 *  人员管理模块 api
 *  @module api/personnel
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 新增人员信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addWorkerSecrecy = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/add'
})

/**
 * 更新人员信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editWorkerSecrecy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/edit'
})

/**
 * 删除人员信息管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeWorkerSecrecy = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/remove'
})

/**
 * 获取人员信息管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/page'
})

/**
 * 获取人员信息管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/info'
})

/**
 * 人员信息管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/unique'
})

/**
 * 人员信息管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const downloadWorkerSecrecy = (data) => axios({
	method: 'post',
	responseType: 'blob',
	data: data,
	url: API_HOST + 'secrecy/workerSecrecy/download'
})

/**
 * 人员信息管理字段去重校验字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueWorker = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/worker/unique'
})

/**
 * 获取涉密人员列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const gradeWorkerWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/gradeWorker'
})

/**
 * 用户关联获取涉密人员列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const relationSelGradeWorkerWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/relationSelGradeWorker'
})

/**
 * 保密人员复审
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const reviewCaseWorkerSecrecy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/reviewCase'
})

/**
 * 保密人员变更
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const changeWorkerSecrecy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/change'
})

/**
 * 保密人员脱密
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const declassificationWorkerSecrecy = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/workerSecrecy/declassification'
})

/**
 * 根据人员id获取借用的设备序列号
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const deviceCountDeviceBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/deviceBorrow/deviceCount'
})

/**
 * 根据人员id获取借用的载体序列号
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const carrierCountCarrierBorrow = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/carrierBorrow/carrierCount'
})

/**
 * 新增保密培训管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addTrain = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/train/add'
})

/**
 * 更新保密培训管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editTrain = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/secrecy/train/edit'
})

/**
 * 删除保密培训管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeTrain = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/secrecy/train/remove'
})

/**
 * 获取保密培训管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/train/page'
})

/**
 * 获取保密培训管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/train/info'
})

/**
 * 保密培训管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/train/unique'
})

/**
 * 根据人员id分页查询培训数据
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const workerPageTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/train/workerPage'
})

/**
 * 根据人员id查询人员的培训统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const statisticsTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/secrecy/train/statistics'
})

/**
 * 人员导入接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const initTrain = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/secrecy/train/init'
})

/**
 * 下载导入模板接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const downloadTempTrain = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/secrecy/train/downloadTemp'
})

/**
 * 培训结果导出接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const downloadTrain = (data) => axios({
	method: 'post',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/secrecy/train/download'
})
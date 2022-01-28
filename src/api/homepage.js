/**
 *  首页 api
 *  @module api/homepage
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 设备统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeDealt = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/statistics/dealt'
})

/**
 * 设备统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeDevice = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/deviceHome'
})

/**
 * 载体统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeCarrier = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/carrierHome'
})

/**
 * 人员统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeWorkerSecrecy = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/workerHome'
})

/**
 * 培训次数统计
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/trainHome'
})

/**
 * 本年个人排名
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const achievementTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/achievement'
})

/**
 * 本年部门排名
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const deptAchievementTrain = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/deptAchievement'
})
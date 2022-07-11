/**
 *  系统公共接口 api
 *  @module api/public
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 登录接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const authLogin = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/auth/login'
})

/**
 * 登出接口
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const authLogout = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/auth/logout'
})

/**
 * 获取获取个人信息单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoUserProfile = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/profile/info'
})

/**
 * 更新个人信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const updateUserProfile = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/user/profile/update'
})

/**
 * 更新密码
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const updatePwdUserProfile = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/profile/updatePwd'
})

/**
 * 路由信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const homeRouters = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/home/routers'
})

/**
 * 获取验证码
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const captchaImage = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/captcha/image'
})

/**
 * 文件数据上传
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const rdfileDataUpload = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/rdfile/data/upload'
})

/**
 * 文件上传
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const rdfileUpload = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/rdfile/upload'
})

/**
 * 批量文件上传
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const rdfileBatchUpload = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/rdfile/data/batch/upload'
})

/**
 * 文件数据修改名称
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const rdfileRename = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/rdfile/data/rename'
})

/**
 * 部门信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getDept = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dept/use/list'
})

/**
 * 字典数据
 * @param {string|number} dictType Url参数dictType
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getDicts = (dictType, data) => axios({
	method: 'get',
	params: {
		dictType
	},
	data: data,
	url: API_HOST + '/system/dict/data/use/list/:dictType'
})

/**
 * 多个字典key查询多个字典数据
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getDictTypes = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/data/use/types'
})

/**
 * 用户信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getUser = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/use/list'
})

/**
 * 角色信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getRole = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/use/list'
})

/**
 * 岗位信息
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getPost = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/post/use/list'
})

/**
 * 修改密码
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const restPassword = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/restPwd'
})

/**
 * 用户更改状态
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const userChangeStatus = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/changeStatus'
})

/**
 * 角色更改状态
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const changeRoleStatus = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/changeStatus'
})

/**
 * 角色更改数据权限
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const changeDataPerm = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/role/changeDataPerm'
})

/**
 * 角色菜单查询
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getRoleMenuList = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/use/roleMenuList'
})

/**
 * 角色部门查询
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const getRoleDeptList = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/use/roleDeptList'
})

/**
 * 头像上传
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uploadAvatar = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/user/profile/avatar'
})

/**
 * 根据部门id查询人员列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const workerList = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/worker/workerList'
})
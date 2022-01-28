/**
 *  系统管理模块 api
 *  @module api/system
 *  @author coder
 */

// API_HOST
import {
	API_HOST
} from '@/config'

// axios
import axios from '@u/axios'

/**
 * 新增菜单管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addMenu = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/menu/add'
})

/**
 * 更新菜单管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editMenu = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/menu/edit'
})

/**
 * 删除菜单管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeMenu = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/menu/remove'
})

/**
 * 获取菜单管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageMenu = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/menu/page'
})

/**
 * 获取菜单管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoMenu = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/menu/info'
})

/**
 * 菜单管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueMenu = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/menu/unique'
})

/**
 * 新增用户管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addUser = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/user/add'
})

/**
 * 更新用户管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editUser = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/user/edit'
})

/**
 * 删除用户管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeUser = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/user/remove'
})

/**
 * 获取用户管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageUser = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/page'
})

/**
 * 获取用户管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoUser = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/info'
})

/**
 * 用户管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueUser = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/user/unique'
})

/**
 * 用户管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportUser = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/user/export'
})

/**
 * 新增部门管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addDept = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/dept/add'
})

/**
 * 更新部门管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editDept = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/dept/edit'
})

/**
 * 删除部门管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeDept = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/dept/remove'
})

/**
 * 获取部门管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDept = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dept/page'
})

/**
 * 获取部门管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoDept = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dept/info'
})

/**
 * 部门管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueDept = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dept/unique'
})

/**
 * 获取操作日志分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageOperlog = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/operlog/page'
})

/**
 * 删除操作日志
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeOperlog = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/operlog/remove'
})

/**
 * 操作日志导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportOperlog = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/operlog/export'
})

/**
 * 获取登录日志分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageLogininfor = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/logininfor/page'
})

/**
 * 删除登录日志
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeLogininfor = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/logininfor/remove'
})

/**
 * 登录日志导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportLogininfor = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/logininfor/export'
})

/**
 * 新增字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addTypedict = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/dict/type/add'
})

/**
 * 更新字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editTypedict = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/dict/type/edit'
})

/**
 * 删除字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeTypedict = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/dict/type/remove'
})

/**
 * 获取字典管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageTypedict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/type/page'
})

/**
 * 获取字典管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoTypedict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/type/info'
})

/**
 * 字典管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueTypedict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/type/unique'
})

/**
 * 字典管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportTypedict = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/dict/type/export'
})

/**
 * 新增字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addDatadict = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/dict/data/add'
})

/**
 * 更新字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editDatadict = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/dict/data/edit'
})

/**
 * 删除字典管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeDatadict = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/dict/data/remove'
})

/**
 * 获取字典管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageDatadict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/data/page'
})

/**
 * 获取字典管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoDatadict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/data/info'
})

/**
 * 字典管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueDatadict = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/dict/data/unique'
})

/**
 * 新增角色管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addRole = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/role/add'
})

/**
 * 更新角色管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editRole = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/role/edit'
})

/**
 * 删除角色管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeRole = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/role/remove'
})

/**
 * 获取角色管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageRole = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/page'
})

/**
 * 获取角色管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoRole = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/info'
})

/**
 * 角色管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueRole = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/role/unique'
})

/**
 * 角色管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportRole = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/role/export'
})

/**
 * 新增岗位管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addPost = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/post/add'
})

/**
 * 更新岗位管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editPost = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/post/edit'
})

/**
 * 删除岗位管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removePost = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/post/remove'
})

/**
 * 获取岗位管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pagePost = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/post/page'
})

/**
 * 获取岗位管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoPost = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/post/info'
})

/**
 * 岗位管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniquePost = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/post/unique'
})

/**
 * 岗位管理导出
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const exportPost = (data) => axios({
	method: 'get',
	responseType: 'blob',
	data: data,
	url: API_HOST + '/system/post/export'
})

/**
 * 新增配置管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const addConfig = (data) => axios({
	method: 'post',
	data: data,
	url: API_HOST + '/system/config/add'
})

/**
 * 更新配置管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const editConfig = (data) => axios({
	method: 'put',
	data: data,
	url: API_HOST + '/system/config/edit'
})

/**
 * 删除配置管理
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeConfig = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/system/config/remove'
})

/**
 * 获取配置管理分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageConfig = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/config/page'
})

/**
 * 获取配置管理单条信息详情
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const infoConfig = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/config/info'
})

/**
 * 配置管理字段去重校验
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const uniqueConfig = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/config/unique'
})

/**
 * 配置管理使用Key查询Value
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const useDataConfig = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/system/config/use/data'
})

/**
 * 消息-更新已读
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const updateReaded = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/message/info/updateReaded'
})

/**
 * 删除消息-删除
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const removeMessage = (data) => axios({
	method: 'delete',
	data: data,
	url: API_HOST + '/message/info/remove'
})

/**
 * 消息-未读
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const unReadCount = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/message/info/unReadCount'
})

/**
 * 获取消息-分页分页列表
 * @param {object} [data] 发送键值对数据
 * @returns {promise}
 */
export const pageMessage = (data) => axios({
	method: 'get',
	data: data,
	url: API_HOST + '/message/info/page'
})
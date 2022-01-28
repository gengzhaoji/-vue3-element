const statiConfig = window.__config__ || {};

// 默认项目名称
export const TITLE = statiConfig['TITLE'] || '保密管理系统';

// 默认登录页名称
export const NAME = statiConfig['NAME'] || '保密管理系统';

// 默认请求前缀
export const API_HOST = statiConfig['API_HOST'] || '';

// 请求响应成功code
export const AJAX_SUCCESS = statiConfig['AJAX_SUCCESS'] || 200;

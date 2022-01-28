/**
 * 角色权限处理
 * @module utils/directives/hasRole
 */

import store from '@/store';

export default {
    mounted(el, binding, vnode) {
        const { value } = binding;
        const super_admin = '超级管理员';
        const roles = store.getters?.roles;

        if (value && value instanceof Array && value.length > 0) {
            const roleFlag = value;

            const hasRole = roles.some((role) => {
                return super_admin === role || roleFlag.includes(role);
            });

            if (!hasRole) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        } else {
            throw new Error(`请设置角色权限标签值"`);
        }
    },
};

import { ElMessageBox } from 'element-plus';
import store from '@/store';
const statiConfig = window.__config__ || {};

const isNewVersion = () => {
    const version = statiConfig.VERSION;
    const token = store.state.user.token;
    let localVersion = localStorage.getItem('version');
    // 存在版本
    if (version) {
        if (!localVersion) {
            localStorage.clear();
            store.commit('SET_TOKEN', token);
            localStorage.setItem('version', version);
            window.location.reload();
        } else {
            if (localVersion != version) {
                ElMessageBox.alert('系统检测到有新版本，即将更新？', '系统提示', {
                    confirmButtonText: '确定',
                    callback: () => {
                        localStorage.clear();
                        store.commit('SET_TOKEN', token);
                        localStorage.setItem('version', version);
                        window.location.reload();
                    },
                });
            }
        }
    }
};

export default {
    isNewVersion,
};

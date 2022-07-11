import { ElMessageBox } from 'element-plus';
import user from '@/store/user';
const statiConfig = window.__config__ || {};

export default () => {
    const version = statiConfig.VERSION;
    const store = user();
    const token = store.token;
    let localVersion = localStorage.getItem('version');
    // 存在版本
    if (version) {
        if (!localVersion) {
            localStorage.clear();
            store.token = token;
            localStorage.setItem('version', version);
            window.location.reload();
        } else {
            if (localVersion != version) {
                ElMessageBox.alert('系统检测到有新版本，即将更新？', '系统提示', {
                    confirmButtonText: '确定',
                    callback: () => {
                        localStorage.clear();
                        store.token = token;
                        localStorage.setItem('version', version);
                        window.location.reload();
                    },
                });
            }
        }
    }
};

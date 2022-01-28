import { getDept } from '@/api/public';
import { pageUser } from '@/api/system';
import { treeDchildren } from '@u/tree';
import { gradeWorkerWorkerSecrecy } from '@/api/personnel';
// 获取配置数据接口
import { useDataConfig } from '@/api/system';
import Socket from '@u/socket';

// 部门树形数据  用户数据  人员数据
const comData = ['deptTree', 'useList', 'workerList', 'socketPrint', 'CameraUrl'],
    state = {},
    mutations = {};
comData.forEach((item) => {
    state[item] = [];
    mutations[`SET${item}`] = (state, data) => {
        state[item] = data;
    };
});

export default {
    state: {
        ...state,
    },
    mutations: {
        ...mutations,
    },

    actions: {
        // 获取部门树
        GETdeptTree({ commit, state }, deptId) {
            return new Promise((resolve, reject) => {
                if (state.deptTree.length > 0) {
                    resolve(state.deptTree);
                } else {
                    getDept({ deptId })
                        .then((res) => {
                            commit('SETdeptTree', treeDchildren(res.data));
                            resolve(state.deptTree);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
        // 获取用户列表
        GETuseList({ commit, state }) {
            return new Promise((resolve, reject) => {
                if (state.useList.length > 0) {
                    resolve(state.useList);
                } else {
                    pageUser()
                        .then((res) => {
                            commit(
                                'SETuseList',
                                res.data.rows.map((item) => ({
                                    dictLabel: item.userName,
                                    dictValue: item.id,
                                }))
                            );
                            resolve(state.useList);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
        // 获取涉密人员列表
        GETworkerList({ commit, state }) {
            return new Promise((resolve, reject) => {
                gradeWorkerWorkerSecrecy()
                    .then((res) => {
                        commit(
                            'SETworkerList',
                            res.data.map((item) => ({
                                dictLabel: item.sysWorkerInfoVo?.name,
                                dictValue: item.sysWorkerInfoVo?.id,
                                deptId: item.sysWorkerInfoVo?.deptId || item.sysWorkerInfoVo?.deptList[0]?.id,
                                idCode: item.sysWorkerInfoVo?.idCode,
                                jobNumber: item.sysWorkerInfoVo?.jobNumber,
                                phone: item.sysWorkerInfoVo?.phone,
                                sex: item.sysWorkerInfoVo?.sex,
                            }))
                        );
                        resolve(state.workerList);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        },
        /**
         * 建立全局Socket长连接
         */
        GETsocketPrint({ commit, state }) {
            return new Promise((resolve, reject) => {
                if (state.socketPrint?.length === 0) {
                    useDataConfig({ configKey: 'sys.device.ws.xprinter' })
                        .then((res) => {
                            commit('SETsocketPrint', new Socket({ server: res?.data?.configValue }));
                            resolve(state.socketPrint);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                } else {
                    resolve(state.socketPrint);
                }
            });
        },
        /**
         * 获取全局高拍仪链接地址
         */
        GETCameraUrl({ commit, state }) {
            return new Promise((resolve, reject) => {
                if (state.CameraUrl?.length === 0) {
                    useDataConfig({ configKey: 'sys.device.ws.eloam' })
                        .then((res) => {
                            commit('SETCameraUrl', res?.data?.configValue);
                            resolve(state.CameraUrl);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                } else {
                    resolve(state.CameraUrl);
                }
            });
        },
    },
};

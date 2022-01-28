import { getDicts } from '@/api/public';
import _camelCase from 'lodash/camelCase';
import dict from '@/config/dict';
const state = {},
    mutations = {},
    actions = {};

dict.forEach((item) => {
    const name = _camelCase(item);
    state[name] = [];
    mutations[`SET${name}`] = (state, data) => {
        state[name] = data;
    };
    actions[`GET${name}`] = ({ dispatch }) => dispatch('getDicts', { data: item, key: name });
});

export default {
    state: {
        ...state,
    },

    mutations: {
        ...mutations,
    },

    actions: {
        // 字典接口
        getDicts({ commit, state }, { data, key }) {
            return new Promise((resolve, reject) => {
                if (state[key].length > 0) {
                    resolve(state[key]);
                } else {
                    getDicts(data)
                        .then((res) => {
                            commit(
                                `SET${key}`,
                                res.data.map((item) => {
                                    item.dictValue = item.dictValue * 1;
                                    return item;
                                })
                            );
                            resolve(state[key]);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
        /******************************************字典数据 *****************************/
        ...actions,
    },
};

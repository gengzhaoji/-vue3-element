import { defineStore } from 'pinia';
/**
 * actions方法名为 state字段前拼接GET
 */
import { getDept } from '@a/public';
import { pageUser } from '@a/system';
import { treeDchildren } from '@u/tree';
import { getPost } from '@/api/public';

export default defineStore('com', {
    state: () => ({
        deptTree: [],
        useList: [],
        post: [],
        issueClassifyList: [],
    }),
    actions: {
        // 获取部门树
        GETdeptTree(deptId) {
            return new Promise((resolve, reject) => {
                if (this.deptTree.length > 0) {
                    resolve(this.deptTree);
                } else {
                    getDept({ deptId })
                        .then((res) => {
                            this.deptTree = treeDchildren(res.data);
                            resolve(this.deptTree);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
        // 获取用户列表
        GETuseList() {
            return new Promise((resolve, reject) => {
                if (this.useList.length > 0) {
                    resolve(this.useList);
                } else {
                    pageUser()
                        .then((res) => {
                            this.useList = res.data.rows.map((item) => ({
                                dictLabel: item.userName,
                                dictValue: item.id,
                            }));
                            resolve(this.useList);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
        // 部门
        GETpost() {
            return new Promise((resolve, reject) => {
                if (this.post.length > 0) {
                    resolve(this.post);
                } else {
                    getPost()
                        .then((res) => {
                            this.post = res.data;
                            resolve(this.post);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                }
            });
        },
    },
});

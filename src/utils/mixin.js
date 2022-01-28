/**
 * 默认页面中的基本增删改查操作（弹窗类页面）
 */
export default {
    data() {
        return {
            tableSelection: [],
        };
    },
    computed: {
        // 弹窗title
        dialogTitle() {
            const data = this.dialog || this.pageConfig.dialog;
            if (data.name === 'insert') return `新增${data.title}`;
            if (data.name === 'update') return `修改${data.title}`;
            if (data.name === 'detail') return `${data.title}详情`;
        },
        // 页面增删改查等接口
        api() {
            return this.pageConfig.api;
        },
        // 表格排序字段
        orderKeys() {
            let data = [];
            this.state.columns.forEach((item) => {
                if (!!item.sortable) {
                    data.push(item.prop);
                }
            });
            return data;
        },
    },
    methods: {
        // 页面查询函数
        getList() {
            this.$refs?.table?.loadData?.();
        },
        // 表格排序
        sortChange({ column, prop, order }) {
            this.orderKeysFn();
            let queryParams = this.queryParams || this.pageConfig.queryParams;
            queryParams[prop] = order === 'ascending'; // true为升序false为降序
            this.$refs?.table?.reload?.();
        },
        // 重置表格排序条件
        orderKeysFn() {
            let queryParams = this.queryParams || this.pageConfig.queryParams;
            let orderKeys = this.orderKeys || this.pageConfig.orderKeys;
            for (const item of orderKeys) {
                queryParams[item] = '';
            }
        },
        // 初始化表格查询逻辑
        loadData(pageNum, pageSize) {
            let queryParams = this.clone(this.queryParams || this.pageConfig.queryParams);
            if (this.queryFormItem || this.pageConfig.queryFormItem) {
                // 时间组件
                const dateList = this.clone(this.queryFormItem || this.pageConfig.queryFormItem).filter((item) => item.itemType === 'date' && item.type.match(/range/gi));
                dateList.forEach((item) => {
                    const { prop, prepend } = item;
                    queryParams = this.addDateRange(queryParams, prop, prepend);
                });
            }
            return this.api.page({ pageNum, pageSize, ...queryParams }).then((res) => {
                this.state.total = res.data?.total;
                this.state.list = res.data?.rows;
            });
        },
        // 新增信息
        insertFn() {
            const data = this.dialog || this.pageConfig.dialog;
            data.name = 'insert';
            data.open = true;
        },
        // 删除信息
        deleteFn(data) {
            if (data) {
                this.$$confirm('此操作将删除该条数据, 是否继续?')
                    .then(() => {
                        this.api.remove({ ids: `${data[this.pageConfig.id]}` }).then(() => {
                            if (1 === this.state.list.length && this.$refs?.table?.lastcurrentPage) {
                                this.$refs?.table?.reload?.();
                            } else {
                                this.getList();
                            }
                            this.msgSuccess('删除成功');
                        });
                    })
                    .catch(() => {
                        this.msgInfo('已取消删除！');
                    });
            } else {
                this.$$confirm('此操作将删除选中数据, 是否继续?')
                    .then(() => {
                        this.api.remove({ ids: this.tableSelection.map((item) => item[this.pageConfig.id]).join(',') }).then(() => {
                            if (this.tableSelection.length === this.state.list.length && this.$refs?.table?.lastcurrentPage) {
                                this.$refs?.table?.reload?.();
                            } else {
                                this.getList();
                            }
                            this.msgSuccess('删除成功');
                        });
                    })
                    .catch(() => {
                        this.msgInfo('已取消删除！');
                    });
            }
        },
        // 修改、详情逻辑
        dialogOpen(row, name) {
            const data = this.dialog || this.pageConfig.dialog;
            data.name = name;
            this.api.info({ id: row[this.pageConfig.id] }).then((res) => {
                data.form = res.data;
                data.open = true;
            });
        },
        // 修改信息
        updateFn(row) {
            this.dialogOpen(row, 'update');
        },
        // 详情信息
        detailFn(row) {
            this.dialogOpen(row, 'detail');
        },
        // 弹窗提交函数
        dialogSubmitFn() {
            const data = this.dialog || this.pageConfig.dialog;
            const Form = this.$refs.dialogForm?.$refs?.comForm || this.$refs.dialogForm;
            Form.validate((valid) => {
                if (valid) {
                    this.api[data.name === 'insert' ? 'add' : 'edit'](data.form).then((res) => {
                        this.msgSuccess(`${data.name === 'insert' ? '新增成功！' : '修改成功！'}`);
                        data.open = false;
                        this.getList();
                    });
                }
            });
        },
        // 弹窗关闭函数
        cancel() {
            const data = this.dialog || this.pageConfig.dialog;
            data.open = false;
            this.resetForm('dialogForm');
        },
    },
};

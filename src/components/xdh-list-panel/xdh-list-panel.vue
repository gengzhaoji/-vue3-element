<template>
    <div class="f1 h0 flex-col system-page-background" v-loading="loading" element-loading-text="拼命加载中" element-loading-spinner="el-icon-loading">
        <slot></slot>
        <div class="p-10" v-if="pager">
            <xdh-pager :layout="layout" :total="total" :size="pageSize" :page="currentPage" @current-change="handlePageChange" @size-change="handleSizeChange">
                <slot v-if="$slots['pager-custom']" name="pager-custom"></slot>
            </xdh-pager>
        </div>
    </div>
</template>

<script>
import XdhPager from '../xdh-pager';

/**
 * 插槽
 * @member slot
 * @property {String} [pager-custom] 分页组件自定义内容
 */

/**
 * 作用域插槽
 * @member scopedSlots
 * @property {String} default 定义列表内容，参数 list：列表数据， height：容器高度, page: 页码， pageSize：页大小
 */

export default {
    name: 'XdhListPanel',
    componentName: 'XdhListPanel',
    components: {
        XdhPager,
    },
    /**
     * 参数属性
     * @property {Boolean} [pager = true] 是否使用分页控件
     * @property {Function(page,size)} [loadFn] 数据加载函数，参数为 加载页和 单页数量。需要返回 promise
     * @property {Boolean} [isAuto = true] 是否在组件初始化时自动加载数据
     */
    props: {
        // 加载数据函数，传入参数：page，size，必须要返回Promise
        loadFn: {
            type: Function,
            default: null,
        },
        // 是否在初始化时自动加载数据
        isAuto: {
            type: Boolean,
            default: true,
        },
        // 是否显示分页
        pager: {
            type: Boolean,
            default: true,
        },
        size: {
            type: Number,
            default: 20,
        },
        sizes: {
            type: Array,
            default() {
                return [5, 10, 20, 30, 50, 100];
            },
        },
        total: {
            type: Number,
            default: 0,
        },
        layout: {
            type: String,
            default: 'total,sizes, ->, prev, pager, next, jumper,slot',
        },
    },
    data() {
        return {
            currentPage: 1,
            pageSize: this.size,
            loading: false,
        };
    },
    computed: {
        lastcurrentPage() {
            return this.currentPage === Math.ceil(this.total / this.pageSize);
        },
    },
    methods: {
        /**
         * 加载数据， 内部调用从组件props传入‘load’函数
         * @Function loadData
         */
        loadData() {
            if (!this.loadFn || this.loading) return;
            this.loading = true;
            this.loadFn(this.currentPage, this.pageSize)
                .then(() => {
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        /**
         * 分页器页码变动是触发的函数
         * @Function handlePageChange
         * @param page
         */
        handlePageChange(page) {
            this.currentPage = page;
            this.loadData();
        },
        /**
         * 分页器每页数量变动时触发的函数
         * @Function handleSizeChange
         * @param size
         */
        handleSizeChange(size) {
            this.currentPage = 1;
            this.pageSize = size;
            this.loadData();
        },
        /**
         * 组件重置函数
         * @Function reload
         */
        reload() {
            this.currentPage = 1;
            this.loadData();
        },
    },
    created() {
        this.isAuto && this.loadData();
    },
};
</script>

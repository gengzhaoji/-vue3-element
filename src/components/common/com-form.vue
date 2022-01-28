<template>
    <el-form ref="comForm" :rules="defaultRules" :validate-on-rule-change="false" v-bind="$attrs" :class="[query ? 'query' : 'validate--bottom']">
        <!-- 栅格布局 -->
        <el-row v-bind="$attrs.row || {}" v-if="row">
            <template v-for="(item, index) in formItem" :key="index">
                <!-- 栅格布局 -->
                <el-col v-bind="item.col || {}" v-if="item.col && item.show !== false" v-show="!query || (query && (index < currentColumn || !currentCollapsed))">
                    <el-form-item :prop="item.prop" :label="detail ? `${item.label}：` : item.label">
                        <slot :name="item.prop" :prop="item.prop" :model="$attrs.model" :item="item">
                            <template v-if="detail">
                                <xdh-file-upload v-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                                <template v-else> {{ $attrs.model[item.prop] }} </template>
                            </template>
                            <template v-else>
                                <com-cascader v-if="item.itemType === 'cascader'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                                <com-select v-else-if="item.itemType === 'select'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                                <com-input-number
                                    v-else-if="item.itemType === 'number'"
                                    v-model="$attrs.model[item.prop]"
                                    :placeholder="`请输入${item.label}`"
                                    v-bind="itemFn(item)"
                                />
                                <com-date-picker
                                    v-else-if="item.itemType === 'date'"
                                    v-model="$attrs.model[item.prop]"
                                    :placeholder="`请选择${item.label}`"
                                    v-bind="itemFn(item)"
                                />
                                <xdh-file-upload v-else-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                                <com-input v-else v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                            </template>
                        </slot>
                    </el-form-item>
                </el-col>
            </template>
        </el-row>
        <!-- 非栅格布局时 查询form表单可以自适应布局 -->
        <template v-else>
            <template v-for="(item, index) in formItem" :key="index">
                <el-form-item
                    :label="detail ? `${item.label}：` : item.label"
                    :prop="item.prop"
                    :style="query && listenEl ? { width: itemWidth } : {}"
                    v-if="item.show !== false"
                    v-show="!query || (query && (index < currentColumn || !currentCollapsed))"
                >
                    <template #label v-if="query">
                        <slot :name="item.prop + '_label'">
                            <span v-for="i in item.label.length" :key="item.label.charAt(i)">
                                {{ item.label.charAt(i - 1) }}
                            </span>
                        </slot>
                    </template>
                    <slot :name="item.prop" :prop="item.prop" :model="$attrs.model" :item="item">
                        <template v-if="detail">
                            <xdh-file-upload v-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                            <template v-else> {{ $attrs.model[item.prop] }} </template>
                        </template>
                        <template v-else>
                            <com-cascader v-if="item.itemType === 'cascader'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                            <com-select v-else-if="item.itemType === 'select'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                            <com-input-number v-else-if="item.itemType === 'number'" v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                            <com-date-picker v-else-if="item.itemType === 'date'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                            <xdh-file-upload v-else-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                            <com-input v-else v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                        </template>
                    </slot>
                </el-form-item>
                <!-- 查询form表单默认按钮 -->
                <template v-if="query && ((index === currentColumn - 1 && formItem.length > currentColumn) || (formItem.length <= currentColumn && index === formItem.length - 1))">
                    <slot>
                        <el-form-item class="query-form-item" ref="queryItem">
                            <div ref="query">
                                <com-button class="el-button--primary_1" icon="el-icon-search" @click.prevent="$emit('searchFn')">搜 索</com-button>
                                <com-button
                                    icon="el-icon-refresh"
                                    @click.prevent="
                                        resetForm('comForm');
                                        $emit('resetFn');
                                    "
                                >
                                    重 置
                                </com-button>
                                <com-button class="m-l-20" type="text" @click.stop.prevent="toggleCollapsed" v-if="collapsible" v-show="formItem.length > currentColumn">
                                    <span>
                                        {{ currentCollapsed ? '展开' : '收起' }}
                                        <i :class="currentCollapsed ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
                                    </span>
                                </com-button>
                            </div>
                        </el-form-item>
                    </slot>
                </template>
            </template>
        </template>
    </el-form>
</template>

<script>
import { addResizeListener, removeResizeListener } from 'element-plus/lib/utils/resize-event';
import { throttle } from '@u/util';

const calcBreakPoint = function (width) {
    if (width <= 947) {
        return 1;
    } else if (width >= 948 && width <= 1171) {
        return 2;
    } else if (width >= 1172 && width <= 1379) {
        return 3;
    } else if (width >= 1380 && width <= 1779) {
        return 4;
    } else if (width >= 1780) {
        return 5;
    }
};

export default {
    name: 'com-form',
    data() {
        return {
            elDom: null,
            queryWidth: 220,
            currentColumn: this.columns,
            // 当前的折叠状态
            currentCollapsed: this.collapsed,
        };
    },
    /***
     * props
     * @property {Array} formItem 生成form表单的配置数组
     * @property {Boolean} query 是否默认添加查询 重置按钮
     * @property {Object} rules form表单的校验对象
     * @property {Number} columns 默认一行显示的form-item数量 默认为3个
     * @property {Boolean} listenEl 是否监听该form的宽度以自适应  一行显示的form-item数量 (必须在是query为true的时候才会生效)
     * @property {Boolean} collapsible 是否支持表单项展开、收起 (必须在是query为true的时候才会生效)
     * @property {boolean} [collapsed=true] 初始收起表单项目，collapsible=true是才有效
     * @property {boolean} [detail=false] 表单是否为详情展示表单默认为FALSE
     */
    props: {
        formItem: {
            type: Array,
            required: true,
        },
        query: {
            type: Boolean,
            default: false,
        },
        rules: {
            type: Object,
            default: () => ({}),
        },
        columns: {
            type: Number,
            default: 3,
        },
        listenEl: {
            type: Boolean,
            default: true,
        },
        collapsible: {
            type: Boolean,
            default: true,
        },
        collapsed: {
            type: Boolean,
            default: true,
        },
        detail: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        defaultRules() {
            if (!this.query) {
                let rules = Object.create(null);
                this.formItem.forEach((item) => {
                    if (!!item.required) {
                        rules[item.prop] = {
                            required: true,
                            message: `${item.label}不能为空`,
                            trigger: ['cascader', 'select', 'date', 'file'].includes(item.itemType) ? 'change' : 'blur',
                        };
                    }
                });
                return Object.assign(rules, this.rules);
            } else {
                return {};
            }
        },
        itemWidth() {
            return `calc(${100 / this.currentColumn}% - ${10 + (this.queryWidth + 10) / this.currentColumn}px) !important`;
        },
        formItemLen() {
            return formItem.length;
        },
        // 判断是否为栅格布局
        row() {
            if (!!this.$attrs.row || this.formItem.some((item) => !!item.col)) {
                return true;
            } else {
                return false;
            }
        },
    },
    methods: {
        /**
         * v-model绑定多层数据的问题
         */
        // valueFn(key, model = this.$attrs.model) {
        //     let keyArray = key.split('.'),
        //         data;
        //     keyArray.forEach((item, index) => {
        //         if (index === 0) {
        //             data = model[item];
        //         } else {
        //             data = data[item];
        //         }
        //     });
        //     return data;
        // },
        // updateFn(val, key, model = this.$attrs.model) {
        //     let keyArray = key.split('.'),
        //         { length } = keyArray;
        //     switch (length) {
        //         case 1:
        //             model[keyArray[0]] = val;
        //             break;
        //         case 2:
        //             model[keyArray[0]][keyArray[1]] = val;
        //             break;
        //         case 3:
        //             model[keyArray[0]][keyArray[1]][keyArray[2]] = val;
        //             break;
        //     }
        // },
        itemFn(item) {
            const date = this.cloneDeep(item);
            delete date.label;
            delete date.prop;
            delete date.itemType;
            delete date.show;
            delete date.col;
            delete date.required;
            return date;
        },
        setupElResponsive() {
            this.currentColumn = calcBreakPoint(this.elDom.offsetWidth);
            this.queryWidth = this.$refs?.query[0]?.offsetWidth || this.$refs?.queryItem?.$el?.offsetWidth;
        },
        toggleCollapsed() {
            this.currentCollapsed = !this.currentCollapsed;
        },
    },
    mounted() {
        if (this.listenEl && this.query) {
            this.elDom = this.$el;
            this.setupElResponsiveProxy = throttle(this.setupElResponsive, this, true, 300);
            addResizeListener(this.elDom, this.setupElResponsiveProxy);
        }
    },
    beforeUnmount() {
        if (this.listenEl && this.query) removeResizeListener(this.elDom, this.setupElResponsiveProxy);
    },
};
</script>

<style lang="scss" scoped>
.query {
    :deep(.el-input__inner) {
        width: 100%;
        max-width: 500px;
    }
    .query-form-item {
        margin-right: 0 !important;
    }
    :deep(.el-form-item__label) {
        display: flex;
        justify-content: space-between;
    }
}
:deep(.el-input),
:deep(.el-textarea) {
    width: 100%;
}
:deep(.el-form-item__content) {
    max-width: 500px;
}
</style>

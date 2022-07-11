<template>
    <el-form
        :id="MyFormId"
        ref="refMyForm"
        @keyup.enter="query ? $emit('searchFn') : ''"
        :rules="defaultRules"
        :validate-on-rule-change="false"
        :disabled="detail"
        v-bind="$attrs"
        :class="[query ? 'query' : 'validate--bottom']"
    >
        <!-- 栅格布局 -->
        <el-row v-bind="$attrs.row || {}" v-if="row">
            <template v-for="(item, index) in formItem" :key="index">
                <!-- 栅格布局 -->
                <el-col
                    v-bind="item.col || (colFlag ? { sm: 12, md: 8, lg: 6 } : {})"
                    v-if="item.show !== false"
                    v-show="!query || (query && (index < currentColumn || !currentCollapsed))"
                >
                    <el-form-item :prop="item.prop" :label="detail ? `${item.label}：` : item.label">
                        <slot :name="item.prop" :model="$attrs.model" :prop="item.prop" :item="item">
                            <template v-if="item.disabled || detail">
                                <my-file-upload v-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                                <my-img-upload v-else-if="item.itemType === 'img'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                                <template v-else-if="item.itemType === 'select'">
                                    {{ DictLabelFn(item) }}
                                    {{
                                        selectDictLabel(
                                            item.list || $store?.dict[item.type?.slice(3) || _camelCase(item.code)] || $store?.com[item.type?.slice(3) || _camelCase(item.code)],
                                            $attrs.model[item.prop]
                                        )
                                    }}
                                </template>
                                <template v-else>{{ $attrs.model[item.prop] }}</template>
                            </template>
                            <template v-else>
                                <my-tree-select v-if="item.itemType === 'tree'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                                <my-cascader
                                    v-if="item.itemType === 'cascader'"
                                    v-model="$attrs.model[item.prop]"
                                    :placeholder="`请选择${item.label}`"
                                    @getLabel="item?.getLabel"
                                    v-bind="itemFn(item)"
                                />
                                <my-select
                                    v-else-if="item.itemType === 'select'"
                                    v-model="$attrs.model[item.prop]"
                                    :placeholder="`请选择${item.label}`"
                                    @getLabel="item?.getLabel"
                                    v-bind="itemFn(item)"
                                />
                                <my-input-number
                                    v-else-if="item.itemType === 'number'"
                                    v-model="$attrs.model[item.prop]"
                                    :placeholder="`请输入${item.label}`"
                                    v-bind="itemFn(item)"
                                />
                                <my-date-picker v-else-if="item.itemType === 'date'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                                <my-file-upload v-else-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                                <my-img-upload v-else-if="item.itemType === 'img'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                                <my-input v-else v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                            </template>
                        </slot>
                        <template v-if="item.description" #label>
                            <el-tooltip :content="item.description" placement="top">
                                <span class="c-p">{{ item.label }}</span>
                            </el-tooltip>
                        </template>
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
                            <span v-for="i in item.label.length" :key="item.label.charAt(i)">{{ item.label.charAt(i - 1) }}</span>
                        </slot>
                    </template>
                    <slot :name="item.prop" :prop="item.prop" :model="$attrs.model" :item="item">
                        <template v-if="item.disabled || detail">
                            <my-file-upload v-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                            <my-img-upload v-else-if="item.itemType === 'img'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" disabled />
                            <template v-else-if="item.itemType === 'select'">
                                {{ DictLabelFn(item) }}
                                {{
                                    selectDictLabel(
                                        item.list || $store?.dict[item.type?.slice(3) || _camelCase(item.code)] || $store?.com[item.type?.slice(3) || _camelCase(item.code)],
                                        $attrs.model[item.prop]
                                    )
                                }}
                            </template>
                            <template v-else>{{ $attrs.model[item.prop] }}</template>
                        </template>
                        <template v-else>
                            <my-tree-select v-if="item.itemType === 'tree'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                            <my-cascader
                                v-if="item.itemType === 'cascader'"
                                v-model="$attrs.model[item.prop]"
                                :placeholder="`请选择${item.label}`"
                                @getLabel="item?.getLabel"
                                v-bind="itemFn(item)"
                            />
                            <my-select
                                v-else-if="item.itemType === 'select'"
                                v-model="$attrs.model[item.prop]"
                                :placeholder="`请选择${item.label}`"
                                @getLabel="item?.getLabel"
                                v-bind="itemFn(item)"
                            />
                            <my-input-number v-else-if="item.itemType === 'number'" v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                            <my-date-picker v-else-if="item.itemType === 'date'" v-model="$attrs.model[item.prop]" :placeholder="`请选择${item.label}`" v-bind="itemFn(item)" />
                            <my-file-upload v-else-if="item.itemType === 'file'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                            <my-img-upload v-else-if="item.itemType === 'img'" v-model="$attrs.model[item.prop]" v-bind="itemFn(item)" />
                            <my-input v-else v-model="$attrs.model[item.prop]" :placeholder="`请输入${item.label}`" v-bind="itemFn(item)" />
                        </template>
                    </slot>
                </el-form-item>
                <!-- 查询form表单默认按钮 -->
                <template v-if="query && ((index === currentColumn - 1 && formItem.length > currentColumn) || (formItem.length <= currentColumn && index === formItem.length - 1))">
                    <slot>
                        <el-form-item class="query-form-item">
                            <div :id="MyFormQueryId">
                                <my-button class="el-button--primary" icon="Search" @click.prevent="$emit('searchFn')">搜 索</my-button>
                                <my-button
                                    icon="Refresh"
                                    @click.prevent="
                                        resetForm(refMyForm);
                                        $emit('resetFn');
                                    "
                                    >重 置</my-button
                                >
                                <template v-if="collapsible && formItem.length > currentColumn">
                                    <my-button class="m-l-20" link type="primary" @click.stop.prevent="currentCollapsed = !currentCollapsed">
                                        {{ currentCollapsed ? '展开' : '收起' }}
                                        <el-icon>
                                            <arrow-down v-show="currentCollapsed" />
                                            <arrow-up v-show="!currentCollapsed" />
                                        </el-icon>
                                    </my-button>
                                </template>
                            </div>
                        </el-form-item>
                    </slot>
                </template>
            </template>
        </template>
    </el-form>
</template>

<script setup name="myForm">
import { addResizeListener, removeResizeListener } from '@u/dom';
import _camelCase from 'lodash/camelCase';
import { throttle, guid } from '@u/util';
const $vm = inject('$vm'),
    refMyForm = $ref(null),
    MyFormId = `MyFormId${guid()}`,
    MyFormQueryId = `MyFormQueryId${guid()}`;
const calcBreakPoint = function (width) {
    if (width <= 800) {
        return 1;
    } else if (width >= 800 && width <= 1171) {
        return 2;
    } else if (width >= 1172 && width <= 1379) {
        return 3;
    } else if (width >= 1380 && width <= 1779) {
        return 4;
    } else if (width >= 1780) {
        return 5;
    }
};

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
 * @property {boolean} [colFlag=false] 是否开启表单响应式
 */
const props = defineProps({
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
    colFlag: {
        type: Boolean,
        default: false,
    },
});

const queryWidth = $ref(220);
let currentColumn = $ref(props.columns);
// 当前的折叠状态
const currentCollapsed = $ref(props.collapsed);
const defaultRules = computed(() => {
    if (!props.query && !props.detail) {
        let rules = Object.create(null);
        props.formItem.forEach((item) => {
            if (!!item.required) {
                rules[item.prop] = {
                    required: true,
                    message: `${item.label}不能为空`,
                    trigger: item.trigger ? item.trigger : ['cascader', 'select', 'date', 'file', 'img'].includes(item.itemType) ? 'change' : 'blur',
                };
            }
        });
        return Object.assign(rules, props.rules);
    } else {
        return {};
    }
});
let itemWidth = computed(() => `calc(${100 / currentColumn}% - ${10 + (queryWidth + 1) / currentColumn}px) !important`);
let formItemLen = computed(() => props.formItem.length);

// 是否使用el-row布局进行响应式页面
const $attrs = useAttrs();
const row = computed(() => {
    if (!!$attrs.row || props.formItem.some((item) => !!item.col) || props.colFlag) return true;
    return false;
});

// form-item的参数处理逻辑
function itemFn(item) {
    const date = $vm.cloneDeep(item);
    delete date.label;
    delete date.prop;
    delete date.itemType;
    delete date.show;
    delete date.col;
    delete date.required;
    return date;
}

// 下拉选择框详情显示Label函数
function DictLabelFn(item) {
    const dictType = item.type || (item.code && `GET${_camelCase(item.code)}`);
    if (dictType) ($vm.$store?.dict[dictType] || $vm.$store?.com[dictType])();
}

let setupElResponsiveProxy, $el;
function setupElResponsive() {
    currentColumn = calcBreakPoint($el.offsetWidth);
    queryWidth = document.getElementById(MyFormQueryId)?.offsetWidth || queryWidth;
}
onMounted(() => {
    $el = document.getElementById(MyFormId);
    if (props.listenEl && props.query) {
        setupElResponsiveProxy = throttle(setupElResponsive, true);
        addResizeListener($el, setupElResponsiveProxy);
    }
});
onBeforeUnmount(() => {
    if (props.listenEl && props.query) removeResizeListener($el, setupElResponsiveProxy);
});
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
:deep(.el-input__wrapper),
:deep(.el-textarea) {
    width: 100% !important;
    box-sizing: border-box;
}
</style>

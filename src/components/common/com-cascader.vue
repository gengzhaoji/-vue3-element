<template>
  <el-cascader
    ref='cascader'
    v-model="fieldValue"
    v-bind="$attrs"
    :options="options"
    :props="props"
    :show-all-levels="showAllLevels"
    :filterable='filterable'
    :clearable='clearable'
    :size='$attrs.size || $store.getters.size'
  ></el-cascader>
</template>
 
<script>
import { mapGetters } from "vuex";

export default {
  name: "com-cascader",
  /***
   * 参数属性
   * @property {Object[]} value 默认值
   */
  model: {
    prop: "value", // 自定义prop属性
    event: "fieldValue" // 自定义它的触发方法名
  },
  props: {
    type: "",
    value: null,
    props: {
      default: function() {
        return {
          expandTrigger: "hover",
          value: "id",
          emitPath: false,
          checkStrictly: true
        };
      }
    },
    showAllLevels: {
      default: false
    },
    filterable: {
      default: true
    },
    list: {
      type: Array,
      default: () => []
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      options: [],
      catchDispatch: false
    };
  },
  computed: {
    /**
     * 多个同一请求同一时间在执行时被取消的逻辑
     * this.$store.getters[this.type.replace("Get", "")]获取最前面执行的那一个请求的结果 因为可能为数组所以使用watch监听赋值
     */
    catchOptions() {
      if (this.catchDispatch) {
        return this.$store.getters[this.type.replace("Get", "")];
      } else {
        return [];
      }
    },
    fieldValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$refs.cascader.dropDownVisible = false;
        this.$emit("fieldValue", val);
      }
    }
  },
  watch: {
    list: {
      handler(val) {
        this.options = val;
      },
      deep: true,
      immediate: true
    },
    /**
     * 监听computed所返回的数组数据--并赋值
     */
    catchOptions: {
      handler(val) {
        if (this.catchDispatch) {
          this.options = val;
        }
      },
      deep: true
    }
  },
  created() {
    /**
     * GetnameList 用户树
     * GetdeptList 部门数
     * GeteqptNameTree 设备树
     */
    if (this.type) {
      this.$store
        .dispatch(this.type)
        .then(data => {
          this.options = data;
        })
        .catch(() => {
          this.catchDispatch = true;
        });
    }
  }
};
</script>
<template>
  <el-select
    v-model="fieldValue"
    v-bind="$attrs"
    :size='$attrs.size || $store.getters.size'
    :clearable='clearable'
    :filterable='filterable'
  >
    <slot>
      <el-option
        v-for="item in options"
        :key='item.value'
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled"
      ></el-option>
    </slot>
    <slot
      name='prefix'
      slot="prefix"
    ></slot>
    <slot
      name='empty'
      slot="empty"
    ></slot>
  </el-select>
</template>
 
<script>
export default {
  name: "com-select",
  model: {
    prop: "value", // 自定义prop属性
    event: "fieldValue" // 自定义它的触发方法名
  },
  /***
   * 参数属性
   * @property {Object[]} value 默认值
   * @property {list[]} list 下拉列表数据
   * @property {Boolean} needAll 是否需要全部选项，默认为false
   * @property {Object} fillType 数据格式默认为{'label':'label','value':'value'}
   * @property {String} this.type store.dispatch的方法名
   *
   */
  props: {
    value: {
      type: [String, Number, Boolean, Array]
    },
    list: {
      type: Array,
      default: () => []
    },
    needAll: {
      type: Boolean,
      default: true
    },
    fileType: {
      type: Object,
      default: function() {
        return { label: "dictLabel", value: "dictValue" };
      }
    },
    filterable: {
      default: true
    },
    type: {
      type: String,
      default: ""
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      options: []
    };
  },
  computed: {
    fieldValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("fieldValue", val);
      }
    }
  },
  watch: {
    list: {
      handler(val) {
        this.initialization(val);
      },
      deep: true,
      immediate: true
    },
    type(val) {
      if (val !== "") {
        this.$store.dispatch(val).then(data => {
          this.options = this.fileTypeFn(data);
          if (this.needAll) {
            this.options = this.needAllFn(this.options);
          }
        });
      } else {
        this.initialization();
      }
    }
  },
  mounted() {
    if (this.type) {
      this.$store.dispatch(this.type).then(data => {
        this.options = this.fileTypeFn(data);
        if (this.needAll) {
          this.options = this.needAllFn(this.options);
        }
      });
    } else {
      this.initialization();
    }
  },
  methods: {
    initialization(list = this.list) {
      this.options = this.fileTypeFn(list);
      if (this.needAll) {
        this.options = this.needAllFn(this.options);
      }
    },
    fileTypeFn(data, fileType = this.fileType) {
      return data.map((val, i) => ({
        label: val[fileType.label],
        value: val[fileType.value],
        disabled: val[fileType.disabled] || false
      }));
    },
    needAllFn(data) {
      const num = JSON.stringify(data).includes(
        JSON.stringify({ label: "全部", value: "" })
      );
      if (!num) {
        data.unshift({ label: "全部", value: "" });
      }
      return data;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-select {
  width: 100%;
}
</style>

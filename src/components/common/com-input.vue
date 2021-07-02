<template>
  <el-input
    ref="input"
    :value="fieldValue"
    @input="e =>(fieldValue = $attrs.type === 'textarea' ? e : e.replace(/\//gi,'').trim())"
    :maxlength="$attrs.maxlength || ($attrs.type === 'textarea' ? 255 : 100)"
    :clearable='clearable'
    v-bind="$attrs"
    :size='$attrs.size || $store.getters.size'
  >
    <slot
      name='prefix'
      slot="prefix"
    ></slot>
    <slot
      name='suffix'
      slot="suffix"
    ></slot>
    <slot
      name='prepend'
      slot="prepend"
    ></slot>
    <slot
      name='append'
      slot="append"
    ></slot>
  </el-input>
</template>
 
<script>
export default {
  name: "com-input",
  /***
   * 参数属性
   * @property {Object[]} value 默认值
   */
  model: {
    prop: "value", // 自定义prop属性
    event: "fieldValue" // 自定义它的触发方法名
  },
  props: {
    value: {
      type: String
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    fieldValue: {
      get() {
        return this.value;
      },
      set(val) {
        // 文本编辑框可以输入空格和回车以及/
        this.$emit("fieldValue", val);
      }
    }
  }
};
</script>

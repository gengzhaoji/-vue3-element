<template>
  <el-date-picker
    ref='elDatePicker'
    class='com'
    v-model="fieldValue"
    v-bind="$attrs"
    :picker-options="s_pickerOptions"
    :editable='$attrs.editable || false'
    :size='$attrs.size || $store.getters.size'
    :clearable='clearable'
    :value-format='valueFormat'
  >
  </el-date-picker>
</template>
 
<script>
import date from "@utils/date";
import { typeOf } from "@utils/convert";
export default {
  name: "com-date-picker",
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
      type: [String, Array, Date]
    },
    pickerOptions: {
      type: Object,
      default: () => {}
    },
    now: {
      type: Boolean,
      defaut: false
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    valueFormat: function() {
      if (this.$attrs["value-format"]) {
        return this.$attrs["value-format"];
      } else {
        if (this.$attrs.type.match(/time/gi)) {
          return "yyyy-MM-dd HH:mm:ss";
        } else {
          return "yyyy-MM-dd";
        }
      }
    },
    fieldValue: {
      get() {
        if (this.type === "") {
          this.type = typeOf(this.value);
        }
        return this.value;
      },
      set(val) {
        if (val == null) {
          this.$emit("fieldValue", this.type === "array" ? [] : "");
        } else {
          this.$emit("fieldValue", val);
        }
      }
    }
  },
  data() {
    return {
      type: "",
      s_pickerOptions: ["datetimerange", "daterange"].includes(this.$attrs.type)
        ? {
            shortcuts: [
              {
                text: "最近一周",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  picker.$emit("pick", [start, end]);
                }
              },
              {
                text: "最近一个月",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                  picker.$emit("pick", [start, end]);
                }
              },
              {
                text: "最近三个月",
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                  picker.$emit("pick", [start, end]);
                }
              }
            ],
            ...this.pickerOptions
          }
        : {
            shortcuts: [
              {
                text: "今天",
                onClick(picker) {
                  picker.$emit("pick", new Date());
                }
              },
              {
                text: "昨天",
                onClick(picker) {
                  const date = new Date();
                  date.setTime(date.getTime() - 3600 * 1000 * 24);
                  picker.$emit("pick", date);
                }
              },
              {
                text: "一周前",
                onClick(picker) {
                  const date = new Date();
                  date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                  picker.$emit("pick", date);
                }
              }
            ],
            ...this.pickerOptions
          }
    };
  },
  created() {
    if (this.now) {
      this.fieldValue = date(new Date(), this.valueFormat);
    }
  }
};
</script>

<style scoped lang = "scss">
.el-date-editor.el-input {
  width: 100%;
}
</style>

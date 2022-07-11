<template>
    <div class="p-10 system-page-background b-r-4">
        <textarea ref="mycode" v-model="fieldValue" />
        <div class="tr p-10" :style="{ backgroundColor: theme === 'ambiance' ? '#3D3D3D' : '#f7f7f7' }">
            <my-button type="primary" icon="VideoPlay" class="fl" @click="queryFn()">运行查询</my-button>
            <my-button @click="format()">格式化</my-button>
            <my-button @click="emptyFn()">清空</my-button>
            <my-button>
                <el-dropdown @command="handleCommand">
                    <span class="el-dropdown-link">{{ themeName }}</span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="(theme = ''), (themeName = '亮色主题')">亮色主题</el-dropdown-item>
                            <el-dropdown-item divided @click="(theme = 'ambiance'), (themeName = '暗色主题')">暗色主题</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </my-button>
        </div>
    </div>
</template>

<script setup name="myCodeEditor">
// 引入全局实例
import CodeMirror from 'codemirror/lib/codemirror';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/sql/sql';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/sql-hint';

// 样式
import 'codemirror/theme/ambiance.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
// SQL格式化
import sqlFormatter from 'sql-formatter';

// 尝试获取全局实例
let mycode = $ref(null),
    editor = null, // 编辑器实例
    theme = $ref('ambiance'),
    themeName = $ref('暗色主题');

watch(
    () => theme,
    (val) => {
        editor.setOption('theme', val);
    }
);
const emits = defineEmits(['update:modelValue']),
    props = defineProps({
        modelValue: {
            type: String,
            default: '',
        },
        readOnly: {
            type: [Boolean, String],
        },
    });
let fieldValue = computed({
    get() {
        return props.modelValue;
    },
    set(val) {
        emits('update:modelValue', editor.getValue());
    },
});
onMounted(() => {
    editor = CodeMirror.fromTextArea(mycode, {
        value: props.modelValue,
        mode: 'text/x-mysql', //选择对应代码编辑器的语言，我这边选的是数据库，根据个人情况自行设置即可
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        cursorHeight: 1,
        lineWrapping: true,
        readOnly: props.readOnly,
        theme,
        autofocus: true,
        extraKeys: { Ctrl: 'autocomplete' }, //自定义快捷键
        hintOptions: {
            // 当匹配只有一项的时候是否自动补全
            completeSingle: false,
            //自定义提示内容添加
            tables: {
                /**
                 * key：表名
                 * val：字段
                 */
                users: ['name', 'score', 'birthDate'],
                countries: ['name', 'population', 'size'],
                score: ['zooao'],
            },
        },
    });
    //代码自动提示功能，记住使用cursorActivity事件不要使用change事件，这是一个坑，那样页面直接会卡死
    editor.on('inputRead', () => {
        editor.showHint();
    });
});

/**
 * 代码格式化
 */
function format() {
    /*将sql内容进行格式后放入编辑器中*/
    editor.setValue(sqlFormatter.format(editor.getValue()));
    emits('update:modelValue', editor.getValue());
}
/**
 * 运行查询
 */
function queryFn() {
    console.log(fieldValue);
}
/**
 * 清空
 */
function emptyFn() {
    editor.setValue('');
}
</script>

<style lang="scss">
// 此处不可使用"scoped"
.in-coder-panel {
    flex-grow: 1;
    display: flex;
    position: relative;
    .CodeMirror {
        flex-grow: 1;
        text-align: left !important;
        z-index: 1;
        .CodeMirror-code {
            line-height: 19px;
        }
    }
}
</style>

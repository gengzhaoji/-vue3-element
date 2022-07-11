<template>
    <div class="login-container">
        <div class="content-space">
            <el-form class="validate--bottom login-form" ref="refLoginForm" label-position="top" :model="loginForm" :rules="loginRules">
                <div class="form">
                    <div class="title">WELCOME TO BM</div>
                    <div class="sub-title">请登录您的账号进入{{ TITLE }}</div>
                    <el-form-item prop="username" label="账号">
                        <el-input ref="username" size="large" v-model="loginForm.username" placeholder="请输入" />
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                        <el-input ref="password" size="large" v-model="loginForm.password" show-password placeholder="请输入" @keyup.enter="handleLogin" />
                    </el-form-item>
                    <el-form-item prop="code" label="请输入" v-if="coo">
                        <el-input ref="code" v-model="loginForm.code" placeholder="验证码" style="width: 70%" @keyup.enter="handleLogin" />
                        <div class="login-code tr">
                            <img :src="codeUrl" @click.prevent="getCode" class="login-code-img" />
                        </div>
                    </el-form-item>
                    <div class="flex m-between">
                        <el-checkbox v-model="loginForm.rememberMe">
                            <span :style="{ color: loginForm.rememberMe ? '' : '#d3d7f7' }">记住密码</span>
                        </el-checkbox>
                    </div>
                    <el-form-item>
                        <button class="loginBtn" :loading="loading" @click.prevent="handleLogin">{{ loading ? '登 录 中...' : '登 录' }}</button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup name="Login">
import { TITLE } from '@/config';
import { captchaImage } from '@a/public';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import { set, get, remove, has } from '@/utils/cookie';
import { parse } from '@u/url';
const $vm = inject('$vm');

/**
 * data数据
 */
let codeUrl = $ref(''),
    loginForm = reactive({
        username: has('username') ? get('username') : '',
        password: has('password') ? decrypt(get('password')) : '',
        rememberMe: has('rememberMe') ? Boolean(get('rememberMe')) : false,
        code: '',
        uuid: '',
    }),
    coo = $ref(false),
    loading = $ref(false),
    redirect = useRoute().query?.redirect;
/**
 * 计算属性-计算form表单校验数组
 */
const Rules1 = {
    username: [
        {
            required: true,
            trigger: 'change',
            message: '账号不能为空',
        },
    ],
    password: [
        {
            required: true,
            trigger: 'change',
            message: '密码不能为空',
        },
    ],
    code: [
        {
            required: true,
            trigger: 'change',
            message: '验证码不能为空',
        },
    ],
};
const Rules2 = {
    username: [
        {
            required: true,
            trigger: 'change',
            message: '账号不能为空',
        },
    ],
    password: [
        {
            required: true,
            trigger: 'change',
            message: '密码不能为空',
        },
    ],
};
let loginRules = computed(() => (coo.value ? Rules1 : Rules2));
/**
 * 初始化判断光标位置
 */
let username = $ref(null),
    password = $ref(null),
    code = $ref(null);
onMounted(() => {
    if (loginForm.username === '') {
        username.focus();
    } else if (loginForm.password === '') {
        password.focus();
    } else {
        if (coo) code.focus();
    }
});
// 获取是否需要验证码——验证码图片
getCode();
function getCode() {
    captchaImage().then((res) => {
        const { img, uuid } = res.data;
        coo = res.data.coo;
        if (coo) {
            codeUrl = 'data:image/gif;base64,' + img;
            loginForm.uuid = uuid;
        }
    });
}
// 登录接口逻辑
let refLoginForm = $ref(null);
function handleLogin() {
    refLoginForm.validate((valid) => {
        if (valid) {
            loading = true;
            if (loginForm.rememberMe) {
                const time = 30 * 24 * 60 * 60;
                set('username', loginForm.username, time);
                set('password', encrypt(loginForm.password), time);
                set('rememberMe', loginForm.rememberMe, time);
            } else {
                remove('username');
                remove('password');
                remove('rememberMe');
            }
            $vm.$store.user
                .Login(loginForm)
                .then(() => {
                    nextTick(() => {
                        $vm.$router.push({ path: redirect || '/', query: parse(redirect) || {} });
                    });
                })
                .catch(() => {
                    getCode();
                    loading = false;
                });
        }
    });
}
</script>

<style scoped lang="scss">
$text-color: #d3d7f7;
.login-container {
    height: 100%;
    background-image: url('./images/background.png');
    background-size: 100% 100%, cover;
    background-repeat: no-repeat;
    position: relative;
    .content-space {
        position: absolute;
        top: 30%;
        right: 20%;
        padding: 20px;
        .form {
            max-width: 500px;
            height: auto;
            .title {
                height: 40px;
                line-height: 40px;
                color: #3a3f63;
                font-weight: 800;
                font-size: 32px;
                padding-bottom: 5px;
            }
            .sub-title {
                height: 24px;
                line-height: 24px;
                color: #6a74a5;
                font-size: 16px;
                font-weight: 400;
                padding-bottom: 20px;
            }
            .loginBtn {
                width: 240px;
                padding: 12px 0;
                border: 1px solid $text-color;
                font-size: 16px;
                color: #fff;
                cursor: pointer;
                background: linear-gradient(45deg, #4f8aff 0%, #4b5eff 100%);
                border-radius: 27px;
                margin-top: 10px;
                &:hover {
                    color: #fff;
                    background: #4b5eff;
                    opacity: 0.8;
                }
            }
            .login-code {
                width: 30%;
                height: 38px;
                float: right;
                img {
                    cursor: pointer;
                    vertical-align: middle;
                }
            }
            .login-code-img {
                height: 36px;
            }
        }
    }
}
</style>

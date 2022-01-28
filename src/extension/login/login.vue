<template>
    <div class="login-container">
        <div class="left">
            <img class="name" src="./images/name.png" alt="name" />
        </div>
        <div class="right">
            <div class="content-space">
                <el-form class="validate--bottom login-form" ref="loginForm" label-position="top" :model="loginForm" :rules="loginRules">
                    <div class="form">
                        <div class="title">WELCOME TO BM</div>
                        <div class="sub-title">请登录您的账号进入保密管理系统</div>
                        <el-form-item prop="username" label="账号">
                            <el-input ref="username" size="medium" v-model="loginForm.username" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item prop="password" label="密码">
                            <el-input ref="password" size="medium" v-model="loginForm.password" show-password placeholder="请输入" @keyup.enter="handleLogin" />
                        </el-form-item>
                        <el-form-item prop="code" label="请输入" v-if="coo">
                            <el-input ref="code" size="medium" v-model="loginForm.code" placeholder="验证码" style="width: 70%" @keyup.enter="handleLogin" />
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
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { captchaImage } from '@a/public';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import { set, get, remove, has } from '@/utils/cookie';
import { NAME } from '@/config';
export default defineComponent({
    name: 'Login',
    data() {
        return {
            codeUrl: '',
            loginForm: {
                username: has('username') ? get('username') : '',
                password: has('password') ? decrypt(get('password')) : '',
                rememberMe: has('rememberMe') ? Boolean(get('rememberMe')) : false,
                code: '',
                uuid: '',
            },
            coo: false,
            loading: false,
            redirect: undefined,
            NAME,
        };
    },
    computed: {
        loginRules() {
            return this.coo
                ? {
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
                  }
                : {
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
        },
    },
    watch: {
        $route: {
            handler: function (route) {
                this.redirect = route.query && route.query.redirect;
            },
            immediate: true,
        },
    },
    created() {
        // this.getCode();
    },
    mounted() {
        if (this.loginForm.username === '') {
            this.$refs.username.focus();
        } else if (this.loginForm.password === '') {
            this.$refs.password.focus();
        } else {
            if (this.coo) this.$refs.code.focus();
        }
    },
    methods: {
        getCode() {
            captchaImage().then((res) => {
                const { coo, img, uuid } = res.data;
                this.coo = coo;
                if (coo) {
                    this.codeUrl = 'data:image/gif;base64,' + img;
                    this.loginForm.uuid = uuid;
                }
            });
        },
        handleLogin() {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    if (this.loginForm.rememberMe) {
                        const time = 30 * 24 * 60 * 60;
                        set('username', this.loginForm.username, time);
                        set('password', encrypt(this.loginForm.password), time);
                        set('rememberMe', this.loginForm.rememberMe, time);
                    } else {
                        remove('username');
                        remove('password');
                        remove('rememberMe');
                    }
                    this.$store
                        .dispatch('Login', this.loginForm)
                        .then(() => {
                            this.$router.push({ path: this.redirect || '/' });
                        })
                        .catch(() => {
                            this.loading = false;
                            this.getCode();
                        });
                }
            });
        },
    },
});
</script>

<style scoped lang="scss">
$text-color: #d3d7f7;
.login-container {
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: flex;
    .left {
        position: relative;
        flex: 1;
        background-image: url('./images/background.png');
        background-repeat: no-repeat;
        background-size: 100% 100%, cover;
        .name {
            position: absolute;
            top: 44px;
            left: 42px;
        }
    }
    .right {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        .content-space {
            .form {
                width: 460px;
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
}
</style>

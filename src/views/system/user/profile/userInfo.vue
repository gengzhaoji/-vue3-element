<template>
    <el-form ref="form" :model="user" :rules="rules" label-width="80px" class="validate--bottom">
        <el-form-item label="用户昵称" prop="nickName">
            <com-input v-model="user.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phonenumber">
            <com-input v-model="user.phonenumber" maxlength="11" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
            <com-input v-model="user.email" maxlength="50" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别">
            <el-radio-group v-model="user.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item>
            <com-button type="primary" @click.prevent="submit">提 交</com-button>
            <com-button type="danger" @click.prevent="close">关 闭</com-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { updateUserProfile } from '@/api/public';
import { defineComponent } from 'vue';
export default defineComponent({
    props: {
        user: {
            type: Object,
        },
    },
    data() {
        return {
            // 表单校验
            rules: {
                nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'change' }],
                email: [
                    { required: true, message: '邮箱地址不能为空', trigger: 'change' },
                    {
                        type: 'email',
                        message: "'请输入正确的邮箱地址",
                        trigger: ['change', 'change'],
                    },
                ],
                phonenumber: [
                    { required: true, message: '手机号码不能为空', trigger: 'change' },
                    {
                        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
                        message: '请输入正确的手机号码',
                        trigger: 'change',
                    },
                ],
            },
        };
    },
    methods: {
        submit() {
            this.$refs['form'].validate((valid) => {
                if (valid) {
                    updateUserProfile(this.user).then((response) => {
                        this.msgSuccess('修改成功');
                    });
                }
            });
        },
        close() {
            this.$router.go(-1);
        },
    },
});
</script>

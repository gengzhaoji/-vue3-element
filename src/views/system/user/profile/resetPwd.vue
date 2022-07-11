<template>
    <el-form ref="form" :model="user" :rules="rules" label-width="80px" class="validate--bottom">
        <el-form-item label="旧密码" prop="oldPassword">
            <my-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
            <my-input v-model="user.newPassword" placeholder="请输入新密码" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
            <my-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" />
        </el-form-item>
        <el-form-item>
            <my-button type="primary" @click.prevent="submit">提 交</my-button>
            <my-button type="danger" @click.prevent="close">关 闭</my-button>
        </el-form-item>
    </el-form>
</template>

<script>
import { updatePwdUserProfile } from '@/api/public';
import { defineComponent, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
export default defineComponent({
    setup() {
        const router = useRouter();
        const user = reactive({
            oldPassword: undefined,
            newPassword: undefined,
            confirmPassword: undefined,
        });
        const equalToPassword = (rule, value, callback) => {
            if (user.newPassword !== value) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        };
        const rules = {
            oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'change' }],
            newPassword: [
                { required: true, message: '新密码不能为空', trigger: 'change' },
                {
                    min: 6,
                    max: 20,
                    message: '长度在 6 到 20 个字符',
                    trigger: 'change',
                },
            ],
            confirmPassword: [
                { required: true, message: '确认密码不能为空', trigger: 'change' },
                { required: true, validator: equalToPassword, trigger: 'blur' },
            ],
        };
        const form = ref(null);
        const submit = () => {
            form.value.validate((valid) => {
                if (valid) {
                    updatePwdUserProfile({
                        oldPassword: user.oldPassword,
                        newPassword: user.newPassword,
                    }).then((response) => {
                        ElMessage({
                            message: '修改成功',
                            type: 'success',
                        });
                    });
                }
            });
        };
        const close = () => {
            router.go(-1);
        };
        return {
            user,
            rules,
            submit,
            close,
            form,
        };
    },
});
</script>

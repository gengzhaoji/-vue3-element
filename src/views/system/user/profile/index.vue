<template>
    <div class="page p-10">
        <div class="f1 h0 system-page-background p-10">
            <el-row :gutter="10" style="overflow-x: hidden">
                <el-col :span="6" :xs="24">
                    <el-card class="box-card">
                        <template #header>
                            <div class="clearfix header">
                                <span>个人信息</span>
                            </div>
                        </template>
                        <div>
                            <div class="tc">
                                <userAvatar :user="user" />
                            </div>
                            <ul class="list-group">
                                <li class="list-group-item">
                                    用户名称
                                    <div class="pull-right">{{ user.userName }}</div>
                                </li>
                                <li class="list-group-item">
                                    手机号码
                                    <div class="pull-right">{{ user.phonenumber }}</div>
                                </li>
                                <li class="list-group-item">
                                    用户邮箱
                                    <div class="pull-right">{{ user.email }}</div>
                                </li>
                                <li class="list-group-item">
                                    所属部门
                                    <div class="pull-right" v-if="user.deptName">{{ user.deptName }} / {{ postGroup }}</div>
                                </li>
                                <li class="list-group-item">
                                    所属角色
                                    <div class="pull-right">{{ roleGroup }}</div>
                                </li>
                                <li class="list-group-item">
                                    创建日期
                                    <div class="pull-right">{{ user.createTime }}</div>
                                </li>
                            </ul>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="18" :xs="24">
                    <el-card>
                        <template #header>
                            <div class="clearfix">
                                <span>基本资料</span>
                            </div>
                        </template>
                        <el-tabs v-model="activeTab" type="card">
                            <el-tab-pane label="基本资料" name="userinfo">
                                <userInfo :user="user" />
                            </el-tab-pane>
                            <el-tab-pane label="修改密码" name="resetPwd">
                                <resetPwd :user="user" />
                            </el-tab-pane>
                        </el-tabs>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script setup name="profile">
import { infoUserProfile } from '@/api/public';
import resetPwd from './resetPwd.vue';
import userAvatar from './userAvatar.vue';
import userInfo from './userInfo.vue';
let user = $ref({}),
    roleGroup = $ref({}),
    postGroup = $ref({}),
    activeTab = $ref('userinfo');
getUser();
function getUser() {
    infoUserProfile().then((response) => {
        user = response.data.user;
        roleGroup = response.data.roles.join('');
        postGroup = response.data.posts.join('');
    });
}
</script>

<style lang="scss" scoped>
.list-group {
    padding-left: 0px;
    list-style: none;
}
.list-group-item {
    border-bottom: 1px solid #e7eaec;
    border-top: 1px solid #e7eaec;
    margin-bottom: -1px;
    padding: 11px 0px;
    font-size: 13px;
}
</style>

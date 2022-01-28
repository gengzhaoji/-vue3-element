export default {
    columns: (state) => state.user.columns,
    userId: (state) => state.user.userInfo.userId,
    roles: (state) => state.user.roles,
    permissions: (state) => state.user.permissions,
    socketPrint: (state) => state.com.socketPrint,
};

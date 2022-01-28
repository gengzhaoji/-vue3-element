module.exports = {
    name: '首页',
    model: [
        {
            title: '设备统计',
            name: 'dealt',
            methods: 'home',
            path: '/home/statistics/dealt',
        },
        {
            title: '设备统计',
            name: 'device',
            methods: 'home',
            path: '/home/deviceHome',
        },
        {
            title: '载体统计',
            name: 'carrier',
            methods: 'home',
            path: '/home/carrierHome',
        },
        {
            title: '人员统计',
            name: 'workerSecrecy',
            methods: 'home',
            path: '/home/workerHome',
        },
        {
            title: '培训次数统计',
            name: 'train',
            methods: 'home',
            path: '/home/trainHome',
        },
        {
            title: '本年个人排名',
            name: 'train',
            methods: 'achievement',
            path: '/home/achievement',
        },
        {
            title: '本年部门排名',
            name: 'train',
            methods: 'deptAchievement',
            path: '/home/deptAchievement',
        },
    ],
};

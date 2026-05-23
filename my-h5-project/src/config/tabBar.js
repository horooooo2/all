import tab01Nor from '@/assets/tabbar/icon_tab_01_nor_day.svg'
import tab01Sel from '@/assets/tabbar/icon_tab_01_sel_day.svg'
import tab02Nor from '@/assets/tabbar/icon_tab_02_nor_day.svg'
import tab02Sel from '@/assets/tabbar/icon_tab_02_sel_day.svg'
import tab03Nor from '@/assets/tabbar/icon_tab_03_nor_day.svg'
import tab03Sel from '@/assets/tabbar/icon_tab_03_sel_day.svg'
import tab04Nor from '@/assets/tabbar/icon_tab_04_nor_day.svg'
import tab04Sel from '@/assets/tabbar/icon_tab_04_sel_day.svg'
import tab05Nor from '@/assets/tabbar/icon_tab_05_nor_day.svg'
import tab05Sel from '@/assets/tabbar/icon_tab_05_sel_day.svg'

export const tabBarConfig = [
    {
        name: '首页',
        path: '/',
        icon: 'home-o',
        activeIcon: 'home',
        customIcon: {
            inactive: tab01Nor,
            active: tab01Sel
        },
        meta: {
            title: '首页',
            keepAlive: true
        }
    },
    {
        name: '客服',
        path: '/service',
        icon: 'service-o',
        activeIcon: 'service',
        badge: 99,
        customIcon: {
            inactive: tab02Nor,
            active: tab02Sel

        },
        meta: {
            title: '客服中心',
            keepAlive: false
        }
    },
    {
        name: '充值',
        path: '/recharge',
        icon: 'balance-o',
        activeIcon: 'balance',
        customIcon: {
            inactive: tab03Nor,
            active: tab03Sel
        },
        meta: {
            title: '充值',
            keepAlive: false
        }
    },
    {
        name: '活动',
        path: '/activity',
        icon: 'gift-o',
        activeIcon: 'gift',
        customIcon: {
            inactive: tab04Nor,
            active: tab04Sel
        },
        meta: {
            title: '优惠活动',
            keepAlive: true
        }
    },
    {
        name: '我的',
        path: '/user',
        icon: 'user-o',
        activeIcon: 'user',
        customIcon: {
            inactive: tab05Nor,
            active: tab05Sel
        },
        meta: {
            title: '个人中心',
            keepAlive: false,
            requireAuth: true
        }
    }
]

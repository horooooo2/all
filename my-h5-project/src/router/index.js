import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { scrollToTop } from '@/utils/scrollToTop'

const routes = [
    {
        path: '/',
        component: BasicLayout,
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('@/views/tabbar/Home.vue'),
                meta: {
                    title: '首页',
                    keepAlive: true
                }
            },
            {
                path: 'service',
                name: 'service',
                component: () => import('@/views/tabbar/Service.vue'),
                meta: {
                    title: '客服中心',
                    keepAlive: false
                }
            },
            {
                path: 'service/detail',
                name: 'serviceDetail',
                component: () => import('@/views/service/ServiceDetail.vue'),
                meta: {
                    title: '在线客服',
                    keepAlive: false
                }
            },
            {
                path: 'help-center',
                name: 'helpCenter',
                component: () => import('@/views/help/HelpCenter.vue'),
                meta: {
                    title: '帮助中心',
                    keepAlive: false
                }
            },
            {
                path: 'help-center/questions',
                name: 'commonQuestions',
                component: () => import('@/views/help/CommonQuestions.vue'),
                meta: {
                    title: '常见问题',
                    keepAlive: false
                }
            },
            {
                path: 'recharge',
                name: 'recharge',
                component: () => import('@/views/tabbar/Recharge.vue'),
                meta: {
                    title: '充值',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'wallet-recycle',
                name: 'walletRecycle',
                component: () => import('@/views/tabbar/recharge/WalletRecycle.vue'),
                meta: {
                    title: '转账至主钱包',
                    keepAlive: false
                }
            },
            {
                path: 'activity',
                name: 'activity',
                component: () => import('@/views/tabbar/Activity.vue'),
                meta: {
                    title: '优惠活动',
                    keepAlive: true
                }
            },
            {
                path: 'user',
                name: 'user',
                component: () => import('@/views/tabbar/User.vue'),
                meta: {
                    title: '个人中心',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'game-hall',
                name: 'gameHall',
                component: () => import('@/views/game/GameHall.vue'),
                meta: {
                    title: '游戏大厅',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'game-room',
                name: 'gameRoom',
                component: () => import('@/views/game/lottery/GameRoom.vue'),
                meta: {
                    title: '游戏',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'game-trend',
                name: 'gameTrend',
                component: () => import('@/views/game/lottery/FullTrend.vue'),
                meta: {
                    title: '完整走势',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'lottery-bet-record',
                name: 'lotteryBetRecord',
                component: () => import('@/views/game/lottery/LotteryBetRecord.vue'),
                meta: {
                    title: '投注记录',
                    keepAlive: false,
                    requireAuth: false
                }
            },
            {
                path: 'lottery-bet-order-detail',
                name: 'lotteryBetOrderDetail',
                component: () => import('@/views/game/lottery/LotteryBetOrderDetail.vue'),
                meta: {
                    title: '订单详情',
                    keepAlive: false,
                    requireAuth: false
                }
            }
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
            title: '登录',
            keepAlive: false
        }
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/register.vue'),
        meta: {
            title: '注册',
            keepAlive: false
        }
    },
    {
        path: '/transaction-record',
        name: 'transactionRecord',
        component: () => import('@/views/user/records/TransactionRecord.vue'),
        meta: {
            title: '交易记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/transaction-record-detail',
        name: 'transactionRecordDetail',
        component: () => import('@/views/user/records/TransactionRecordDetail.vue'),
        meta: {
            title: '交易记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/deposit-withdraw-record',
        name: 'depositWithdrawRecord',
        component: () => import('@/views/recharge/DepositWithdrawRecord.vue'),
        meta: {
            title: '交易记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/game-record',
        name: 'gameRecord',
        component: () => import('@/views/user/records/GameRecord.vue'),
        meta: {
            title: '游戏记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/chase-order',
        name: 'chaseOrder',
        component: () => import('@/views/game/lottery/ChaseOrder.vue'),
        meta: {
            title: '我要追号',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/game-record-detail',
        name: 'gameRecordDetail',
        component: () => import('@/views/user/records/GameRecordDetail.vue'),
        meta: {
            title: '游戏记录详情',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/today-profit-loss',
        name: 'todayProfitLoss',
        component: () => import('@/views/user/records/TodayProfitLoss.vue'),
        meta: {
            title: '今日赢亏',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/user/settings/Settings.vue'),
        meta: {
            title: '设置',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/edit-profile',
        name: 'editProfile',
        component: () => import('@/views/user/settings/EditProfile.vue'),
        meta: {
            title: '编辑个人资料',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/set-nickname',
        name: 'setNickname',
        component: () => import('@/views/user/settings/SetNickname.vue'),
        meta: {
            title: '设置昵称',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/set-real-name',
        name: 'setRealName',
        component: () => import('@/views/user/settings/SetRealName.vue'),
        meta: {
            title: '设置姓名',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/set-contact-info',
        name: 'setContactInfo',
        component: () => import('@/views/user/settings/SetContactInfo.vue'),
        meta: {
            title: '设置联系方式',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/change-login-password',
        name: 'changeLoginPassword',
        component: () => import('@/views/user/settings/ChangeLoginPassword.vue'),
        meta: {
            title: '修改登录密码',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/change-withdraw-password',
        name: 'changeWithdrawPassword',
        component: () => import('@/views/user/settings/ChangeWithdrawPassword.vue'),
        meta: {
            title: '提款密码设置',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/withdrawal-accounts',
        name: 'withdrawalAccounts',
        component: () => import('@/views/user/settings/WithdrawalAccounts.vue'),
        meta: {
            title: '提款账户',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/withdrawal-accounts/edit',
        name: 'withdrawalAccountEdit',
        component: () => import('@/views/user/settings/WithdrawalAccountEdit.vue'),
        meta: {
            title: '提款账户',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/about-us',
        name: 'aboutUs',
        component: () => import('@/views/user/settings/LegalDocument.vue'),
        meta: {
            title: '关于我们',
            legalKind: 'about',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/user-agreement',
        name: 'userAgreement',
        component: () => import('@/views/user/settings/LegalDocument.vue'),
        meta: {
            title: '用户协议',
            legalKind: 'agreement',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/privacy-policy',
        name: 'privacyPolicy',
        component: () => import('@/views/user/settings/LegalDocument.vue'),
        meta: {
            title: '隐私政策',
            legalKind: 'privacy',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/my-rebate',
        name: 'myRebate',
        component: () => import('@/views/user/records/MyRebate.vue'),
        meta: {
            title: '我的返水',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/vip-center',
        name: 'vipCenter',
        component: () => import('@/views/user/vip/VipCenter.vue'),
        meta: {
            title: 'VIP等级',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/vip-detail',
        name: 'vipDetail',
        component: () => import('@/views/user/vip/VipDetail.vue'),
        meta: {
            title: 'VIP详情',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-center',
        name: 'agentCenter',
        component: () => import('@/views/user/agent/AgentCenter.vue'),
        meta: {
            title: '代理中心',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-apply',
        name: 'agentApply',
        component: () => import('@/views/user/agent/AgentApply.vue'),
        meta: {
            title: '代理中心',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-promotion',
        name: 'agentPromotion',
        component: () => import('@/views/user/agent/AgentPromotion.vue'),
        meta: {
            title: '我的推广',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-commission',
        name: 'agentCommission',
        component: () => import('@/views/user/agent/AgentCommission.vue'),
        meta: {
            title: '我的佣金',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-treatment',
        name: 'agentTreatment',
        component: () => import('@/views/user/agent/AgentTreatment.vue'),
        meta: {
            title: '我的待遇',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-direct-team',
        name: 'agentDirectTeam',
        component: () => import('@/views/user/agent/AgentDirectTeam.vue'),
        meta: {
            title: '直属团队',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-team-performance',
        name: 'agentTeamPerformance',
        component: () => import('@/views/user/agent/AgentTeamPerformance.vue'),
        meta: {
            title: '代理收入',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-team-lottery-records',
        name: 'agentTeamLotteryRecords',
        component: () => import('@/views/user/agent/AgentTeamLotteryRecords.vue'),
        meta: {
            title: '团队彩票注单记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-team-billing-records',
        name: 'agentTeamBillingRecords',
        component: () => import('@/views/user/agent/AgentTeamBillingRecords.vue'),
        meta: {
            title: '团队账变记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/agent-team-three-party-records',
        name: 'agentTeamThreePartyRecords',
        component: () => import('@/views/user/agent/AgentTeamThreePartyRecords.vue'),
        meta: {
            title: '团队三方游戏记录',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/member-manage',
        name: 'memberManage',
        component: () => import('@/views/user/agent/MemberManage.vue'),
        meta: {
            title: '会员管理',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/create-player',
        name: 'createPlayer',
        component: () => import('@/views/user/agent/CreatePlayer.vue'),
        meta: {
            title: '创建玩家',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/link-detail',
        name: 'linkDetail',
        component: () => import('@/views/user/agent/LinkDetail.vue'),
        meta: {
            title: '链接详情',
            keepAlive: false,
            requireAuth: false
        }
    },
    {
        path: '/500',
        name: 'serverError500',
        component: () => import('@/views/exception/ServerError500.vue'),
        meta: {
            title: '服务器错误',
            keepAlive: false
        }
    },
    {
        path: '/404',
        name: 'error404',
        component: () => import('@/views/exception/NotFound404.vue'),
        meta: {
            title: '页面不存在',
            keepAlive: false
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notFound404',
        component: () => import('@/views/exception/NotFound404.vue'),
        meta: {
            title: '页面不存在',
            keepAlive: false
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { el: '#app', top: 0, left: 0 }
    }
})

const preloadedChunks = new Set()

const preloadRoute = async (routeName) => {
    const route = routes.find(r => r.name === routeName)
    if (!route || !route.component) return

    const chunkName = routeName
    if (preloadedChunks.has(chunkName)) return

    try {
        console.log(`🔄 预加载页面: ${routeName}`)
        await route.component()
        preloadedChunks.add(chunkName)
        console.log(`✅ 预加载完成: ${routeName}`)
    } catch (error) {
        console.error(`❌ 预加载失败: ${routeName}`, error)
    }
}

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'PC28'

    if (to.meta.requireAuth) {
        const token = localStorage.getItem('token')
        if (token) {
            next()
        } else {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        }
    } else {
        next()
    }
})

router.afterEach((to) => {
    nextTick(() => {
        scrollToTop()
    })

    const preloadList = to.meta.preload || []

    if (preloadList.length > 0) {
        console.log(`📋 准备预加载: ${preloadList.join(', ')}`)

        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                preloadList.forEach(routeName => preloadRoute(routeName))
            }, { timeout: 2000 })
        } else {
            setTimeout(() => {
                preloadList.forEach(routeName => preloadRoute(routeName))
            }, 1000)
        }
    }
})

export default router

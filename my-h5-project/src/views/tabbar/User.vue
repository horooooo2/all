<template>
  <div class="user-page">
    <section class="top-panel">
      <div class="top-user">
        <div class="avatar-wrap">
          <img
            v-if="isLogin && viewUserInfo?.avatar"
            :src="viewUserInfo.avatar"
            alt="avatar"
          >
          <div v-else class="avatar-placeholder">U</div>
        </div>
        <div class="user-text">
          <div class="user-name">{{ isLogin ? (viewUserInfo?.name || '昵称') : '未登录' }}</div>
          <div class="user-id">{{ isLogin ? `ID:${viewUserInfo?.id || '0000001'}` : '点击头像去登录' }}</div>
        </div>
        <div class="top-user-actions">
          <div
            v-if="isLogin"
            class="icon-edit-btn"
            role="button"
            tabindex="0"
            @click="goEditProfile"
            @keydown.enter.prevent="goEditProfile"
            @keydown.space.prevent="goEditProfile"
          >
            <img :src="iconBj" alt="编辑">
          </div>
          <button
            type="button"
            class="edit-btn"
            v-if="!isLogin"
            @click="goLogin()"
          >
            登录
          </button>
        </div>
      </div>

      <div class="vip-progress-wrap">
        <div class="vip-line">
          <span>当前等级VIP0 晋级进度 ¥10/¥10,000</span>
          <div
            class="link-btn"
            role="button"
            tabindex="0"
            @click="goVipCenter"
            @keydown.enter.prevent="goVipCenter"
            @keydown.space.prevent="goVipCenter"
          >
            查看进度
            <img class="link-btn-icon" :src="iconDack" alt="">
          </div>
        </div>
        <div class="vip-track">
          <span class="vip-tag">VIP0</span>
          <div class="track-bg">
            <div class="track-inner" />
          </div>
          <span class="vip-tag">VIP1</span>
        </div>
      </div>
    </section>

    <section class="wallet-card">
      <div class="wallet-header">
        <span>TG2323121</span>
        <img class="vip-chip-img" :src="iconVip00" alt="VIP0">
      </div>
      <div class="wallet-body">
        <div class="balance-wrap">
          <img class="currency-icon" :src="iconCny" alt="">
          <span class="balance">89,685.50</span>
        </div>
        <div class="wallet-actions">
          <div
            class="wallet-action"
            role="button"
            tabindex="0"
            @click="goRecharge"
            @keydown.enter.prevent="goRecharge"
            @keydown.space.prevent="goRecharge"
          >
            <img :src="iconDeposit2" alt="deposit">
            <span>存款</span>
          </div>
          <div
            class="wallet-action"
            role="button"
            tabindex="0"
            @click="goWithdraw"
            @keydown.enter.prevent="goWithdraw"
            @keydown.space.prevent="goWithdraw"
          >
            <img :src="iconWithdrawal" alt="withdraw">
            <span>取款</span>
          </div>
          <div
            class="wallet-action"
            role="button"
            tabindex="0"
            @click="goAgentCenter"
            @keydown.enter.prevent="goAgentCenter"
            @keydown.space.prevent="goAgentCenter"
          >
            <img :src="iconActing" alt="acting">
            <span>代理</span>
          </div>
        </div>
      </div>
    </section>

    <section class="quick-grid">
      <div
        class="quick-item"
        role="button"
        tabindex="0"
        @click="goMemberManage"
        @keydown.enter.prevent="goMemberManage"
        @keydown.space.prevent="goMemberManage"
      >
        <img class="quick-icon-img" :src="iconHuiyuan" alt="">
        <span>会员管理</span>
      </div>
      <div
        class="quick-item"
        role="button"
        tabindex="0"
        @click="goTransactionRecord"
        @keydown.enter.prevent="goTransactionRecord"
        @keydown.space.prevent="goTransactionRecord"
      >
        <img class="quick-icon-img" :src="iconJyjl" alt="">
        <span>交易记录</span>
      </div>
      <div
        class="quick-item"
        role="button"
        tabindex="0"
        @click="goGameRecord"
        @keydown.enter.prevent="goGameRecord"
        @keydown.space.prevent="goGameRecord"
      >
        <img class="quick-icon-img" :src="iconYxjl" alt="">
        <span>游戏记录</span>
      </div>
      <div
        class="quick-item"
        role="button"
        tabindex="0"
        @click="goTodayProfitLoss"
        @keydown.enter.prevent="goTodayProfitLoss"
        @keydown.space.prevent="goTodayProfitLoss"
      >
        <img class="quick-icon-img" :src="iconJryk" alt="">
        <span>今日赢亏</span>
      </div>
    </section>

    <section class="menu-card">
      <div
        class="menu-row"
        role="button"
        tabindex="0"
        @click="goMyRebate"
        @keydown.enter.prevent="goMyRebate"
        @keydown.space.prevent="goMyRebate"
      >
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconFs" alt="">
          <span>我的返水</span>
        </span>
        <van-icon name="arrow" />
      </div>
      <div class="menu-row" role="button" tabindex="0">
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconApp" alt="">
          <span>下载应用程序</span>
        </span>
        <van-icon name="arrow" />
      </div>
      <div
        class="menu-row"
        role="button"
        tabindex="0"
        @click="goHelpCenter"
        @keydown.enter.prevent="goHelpCenter"
        @keydown.space.prevent="goHelpCenter"
      >
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconHlepc" alt="">
          <span>帮助中心</span>
        </span>
        <van-icon name="arrow" />
      </div>
      <div
        class="menu-row"
        role="button"
        tabindex="0"
        @click="goService"
        @keydown.enter.prevent="goService"
        @keydown.space.prevent="goService"
      >
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconZxkf" alt="">
          <span>联系我们</span>
        </span>
        <van-icon name="arrow" />
      </div>
      <div
        class="menu-row"
        role="button"
        tabindex="0"
        @click="goSettings"
        @keydown.enter.prevent="goSettings"
        @keydown.space.prevent="goSettings"
      >
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconSetting" alt="">
          <span>设置</span>
        </span>
        <van-icon name="arrow" />
      </div>
    </section>

    <section class="single-card">
      <div
        class="menu-row"
        role="button"
        tabindex="0"
        @click="showLangPopup = true"
        @keydown.enter.prevent="showLangPopup = true"
        @keydown.space.prevent="showLangPopup = true"
      >
        <span class="menu-row-inner">
          <img class="menu-icon" :src="iconEn" alt="">
          <span>语言设置</span>
        </span>
        <span class="right-text">{{ currentLangLabel }} <van-icon name="arrow" /></span>
      </div>
    </section>

<!--    <section class="single-card">-->
<!--      <div class="mode-row">-->
<!--        <span>夜间模式</span>-->
<!--        <van-switch v-model="isDark" size="22px" />-->
<!--      </div>-->
<!--    </section>-->

    <LangPopup v-model:show="showLangPopup" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LangPopup from '@/components/LangPopup.vue'
import { useUserStore } from '@/stores/user'
import toast from '@/components/Toast'
import iconBj from '@/assets/icon_bj.png'
import iconDack from '@/assets/icon_dack2.png'
import iconVip00 from '@/assets/icon_vip_00.png'
import iconCny from '@/assets/icon_cny.svg'
import iconDeposit2 from '@/assets/icon_deposit.svg'
import iconWithdrawal from '@/assets/icon_withdrawal.png'
import iconActing from '@/assets/icon_acting.png'
import iconHuiyuan from '@/assets/icon_huiyuan.png'
import iconJyjl from '@/assets/icon_jyjl.png'
import iconYxjl from '@/assets/icon_yxjl.png'
import iconJryk from '@/assets/icon_jryk.png'
import iconFs from '@/assets/icon_fs.png'
import iconApp from '@/assets/icon_app.png'
import iconHlepc from '@/assets/icon_hlepc.png'
import iconZxkf from '@/assets/icon_zxkf.svg'
import iconSetting from '@/assets/icon_setting.png'
import iconEn from '@/assets/icon_en.svg'

const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()
const showLangPopup = ref(false)

// 临时：固定个人中心为“已登录”状态（仅影响此页面展示）
const isLogin = computed(() => true)
const viewUserInfo = computed(() => userStore.userInfo || {
  id: '000001',
  name: 'ACYOM',
  avatar: ''
})

const LANG_LABELS = {
  zh: '简体中文',
  zht: '繁体中文',
  en: 'English'
}
const currentLangLabel = computed(() => LANG_LABELS[locale.value] || LANG_LABELS.zh)

const goLogin = () => router.push('/login')
const goEditProfile = () => router.push({ name: 'editProfile' })
const goRecharge = () => router.push({ name: 'recharge', query: { tab: 'deposit' } })
const goWithdraw = () => router.push({ name: 'recharge', query: { tab: 'withdraw' } })
const goService = () => router.push('/service')
const goTransactionRecord = () => router.push('/transaction-record')
const goGameRecord = () => router.push('/game-record')
const goTodayProfitLoss = () => router.push('/today-profit-loss')
const goMyRebate = () => router.push('/my-rebate')
const goHelpCenter = () => router.push({ name: 'helpCenter' })
const goSettings = () => router.push({ name: 'settings' })
const goVipCenter = () => router.push({ name: 'vipCenter' })
const goAgentCenter = () => router.push({ name: 'agentCenter' })
const goMemberManage = () => router.push({ name: 'memberManage' })

const handleLogout = () => {
  toast.warning('当前页面已临时固定为已登录')
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/user.less';
</style>

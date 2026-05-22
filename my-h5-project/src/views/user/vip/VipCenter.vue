<template>
  <div class="vip-page">
    <header class="vip-nav">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>VIP</h1>
    </header>

    <!-- 顶部背景固定 200px；卡片悬浮叠在背景上，向下露出 57px（与个人中心金额卡类似） -->
    <section class="vip-hero-top">
      <div class="vip-user-row">
        <div class="vip-avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="">
          <img v-else class="vip-avatar-fallback" :src="avatarDefault" alt="">
        </div>
        <div class="vip-user-meta">
          <div class="vip-nickname">{{ nickname }}</div>
          <div class="vip-user-id">ID:{{ userId }}</div>
        </div>
        <button type="button" class="vip-detail-link" @click="goVipDetail">
          查看详情
          <img class="link-btn-icon" :src="iconDack" alt="">
        </button>
      </div>
    </section>

    <div class="vip-card-float">
      <van-swipe
        ref="swipeRef"
        class="vip-card-swipe"
        :width="vipSwipeSlideWidth"
        :height="vipSwipeHeight"
        :loop="false"
        :show-indicators="true"
        @change="onSwipeChange"
      >
        <van-swipe-item v-for="lvl in vipLevels" :key="lvl">
          <div class="vip-slide-inner">
            <div class="vip-level-card">
              <img class="vip-level-badge-img" :src="vipLevelIcon(lvl)" alt="">
              <div class="vip-level-card-body">
                <div class="vip-level-card-head">
                  <p class="vip-level-status">{{ levelStatusText }}</p>
                  <div class="vip-level-name">VIP{{ lvl }}</div>
                </div>
                <p class="vip-level-progress-label">{{ progressLabel }}</p>
                <div class="vip-level-progress-track">
                  <div class="vip-level-progress-inner" :style="{ width: progressPercent + '%' }" />
                </div>
                <p class="vip-level-desc">{{ upgradeHint }}</p>
              </div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
    </div>

    <section class="vip-level-section">
      <div class="vip-timeline">
        <span
          v-for="n in vipLevels"
          :key="n"
          class="vip-timeline-node"
          :class="{ active: n - 1 === activeSwipeIndex }"
        />
      </div>
      <div ref="levelTabsRef" class="vip-level-tabs">
        <button
          v-for="lv in levelTabs"
          :key="lv"
          type="button"
          class="vip-level-tab"
          :class="{ active: lv === selectedTab }"
          @click="selectLevelTab(lv)"
        >
          {{ lv }}
        </button>
      </div>
    </section>

    <!-- 浅色区：特权列表 -->
    <section class="vip-priv-section">
      <div class="vip-priv-title">
        <img class="vip-priv-title-side" :src="iconZsLeft" alt="">
        <span class="vip-priv-title-text">VIP特权</span>
        <img class="vip-priv-title-side" :src="iconZsRight" alt="">
      </div>

      <div class="vip-priv-list">
        <div v-for="item in privilegeList" :key="item.id" class="vip-priv-card">
          <div class="vip-priv-icon">
            <img :src="item.icon" alt="">
          </div>
          <div class="vip-priv-body">
            <div class="vip-priv-name">{{ item.title }}</div>
            <div class="vip-priv-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="vip-footer">
      <button type="button" class="vip-footer-btn" @click="goRecharge">
        前往充值
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import avatarDefault from '@/assets/touxiang2.png'
import iconBack from '@/assets/icon_dack.svg'
import iconDack from '@/assets/icon_dack2.png'
import iconVipFallback from '@/assets/icon_vip_00.svg'
import iconZsLeft from '@/assets/icon_zs_left.svg'
import iconZsRight from '@/assets/icon_zs_right.svg'
import iconMrtx from '@/assets/icon_mrtx.svg'
import iconTxk from '@/assets/icon_txk.svg'
import iconJspl from '@/assets/icon_jspl.svg'
import { useUserStore } from '@/stores/user'

const vipLevelIconModules = {
  ...import.meta.glob('@/assets/vip_0[1-9].png', { eager: true, import: 'default' }),
  ...import.meta.glob('@/assets/vip_10.png', { eager: true, import: 'default' })
}

function vipLevelIcon(level) {
  const pad = String(level).padStart(2, '0')
  const suffix = `/vip_${pad}.png`
  const key = Object.keys(vipLevelIconModules).find((path) =>
    path.replace(/\\/g, '/').endsWith(suffix)
  )
  return key ? vipLevelIconModules[key] : iconVipFallback
}

const router = useRouter()
const userStore = useUserStore()

const goBack = () => router.back()
const goRecharge = () => router.push({ name: 'recharge', query: { tab: 'deposit' } })
const goVipDetail = () => router.push({ name: 'vipDetail' })

const nickname = computed(() => (userStore.isLogin ? (userStore.userInfo?.name || '昵称') : '昵称'))
const userId = computed(() => (userStore.isLogin ? (userStore.userInfo?.id || '000001') : '000001'))
const avatarUrl = computed(() => (userStore.isLogin && userStore.userInfo?.avatar ? userStore.userInfo.avatar : ''))

/** 单页宽度 = 卡片宽 339 + 与右侧下一张的间距 12 */
const VIP_CARD_W = 339
const VIP_CARD_GAP = 24
const VIP_CARD_H = 173
const VIP_BADGE_FLOAT_H = 28
const vipSwipeSlideWidth = VIP_CARD_W + VIP_CARD_GAP
const vipSwipeHeight = VIP_CARD_H + VIP_BADGE_FLOAT_H

const vipLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const levelTabs = vipLevels.map((n) => `VIP${n}`)

const swipeRef = ref()
const levelTabsRef = ref(null)
const activeSwipeIndex = ref(0)
const selectedTab = ref('VIP1')

const scrollLevelTabIntoView = (index) => {
  nextTick(() => {
    const container = levelTabsRef.value
    if (!container) return
    const tab = container.children[index]
    if (!tab) return
    const targetLeft = tab.offsetLeft - (container.clientWidth - tab.offsetWidth) / 2
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    })
  })
}

/** 框架占位文案，后续接接口 */
const levelStatusText = ref('你不是VIP用户')
const progressLabel = ref('0/10000')
const progressPercent = ref(0)
const upgradeHint = ref('有效投注 10000 CNY，或累计充值 CNY，将升级成为 VIP1')

function onSwipeChange(index) {
  activeSwipeIndex.value = index
  selectedTab.value = `VIP${index + 1}`
  scrollLevelTabIntoView(index)
}

function selectLevelTab(lv) {
  selectedTab.value = lv
  const n = parseInt(String(lv).replace(/^VIP/i, ''), 10)
  const idx = Math.max(0, Math.min(vipLevels.length - 1, n - 1))
  activeSwipeIndex.value = idx
  scrollLevelTabIntoView(idx)
  nextTick(() => {
    swipeRef.value?.swipeTo?.(idx)
  })
}

const privilegeList = ref([
  {
    id: 1,
    title: '每日提现金额',
    desc: '根据 VIP 等级享受不同提现额度与次数（示例文案，后续接配置）',
    icon: iconMrtx
  },
  {
    id: 2,
    title: '专属客服',
    desc: '高等级 VIP 可享专属客服通道（示例）',
    icon: iconTxk
  },
  {
    id: 3,
    title: '即时评论效果VIP',
    desc: 'VIP直播评论效果',
    icon: iconJspl
  }
])
</script>

<style lang="less" scoped>
@import '@/styles/pages/vip-center.less';
</style>

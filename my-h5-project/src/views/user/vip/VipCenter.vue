<template>
  <div class="vip-page">
    <header class="vip-nav">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>VIP</h1>
    </header>

    <section class="vip-hero-top">
      <div class="vip-user-row">
        <div class="vip-avatar">
          <img
            v-if="displayAvatar"
            :src="displayAvatar"
            alt=""
            @error="onAvatarError"
          >
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
                  <p class="vip-level-status">{{ cardState(lvl).statusText }}</p>
                  <div class="vip-level-name">{{ cardState(lvl).levelName }}</div>
                </div>
                <p class="vip-level-progress-label">{{ cardState(lvl).progressLabel }}</p>
                <div class="vip-level-progress-track">
                  <div
                    class="vip-level-progress-inner"
                    :style="{ width: cardState(lvl).progressPercent + '%' }"
                  />
                </div>
                <p class="vip-level-desc">{{ cardState(lvl).upgradeHint }}</p>
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
          :class="{ active: n === selectedLevelNo }"
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

    <section class="vip-priv-section">
      <div class="vip-priv-title">
        <img class="vip-priv-title-side" :src="iconZsLeft" alt="">
        <span class="vip-priv-title-text">VIP特权</span>
        <img class="vip-priv-title-side" :src="iconZsRight" alt="">
      </div>

      <div v-if="privilegeList.length" class="vip-priv-list">
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
      <p v-else class="vip-priv-empty">暂无该等级特权说明</p>
    </section>

    <div class="vip-footer">
      <button type="button" class="vip-footer-btn" @click="goRecharge">
        前往充值
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getVipIndex,
  getVipRules,
  formatVipBetAmount,
  formatVipMoney,
  formatVipFeeRate,
  buildVipUpgradeHint,
  resolveVipRuleHint
} from '@/api/vip'
import { useUserStore } from '@/stores/user'
import { useUserAvatar } from '@/composables/useUserAvatar'
import avatarDefault from '@/assets/touxiang2.png'
import iconBack from '@/assets/icon_dack.svg'
import iconDack from '@/assets/icon_dack2.png'
import iconVipFallback from '@/assets/icon_vip_00.svg'
import iconZsLeft from '@/assets/icon_zs_left.svg'
import iconZsRight from '@/assets/icon_zs_right.svg'
import iconMrtx from '@/assets/icon_mrtx.svg'
import iconTxk from '@/assets/icon_txk.svg'
import iconJspl from '@/assets/icon_jspl.svg'

const PRIVILEGE_ICON_BY_CODE = {
  daily_withdraw: iconMrtx,
  daily_withdraw_amount: iconMrtx,
  withdraw: iconMrtx,
  withdraw_count: iconTxk,
  daily_withdraw_count: iconTxk,
  withdraw_fee: iconJspl,
  withdraw_fee_rate: iconJspl,
  upgrade_bonus: iconMrtx,
  exclusive_service: iconTxk,
  vip_comment: iconJspl
}

const PRIVILEGE_ICON_FALLBACK = [iconMrtx, iconTxk, iconJspl]

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
const { displayAvatar, refreshProfile } = useUserAvatar()

const goBack = () => router.back()
const goRecharge = () => router.push({ name: 'recharge', query: { tab: 'deposit' } })
const goVipDetail = () => router.push({ name: 'vipDetail' })

const nickname = computed(() => (userStore.isLogin ? (userStore.userInfo?.name || '昵称') : '昵称'))
const userId = computed(() => (userStore.isLogin ? (userStore.userInfo?.id || '000001') : '000001'))

const onAvatarError = (e) => {
  const el = e?.target
  if (!el || el.src === avatarDefault) return
  el.src = avatarDefault
}

const VIP_CARD_W = 339
const VIP_CARD_SIDE_GAP = 15
const VIP_CARD_H = 173
const VIP_BADGE_FLOAT_H = 34
const VIP_SWIPE_INDICATOR_H = 16
const VIP_SWIPE_EXTRA_H = 10
const vipSwipeSlideWidth = VIP_CARD_W + VIP_CARD_SIDE_GAP * 2
const vipSwipeHeight = VIP_CARD_H + VIP_BADGE_FLOAT_H + VIP_SWIPE_INDICATOR_H + VIP_SWIPE_EXTRA_H

const DEFAULT_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const vipInfo = ref(null)
const vipRules = ref([])

const ruleByLevel = computed(() => {
  const map = new Map()
  vipRules.value.forEach((rule) => {
    map.set(rule.levelNo, rule)
  })
  return map
})

const vipLevels = computed(() => {
  const levels = vipRules.value.map((item) => item.levelNo)
  return levels.length ? levels : DEFAULT_LEVELS
})

const levelTabs = computed(() => vipLevels.value.map((n) => {
  const rule = ruleByLevel.value.get(n)
  return rule?.levelName || `VIP${n}`
}))

const swipeRef = ref()
const levelTabsRef = ref(null)
const activeSwipeIndex = ref(0)
const selectedTab = ref('VIP1')

const selectedLevelNo = computed(() => {
  const match = String(selectedTab.value).match(/(\d+)/)
  if (match) {
    return Number(match[1])
  }
  return vipLevels.value[activeSwipeIndex.value] ?? 1
})

function getPrivilegeIcon(code, index) {
  const key = String(code || '').toLowerCase()
  if (PRIVILEGE_ICON_BY_CODE[key]) {
    return PRIVILEGE_ICON_BY_CODE[key]
  }
  return PRIVILEGE_ICON_FALLBACK[index % PRIVILEGE_ICON_FALLBACK.length]
}

function buildPrivilegesFromRule(rule) {
  if (!rule) {
    return []
  }
  const items = [
    {
      id: `${rule.levelNo}-withdraw-amount`,
      title: '每日提现金额',
      desc: formatVipMoney(rule.dailyWithdrawAmount, rule.currencyCode),
      icon: iconMrtx
    },
    {
      id: `${rule.levelNo}-withdraw-count`,
      title: '每日提现次数',
      desc: rule.dailyWithdrawCount > 0 ? `${rule.dailyWithdrawCount} 次` : '—',
      icon: iconTxk
    },
    {
      id: `${rule.levelNo}-withdraw-fee`,
      title: '提现手续费',
      desc: formatVipFeeRate(rule.withdrawFeeRate),
      icon: iconJspl
    },
    {
      id: `${rule.levelNo}-upgrade-bonus`,
      title: '升级礼金',
      desc: formatVipMoney(rule.upgradeBonus, rule.currencyCode),
      icon: iconMrtx
    }
  ]
  return items.filter((item) => item.desc && item.desc !== '—')
}

function buildPrivilegesFromIndex(list) {
  return (list || []).map((item, index) => ({
    id: item.code || index,
    title: item.name || 'VIP特权',
    desc: item.value || '—',
    icon: getPrivilegeIcon(item.code, index)
  })).filter((item) => item.desc && item.desc !== '—')
}

const privilegeList = computed(() => {
  const rulePrivileges = buildPrivilegesFromRule(ruleByLevel.value.get(selectedLevelNo.value))
  if (rulePrivileges.length) {
    return rulePrivileges
  }
  return buildPrivilegesFromIndex(vipInfo.value?.privileges)
})

function buildCardProgress(lvl, info, rule) {
  const cur = info?.currentLevel ?? 0
  const next = info?.nextLevel ?? (cur > 0 ? cur + 1 : 1)
  const maxLevel = Math.max(...vipLevels.value, 0)
  const threshold = rule?.upgradeValidBetAmount ?? info?.upgradeValidBetAmount ?? 0
  const valid = info?.validBetAmount ?? 0
  const rate = info?.progressRate ?? 0

  if (lvl === cur && (cur >= maxLevel || next <= cur)) {
    return { progressLabel: '已满级', progressPercent: 100 }
  }

  if (threshold <= 0) {
    return { progressLabel: '—', progressPercent: lvl < cur ? 100 : 0 }
  }

  if (lvl < cur) {
    const done = formatVipBetAmount(threshold)
    return { progressLabel: `${done}/${done}`, progressPercent: 100 }
  }

  if (lvl === next || (cur === 0 && lvl === next)) {
    return {
      progressLabel: `${formatVipBetAmount(valid)}/${formatVipBetAmount(threshold)}`,
      progressPercent: rate
    }
  }

  return {
    progressLabel: `0/${formatVipBetAmount(threshold)}`,
    progressPercent: 0
  }
}

function buildCardUpgradeHint(lvl, info, rule) {
  const cur = info?.currentLevel ?? 0
  const next = info?.nextLevel ?? (cur > 0 ? cur + 1 : 1)
  const nextRule = ruleByLevel.value.get(next)

  if (cur === 0 && lvl === next) {
    return resolveVipRuleHint(info?.nextRule, rule) || buildVipUpgradeHint(rule)
  }
  if (lvl === cur) {
    return resolveVipRuleHint(info?.currentRule, rule) || buildVipUpgradeHint(rule)
  }
  if (lvl === next) {
    return resolveVipRuleHint(info?.nextRule, nextRule) || buildVipUpgradeHint(nextRule)
  }
  return buildVipUpgradeHint(rule) || `需先达到 VIP${Math.max(1, lvl - 1)}`
}

function cardState(lvl) {
  const info = vipInfo.value
  const rule = ruleByLevel.value.get(lvl)
  const levelName = rule?.levelName || `VIP${lvl}`
  const cur = info?.currentLevel ?? 0
  const next = info?.nextLevel ?? (cur > 0 ? cur + 1 : 1)
  const curName = info?.currentLevelName ?? ''
  const nextName = info?.nextLevelName || ruleByLevel.value.get(next)?.levelName || `VIP${next}`
  const { progressLabel, progressPercent } = buildCardProgress(lvl, info, rule)

  if (!info && !rule) {
    return {
      statusText: '加载中...',
      levelName,
      progressLabel: '—',
      progressPercent: 0,
      upgradeHint: ''
    }
  }

  if (cur === 0 && lvl === next) {
    return {
      statusText: '你不是VIP用户',
      levelName,
      progressLabel,
      progressPercent,
      upgradeHint: buildCardUpgradeHint(lvl, info, rule)
    }
  }

  if (lvl < cur) {
    return {
      statusText: '已达成该等级',
      levelName,
      progressLabel,
      progressPercent,
      upgradeHint: buildCardUpgradeHint(lvl, info, rule)
    }
  }

  if (lvl === cur) {
    return {
      statusText: curName ? `当前${curName}` : `当前 VIP${cur}`,
      levelName,
      progressLabel,
      progressPercent,
      upgradeHint: buildCardUpgradeHint(lvl, info, rule)
    }
  }

  if (lvl === next) {
    return {
      statusText: nextName ? `升级至${nextName}` : `升级至 VIP${next}`,
      levelName,
      progressLabel,
      progressPercent,
      upgradeHint: buildCardUpgradeHint(lvl, info, rule)
    }
  }

  return {
    statusText: '未解锁',
    levelName,
    progressLabel,
    progressPercent,
    upgradeHint: buildCardUpgradeHint(lvl, info, rule)
  }
}

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

function syncSwipeToLevel(level) {
  const levels = vipLevels.value
  const n = levels.includes(level)
    ? level
    : (levels[0] ?? 1)
  const idx = Math.max(0, levels.indexOf(n))
  activeSwipeIndex.value = idx
  selectedTab.value = ruleByLevel.value.get(n)?.levelName || `VIP${n}`
  scrollLevelTabIntoView(idx)
  nextTick(() => {
    swipeRef.value?.swipeTo?.(idx)
  })
}

function onSwipeChange(index) {
  activeSwipeIndex.value = index
  selectedTab.value = levelTabs.value[index] || `VIP${index + 1}`
  scrollLevelTabIntoView(index)
}

function selectLevelTab(lv) {
  selectedTab.value = lv
  const idx = levelTabs.value.indexOf(lv)
  const n = idx >= 0 ? vipLevels.value[idx] : parseInt(String(lv).replace(/\D/g, ''), 10)
  const levelIdx = Math.max(0, vipLevels.value.indexOf(n))
  activeSwipeIndex.value = levelIdx
  scrollLevelTabIntoView(levelIdx)
  nextTick(() => {
    swipeRef.value?.swipeTo?.(levelIdx)
  })
}

const fetchVipData = async () => {
  try {
    const [indexData, rules] = await Promise.all([
      getVipIndex().catch(() => null),
      getVipRules().catch(() => [])
    ])
    vipInfo.value = indexData
    vipRules.value = rules
    const focusLevel = indexData?.currentLevel > 0
      ? indexData.currentLevel
      : (indexData?.nextLevel || rules[0]?.levelNo || 1)
    syncSwipeToLevel(focusLevel)
  } catch (error) {
    console.error('加载 VIP 数据失败:', error)
  }
}

onMounted(() => {
  if (userStore.isLogin) {
    refreshProfile().catch(() => {})
  }
  fetchVipData()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/vip-center.less';
@import '@/styles/variables.less';

.vip-priv-empty {
  margin: 0;
  padding: @spacing-lg 0;
  text-align: center;
  font-size: @font-size-sm;
  color: #8f9ab1;
}
</style>

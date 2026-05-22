<template>
  <div class="agent-subpage agent-promotion-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>我的推广</h1>
    </header>

    <div class="promo-card">
      <div class="promo-row">
        <div class="promo-row-icon promo-row-icon--home">
          <img :src="iconPromotionLink" alt="">
        </div>
        <span class="promo-row-label">邀请链接</span>
        <button type="button" class="promo-link-btn" @click="showLinkPopup = true">查看链接</button>
      </div>
      <div class="promo-row promo-row--code">
        <div class="promo-row-icon promo-row-icon--home">
          <img :src="iconInvitationCode" alt="">
        </div>
        <div class="promo-row-text">
          <span>邀请代码</span>
          <span class="promo-code">{{ inviteCode }}</span>
        </div>
        <button type="button" class="promo-copy" aria-label="复制" @click="copyInviteCode">
          <img :src="iconCopy" alt="">
        </button>
      </div>
    </div>

    <h2 class="promo-section-title">推广数据</h2>
    <div class="promo-grid">
      <div v-for="item in statItems" :key="item.key" class="promo-stat">
        <p class="promo-stat-label">{{ item.label }}</p>
        <p class="promo-stat-value">{{ formatStat(item.value) }}</p>
      </div>
    </div>

    <van-popup
      v-model:show="showLinkPopup"
      position="bottom"
      round
      class="promo-link-popup"
      :style="{ maxHeight: '55%' }"
    >
      <div class="promo-popup-inner">
        <div class="promo-popup-head">
          <span class="promo-popup-title">邀请链接</span>
          <button type="button" class="promo-popup-close" aria-label="关闭" @click="showLinkPopup = false">
            <img :src="iconClose" alt="">
          </button>
        </div>
        <p class="promo-popup-desc">复制或分享以下链接，好友注册后计入您的推广。</p>
        <div class="promo-popup-url">{{ inviteFullLink }}</div>
        <button type="button" class="promo-popup-copy-btn" @click="copyInviteLink">复制链接</button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconPromotionLink from '@/assets/icon_invitation_link.svg'
import iconInvitationCode from '@/assets/icon_invitation_code.svg'
import iconCopy from '@/assets/icon_copy.svg'
import iconClose from '@/assets/icon_x.svg'
import toast from '@/components/Toast'

const router = useRouter()

/** 邀请代码：icon_invitation_code.svg；链接：icon_invitation_link.svg */
const inviteCode = ref('afz2z')
const showLinkPopup = ref(false)

const inviteFullLink = computed(() => {
  if (typeof window === 'undefined') return ''
  const base = `${window.location.origin}/register`
  const q = inviteCode.value ? `?code=${encodeURIComponent(inviteCode.value)}` : ''
  return `${base}${q}`
})

const statItems = ref([
  { key: 'd1', label: '今日增加玩家', value: 0 },
  { key: 't1', label: '今日团队新增玩家', value: 0 },
  { key: 'd2', label: '今日投注玩家', value: 0 },
  { key: 't2', label: '今日团队投注玩家', value: 0 },
  { key: 'd3', label: '直属玩家人数', value: 0 },
  { key: 't3', label: '团队总玩家数', value: 0 },
  { key: 'd4', label: '直属代理人数', value: 0 },
  { key: 't4', label: '团队代理人数', value: 0 }
])

const formatStat = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  return v.toLocaleString('zh-CN')
}

const goBack = () => router.back()

const writeClipboard = async (text) => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

const copyInviteCode = async () => {
  try {
    await writeClipboard(inviteCode.value)
    toast.success('已复制邀请代码')
  } catch {
    toast.error('复制失败')
  }
}

const copyInviteLink = async () => {
  try {
    await writeClipboard(inviteFullLink.value)
    toast.success('已复制邀请链接')
    showLinkPopup.value = false
  } catch {
    toast.error('复制失败')
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-promotion.less';
</style>

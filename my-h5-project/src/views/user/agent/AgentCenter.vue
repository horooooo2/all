<template>
  <div class="agent-center-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('代理中心') }}</h1>
    </header>

    <!-- 未申请 -->
    <section v-if="agentStatus === 'none'" class="status-card">
      <div class="status-card-text">
        <p class="status-card-label">{{ $t('您当前还不是代理') }}</p>
        <p class="status-card-title">{{ $t('加入我们开启您的财富之旅') }}</p>
      </div>
      <button type="button" class="status-card-btn" @click="goApply">
        申请成为代理
      </button>
    </section>

    <!-- 申请中（审核中按钮样式） -->
    <section v-else-if="agentStatus === 'pending' && pendingVariant === 'review'" class="status-card">
      <div class="status-card-text">
        <p class="status-card-label">{{ $t('申请中') }}</p>
        <p class="status-card-title">{{ $t('您的代理申请正在审核中') }}</p>
      </div>
      <button type="button" class="status-card-btn" disabled>
        审核中
      </button>
    </section>

    <!-- 申请中（绿字 + 联系客服） -->
    <section
      v-else-if="agentStatus === 'pending' && pendingVariant === 'cs'"
      class="status-card status-card--pending-alt"
    >
      <div class="status-card-text">
        <p class="status-card-label">{{ $t('已提交申请，等待审核通过') }}</p>
        <p class="status-card-title">{{ $t('加入我们开启您的财富之旅') }}</p>
      </div>
      <button type="button" class="status-card-btn" @click="goService">
        联赛客服咨询
      </button>
    </section>

    <!-- 已是代理 -->
    <template v-else-if="agentStatus === 'agent'">
      <div class="agent-dash-wrap">
        <div class="agent-dash-card">
          <div class="agent-dash-account">
            <div class="agent-dash-cell">
              <span class="agent-dash-label">{{ $t('我的账号') }}</span>
              <span class="agent-dash-value">{{ myAccount }}</span>
            </div>
            <div class="agent-dash-vline" aria-hidden="true" />
            <div class="agent-dash-cell">
              <span class="agent-dash-label">{{ $t('上级代理') }}</span>
              <span class="agent-dash-value">{{ superiorId }}</span>
            </div>
          </div>
        </div>

        <div class="agent-dash-card">
          <div class="agent-dash-shortcuts">
            <div
              v-for="item in primaryActions"
              :key="item.action"
              class="agent-dash-shortcut"
              role="button"
              tabindex="0"
              @click="onMenu(item)"
              @keydown.enter.prevent="onMenu(item)"
              @keydown.space.prevent="onMenu(item)"
            >
              <img class="agent-dash-shortcut-icon" :src="item.icon" alt="">
              <span class="agent-dash-shortcut-text">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="agent-sections">
        <div
          v-for="(section, si) in listSections"
          :key="si"
          class="agent-panel-card"
        >
          <div class="agent-panel-block">
            <template v-for="item in section" :key="item.action">
              <div
                v-if="item.action === 'inviteCode'"
                class="agent-panel-row agent-panel-row--invite-code"
              >
                <div
                  class="agent-panel-invite-tap"
                  role="button"
                  tabindex="0"
                  @click="onMenu(item)"
                  @keydown.enter.prevent="onMenu(item)"
                  @keydown.space.prevent="onMenu(item)"
                >
                  <img class="agent-panel-icon" :src="item.icon" alt="">
                  <span>{{ item.label }}</span>
                  <span class="agent-panel-code">{{ inviteCode }}</span>
                </div>
                <div
                  class="agent-panel-copy-btn"
                  role="button"
                  tabindex="0"
                  aria-label="复制邀请代码"
                  @click.stop="copyInviteCode"
                  @keydown.enter.prevent="copyInviteCode"
                  @keydown.space.prevent="copyInviteCode"
                >
                  <img :src="iconCopy" alt="">
                </div>
              </div>
              <div
                v-else
                class="agent-panel-row"
                @click="onMenu(item)"
                role="button"
                tabindex="0"
                @keydown.enter.prevent="onMenu(item)"
                @keydown.space.prevent="onMenu(item)"
              >
                <span class="agent-panel-row-inner">
                  <img class="agent-panel-icon" :src="item.icon" alt="">
                  <span>{{ item.label }}</span>
                </span>
                <img class="agent-panel-arrow" :src="iconArrow" alt="">
              </div>
            </template>
          </div>
        </div>

        <div class="agent-panel-card agent-share">
          <div class="agent-share-btns">
            <div
              class="agent-share-btn"
              role="button"
              tabindex="0"
              @click="onShare('telegram')"
              @keydown.enter.prevent="onShare('telegram')"
              @keydown.space.prevent="onShare('telegram')"
            >
              <img :src="imgTelegram" alt="Telegram">
            </div>
            <div
              class="agent-share-btn"
              role="button"
              tabindex="0"
              @click="onShare('whatsapp')"
              @keydown.enter.prevent="onShare('whatsapp')"
              @keydown.space.prevent="onShare('whatsapp')"
            >
              <img :src="imgWhatsapp" alt="WhatsApp">
            </div>
            <div
              class="agent-share-btn"
              role="button"
              tabindex="0"
              @click="onShare('facebook')"
              @keydown.enter.prevent="onShare('facebook')"
              @keydown.space.prevent="onShare('facebook')"
            >
              <img :src="imgFacebook" alt="Facebook">
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconArrow from '@/assets/icon_dack_line.svg'
import iconPromotion from '@/assets/icon_promotion.svg'
import iconCommission from '@/assets/icon_commission.svg'
import iconTreatment from '@/assets/icon_treatment.svg'
import iconTeamMembers from '@/assets/icon_team_members.svg'
import iconPerformance from '@/assets/icon_performance.svg'
import iconLotteryRecords from '@/assets/icon_lottery_records.svg'
import iconThreePartyRecords from '@/assets/icon_three_party_records.svg'
import iconBillingRecords from '@/assets/icon_billing_records.svg'
import iconAgentFuchi from '@/assets/icon_agent_fuchi.svg'
import iconInvitationLink from '@/assets/icon_invitation_link.svg'
import iconInvitationCode from '@/assets/icon_invitation_code.svg'
import iconCopy from '@/assets/icon_copy.svg'
import imgTelegram from '@/assets/telegram.svg'
import imgWhatsapp from '@/assets/whatsapp.svg'
import imgFacebook from '@/assets/facebook.svg'
import toast from '@/components/Toast'

const router = useRouter()
const route = useRoute()

/** 接入接口后改为 store：none | pending | agent */
const agentStatus = computed(() => {
  const q = route.query.status
  if (q === 'pending') return 'pending'
  if (q === 'none') return 'none'
  return 'agent'
})

const pendingVariant = computed(() => (route.query.pending === 'cs' ? 'cs' : 'review'))

const myAccount = ref('6669_2203456')
const superiorId = ref('123456')
/** 接入接口后改为接口字段 */
const inviteCode = ref('8K2M9')

const primaryActions = [
  { label: t('我的推广'), icon: iconPromotion, action: 'promotion' },
  { label: t('我的佣金'), icon: iconCommission, action: 'commission' },
  { label: t('我的待遇'), icon: iconTreatment, action: 'treatment' }
]

const listSections = [
  [
    { label: t('直属成员'), icon: iconTeamMembers, action: 'team' },
    { label: t('团队业绩报表'), icon: iconPerformance, action: 'performance' },
    { label: t('团队彩票注单记录'), icon: iconLotteryRecords, action: 'lotteryRecords' },
    { label: t('团队三方注单记录'), icon: iconThreePartyRecords, action: 'threePartyRecords' }
  ],
  [
    { label: t('团队账变记录'), icon: iconBillingRecords, action: 'billingRecords' },
    { label: t('代理扶持'), icon: iconAgentFuchi, action: 'agentSupport' }
  ],
  [
    { label: t('邀请链接'), icon: iconInvitationLink, action: 'inviteLink' },
    { label: t('邀请代码'), icon: iconInvitationCode, action: 'inviteCode' }
  ]
]

const goBack = () => router.back()
const goApply = () => router.push({ name: 'agentApply' })
const goService = () => router.push({ name: 'service' })

const AGENT_SUB_ROUTES = {
  promotion: 'agentPromotion',
  commission: 'agentCommission',
  treatment: 'agentTreatment',
  team: 'agentDirectTeam',
  performance: 'agentTeamPerformance',
  lotteryRecords: 'agentTeamLotteryRecords',
  billingRecords: 'agentTeamBillingRecords',
  threePartyRecords: 'agentTeamThreePartyRecords',
  agentSupport: 'agentSupport'
}

const onMenu = (item) => {
  if (item.action === 'inviteLink') {
    router.push({ name: 'createPlayer', query: { tab: 'link' } })
    return
  }
  const name = AGENT_SUB_ROUTES[item.action]
  if (name) {
    router.push({ name })
    return
  }
  toast.success(`${item.label}（待对接）`)
}

const onShare = (channel) => {
  toast.success(`${channel} 分享（待对接）`)
}

const copyInviteCode = async () => {
  const text = inviteCode.value
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    toast.success(t('已复制邀请代码'))
  } catch {
    toast.error(t('复制失败'))
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-center.less';
</style>

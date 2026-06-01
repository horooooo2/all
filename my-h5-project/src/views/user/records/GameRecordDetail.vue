<template>
  <div class="game-record-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('游戏记录详情') }}</h1>
    </header>

    <section v-if="detail" class="detail-list">
      <article class="detail-card">
        <div class="detail-right">
          <img class="status-image" :src="statusIconByKey(detail.status)" alt="status">
          <div v-if="detail.status === 'unsettled'" class="result-amount result-amount--unsettled">{{ $t('未结算') }}</div>
          <div v-else-if="detail.status === 'revoked'" class="result-amount result-amount--revoked">{{ $t('已撤销') }}</div>
          <div v-else class="result-amount" :class="detail.winLoss >= 0 ? 'positive' : 'negative'">
            <span>{{ detail.winLoss >= 0 ? '' : '-' }}{{ formatMoney(Math.abs(detail.winLoss)) }}</span>
            <img class="amount-currency" :src="iconCny" alt="">
          </div>
        </div>
        <div class="card-head">
          <strong>{{ detail.gameName }}</strong>
        </div>
        <div class="row">
          <span class="row-label">{{ $t('平台：') }}</span>
          <span class="row-value">{{ detail.platform }}</span>
        </div>
        <div class="row">
          <span class="row-label">{{ $t('金额：') }}</span>
          <span class="row-value">¥{{ formatMoney(detail.amount) }}</span>
        </div>
        <div class="row">
          <span class="row-label">{{ $t('时间：') }}</span>
          <span class="row-value">{{ detail.orderTime }}</span>
        </div>
        <div class="row">
          <span class="row-label">{{ $t('局号：') }}</span>
          <span class="row-value">{{ detail.roundNo || detail.id }}</span>
          <button type="button" class="copy-btn" @click="copyIssue(detail.roundNo || detail.id)">
            <img :src="iconCopy" alt="copy">
          </button>
        </div>
        <div v-if="detail.orderNo" class="row">
          <span class="row-label">{{ $t('订单号：') }}</span>
          <span class="row-value">{{ detail.orderNo }}</span>
        </div>
        <div class="bet-box">
          <div class="bet-box-line">
            <span class="bet-box-label">{{ $t('投注：') }}</span>
            <span class="bet-box-value">
              <template v-if="parseBetText(detail.betText).odds">
                {{ parseBetText(detail.betText).main }}<span class="bet-odds"> @{{ parseBetText(detail.betText).odds }}</span>
              </template>
              <template v-else>{{ detail.betText || '--' }}</template>
            </span>
          </div>
          <div class="bet-box-line">
            <span class="bet-box-label">投注金额：</span>
            <span class="bet-box-value">¥{{ formatMoney(detail.betAmount) }}</span>
          </div>
          <div class="bet-box-line">
            <span class="bet-box-label">有效投注：</span>
            <span class="bet-box-value">¥{{ formatMoney(detail.validBet) }}</span>
          </div>
          <div class="bet-box-line">
            <span class="bet-box-label">派彩：</span>
            <span class="bet-box-value">¥{{ formatMoney(detail.payout) }}</span>
          </div>
          <div v-if="detail.payoutAt" class="bet-box-line">
            <span class="bet-box-label">派彩时间：</span>
            <span class="bet-box-value">{{ detail.payoutAt }}</span>
          </div>
        </div>
        <div class="total-row">
          <span class="total-row-label">盈亏金额：</span>
          <span class="total-row-value">
            {{ detail.winLoss >= 0 ? '+' : '-' }}¥{{ formatMoney(Math.abs(detail.winLoss)) }}
          </span>
        </div>
      </article>
    </section>

    <div v-else class="detail-empty">
      <p>{{ $t('记录不存在或已删除') }}</p>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'
import { getGameRecordCache } from '@/utils/gameRecordCache'
import { copyTextToClipboard } from '@/utils/copyText'
import iconCopy from '@/assets/icon_copy.svg'
import iconCny from '@/assets/icon_cny.svg'
import iconSettled from '@/assets/icon_settled.svg'
import iconUnsettled from '@/assets/icon_unsettled.svg'
import iconRevoked from '@/assets/icon_revoked.svg'

const statusIconMap = {
  settled: iconSettled,
  unsettled: iconUnsettled,
  revoked: iconRevoked
}
const statusIconByKey = (status) => statusIconMap[status] || iconUnsettled

function parseBetText(text) {
  const s = String(text ?? '')
  const idx = s.lastIndexOf(' @')
  if (idx === -1) return { main: s, odds: '' }
  return { main: s.slice(0, idx), odds: s.slice(idx + 2).trim() }
}

const formatMoney = (value) => {
  const n = Number(value)
  return (Number.isNaN(n) ? 0 : n).toFixed(2)
}

const route = useRoute()
const router = useRouter()
const detail = ref(null)

const load = () => {
  const id = route.query.id
  detail.value = id ? getGameRecordCache(id) : null
}

const goBack = () => router.back()

const copyIssue = async (issueNo) => {
  const ok = await copyTextToClipboard(String(issueNo))
  if (ok) {
    toast.success(t('已复制局号'))
  } else {
    toast.error(t('复制失败'))
  }
}

onMounted(() => {
  load()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/game-record-detail.less';

.game-record-detail-page .detail-empty {
  padding: 48px 16px;
  text-align: center;
  color: #8aa2d6;
  font-size: 14px;
}
</style>

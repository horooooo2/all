<template>
  <div class="game-record-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>游戏记录详情</h1>
    </header>

    <section class="detail-list">
      <article v-for="item in detailRecords" :key="item.id" class="detail-card">
        <div class="detail-right">
          <img class="status-image" :src="statusIconByKey(item.status)" alt="status">
          <div v-if="item.status === 'unsettled'" class="result-amount result-amount--unsettled">未结算</div>
          <div v-else-if="item.status === 'revoked'" class="result-amount result-amount--revoked">已撤销</div>
          <div v-else class="result-amount" :class="item.winLoss >= 0 ? 'positive' : 'negative'">
            <span>{{ item.winLoss >= 0 ? '' : '-' }}{{ Math.abs(item.winLoss) }}</span>
            <img class="amount-currency" :src="iconCny" alt="">
          </div>
        </div>
        <div class="card-head">
          <strong>{{ item.gameName }}</strong>
        </div>
        <div class="row">
          <span class="row-label">平台：</span>
          <span class="row-value">{{ item.platform }}</span>
        </div>
        <div class="row">
          <span class="row-label">金额：</span>
          <span class="row-value">¥{{ item.amount }}</span>
        </div>
        <div class="row">
          <span class="row-label">时间：</span>
          <span class="row-value">{{ item.orderTime }}</span>
        </div>
        <div class="row">
          <span class="row-label">局号：</span>
          <span class="row-value">{{ item.id }}</span>
          <button type="button" class="copy-btn" @click="copyIssue(item.id)">
            <img :src="iconCopy" alt="copy">
          </button>
        </div>
        <div class="result-row">
          <span class="result-row-label">开奖结果：</span>
          <span class="result-row-value">{{ item.resultText }}</span>
        </div>
        <div class="bet-box">
          <div class="bet-box-line">
            <span class="bet-box-label">投注：</span>
            <span class="bet-box-value">
              <template v-if="parseBetText(item.betText).odds">
                {{ parseBetText(item.betText).main }}<span class="bet-odds"> @{{ parseBetText(item.betText).odds }}</span>
              </template>
              <template v-else>{{ item.betText }}</template>
            </span>
          </div>
          <div class="bet-box-line">
            <span class="bet-box-label">投注金额：</span>
            <span class="bet-box-value">¥{{ item.betAmount }}</span>
          </div>
          <div class="bet-box-line">
            <span class="bet-box-label">派彩：</span>
            <span class="bet-box-value">¥{{ item.payout }}</span>
          </div>
        </div>
        <div class="total-row">
          <span class="total-row-label">总投注金额：</span>
          <span class="total-row-value">¥{{ item.betAmount }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'
import { gameRecords } from './game-record.mock'
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

/** 投注文案拆出赔率，如「… @4.28」 */
function parseBetText(text) {
  const s = String(text ?? '')
  const idx = s.lastIndexOf(' @')
  if (idx === -1) return { main: s, odds: '' }
  return { main: s.slice(0, idx), odds: s.slice(idx + 2).trim() }
}

const route = useRoute()
const router = useRouter()

const detailRecords = computed(() => {
  const id = Number(route.query.id)
  if (!id) return gameRecords.slice(0, 2)
  const one = gameRecords.find(i => i.id === id)
  return one ? [one, ...gameRecords.filter(i => i.id !== id).slice(0, 1)] : gameRecords.slice(0, 2)
})

const goBack = () => router.back()

const copyIssue = async (issueNo) => {
  try {
    const text = String(issueNo)
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const input = document.createElement('input')
      input.value = text
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    toast.success('已复制局号')
  } catch (error) {
    toast.error('复制失败')
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/game-record-detail.less';
</style>

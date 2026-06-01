<template>
  <div class="agent-subpage agent-commission-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('我的佣金') }}</h1>
    </header>

    <div class="comm-summary">
      <div class="comm-card">
        <p class="comm-card-label">{{ $t('今日获得返佣') }}</p>
        <p class="comm-card-value">{{ fmt(todayRebate) }}</p>
      </div>
      <div class="comm-card">
        <p class="comm-card-label">{{ $t('本月累计返佣') }}</p>
        <p class="comm-card-value">{{ fmt(monthRebate) }}</p>
      </div>
    </div>

    <div class="comm-row-card">
      <span class="comm-row-label">{{ $t('预计下起发放返佣') }}</span>
      <span class="comm-row-value">{{ fmt(nextRebate) }}</span>
    </div>

    <h2 class="comm-section-title">{{ $t('直属数据') }}</h2>
    <div class="comm-data-card">
      <div class="comm-data-row">
        <span class="comm-data-label">{{ $t('今日有效投注') }}</span>
        <span class="comm-data-value">{{ fmt(directBet) }}</span>
      </div>
      <div class="comm-data-row">
        <span class="comm-data-label">{{ $t('今日盈亏') }}</span>
        <span class="comm-data-value">{{ fmt(directPnL) }}</span>
      </div>
    </div>

    <h2 class="comm-section-title">{{ $t('团队数据') }}</h2>
    <div class="comm-data-card">
      <div class="comm-data-row">
        <span class="comm-data-label">{{ $t('今日有效投注') }}</span>
        <span class="comm-data-value">{{ fmt(teamBet) }}</span>
      </div>
      <div class="comm-data-row">
        <span class="comm-data-label">{{ $t('今日盈亏') }}</span>
        <span class="comm-data-value">{{ fmt(teamPnL) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const todayRebate = ref(0)
const monthRebate = ref(0)
const nextRebate = ref(0)
const directBet = ref(0)
const directPnL = ref(0)
const teamBet = ref(0)
const teamPnL = ref(0)

const fmt = (n) => `¥${Number(n).toFixed(0)}`

const goBack = () => router.back()
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-commission.less';
</style>

<template>
  <div class="agent-subpage agent-team-perf-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('代理收入') }}</h1>
    </header>

    <div class="perf-period">
      <button type="button" class="perf-period-btn" @click="pickerVisible = true">
        <span>{{ periodLabel }}</span>
        <van-icon name="arrow-down" />
      </button>
    </div>

    <div class="perf-summary">
      <div class="perf-row">
        <div v-for="c in summaryRows[0]" :key="c.key" class="perf-cell">
          <span class="perf-label">{{ c.label }}</span>
          <p class="perf-value">{{ fmtMoney(summary[c.key]) }}</p>
        </div>
      </div>
      <div class="perf-row">
        <div v-for="c in summaryRows[1]" :key="c.key" class="perf-cell">
          <span class="perf-label">{{ c.label }}</span>
          <p class="perf-value">{{ fmtMoney(summary[c.key]) }}</p>
        </div>
      </div>
      <div class="perf-row">
        <div v-for="c in summaryRows[2]" :key="c.key" class="perf-cell">
          <span class="perf-label">{{ c.label }}</span>
          <p class="perf-value">
            {{ c.money ? fmtMoney(summary[c.key]) : summary[c.key] }}
          </p>
        </div>
      </div>
      <div class="perf-row">
        <div v-for="c in summaryRows[3]" :key="c.key" class="perf-cell">
          <span class="perf-label">{{ c.label }}</span>
          <p class="perf-value">
            {{ c.money ? fmtMoney(summary[c.key]) : summary[c.key] }}
          </p>
        </div>
      </div>
      <div class="perf-row">
        <div v-for="c in summaryRows[4]" :key="c.key" class="perf-cell">
          <span class="perf-label">{{ c.label }}</span>
          <p class="perf-value">
            {{ c.money ? fmtMoney(summary[c.key]) : summary[c.key] }}
          </p>
        </div>
      </div>
      <div class="perf-row perf-row--full">
        <div class="perf-cell">
          <span class="perf-label">{{ summaryFullRow.label }}</span>
          <p class="perf-value">{{ summary[summaryFullRow.key] }}</p>
        </div>
      </div>
    </div>

    <div class="perf-table-wrap">
      <table class="perf-table">
        <thead>
          <tr>
            <th>{{ $t('类型') }}</th>
            <th>{{ $t('有效投注') }}</th>
            <th>{{ $t('团队赢亏') }}</th>
            <th>{{ $t('返佣金额') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in categoryRows" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ fmtMoney(row.validBet) }}</td>
            <td>{{ fmtMoney(row.teamPnL) }}</td>
            <td>{{ fmtMoney(row.commission) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <van-popup
      v-model:show="pickerVisible"
      position="bottom"
      round
      class="perf-picker-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="perf-picker-head">
        <span class="perf-picker-title">{{ $t('时间范围') }}</span>
        <button type="button" class="perf-picker-close" :aria-label="$t('关闭')" @click="pickerVisible = false">
          <img :src="iconClose" alt="">
        </button>
      </div>
      <div class="perf-picker-list">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          type="button"
          class="perf-picker-row"
          :class="{ 'perf-picker-row--active': period === opt.value }"
          @click="selectPeriod(opt)"
        >
          <span class="perf-picker-label">{{ opt.label }}</span>
          <img v-if="period === opt.value" class="perf-picker-check" :src="iconSelected" alt="">
          <span v-else class="perf-picker-radio" aria-hidden="true" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'

const router = useRouter()
const period = ref('month')
const periodOptions = [
  { value: 'month', label: t('本月') },
  { value: 'lastMonth', label: t('上月') },
  { value: '30d', label: t('近30日') }
]

const periodLabel = computed(() => periodOptions.find((o) => o.value === period.value)?.label ?? t('本月')
const pickerVisible = ref(false)

const selectPeriod = (opt) => {
  period.value = opt.value
  pickerVisible.value = false
}

const summaryRows = [
  [
    { key: 'teamValidBet', label: t('团队有效投注'), money: true },
    { key: 'teamPnL', label: t('团队赢亏'), money: true },
    { key: 'agentCommission', label: t('代理返佣'), money: true }
  ],
  [
    { key: 'lotteryValidBet', label: t('彩票有效投注'), money: true },
    { key: 'lotteryPnL', label: t('彩票赢亏'), money: true },
    { key: 'lotteryRebate', label: t('彩票赚水'), money: true }
  ],
  [
    { key: 'activityBonus', label: t('活动彩金'), money: true },
    { key: 'teamSize', label: t('团队人数'), money: false },
    { key: 'validPlayers', label: t('有效玩家'), money: false }
  ],
  [
    { key: 'newPlayers', label: t('新增玩家'), money: false },
    { key: 'withdrawUsers', label: t('提现人数'), money: false },
    { key: 'withdrawAmount', label: t('提现金额'), money: true }
  ],
  [
    { key: 'teamBalance', label: t('团队余额'), money: true },
    { key: 'rechargeUsers', label: t('充值人数'), money: false },
    { key: 'rechargeAmount', label: t('充值金额'), money: true }
  ]
]

const summaryFullRow = { key: 'bettingUsers', label: t('投注人数') }

const summary = reactive({
  teamValidBet: 0,
  teamPnL: 0,
  agentCommission: 0,
  lotteryValidBet: 0,
  lotteryPnL: 0,
  lotteryRebate: 0,
  activityBonus: 0,
  teamSize: 0,
  validPlayers: 0,
  newPlayers: 0,
  withdrawUsers: 0,
  withdrawAmount: 0,
  teamBalance: 0,
  rechargeUsers: 0,
  rechargeAmount: 0,
  bettingUsers: 0
})

const categoryRows = ref([
  { name: t('电子'), validBet: 0, teamPnL: 0, commission: 0 },
  { name: t('棋牌'), validBet: 0, teamPnL: 0, commission: 0 },
  { name: t('视讯'), validBet: 0, teamPnL: 0, commission: 0 },
  { name: t('捕鱼'), validBet: 0, teamPnL: 0, commission: 0 },
  { name: t('体育'), validBet: 0, teamPnL: 0, commission: 0 }
])

const fmtMoney = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '¥0'
  const s = v.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  return `¥${s}`
}

const goBack = () => router.back()
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-team-performance.less';
</style>

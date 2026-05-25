<template>
  <div class="today-profit-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>今日赢亏</h1>
    </header>

    <section class="total-card">
      <div class="total-left">
        <span class="label">赢亏金额</span>
        <strong :class="summary.profitAmount >= 0 ? 'positive' : 'negative'">
          {{ summary.profitAmount >= 0 ? '+' : '-' }}¥{{ formatMoney(Math.abs(summary.profitAmount)) }}
        </strong>
      </div>
      <button type="button" class="time-btn" @click="showTimePopup = true">
        <span>{{ currentTimeText }}</span>
        <van-icon name="arrow-down" />
      </button>
    </section>

    <p class="formula-text">赢亏金额 = 派彩金额 - 投注金额</p>

    <section v-if="loading" class="loading-tip">加载中...</section>

    <section v-else class="stat-grid">
      <div
        v-for="item in statItems"
        :key="item.key"
        class="stat-item"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.isCount ? item.value : `¥${formatMoney(item.value)}` }}</strong>
      </div>
    </section>

    <section v-if="!loading && platforms.length" class="platform-section">
      <h3 class="platform-title">各平台明细</h3>
      <article
        v-for="item in platforms"
        :key="item.platformName"
        class="platform-card"
      >
        <div class="platform-name">{{ item.platformName }}</div>
        <div class="platform-grid">
          <div class="platform-stat">
            <span>投注</span>
            <strong>¥{{ formatMoney(item.betAmount) }}</strong>
          </div>
          <div class="platform-stat">
            <span>有效投注</span>
            <strong>¥{{ formatMoney(item.validBet) }}</strong>
          </div>
          <div class="platform-stat">
            <span>派彩</span>
            <strong>¥{{ formatMoney(item.payoutAmount) }}</strong>
          </div>
          <div class="platform-stat">
            <span>盈亏</span>
            <strong :class="item.profitAmount >= 0 ? 'positive' : 'negative'">
              {{ item.profitAmount >= 0 ? '+' : '-' }}¥{{ formatMoney(Math.abs(item.profitAmount)) }}
            </strong>
          </div>
        </div>
      </article>
    </section>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="custom-popup">
      <div class="popup-title-row">
        <span>时间选择</span>
        <img :src="iconClose" alt="close" @click="showTimePopup = false">
      </div>
      <div class="time-list">
        <button
          v-for="item in timeOptions"
          :key="item.value"
          type="button"
          class="time-item"
          :class="{ active: selectedTime === item.value }"
          @click="selectTime(item.value)"
        >
          <span>{{ item.label }}</span>
          <img
            v-if="selectedTime === item.value"
            class="selected-icon"
            :src="iconSelected"
            alt="selected"
          >
          <span v-else class="circle-icon" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import toast from '@/components/Toast'
import { fetchRecordProfit, resolveProfitPeriodParams } from '@/api/record'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const emptySummary = () => ({
  orderCount: 0,
  betAmount: 0,
  validBet: 0,
  payoutAmount: 0,
  profitAmount: 0
})

const summary = ref(emptySummary())
const platforms = ref([])
const loading = ref(false)

const timeOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近七天', value: 'week' },
  { label: '本周', value: 'thisWeek' },
  { label: '上周', value: 'lastWeek' },
  { label: '本月', value: 'thisMonth' }
]

const selectedTime = ref('today')
const showTimePopup = ref(false)

const currentTimeText = computed(
  () => timeOptions.find((i) => i.value === selectedTime.value)?.label || '今天'
)

const statItems = computed(() => [
  { key: 'orderCount', label: '订单数量', value: summary.value.orderCount, isCount: true },
  { key: 'bet', label: '投注金额', value: summary.value.betAmount },
  { key: 'validBet', label: '有效投注', value: summary.value.validBet },
  { key: 'payout', label: '派彩金额', value: summary.value.payoutAmount },
  { key: 'profit', label: '盈亏金额', value: summary.value.profitAmount }
])

const formatMoney = (value) => {
  const n = Number(value)
  return (Number.isNaN(n) ? 0 : n).toFixed(2)
}

const loadProfit = async () => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/today-profit-loss' } })
    return
  }

  loading.value = true
  try {
    const params = resolveProfitPeriodParams(selectedTime.value)
    const res = await fetchRecordProfit(params)
    summary.value = res.summary
    platforms.value = res.platforms
  } catch (error) {
    console.error('加载盈亏数据失败:', error)
    summary.value = emptySummary()
    platforms.value = []
    toast.error('加载盈亏数据失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

const selectTime = (value) => {
  selectedTime.value = value
  showTimePopup.value = false
  loadProfit()
}

onMounted(() => {
  loadProfit()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/today-profit-loss.less';

.today-profit-page .total-left strong.positive {
  color: #e62e2e;
}

.today-profit-page .total-left strong.negative {
  color: #1f9d4c;
}

.today-profit-page .loading-tip {
  margin: 0 @spacing-md @spacing-md;
  text-align: center;
  font-size: @font-size-sm;
  color: var(--text-color-tertiary);
}

.today-profit-page .platform-section {
  margin: @spacing-md;
}

.today-profit-page .platform-title {
  margin: 0 0 @spacing-sm;
  font-size: @font-size-md;
  font-weight: 600;
  color: var(--text-color);
}

.today-profit-page .platform-card {
  margin-bottom: @spacing-sm;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  background: var(--bg-module);
}

.today-profit-page .platform-name {
  margin-bottom: @spacing-sm;
  font-size: @font-size-md;
  font-weight: 600;
  color: var(--text-color);
}

.today-profit-page .platform-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: @spacing-sm;
}

.today-profit-page .platform-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: @font-size-sm;
    color: var(--text-color-tertiary);
  }

  strong {
    font-size: @font-size-md;
    color: var(--text-color);
    font-weight: 600;
  }

  strong.positive {
    color: #e62e2e;
  }

  strong.negative {
    color: #1f9d4c;
  }
}
</style>

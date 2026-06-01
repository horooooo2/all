<template>
  <div class="full-trend-page">
    <header class="trend-header" role="banner">
      <div class="trend-header__left">
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          :aria-label="$t('返回')"
          @click="goBack"
          @keydown.enter.prevent="goBack"
          @keydown.space.prevent="goBack"
        >
          <img class="icon-img" :src="iconBack" alt="" aria-hidden="true" />
        </div>
        <div class="title">{{ pageTitle }}</div>
      </div>

      <button type="button" class="bet-btn" @click="goBet">{{ $t('去投注') }}</button>
    </header>

    <div class="trend-sub">
      <span class="sub-text">第 {{ currentIssue }} 期,截止时间:{{ cutoffText }}</span>
    </div>

    <div class="trend-actions">
      <button type="button" class="primary-tab">{{ $t('开奖号码') }}</button>
    </div>

    <main class="trend-table-wrap" role="main">
      <div class="trend-table" role="table" aria-label="完整走势">
        <div class="trend-row trend-row--head" role="row">
          <div class="col col-issue" role="columnheader">{{ $t('期号') }}</div>
          <div class="col col-nums" role="columnheader">{{ $t('开奖号码/总和') }}</div>
          <div class="col col-sum" role="columnheader">{{ $t('总和双面') }}</div>
          <div class="col col-ext1" role="columnheader">{{ $t('极值') }}</div>
          <div class="col col-ext2" role="columnheader">{{ $t('形态') }}</div>
          <div class="col col-tail" role="columnheader">尾</div>
        </div>

        <div v-for="row in trendRows" :key="row.issue" class="trend-row" role="row">
          <div class="col col-issue" role="cell">{{ row.issue }}</div>

          <div class="col col-nums" role="cell">
            <span class="nums-text">{{ row.nums[0] }}+{{ row.nums[1] }}+{{ row.nums[2] }}={{ row.sum }}</span>
          </div>

          <div class="col col-sum" role="cell">
            <span class="tag" :class="row.bigSmall === '大' ? 'is-red' : 'is-blue'">{{ row.bigSmall }}</span>
            <span class="tag" :class="row.oddEven === '单' ? 'is-red' : 'is-blue'">{{ row.oddEven }}</span>
          </div>

          <div class="col col-ext1" role="cell">
            <span class="tag" :class="row.extreme === t('极小') ? 'is-blue' : row.extreme ? 'is-red' : 'is-muted'">
              {{ row.extreme || '—' }}
            </span>
          </div>

          <div class="col col-ext2" role="cell">
            <span class="tag" :class="row.shape === t('对子') ? 'is-red' : row.shape ? 'is-green' : 'is-muted'">
              {{ row.shape || '—' }}
            </span>
          </div>

          <div class="col col-tail" role="cell">{{ row.tail }}</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => String(route.query.gameName || t('加拿大28')))

// TODO: 后续接真实接口；目前用静态数据走通样式与交互
const currentIssue = ref('3415704')
const remainingSeconds = ref(51)

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, '0')
}

const cutoffText = computed(() => {
  const s = Math.max(0, Number(remainingSeconds.value || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(ss)}`
})

let timer

function startCountdown() {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (remainingSeconds.value <= 0) return
    remainingSeconds.value -= 1
  }, 1000)
}

onMounted(() => {
  startCountdown()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const trendRows = ref([
  { issue: '3333339', nums: [6, 2, 8], sum: 16, bigSmall: '大', oddEven: '双', extreme: '', shape: '', tail: 6 },
  { issue: '3333338', nums: [0, 1, 0], sum: 1, bigSmall: '小', oddEven: '单', extreme: t('极小'), shape: t('对子'), tail: 1 },
  { issue: '3333337', nums: [0, 1, 0], sum: 1, bigSmall: '小', oddEven: '单', extreme: t('极小'), shape: t('对子'), tail: 1 },
  { issue: '3333336', nums: [9, 1, 0], sum: 10, bigSmall: '小', oddEven: '双', extreme: '', shape: '顺子', tail: 0 },
  { issue: '3333335', nums: [0, 1, 0], sum: 1, bigSmall: '小', oddEven: '单', extreme: t('极小'), shape: t('对子'), tail: 1 }
])

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function goBet() {
  // 从游戏房间进来的：直接返回即可；后续如需跳到“投注区”可改为带参数路由
  goBack()
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.full-trend-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.trend-header {
  height: 48px;
  padding: 6px @spacing-md;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #dbe7ff;
}

.trend-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  padding: 0;
  background: #eef4ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.icon-img {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
}

.title {
  font-size: @font-size-xl;
  font-weight: 700;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.bet-btn {
  width: 84px;
  height: 34px;
  border-radius: 6px;
  border: 1px solid #0065ff;
  background: #fff;
  color: #0065ff;
  font-size: @font-size-md;
  font-weight: 600;
  cursor: pointer;
}

.trend-sub {
  padding: 10px @spacing-md;
  color: #6a7892;
  font-size: @font-size-md;
  border-bottom: 1px solid #dbe7ff;
}

.trend-actions {
  padding: 10px @spacing-md;
  border-bottom: 1px solid #dbe7ff;
}

.primary-tab {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 4px;
  background: #0065ff;
  color: #fff;
  font-size: @font-size-md;
  font-weight: 600;
}

.trend-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.trend-table {
  width: 100%;
}

.trend-row {
  display: flex;
  align-items: stretch;
  min-height: 40px;
  border-bottom: 1px solid #dbe7ff;
}

.trend-row--head {
  background: #e5efff;
  color: #1d1d1f;
  font-size: @font-size-sm;
  font-weight: 600;
}

.trend-row:nth-child(even):not(.trend-row--head) {
  background: #f7faff;
}

.col {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 6px;
  box-sizing: border-box;
  font-size: @font-size-sm;
  color: #1d1d1f;
  border-right: 1px solid #dbe7ff;
}

.trend-row .col:last-child {
  border-right: none;
}

.col-issue {
  width: 78px;
}

.col-nums {
  width: 130px;
}

.col-sum {
  width: 88px;
  gap: 6px;
}

.col-ext1 {
  width: 52px;
}

.col-ext2 {
  width: 52px;
}

.col-tail {
  width: 45px;
}

.nums-text {
  color: #08d836;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.tag {
  font-weight: 400;
  line-height: 1;
}

.is-blue {
  color: #0065ff;
}

.is-red {
  color: #ff3b30;
}

.is-green {
  color: #08d836;
}

.is-muted {
  color: #6a7892;
}
</style>


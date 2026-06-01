<template>
  <div class="lottery-bet-record">
    <!-- 顶栏Tab 样式对齐 /my-rebate（MyRebate.vue + my-rebate.less-->
    <header class="record-header">
      <img :src="iconBack" alt="" class="back-btn" @click="goBack" />
      <h1>{{ $t('投注记录') }}</h1>
      <div
        class="record-header__filter"
        role="button"
        tabindex="0"
        :aria-label="`时间筛选，当前 ${timeFilterSummary}`"
        @click="onFilter"
        @keydown.enter.prevent="onFilter"
        @keydown.space.prevent="onFilter"
      >
        <img :src="iconFilter" alt="" class="record-header__filter-img" aria-hidden="true" />
      </div>
    </header>

    <section class="top-tabs" aria-label="记录类型">
      <div
        class="top-tab"
        role="tab"
        :aria-selected="mainTab === 'normal'"
        tabindex="0"
        :class="{ active: mainTab === 'normal' }"
        @click="mainTab = 'normal'"
        @keydown.enter.prevent="mainTab = 'normal'"
        @keydown.space.prevent="mainTab = 'normal'"
      >
        普通记
      </div>
      <div
        class="top-tab"
        role="tab"
        :aria-selected="mainTab === 'chase'"
        tabindex="0"
        :class="{ active: mainTab === 'chase' }"
        @click="mainTab = 'chase'"
        @keydown.enter.prevent="mainTab = 'chase'"
        @keydown.space.prevent="mainTab = 'chase'"
      >
        追号记录
      </div>
    </section>

    <!-- .top-tabs 同宽双列：左列对齐「普通记录」，右列对齐「追号记录-->
    <div class="lbr-subbar">
      <div class="lbr-subbar__col lbr-subbar__col--left">
        <span class="lbr-subbar__game">{{ $t('加拿大28') }}</span>
      </div>
      <div class="lbr-subbar__col lbr-subbar__col--right">
        <div
          class="lbr-subbar__scope"
          role="button"
          tabindex="0"
          aria-label="订单状态"
          aria-haspopup="listbox"
          :aria-expanded="statusFilterOpen ? 'true' : 'false'"
          @click="statusFilterOpen = true"
          @keydown.enter.prevent="statusFilterOpen = true"
          @keydown.space.prevent="statusFilterOpen = true"
        >
          <span>{{ statusFilterLabel }}</span>
          <van-icon name="arrow-down" class="lbr-subbar__scope-icon" />
        </div>
      </div>
    </div>

    <section class="lbr-body">
    <main class="lbr-main">
      <template v-if="!displayRecords.length">
        <div class="lbr-empty">
          <img class="lbr-empty__img" :src="noDataImage" alt="" aria-hidden="true" />
          <p class="lbr-empty__text">{{ emptyText }}</p>
        </div>
      </template>

      <template v-else>
        <div
          v-for="row in displayRecords"
          :key="row.id"
          class="lbr-card"
          role="button"
          tabindex="0"
          @click="onCard(row)"
          @keydown.enter.prevent="onCard(row)"
          @keydown.space.prevent="onCard(row)"
        >
          <div class="lbr-card__row1">
            <span class="lbr-pill" :class="`is-${row.statusKey}`">{{ row.statusText }}</span>
            <div class="lbr-card__bet">
              {{ row.betPrefix }}<span class="hl">{{ row.betPick }}</span> <span class="num">{{ row.betStake }}</span>
            </div>
            <div class="lbr-card__bonus">
              <span class="lbr-card__bonus-label">{{ $t('奖金:') }}</span>
              <span class="lbr-card__bonus-val">{{ row.bonus }}</span>
              <van-icon name="arrow" class="lbr-card__chev" />
            </div>
          </div>
          <div class="lbr-card__row2">
            <span class="lbr-card__time">{{ row.time }}</span>
            <span class="lbr-card__rebate"><em>{{ $t('返水:') }}</em> {{ row.rebate }}</span>
          </div>
        </div>
      </template>
    </main>
    </section>

    <van-popup
      v-model:show="showTimePopup"
      position="bottom"
      round
      teleport="body"
      class="custom-popup lottery-game-time-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="time-panel">
        <h3>{{ $t('下单时间') }}</h3>
        <div class="quick-row">
          <button
            v-for="item in timePeriodOptions"
            :key="item.value"
            type="button"
            class="quick-item"
            :class="{ active: draftTimePeriod === item.value }"
            @click="draftTimePeriod = item.value"
          >
            {{ item.label }}
            <img v-if="draftTimePeriod === item.value" class="selected-icon" :src="iconSelected" alt="">
            <span v-else class="circle-icon" />
          </button>
        </div>

        <div class="lbr-time-issue">
          <input
            v-model.trim="draftIssueKeyword"
            class="lbr-time-issue__input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="筛选期号"
          >
        </div>

        <div class="action-row">
          <button type="button" class="btn-reset" @click="resetTimePopup">{{ $t('重置') }}</button>
          <button type="button" class="btn-confirm" @click="confirmTime">{{ $t('确定') }}</button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="statusFilterOpen" position="bottom" round teleport="body" class="lbr-status-popup">
      <div class="lbr-status-sheet">
        <div class="lbr-status-sheet__head">
          <span class="lbr-status-sheet__title">{{ $t('状态选择') }}</span>
          <button type="button" class="lbr-status-sheet__close" :aria-label="$t('关闭')" @click="statusFilterOpen = false">
            <van-icon name="cross" />
          </button>
        </div>
        <div class="lbr-status-sheet__list" role="listbox" aria-label="订单状态">
          <div
            v-for="opt in statusFilterOptions"
            :key="opt.value"
            class="lbr-status-sheet__row"
            role="option"
            tabindex="0"
            :class="{ active: statusFilter === opt.value }"
            :aria-selected="statusFilter === opt.value ? 'true' : 'false'"
            @click="selectStatusFilter(opt.value)"
            @keydown.enter.prevent="selectStatusFilter(opt.value)"
            @keydown.space.prevent="selectStatusFilter(opt.value)"
          >
            <span class="lbr-status-sheet__label">{{ opt.label }}</span>
            <span v-if="statusFilter === opt.value" class="lbr-status-sheet__tick" aria-hidden="true">
              <van-icon name="success" />
            </span>
            <span v-else class="lbr-status-sheet__radio" aria-hidden="true" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDemoBetRecordsBundle } from './lottery-bet-records.mock'
import iconBack from '@/assets/icon_dack.svg'
import iconFilter from '@/assets/icon_filter.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'

const router = useRouter()
const mainTab = ref('normal')

/** 列表上方：订单状态 */
const statusFilterOpen = ref(false)
const statusFilter = ref('all')
const statusFilterOptions = [
  { value: 'all', label: t('所有') },
  { value: 'pending', label: t('未开奖') },
  { value: 'loss', label: t('未中奖') },
  { value: 'win', label: t('已中奖') },
  { value: 'canceled', label: t('已撤单') }
]

const statusFilterLabel = computed(
  () => statusFilterOptions.find((o) => o.value === statusFilter.value)?.label ?? t('所有')
)

const startOfDay = (d) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const endOfDay = (d) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

const inRange = (timeText, start, end) => {
  const d = new Date(String(timeText).replace(/-/g, '/'))
  if (Number.isNaN(d.getTime())) return false
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  return d >= s && d <= e
}

/** 右上角：今天 / 昨天 / 本周 / 本月 + 期号（无具体日期点选） */
const timePeriodOptions = [
  { label: '今天', value: 'today' },
  { label: t('昨天'), value: 'yesterday' },
  { label: t('本周'), value: 'week' },
  { label: t('本月'), value: 'month' }
]

const appliedTimePeriod = ref('today')
const appliedIssueKeyword = ref('')

const draftTimePeriod = ref('today')
const draftIssueKeyword = ref('')

const listFilterStart = ref(startOfDay(new Date()))
const listFilterEnd = ref(endOfDay(new Date()))

function rangeForPeriod(period) {
  const now = new Date()
  if (period === 'today') {
    return { start: startOfDay(now), end: endOfDay(now) }
  }
  if (period === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return { start: startOfDay(y), end: endOfDay(y) }
  }
  if (period === 'week') {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const start = new Date(now)
    start.setDate(now.getDate() + mondayOffset)
    return { start: startOfDay(start), end: endOfDay(now) }
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: startOfDay(start), end: endOfDay(now) }
}

function applyPeriodToListRange(period) {
  const { start, end } = rangeForPeriod(period)
  listFilterStart.value = start
  listFilterEnd.value = end
}

applyPeriodToListRange(appliedTimePeriod.value)

const showTimePopup = ref(false)

const timeFilterSummary = computed(() => {
  const label = timePeriodOptions.find((o) => o.value === appliedTimePeriod.value)?.label ?? ''
  const q = appliedIssueKeyword.value
  return q ? `${label} · 期号${q}` : label
})

function openTimeFilter() {
  draftTimePeriod.value = appliedTimePeriod.value
  draftIssueKeyword.value = appliedIssueKeyword.value
  showTimePopup.value = true
}

function resetTimePopup() {
  draftTimePeriod.value = 'today'
  draftIssueKeyword.value = ''
}

function confirmTime() {
  appliedTimePeriod.value = draftTimePeriod.value
  appliedIssueKeyword.value = draftIssueKeyword.value.trim()
  applyPeriodToListRange(appliedTimePeriod.value)
  showTimePopup.value = false
}

/** 演示数据 lottery-bet-records.mock.js；接接口后改为请求结果 */
const demoBundle = getDemoBetRecordsBundle()
const normalRecords = ref([...demoBundle.normal])
const chaseRecords = ref([...demoBundle.chase])

const displayRecords = computed(() => {
  const source = mainTab.value === 'chase' ? chaseRecords.value : normalRecords.value
  let rows = source.filter((r) => inRange(r.time, listFilterStart.value, listFilterEnd.value))
  const q = appliedIssueKeyword.value
  if (q) rows = rows.filter((r) => String(r.issue ?? '').includes(q))
  const f = statusFilter.value
  if (f !== 'all') rows = rows.filter((r) => r.statusKey === f)
  return rows
})

const emptyText = computed(() =>
  mainTab.value === 'chase' ? '暂无追号订单记录' : '暂无普通订单记录'
)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push({ name: 'liveLotteryRoom' })
}

function onFilter() {
  openTimeFilter()
}

function selectStatusFilter(value) {
  statusFilter.value = value
  statusFilterOpen.value = false
}

function onCard(row) {
  router.push({ name: 'lotteryBetOrderDetail', query: { id: row.id } })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lottery-bet-record {
  height: 100vh;
  height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f1f5ff;
  box-sizing: border-box;
  padding-top: 44px;
}

/* —my-rebate.less .record-header / .back-btn 一致，并增加右侧筛—*/
.record-header {
  height: 44px;
  padding: 0 @spacing-md;
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  background: var(--bg-module);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-sizing: border-box;

  h1 {
    margin: 0;
    font-size: @font-size-lg;
    color: #1d2433;
    font-weight: 600;
    text-align: center;
    justify-self: center;
  }
}

.back-btn {
  width: @icon-dack-size;
  height: @icon-dack-size;
  border-radius: 4px;
  padding: 0;
  display: block;
  object-fit: contain;
  justify-self: start;
  cursor: pointer;
}

.record-header__filter {
  justify-self: end;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.record-header__filter-img {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

/* —my-rebate.less .top-tabs / .top-tab 一致（使用 div 实现—*/
.top-tabs {
  flex-shrink: 0;
  height: 48px;
  background: var(--bg-module);
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #d3ddef;
}

.top-tab {
  border: none;
  background: transparent;
  color: #8d9ab5;
  font-size: @font-size-md;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  &.active {
    color: #1d2433;
    font-weight: 600;
  }

  &.active::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 0;
    height: 3px;
    border-radius: 3px;
    background: #1f6dff;
  }
}

.lbr-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: @spacing-sm @spacing-md calc(@spacing-md + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.lbr-subbar {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: @spacing-sm 0;
  margin: 0;
  background: transparent;
  box-sizing: border-box;
}

.lbr-subbar__col {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.lbr-subbar__game {
  /* 相对12px 上跳两档：sm md lg */
  font-size: @font-size-lg;
  font-weight: 700;
  color: #2b3855;
  line-height: 1.2;
}

.lbr-subbar__scope {
  min-width: 80px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d8e2f3;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: @font-size-md;
  font-weight: 500;
  color: #3a4765;
  box-sizing: border-box;
  cursor: pointer;
  line-height: 1.2;
}

.lbr-subbar__scope-icon {
  font-size: @font-size-sm;
  line-height: 1;
  display: flex;
  align-items: center;
}

.lbr-main {
  padding: 0;
  box-sizing: border-box;
}

.lbr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px 48px;
  text-align: center;
}

.lbr-empty__img {
  width: 180px;
  height: 180px;
  object-fit: contain;
  display: block;
  margin-bottom: 12px;
}

.lbr-empty__text {
  margin: 0;
  font-size: 12px;
  color: #8c9aaf;
  line-height: 1.4;
}

.lbr-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  box-sizing: border-box;
  cursor: pointer;
}

.lbr-card__row1 {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.lbr-pill {
  flex-shrink: 0;
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.lbr-pill.is-pending {
  background: #ff9f43;
}

.lbr-pill.is-loss {
  background: #07c160;
}

.lbr-pill.is-win {
  background: #ee0a24;
}

.lbr-pill.is-canceled {
  background: #969799;
}

.lbr-card__bet {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  font-weight: 600;
  color: #2f3b58;
  line-height: 20px;
}

.lbr-card__bet .hl {
  color: #0065ff;
}

.lbr-card__bet .num {
  color: #07c160;
  font-weight: 700;
}

.lbr-card__bonus {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #6a7892;
}

.lbr-card__bonus-val {
  color: #0065ff;
  font-weight: 600;
}

.lbr-card__chev {
  color: #c5cedd;
  font-size: 12px;
  transform: rotate(90deg);
}

.lbr-card__row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #8c9aaf;
}

.lbr-card__rebate em {
  font-style: normal;
  color: #8c9aaf;
}

.lbr-card__rebate {
  color: #0065ff;
  font-weight: 500;
}

.lbr-status-popup {
  border-radius: 16px 16px 0 0;
}

.lbr-status-sheet {
  padding: 14px 16px calc(20px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.lbr-status-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.lbr-status-sheet__title {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.lbr-status-sheet__close {
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #e8f0ff;
  color: #1f6dff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .van-icon {
    font-size: 14px;
  }
}

.lbr-status-sheet__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lbr-status-sheet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 10px;
  font-size: 15px;
  color: #8c8c8c;
  cursor: pointer;
  box-sizing: border-box;
}

.lbr-status-sheet__row.active {
  background: #e8f0ff;
  color: #1d1d1f;
  font-weight: 500;
}

.lbr-status-sheet__label {
  flex: 1;
  min-width: 0;
}

.lbr-status-sheet__radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #c5cedd;
  box-sizing: border-box;
  flex-shrink: 0;
}

.lbr-status-sheet__tick {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1f6dff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .van-icon {
    font-size: 12px;
    line-height: 1;
  }
}
</style>

<style lang="less">
/* van-popup teleport body 时，与游戏记录同款时间弹层需全局样式 */
@import '@/styles/pages/record-game-time-popup-global.less';

.lottery-game-time-popup .lbr-time-issue {
  margin-top: @spacing-sm;
}

.lottery-game-time-popup .lbr-time-issue__input {
  width: 100%;
  height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: @border-radius-md;
  background: var(--bg-module);
  font-size: @font-size-md;
  color: var(--text-color);

  &::placeholder {
    color: var(--text-color-tertiary);
  }
}
</style>

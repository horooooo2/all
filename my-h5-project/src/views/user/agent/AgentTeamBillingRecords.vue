<template>
  <div class="agent-subpage agent-team-billing-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>团队账变记录</h1>
    </header>

    <div class="billing-toolbar">
      <div class="billing-toolbar-row">
        <div class="billing-segments">
          <button
            v-for="tab in periodTabs"
            :key="tab.value"
            type="button"
            class="billing-seg"
            :class="{ 'billing-seg--active': isPeriodTabActive(tab.value) }"
            @click="applyPeriodTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <button type="button" class="billing-filter" @click="openFilterPopup">
          <img class="billing-filter-icon" :src="iconFilter" alt="">
          筛选
        </button>
      </div>

      <div class="billing-toolbar-row billing-search-row">
        <div class="billing-player-search">
          <img class="billing-player-search__icon" :src="iconSearch" alt="">
          <input
            ref="playerSearchInputRef"
            v-model.trim="playerKeyword"
            class="billing-player-search__input"
            type="text"
            placeholder="全部玩家"
            autocomplete="off"
          >
          <button type="button" class="billing-player-search__btn" @click="onPlayerSearchClick">
            搜索
          </button>
        </div>
      </div>
      <div class="billing-toolbar-row billing-drops">
        <button type="button" class="billing-drop billing-drop--chevron" @click="openPicker">
          <span class="billing-drop-text">{{ typeLabel }}</span>
          <van-icon class="billing-drop-chev" name="arrow-down" />
        </button>
      </div>
    </div>

    <div class="billing-body">
      <section v-if="filteredRecords.length" class="billing-list">
        <article v-for="item in filteredRecords" :key="item.id" class="billing-card">
          <div class="billing-card-main">
            <h2 class="billing-card-title">{{ item.typeLabel }}</h2>
            <p class="billing-card-row">会员：{{ item.memberAccount }}</p>
            <p class="billing-card-row">订单号：{{ item.id }}</p>
            <p class="billing-card-row">账变后余额：¥{{ fmtMoney(item.balanceAfter) }}</p>
            <p class="billing-card-row">时间：{{ item.time }}</p>
          </div>
          <p
            class="billing-card-amt"
            :class="item.amount >= 0 ? 'billing-card-amt--pos' : 'billing-card-amt--neg'"
          >
            {{ item.amount >= 0 ? '+' : '-' }}¥{{ fmtMoney(Math.abs(item.amount)) }}
          </p>
        </article>
      </section>

      <div v-else class="billing-empty">
        <img :src="noDataImage" alt="">
        <p>暂无数据</p>
      </div>
    </div>

    <!-- 筛选弹层（参考稿图） -->
    <van-popup
      v-model:show="filterVisible"
      position="bottom"
      round
      class="billing-filter-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="billing-filter-sheet">
        <h3 class="billing-filter-title">筛选</h3>

        <div class="billing-filter-quick">
          <button
            v-for="opt in filterQuickOptions"
            :key="opt.value"
            type="button"
            class="billing-filter-quick-btn"
            :class="{ 'billing-filter-quick-btn--active': filterQuick === opt.value }"
            @click="selectFilterQuick(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <span class="billing-filter-quick-indicator" aria-hidden="true" />
          </button>
        </div>

        <div class="billing-filter-range">
          <button type="button" class="billing-filter-date" @click="openDatePicker('start')">{{ formatSlashDate(popupStartDate) }}</button>
          <span>-</span>
          <button type="button" class="billing-filter-date" @click="openDatePicker('end')">{{ formatSlashDate(popupEndDate) }}</button>
        </div>

        <div class="billing-filter-actions">
          <button type="button" class="billing-filter-reset" @click="resetFilter">重置</button>
          <button type="button" class="billing-filter-search" @click="applyFilter">搜寻</button>
        </div>
      </div>
    </van-popup>

    <!-- 日期选择（复用现成 date-picker 样式结构） -->
    <van-popup
      v-model:show="datePickerVisible"
      position="bottom"
      round
      class="custom-popup lottery-game-time-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="popup-title-row">
        <span>{{ datePickerTitle }}</span>
        <button type="button" class="picker-confirm" @click="confirmPickDate">确认</button>
      </div>
      <van-date-picker
        v-model="pickerDateValues"
        :columns-type="['year', 'month', 'day']"
        :min-date="minDate"
        :max-date="maxDate"
        :show-toolbar="false"
      />
    </van-popup>

    <!-- 玩家/类型选择 -->
    <van-popup
      v-model:show="pickerVisible"
      position="bottom"
      round
      class="billing-picker-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="billing-picker-head">
        <span class="billing-picker-title">{{ pickerTitle }}</span>
        <button type="button" class="billing-picker-close" aria-label="关闭" @click="pickerVisible = false">
          <img :src="iconClose" alt="">
        </button>
      </div>
      <div class="billing-picker-list">
        <button
          v-for="opt in pickerOptions"
          :key="String(opt.value)"
          type="button"
          class="billing-picker-row"
          :class="{ 'billing-picker-row--active': isPickerSelected(opt) }"
          @click="applyPicker(opt)"
        >
          <span class="billing-picker-label">{{ opt.label }}</span>
          <img v-if="isPickerSelected(opt)" class="billing-picker-check" :src="iconSelected" alt="">
          <span v-else class="billing-picker-radio" aria-hidden="true" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconFilter from '@/assets/icon_filter.svg'
import iconSelected from '@/assets/icon_sel.svg'
import iconClose from '@/assets/icon_x.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSearch from '@/assets/icon_search.svg'
import { teamBillingRecords } from './agent-team-billing-records.mock'

const router = useRouter()
const goBack = () => router.back()

const periodTabs = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'week', label: '本周' }
]

const timeMode = ref('tab') // tab | custom
const periodTab = ref('today')

const listFilterStart = ref(new Date())
const listFilterEnd = ref(new Date())

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

const applyPeriodTab = (tab) => {
  const now = new Date()
  let start
  let end
  if (tab === 'today') {
    start = startOfDay(now)
    end = endOfDay(now)
  } else if (tab === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    start = startOfDay(y)
    end = endOfDay(y)
  } else {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    start = new Date(now)
    start.setDate(now.getDate() + mondayOffset)
    start = startOfDay(start)
    end = endOfDay(now)
  }
  listFilterStart.value = start
  listFilterEnd.value = end
  timeMode.value = 'tab'
  periodTab.value = tab
}

applyPeriodTab('today')

const isPeriodTabActive = (tab) => timeMode.value === 'tab' && periodTab.value === tab

const playerKeyword = ref('')
const playerSearchInputRef = ref(null)

const onPlayerSearchClick = () => {
  playerSearchInputRef.value?.blur()
}

const typeValue = ref('all')

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'deposit', label: '充值' },
  { value: 'withdraw', label: '提现' },
  { value: 'bonus', label: '活动' }
]

const typeLabel = computed(() => TYPE_OPTIONS.find((o) => o.value === typeValue.value)?.label ?? '全部类型')

/** 筛选弹层 */
const filterVisible = ref(false)
const filterQuickOptions = [
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' }
]
const filterQuick = ref('today')

const popupStartDate = ref(new Date())
const popupEndDate = ref(new Date())
const openFilterPopup = () => {
  popupStartDate.value = new Date(listFilterStart.value.getTime())
  popupEndDate.value = new Date(listFilterEnd.value.getTime())
  filterQuick.value = 'today'
  syncPickerFromDate(popupStartDate.value)
  filterVisible.value = true
}

const selectFilterQuick = (value) => {
  filterQuick.value = value
  const now = new Date()
  if (value === 'today') {
    popupStartDate.value = startOfDay(now)
    popupEndDate.value = endOfDay(now)
  } else if (value === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    popupStartDate.value = startOfDay(y)
    popupEndDate.value = endOfDay(y)
  } else if (value === 'week') {
    const day = now.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const s = new Date(now)
    s.setDate(now.getDate() + mondayOffset)
    popupStartDate.value = startOfDay(s)
    popupEndDate.value = endOfDay(now)
  } else {
    popupStartDate.value = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
    popupEndDate.value = endOfDay(now)
  }
}

const resetFilter = () => {
  selectFilterQuick('today')
}

const applyFilter = () => {
  listFilterStart.value = new Date(popupStartDate.value.getTime())
  listFilterEnd.value = new Date(popupEndDate.value.getTime())
  timeMode.value = 'custom'
  periodTab.value = ''
  filterVisible.value = false
}

/** 日期选择 */
const datePickerVisible = ref(false)
const pickerTarget = ref('start')
const minDate = new Date(2023, 0, 1)
const maxDate = new Date(new Date().getFullYear() + 1, 11, 31)
const pickerDateValues = ref(['2026', '01', '01'])

const datePickerTitle = computed(() => (pickerTarget.value === 'start' ? '开始时间' : '结束时间'))

const syncPickerFromDate = (date) => {
  pickerDateValues.value = [
    `${date.getFullYear()}`,
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0')
  ]
}

const openDatePicker = (target) => {
  pickerTarget.value = target
  syncPickerFromDate(target === 'start' ? popupStartDate.value : popupEndDate.value)
  datePickerVisible.value = true
}

const confirmPickDate = () => {
  const [y, m, d] = pickerDateValues.value
  const picked = new Date(Number(y), Number(m) - 1, Number(d))
  if (pickerTarget.value === 'start') popupStartDate.value = picked
  else popupEndDate.value = picked
  if (popupStartDate.value > popupEndDate.value) {
    const t = popupStartDate.value
    popupStartDate.value = popupEndDate.value
    popupEndDate.value = t
  }
  filterQuick.value = ''
  datePickerVisible.value = false
}

const formatSlashDate = (date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}/${mm}/${dd}`
}

/** 底部选择弹层 */
const pickerVisible = ref(false)
const pickerTitle = computed(() => '类型选择')
const pickerOptions = computed(() => TYPE_OPTIONS)
const openPicker = () => {
  pickerVisible.value = true
}
const isPickerSelected = (opt) => opt.value === typeValue.value
const applyPicker = (opt) => {
  typeValue.value = opt.value
  pickerVisible.value = false
}

const inRange = (timeText, start, end) => {
  const d = new Date(timeText.replace(/-/g, '/'))
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  return d >= s && d <= e
}

const filteredRecords = computed(() =>
  teamBillingRecords.filter((item) => {
    if (!inRange(item.time, listFilterStart.value, listFilterEnd.value)) return false
    if (playerKeyword.value && !String(item.memberAccount || '').includes(playerKeyword.value)) return false
    if (typeValue.value !== 'all' && item.type !== typeValue.value) return false
    return true
  })
)

const fmtMoney = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  return v.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-team-billing-records.less';
</style>

<style lang="less">
@import '@/styles/pages/agent-team-billing-picker-global.less';
@import '@/styles/pages/agent-team-billing-filter-global.less';
@import '@/styles/pages/record-game-time-popup-global.less';
</style>


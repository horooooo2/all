<template>
  <div class="agent-subpage agent-team-third-party-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>团队三方游戏记录</h1>
    </header>

    <div class="tp-toolbar">
      <div class="tp-toolbar-row">
        <div class="tp-segments">
          <button
            v-for="tab in typeTabs"
            :key="tab.value"
            type="button"
            class="tp-seg"
            :class="{ 'tp-seg--active': typeTab === tab.value }"
            @click="typeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <button type="button" class="tp-filter" @click="openFilterPopup">
          <img class="tp-filter-icon" :src="iconFilter" alt="">
          筛选
        </button>
      </div>

      <div class="tp-toolbar-row tp-search-row">
        <div class="tp-player-search">
          <img class="tp-player-search__icon" :src="iconSearch" alt="">
          <input
            ref="playerSearchInputRef"
            v-model.trim="playerKeyword"
            class="tp-player-search__input"
            type="text"
            placeholder="全部玩家"
            autocomplete="off"
          >
          <button type="button" class="tp-player-search__btn" @click="onPlayerSearchClick">
            搜索
          </button>
        </div>
      </div>
      <div class="tp-toolbar-row tp-drops">
        <button type="button" class="tp-drop tp-drop--chevron" @click="openPicker('platform')">
          <span class="tp-drop-text">{{ platformLabel }}</span>
          <van-icon class="tp-drop-chev" name="arrow-down" />
        </button>
      </div>
    </div>

    <div class="tp-body">
      <section v-if="filteredRecords.length" class="tp-list">
        <article v-for="item in filteredRecords" :key="item.id" class="tp-card">
          <div class="tp-card-row tp-card-row--top">
            <span class="tp-card-game">{{ item.gameName }}</span>
            <span class="tp-card-user">{{ item.memberAccount }}</span>
          </div>
          <div class="tp-card-row tp-card-row--mid">
            <p class="tp-card-bet">
              投注：<span class="tp-card-bet-val">¥{{ fmtMoney(item.betAmount) }}</span>
            </p>
          </div>
          <div class="tp-card-row tp-card-row--foot">
            <span class="tp-card-time">{{ item.time }}</span>
            <span
              class="tp-card-pnl"
              :class="item.winLoss > 0 ? 'tp-card-pnl--pos' : 'tp-card-pnl--zero'"
            >
              ¥{{ fmtMoney(Math.abs(item.winLoss)) }}
            </span>
          </div>
        </article>
      </section>

      <div v-else class="tp-empty">
        <img :src="noDataImage" alt="">
        <p>暂无数据</p>
      </div>
    </div>

    <van-popup
      v-model:show="showFilterPopup"
      position="bottom"
      round
      class="tp-filter-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="tp-filter-sheet">
        <h3 class="tp-filter-title">筛选</h3>

        <div class="tp-filter-quick">
          <button
            v-for="opt in filterQuickOptions"
            :key="opt.value"
            type="button"
            class="tp-filter-quick-btn"
            :class="{ 'tp-filter-quick-btn--active': filterQuick === opt.value }"
            @click="selectFilterQuick(opt.value)"
          >
            <span>{{ opt.label }}</span>
            <span class="tp-filter-quick-indicator" />
          </button>
        </div>

        <div class="tp-filter-range">
          <button type="button" class="tp-filter-date" @click="openDatePicker('start')">
            {{ formatSlashDate(filterStartDate) }}
          </button>
          <span>-</span>
          <button type="button" class="tp-filter-date" @click="openDatePicker('end')">
            {{ formatSlashDate(filterEndDate) }}
          </button>
        </div>

        <div class="tp-filter-actions">
          <button type="button" class="tp-filter-reset" @click="resetFilter">重置</button>
          <button type="button" class="tp-filter-search" @click="applyFilter">搜索</button>
        </div>
      </div>
    </van-popup>

    <van-popup
      v-model:show="showDatePickerPopup"
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

    <van-popup
      v-model:show="showPickerPopup"
      position="bottom"
      round
      class="tp-picker-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="tp-picker-head">
        <div class="tp-picker-title">{{ pickerTitle }}</div>
        <button type="button" class="tp-picker-close" @click="showPickerPopup = false">
          <img :src="iconClose" alt="">
        </button>
      </div>
      <div class="tp-picker-list">
        <button
          v-for="opt in activePickerOptions"
          :key="opt.value"
          type="button"
          class="tp-picker-row"
          :class="{ 'tp-picker-row--active': isPickerSelected(opt.value) }"
          @click="applyPicker(opt.value)"
        >
          <span class="tp-picker-label">{{ opt.label }}</span>
          <img v-if="isPickerSelected(opt.value)" class="tp-picker-check" :src="iconSelected" alt="">
          <span v-else class="tp-picker-radio" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { threePartyRecordsMock, PLATFORM_OPTIONS, TYPE_TABS } from './agent-team-three-party-records.mock'

import iconBack from '@/assets/icon_dack.svg'
import iconFilter from '@/assets/icon_filter.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSearch from '@/assets/icon_search.svg'

const router = useRouter()
const goBack = () => router.back()

const typeTabs = TYPE_TABS
const typeTab = ref('all')

const playerKeyword = ref('')
const playerSearchInputRef = ref(null)

const onPlayerSearchClick = () => {
  playerSearchInputRef.value?.blur()
}
const platformValue = ref('all')

const records = ref([])

const showFilterPopup = ref(false)
const showPickerPopup = ref(false)
const showDatePickerPopup = ref(false)

const pickerMode = ref('platform') // 'platform'

const filterQuickOptions = [
  { label: '今日', value: 'today' },
  { label: '昨日', value: 'yesterday' },
  { label: '本周', value: 'thisWeek' },
  { label: '本月', value: 'thisMonth' }
]
const filterQuick = ref('today')

const filterStartDate = ref(new Date())
const filterEndDate = ref(new Date())

const appliedStart = ref(new Date())
const appliedEnd = ref(new Date())

const datePickerMode = ref('start') // 'start' | 'end'
const pickerDateValues = ref([])

const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2035, 11, 31)

const datePickerTitle = computed(() => (datePickerMode.value === 'start' ? '开始日期' : '结束日期'))

const platformLabel = computed(() => PLATFORM_OPTIONS.find((o) => o.value === platformValue.value)?.label ?? '所有')

const pickerTitle = computed(() => '平台选择')

const activePickerOptions = computed(() => PLATFORM_OPTIONS)

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function startOfWeek(d) {
  const x = new Date(d)
  const day = x.getDay() || 7
  x.setDate(x.getDate() - (day - 1))
  return startOfDay(x)
}

function endOfWeek(d) {
  const x = startOfWeek(d)
  x.setDate(x.getDate() + 6)
  return endOfDay(x)
}

function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  return startOfDay(x)
}

function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return endOfDay(x)
}

function applyQuickToRange(q) {
  const now = new Date()
  if (q === 'today') return { start: startOfDay(now), end: endOfDay(now) }
  if (q === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return { start: startOfDay(y), end: endOfDay(y) }
  }
  if (q === 'thisWeek') return { start: startOfWeek(now), end: endOfWeek(now) }
  return { start: startOfMonth(now), end: endOfMonth(now) }
}

function syncPickerFromDate(d) {
  pickerDateValues.value = [String(d.getFullYear()), String(d.getMonth() + 1), String(d.getDate())]
}

function formatSlashDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

function openFilterPopup() {
  showFilterPopup.value = true
}

function selectFilterQuick(q) {
  filterQuick.value = q
  const { start, end } = applyQuickToRange(q)
  filterStartDate.value = new Date(start)
  filterEndDate.value = new Date(end)
}

function resetFilter() {
  filterQuick.value = 'today'
  const { start, end } = applyQuickToRange('today')
  filterStartDate.value = new Date(start)
  filterEndDate.value = new Date(end)
}

function applyFilter() {
  appliedStart.value = startOfDay(filterStartDate.value)
  appliedEnd.value = endOfDay(filterEndDate.value)
  showFilterPopup.value = false
}

function openDatePicker(mode) {
  datePickerMode.value = mode
  showDatePickerPopup.value = true
  syncPickerFromDate(mode === 'start' ? filterStartDate.value : filterEndDate.value)
}

function confirmPickDate() {
  const [y, m, d] = pickerDateValues.value
  const picked = new Date(Number(y), Number(m) - 1, Number(d))
  if (datePickerMode.value === 'start') filterStartDate.value = picked
  else filterEndDate.value = picked
  filterQuick.value = null
  showDatePickerPopup.value = false
}

function openPicker(mode) {
  pickerMode.value = mode
  showPickerPopup.value = true
}

function isPickerSelected(val) {
  return platformValue.value === val
}

function applyPicker(val) {
  platformValue.value = val
  showPickerPopup.value = false
}

function fmtMoney(n) {
  const x = Number(n || 0)
  return x.toFixed(2).replace(/\.00$/, '')
}

function parseTimeToDate(str) {
  const x = new Date(str.replace(/-/g, '/'))
  return isNaN(x.getTime()) ? null : x
}

const filteredRecords = computed(() => {
  const start = appliedStart.value
  const end = appliedEnd.value

  return records.value.filter((r) => {
    if (typeTab.value !== 'all' && r.type !== typeTab.value) return false
    if (playerKeyword.value && !String(r.memberAccount || '').includes(playerKeyword.value)) return false
    if (platformValue.value !== 'all' && r.platform !== platformValue.value) return false
    const t = parseTimeToDate(r.time)
    if (!t) return true
    return t >= start && t <= end
  })
})

onMounted(() => {
  records.value = threePartyRecordsMock
  const { start, end } = applyQuickToRange(filterQuick.value)
  filterStartDate.value = new Date(start)
  filterEndDate.value = new Date(end)
  appliedStart.value = startOfDay(filterStartDate.value)
  appliedEnd.value = endOfDay(filterEndDate.value)
  syncPickerFromDate(filterStartDate.value)
})
</script>

<style scoped lang="less">
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-team-three-party-records.less';

.tp-list {
  display: flex;
  flex-direction: column;
  gap: @spacing-sm;
}

.tp-card {
  border-radius: 10px;
  background: #fff;
  border: 1px solid #eef2f8;
  padding: 12px @spacing-md;
  box-sizing: border-box;
}

.tp-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &--top {
    margin-bottom: 10px;
  }

  &--mid {
    margin-bottom: 8px;
  }
}

.tp-card-game {
  flex: 1;
  min-width: 0;
  font-size: @font-size-md;
  font-weight: 600;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tp-card-user {
  flex-shrink: 0;
  font-size: @font-size-sm;
  color: #8d9fc7;
}

.tp-card-bet {
  margin: 0;
  font-size: @font-size-sm;
  color: #8d9fc7;
}

.tp-card-bet-val {
  color: #1f78ff;
}

.tp-card-pnl {
  flex-shrink: 0;
  font-size: @font-size-md;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;

  &--pos {
    color: var(--success-color);
  }

  &--zero {
    color: var(--danger-color);
  }
}

.tp-card-time {
  font-size: @font-size-sm;
  color: #8d9fc7;
  line-height: 1.3;
}
</style>

<style lang="less">
@import '@/styles/pages/record-game-time-popup-global.less';
@import '@/styles/pages/agent-team-three-party-picker-global.less';
@import '@/styles/pages/agent-team-three-party-filter-global.less';
</style>

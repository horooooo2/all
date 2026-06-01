<template>
  <div class="agent-subpage agent-team-lottery-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('团队彩票注单记录') }}</h1>
    </header>

    <div class="lottery-toolbar">
      <div class="lottery-toolbar-row">
        <div class="lottery-segments">
          <button
            v-for="tab in periodTabs"
            :key="tab.value"
            type="button"
            class="lottery-seg"
            :class="{ 'lottery-seg--active': isPeriodTabActive(tab.value) }"
            @click="applyPeriodTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
        <button type="button" class="lottery-sieve" @click="openTimeFilterPopup">
          <img class="lottery-sieve-icon" :src="iconFilter" alt="">
          筛选
        </button>
      </div>
      <div class="lottery-toolbar-row lottery-search-row">
        <div class="lottery-player-search">
          <img class="lottery-player-search__icon" :src="iconSearch" alt="">
          <input
            ref="playerSearchInputRef"
            v-model.trim="playerKeyword"
            class="lottery-player-search__input"
            type="text"
            placeholder="全部玩家"
            autocomplete="off"
          >
          <button type="button" class="lottery-player-search__btn" @click="onPlayerSearchClick">{{ $t('搜索') }}</button>
        </div>
      </div>
      <div class="lottery-toolbar-row lottery-drops lottery-drops--two">
        <button type="button" class="lottery-drop lottery-drop--chevron" @click="openListPicker('game')">
          <span class="lottery-drop-text">{{ gameLabel }}</span>
          <van-icon class="lottery-drop-chev" name="arrow-down" />
        </button>
        <button type="button" class="lottery-drop lottery-drop--chevron" @click="openListPicker('status')">
          <span class="lottery-drop-text">{{ statusLabel }}</span>
          <van-icon class="lottery-drop-chev" name="arrow-down" />
        </button>
      </div>
    </div>

    <div class="lottery-body">
      <section v-if="filteredRecords.length" class="lottery-list">
        <article v-for="item in filteredRecords" :key="item.id" class="lottery-card">
          <div class="lottery-card-head">
            <div class="lottery-card-head-left">
              <span class="lottery-card-tag" :class="resultTagClass(item.betResult)">{{ resultLabel(item.betResult) }}</span>
              <h2 class="lottery-card-game">{{ item.gameName }}</h2>
            </div>
            <span class="lottery-card-issue">{{ item.issueNo }}期</span>
          </div>
          <div class="lottery-card-mid">
            <p class="lottery-card-bet">
              <span class="lottery-card-bet-label">{{ $t('投注：') }}</span>
              <span class="lottery-card-bet-val">{{ item.betContent }}</span>
            </p>
            <button type="button" class="lottery-card-detail" @click="onViewDetail(item)">{{ $t('查看详情') }}</button>
          </div>
          <div class="lottery-card-foot">
            <span class="lottery-card-time">{{ item.orderTime }}</span>
            <span class="lottery-card-amt">¥{{ formatWinAmount(item.winLoss) }}</span>
          </div>
        </article>
      </section>
      <div v-else class="lottery-empty">
        <img :src="noDataImage" alt="">
        <p>{{ $t('暂无数据') }}</p>
      </div>
    </div>

    <van-popup
      v-model:show="showTimePopup"
      position="bottom"
      round
      class="custom-popup lottery-game-time-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="time-panel">
        <h3>{{ $t('下单时间') }}</h3>
        <div class="quick-row">
          <button
            v-for="item in quickOptions"
            :key="item.label"
            type="button"
            class="quick-item"
            :class="{ active: popupSelectedQuick === item.value }"
            @click="selectQuick(item.value)"
          >
            {{ item.label }}
            <img v-if="popupSelectedQuick === item.value" class="selected-icon" :src="iconSelected" alt="">
            <span v-else class="circle-icon" />
          </button>
        </div>

        <div class="range-row">
          <button type="button" class="date-cell" @click="openDatePicker('start')">{{ formatSlashDate(popupStartDate) }}</button>
          <span>-</span>
          <button type="button" class="date-cell" @click="openDatePicker('end')">{{ formatSlashDate(popupEndDate) }}</button>
        </div>

        <input
          v-model.trim="issueNoKeyword"
          class="time-panel-issue-input"
          type="text"
          placeholder="请输入投注期号"
        >

        <div class="action-row">
          <button type="button" class="btn-reset" @click="resetTimePopup">{{ $t('重置') }}</button>
          <button type="button" class="btn-confirm" @click="confirmTime">{{ $t('确定') }}</button>
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
        <button type="button" class="picker-confirm" @click="confirmPickDate">{{ $t('确认') }}</button>
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
      v-model:show="listPickerVisible"
      position="bottom"
      round
      class="lottery-picker-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="lottery-picker-head">
        <span class="lottery-picker-title">{{ listPickerTitle }}</span>
        <button type="button" class="lottery-picker-close" :aria-label="$t('关闭')" @click="listPickerVisible = false">
          <img :src="iconClose" alt="">
        </button>
      </div>
      <div class="lottery-picker-list">
        <button
          v-for="opt in listPickerOptions"
          :key="String(opt.value)"
          type="button"
          class="lottery-picker-row"
          :class="{ 'lottery-picker-row--active': isListPickerSelected(opt) }"
          @click="applyListPicker(opt)"
        >
          <span class="lottery-picker-label">{{ opt.label }}</span>
          <img v-if="isListPickerSelected(opt)" class="lottery-picker-check" :src="iconSelected" alt="">
          <span v-else class="lottery-picker-radio" aria-hidden="true" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconFilter from '@/assets/icon_filter.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSearch from '@/assets/icon_search.svg'
import toast from '@/components/Toast'
import { teamLotteryRecords } from './agent-team-lottery-records.mock'

const router = useRouter()
const goBack = () => router.back()

const periodTabs = [
  { value: 'today', label: t('今日') },
  { value: 'yesterday', label: t('昨日') },
  { value: 'week', label: t('本周') }
]

/** tab：今日/昨日/本周；custom：筛选弹窗确定的区间 */
const timeMode = ref('tab')
const periodTab = ref('today')

const listFilterStart = ref(new Date())
const listFilterEnd = ref(new Date())

const showTimePopup = ref(false)
const showDatePickerPopup = ref(false)
const pickerTarget = ref('start')

const popupStartDate = ref(new Date())
const popupEndDate = ref(new Date())
const popupSelectedQuick = ref('')
const issueNoKeyword = ref('')

const quickOptions = [
  { label: t('24小时内'), value: '24h' },
  { label: t('48小时内'), value: '48h' },
  { label: t('15天内'), value: '15d' },
  { label: t('30天内'), value: '30d' }
]

const minDate = new Date(2023, 0, 1)
const maxDate = new Date(new Date().getFullYear() + 1, 11, 31)

const pickerDateValues = ref(['2026', '01', '01'])

const playerKeyword = ref('')
const playerSearchInputRef = ref(null)

const onPlayerSearchClick = () => {
  playerSearchInputRef.value?.blur()
}
const gameValue = ref('all')
const statusValue = ref('all')

const listPickerVisible = ref(false)
const listPickerKind = ref('game')

const GAME_OPTIONS = [
  { value: 'all', label: '全部游戏' },
  { value: t('加拿大28'), label: '加拿大PC28(4.2-4.6)特' }
]

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: t('未开奖') },
  { value: 'won', label: t('已中奖') },
  { value: 'lost', label: t('未中奖') }
]

const gameLabel = computed(() => GAME_OPTIONS.find((o) => o.value === gameValue.value)?.label ?? '全部游戏')
const statusLabel = computed(() => STATUS_OPTIONS.find((o) => o.value === statusValue.value)?.label ?? '全部状态')

const listPickerTitle = computed(() => {
  if (listPickerKind.value === 'game') return t('平台选择')
  return t('状态选择')
})

const listPickerOptions = computed(() => {
  if (listPickerKind.value === 'game') return GAME_OPTIONS
  return STATUS_OPTIONS
})

const listPickerCurrentValue = computed(() => {
  if (listPickerKind.value === 'game') return gameValue.value
  return statusValue.value
})

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

const isPeriodTabActive = (tab) => timeMode.value === 'tab' && periodTab.value != null && periodTab.value === tab

const applyQuickToRange = (value, endBase) => {
  const daysMap = { '24h': 1, '48h': 2, '15d': 15, '30d': 30 }
  const days = daysMap[value]
  const end = new Date(endBase)
  const start = new Date(end)
  start.setDate(end.getDate() - days + 1)
  return { start, end }
}

const openTimeFilterPopup = () => {
  popupStartDate.value = new Date(listFilterStart.value.getTime())
  popupEndDate.value = new Date(listFilterEnd.value.getTime())
  popupSelectedQuick.value = ''
  syncPickerFromDate(popupStartDate.value)
  showTimePopup.value = true
}

const syncPickerFromDate = (date) => {
  pickerDateValues.value = [
    `${date.getFullYear()}`,
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0')
  ]
}

const datePickerTitle = computed(() => (pickerTarget.value === 'start' ? t('开始时间') : t('结束时间')

const formatSlashDate = (date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}/${mm}/${dd}`
}

const selectQuick = (value) => {
  popupSelectedQuick.value = value
  const end = new Date()
  const { start } = applyQuickToRange(value, end)
  popupStartDate.value = start
  popupEndDate.value = end
}

const resetTimePopup = () => {
  popupSelectedQuick.value = '24h'
  issueNoKeyword.value = ''
  const end = new Date()
  const { start } = applyQuickToRange('24h', end)
  popupStartDate.value = start
  popupEndDate.value = end
  syncPickerFromDate(start)
}

const confirmTime = () => {
  listFilterStart.value = new Date(popupStartDate.value.getTime())
  listFilterEnd.value = new Date(popupEndDate.value.getTime())
  timeMode.value = 'custom'
  periodTab.value = null
  showTimePopup.value = false
}

const openDatePicker = (target) => {
  pickerTarget.value = target
  const date = target === 'start' ? popupStartDate.value : popupEndDate.value
  syncPickerFromDate(date)
  showDatePickerPopup.value = true
}

const confirmPickDate = () => {
  const [y, m, d] = pickerDateValues.value
  const picked = new Date(Number(y), Number(m) - 1, Number(d))
  if (pickerTarget.value === 'start') {
    popupStartDate.value = picked
  } else {
    popupEndDate.value = picked
  }
  if (popupStartDate.value > popupEndDate.value) {
    const t = popupStartDate.value
    popupStartDate.value = popupEndDate.value
    popupEndDate.value = t
  }
  popupSelectedQuick.value = ''
  showDatePickerPopup.value = false
}

const inRange = (timeText, start, end) => {
  const d = new Date(timeText.replace(/-/g, '/'))
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  return d >= s && d <= e
}

const filteredRecords = computed(() =>
  teamLotteryRecords.filter((item) => {
    if (!inRange(item.orderTime, listFilterStart.value, listFilterEnd.value)) return false
    if (playerKeyword.value && !String(item.memberAccount || '').includes(playerKeyword.value)) return false
    if (gameValue.value !== 'all' && item.platform !== gameValue.value) return false
    if (statusValue.value !== 'all' && item.betResult !== statusValue.value) return false
    if (issueNoKeyword.value && !String(item.issueNo || '').includes(issueNoKeyword.value)) return false
    return true
  })
)

const resultLabel = (r) => {
  if (r === 'pending') return t('未开奖')
  if (r === 'won') return t('已中奖')
  return t('未中奖')
}

const resultTagClass = (r) => {
  if (r === 'pending') return 'lottery-card-tag--pending'
  if (r === 'won') return 'lottery-card-tag--won'
  return 'lottery-card-tag--lost'
}

const formatWinAmount = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  const s = Math.abs(v).toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
  return s
}

const onViewDetail = (item) => {
  router.push({ name: 'agentTeamLotteryOrderDetail', query: { id: item.id } })
}

const openListPicker = (kind) => {
  listPickerKind.value = kind
  listPickerVisible.value = true
}

const isListPickerSelected = (opt) => opt.value === listPickerCurrentValue.value

const applyListPicker = (opt) => {
  if (listPickerKind.value === 'game') gameValue.value = opt.value
  else statusValue.value = opt.value
  listPickerVisible.value = false
}

</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-team-lottery-records.less';
</style>

<style lang="less">
@import '@/styles/pages/record-game-time-popup-global.less';
@import '@/styles/pages/agent-team-lottery-picker-global.less';
</style>

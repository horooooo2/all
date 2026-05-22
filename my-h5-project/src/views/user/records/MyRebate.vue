<template>
  <div class="my-rebate-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>我的返水</h1>
    </header>

    <section class="top-tabs">
      <button
        type="button"
        class="top-tab"
        :class="{ active: activeMainTab === 'record' }"
        @click="activeMainTab = 'record'"
      >
        返水记录
      </button>
      <button
        type="button"
        class="top-tab"
        :class="{ active: activeMainTab === 'treatment' }"
        @click="activeMainTab = 'treatment'"
      >
        返水待遇
      </button>
    </section>

    <section v-if="activeMainTab === 'record'" class="record-tab-panel">
      <div class="income-card">
        <span>今日返水收入</span>
        <strong>¥{{ currentRecordStat.todayIncome }}</strong>
      </div>

      <div class="overview-card">
        <div class="overview-row">
          <span>昨天个人有效投注</span>
          <strong>¥{{ currentRecordStat.yesterdayValidBet }}</strong>
        </div>
        <div class="overview-row">
          <span>有效结算投注返水</span>
          <strong>¥{{ currentRecordStat.settledRebate }}</strong>
        </div>
        <div class="overview-row">
          <span>本月累计返水量</span>
          <strong>¥{{ currentRecordStat.monthlyRebate }}</strong>
        </div>
      </div>

      <div class="record-table-card">
        <div class="record-switch-row">
          <button
            v-for="item in recordTimeTabs"
            :key="item.value"
            type="button"
            class="switch-btn"
            :class="{ active: activeRecordTimeTab === item.value }"
            @click="selectRecordTimeTab(item.value)"
          >
            {{ item.label }}
          </button>
          <div class="icon-btn">
            <img :src="iconFunction" alt="date-filter" @click="openTimePopup">
          </div>
        </div>

        <div class="table-head">
          <span>时间</span>
          <span>返水有效投注</span>
          <span>返水</span>
        </div>

        <template v-if="recordRows.length">
          <template v-for="group in recordRows" :key="group.date">
            <button type="button" class="group-row" @click="toggleGroup(group.date)">
              <span>{{ group.date }}</span>
              <span>¥{{ group.totalValidBet }}</span>
              <span>¥{{ group.totalRebate }}</span>
              <img
                class="group-row__arrow"
                :class="{ 'is-up': expandedGroups.includes(group.date) }"
                :src="iconDetailsDown"
                alt=""
              >
            </button>
            <div v-if="expandedGroups.includes(group.date)">
              <div
                v-for="detail in group.items"
                :key="`${group.date}-${detail.time}-${detail.validBet}`"
                class="detail-row"
              >
                <span>{{ detail.time }}</span>
                <span>¥{{ detail.validBet }}</span>
                <span>¥{{ detail.rebate }}</span>
              </div>
            </div>
          </template>
        </template>

        <div class="summary-row">
          <span>总计</span>
          <span>¥{{ recordSummary.totalValidBet }}</span>
          <span>¥{{ recordSummary.totalRebate }}</span>
        </div>
      </div>
    </section>

    <section v-else class="treatment-tab-panel">
      <div class="game-tabs">
        <button
          v-for="item in treatmentGameTabs"
          :key="item.value"
          type="button"
          class="game-tab-btn"
          :class="{ active: activeTreatmentGameTab === item.value }"
          @click="activeTreatmentGameTab = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <template v-if="currentTreatmentRows.length">
        <div class="treatment-table">
          <div class="table-head">
            <span>类型</span>
            <span>最低有效投注</span>
            <span>返水比例(%)</span>
          </div>

          <template v-for="item in currentTreatmentRows" :key="item.type">
            <button type="button" class="group-row treatment-group-row" @click="toggleTreatment(item.type)">
              <span class="treatment-group-row__title">{{ item.type }}</span>
              <img
                class="treatment-group-row__arrow"
                :class="{ 'is-up': expandedTreatment.includes(item.type) }"
                :src="iconDetailsDown"
                alt=""
              >
            </button>
            <div v-if="expandedTreatment.includes(item.type) && item.children?.length">
              <div
                v-for="child in item.children"
                :key="`${item.type}-${child.type}`"
                class="detail-row"
              >
                <span>{{ child.type }}</span>
                <span>{{ child.minValidBet }}</span>
                <span>{{ child.rate }}</span>
              </div>
            </div>
          </template>
        </div>
      </template>

      <div v-else class="record-empty">
        <img :src="noDataImage" alt="no-data">
        <p>暂无数据</p>
      </div>
    </section>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="custom-popup">
      <div class="time-panel">
        <h3>下单时间</h3>
        <div class="quick-row">
          <button
            v-for="item in quickOptions"
            :key="item.label"
            type="button"
            class="quick-item"
            :class="{ active: draftQuick === item.value }"
            @click="selectQuick(item.value)"
          >
            {{ item.label }}
            <img
              v-if="draftQuick === item.value"
              class="selected-icon"
              :src="iconSelected"
              alt="selected"
            >
            <span v-else class="circle-icon" />
          </button>
        </div>

        <div class="range-row">
          <button type="button" class="date-cell" @click="openDatePicker('start')">{{ formatSlashDate(draftStartDate) }}</button>
          <span>-</span>
          <button type="button" class="date-cell" @click="openDatePicker('end')">{{ formatSlashDate(draftEndDate) }}</button>
        </div>

        <div class="action-row">
          <button type="button" class="btn-reset" @click="resetTime">重置</button>
          <button type="button" class="btn-confirm" @click="confirmTime">确定</button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDatePickerPopup" position="bottom" round class="custom-popup date-picker-popup">
      <div class="date-picker-sheet">
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
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import noDataImage from '@/assets/no_data.svg'
import iconFunction from '@/assets/icon_function.svg'
import iconSelected from '@/assets/icon_sel.svg'
import iconDetailsDown from '@/assets/icon_details_down.svg'

const router = useRouter()
const goBack = () => router.back()

const activeMainTab = ref('record')
const recordTimeTabs = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '本周', value: 'week' }
]
const activeRecordTimeTab = ref('today')
const showTimePopup = ref(false)
const quickOptions = [
  { label: '今天', value: 'today' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' }
]
const selectedQuick = ref('today')
const draftQuick = ref('today')

const allRecordGroups = [
  {
    date: '2026-03-12',
    totalValidBet: 10000,
    totalRebate: 400,
    items: [
      { time: '14:08:29', validBet: 5000, rebate: 200 },
      { time: '18:10:12', validBet: 5000, rebate: 200 }
    ]
  },
  {
    date: '2026-03-13',
    totalValidBet: 20000,
    totalRebate: 800,
    items: [
      { time: '21:25:29', validBet: 10000, rebate: 400 },
      { time: '21:25:29', validBet: 20000, rebate: 400 }
    ]
  }
]

const anchorDate = new Date(2026, 2, 13)
const selectedStartDate = ref(new Date(2026, 2, 13))
const selectedEndDate = ref(new Date(2026, 2, 13))
const draftStartDate = ref(new Date(2026, 2, 13))
const draftEndDate = ref(new Date(2026, 2, 13))

const toDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const parseYmd = (text) => {
  const [y, m, d] = text.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const inDateRange = (valueDate, start, end) => {
  const date = toDateOnly(valueDate)
  const startDate = toDateOnly(start)
  const endDate = toDateOnly(end)
  return date >= startDate && date <= endDate
}

const getRangeByQuick = (value) => {
  const anchor = new Date(anchorDate)
  if (value === 'today') {
    return [new Date(anchor), new Date(anchor)]
  }
  if (value === 'yesterday') {
    const yesterday = new Date(anchor)
    yesterday.setDate(anchor.getDate() - 1)
    return [yesterday, yesterday]
  }
  if (value === 'week') {
    const weekStart = new Date(anchor)
    weekStart.setDate(anchor.getDate() - 6)
    return [weekStart, new Date(anchor)]
  }
  if (value === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    return [start, new Date(anchor)]
  }
  if (value === 'lastMonth') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
    const end = new Date(anchor.getFullYear(), anchor.getMonth(), 0)
    return [start, end]
  }
  return [new Date(anchor), new Date(anchor)]
}

const selectRecordTimeTab = (value) => {
  activeRecordTimeTab.value = value
  selectedQuick.value = value
  const [start, end] = getRangeByQuick(value)
  selectedStartDate.value = start
  selectedEndDate.value = end
}

const expandedGroups = ref(['2026-03-13'])
const recordRows = computed(() => allRecordGroups.filter(group => inDateRange(
  parseYmd(group.date),
  selectedStartDate.value,
  selectedEndDate.value
)))
const recordSummary = computed(() => recordRows.value.reduce((acc, item) => {
  acc.totalValidBet += item.totalValidBet
  acc.totalRebate += item.totalRebate
  return acc
}, { totalValidBet: 0, totalRebate: 0 }))
const monthlyRebate = computed(() => allRecordGroups.reduce((sum, item) => sum + item.totalRebate, 0))
const currentRecordStat = computed(() => ({
  todayIncome: recordSummary.value.totalRebate,
  yesterdayValidBet: recordSummary.value.totalValidBet,
  settledRebate: recordSummary.value.totalRebate,
  monthlyRebate: monthlyRebate.value
}))

const toggleGroup = (date) => {
  const index = expandedGroups.value.indexOf(date)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(date)
  }
}

const treatmentGameTabs = [
  { label: '电子', value: 'slot' },
  { label: '棋牌', value: 'chess' },
  { label: '视讯', value: 'live' }
]
const activeTreatmentGameTab = ref('slot')

const treatmentRowsMap = {
  slot: [
    {
      type: '电子',
      minValidBet: '¥100',
      rate: '0.5%',
      children: [
        { type: 'PG电子', minValidBet: '¥100', rate: '0.5%' },
        { type: 'JDB电子', minValidBet: '¥100', rate: '0.4%' },
        { type: 'PP电子', minValidBet: '¥100', rate: '0.5%' }
      ]
    },
    {
      type: '棋牌',
      minValidBet: '¥100',
      rate: '0.3%',
      children: [
        { type: '开元棋牌', minValidBet: '¥100', rate: '0.3%' },
        { type: '乐游棋牌', minValidBet: '¥100', rate: '0.3%' }
      ]
    },
    {
      type: '视讯',
      minValidBet: '¥100',
      rate: '0.4%',
      children: [
        { type: 'AG视讯', minValidBet: '¥100', rate: '0.4%' },
        { type: 'BBIN视讯', minValidBet: '¥100', rate: '0.4%' }
      ]
    },
    {
      type: '捕鱼',
      minValidBet: '¥100',
      rate: '0.5%',
      children: [
        { type: 'JILI捕鱼', minValidBet: '¥100', rate: '0.5%' },
        { type: 'MW捕鱼', minValidBet: '¥100', rate: '0.5%' }
      ]
    },
    {
      type: '体育',
      minValidBet: '¥100',
      rate: '0.3%',
      children: [
        { type: '沙巴体育', minValidBet: '¥100', rate: '0.3%' },
        { type: '皇冠体育', minValidBet: '¥100', rate: '0.3%' }
      ]
    },
    {
      type: '彩票',
      minValidBet: '¥0',
      rate: '0.4%',
      children: [
        { type: '比特币28', minValidBet: '¥0', rate: '0.4%' },
        { type: '台湾宾果28', minValidBet: '¥0', rate: '0.4%' },
        { type: '加拿大28', minValidBet: '¥0', rate: '0.4%' },
        { type: '加拿大西28', minValidBet: '¥0', rate: '0.4%' }
      ]
    }
  ],
  chess: [
    {
      type: '棋牌',
      minValidBet: '¥100',
      rate: '0.3%',
      children: [
        { type: '开元棋牌', minValidBet: '¥100', rate: '0.3%' },
        { type: '乐游棋牌', minValidBet: '¥100', rate: '0.3%' },
        { type: '博乐棋牌', minValidBet: '¥100', rate: '0.3%' }
      ]
    }
  ],
  live: [
    {
      type: '视讯',
      minValidBet: '¥100',
      rate: '0.4%',
      children: [
        { type: 'AG视讯', minValidBet: '¥100', rate: '0.4%' },
        { type: 'BBIN视讯', minValidBet: '¥100', rate: '0.4%' },
        { type: 'DG视讯', minValidBet: '¥100', rate: '0.4%' }
      ]
    }
  ]
}

const expandedTreatment = ref([])
const currentTreatmentRows = computed(() => treatmentRowsMap[activeTreatmentGameTab.value] || [])
const toggleTreatment = (type) => {
  const index = expandedTreatment.value.indexOf(type)
  if (index > -1) {
    expandedTreatment.value.splice(index, 1)
  } else {
    expandedTreatment.value.push(type)
  }
}

const showDatePickerPopup = ref(false)
const minDate = new Date(2023, 0, 1)
const maxDate = new Date(2026, 11, 31)
const pickerDateValues = ref(['2026', '03', '08'])
const pickerTarget = ref('start')
const datePickerTitle = computed(() => (pickerTarget.value === 'start' ? '开始时间' : '结束时间'))
const formatSlashDate = (date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}/${mm}/${dd}`
}

const selectQuick = (value) => {
  draftQuick.value = value
  const [start, end] = getRangeByQuick(value)
  draftStartDate.value = start
  draftEndDate.value = end
}

const openTimePopup = () => {
  draftQuick.value = selectedQuick.value
  draftStartDate.value = new Date(selectedStartDate.value)
  draftEndDate.value = new Date(selectedEndDate.value)
  showTimePopup.value = true
}

const openDatePicker = (target = 'start') => {
  pickerTarget.value = target
  const date = target === 'start' ? draftStartDate.value : draftEndDate.value
  pickerDateValues.value = [
    `${date.getFullYear()}`,
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0')
  ]
  showDatePickerPopup.value = true
}

const confirmPickDate = () => {
  const [y, m, d] = pickerDateValues.value
  const picked = new Date(Number(y), Number(m) - 1, Number(d))

  if (pickerTarget.value === 'start') {
    draftStartDate.value = picked
  } else {
    draftEndDate.value = picked
  }
  if (draftStartDate.value > draftEndDate.value) {
    const temp = draftStartDate.value
    draftStartDate.value = draftEndDate.value
    draftEndDate.value = temp
  }
  draftQuick.value = ''
  showDatePickerPopup.value = false
}

const resetTime = () => {
  draftQuick.value = 'today'
  const [start, end] = getRangeByQuick('today')
  draftStartDate.value = start
  draftEndDate.value = end
}

const confirmTime = () => {
  selectedQuick.value = draftQuick.value
  if (recordTimeTabs.some((t) => t.value === draftQuick.value)) {
    activeRecordTimeTab.value = draftQuick.value
  }
  selectedStartDate.value = new Date(draftStartDate.value)
  selectedEndDate.value = new Date(draftEndDate.value)
  showTimePopup.value = false
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/my-rebate.less';
</style>

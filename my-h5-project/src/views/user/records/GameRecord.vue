<template>
  <div class="game-record-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>游戏记录</h1>
    </header>

    <section class="record-filters">
      <button type="button" class="filter-btn" @click="showTimePopup = true">
        <span>{{ currentDateText }}</span>
        <van-icon name="arrow-down" />
      </button>
      <button type="button" class="filter-btn" @click="showPlatformPopup = true">
        <span>{{ currentPlatformText }}</span>
        <van-icon name="arrow-down" />
      </button>
    </section>

    <section class="stat-grid">
      <div class="stat-item">
        <span>订单数量</span>
        <strong>{{ summary.orderCount }}</strong>
      </div>
      <div class="stat-item">
        <span>投注金额</span>
        <strong>¥{{ summary.betAmount }}</strong>
      </div>
      <div class="stat-item">
        <span>有效投注</span>
        <strong>¥{{ summary.validBet }}</strong>
      </div>
      <div class="stat-item">
        <span>输/赢金额</span>
        <strong>
          {{ summary.winLoss >= 0 ? '+' : '-' }}¥{{ Math.abs(summary.winLoss) }}
        </strong>
      </div>
    </section>

    <section v-if="filteredRecords.length" class="record-list">
      <article
        v-for="item in filteredRecords"
        :key="item.id"
        class="record-card"
        @click="goDetail(item.id)"
      >
        <div class="card-main">
          <div class="game-title">{{ item.gameName }}</div>
          <div class="row">
            <span class="row-label">平台:</span>
            <span class="row-value">{{ item.platform }}</span>
          </div>
          <div class="row">
            <span class="row-label">金额:</span>
            <span class="row-value">¥{{ item.amount }}</span>
          </div>
          <div class="row">
            <span class="row-label">时间:</span>
            <span class="row-value">{{ item.orderTime }}</span>
          </div>
          <div class="row">
            <span class="row-label">局号:</span>
            <span class="row-value">{{ item.id }}</span>
            <button type="button" class="copy-btn" @click.stop="copyIssue(item.id)">
              <img :src="iconCopy" alt="copy">
            </button>
          </div>
        </div>
        <div class="card-right">
          <img
            class="status-image"
            :src="statusIconByKey(item.status)"
            alt="status"
            @click.stop="openStatusPopup(item.status)"
          >
          <div v-if="item.status === 'unsettled'" class="amount amount--unsettled">未结算</div>
          <div v-else-if="item.status === 'revoked'" class="amount amount--revoked">已撤销</div>
          <div v-else class="amount" :class="item.winLoss >= 0 ? 'positive' : 'negative'">
            <span>{{ item.winLoss >= 0 ? '' : '-' }}{{ Math.abs(item.winLoss) }}</span>
            <img class="amount-currency" :src="iconCny" alt="">
          </div>
        </div>
      </article>
    </section>

    <div v-else class="record-empty">
      <img :src="noDataImage" alt="no-data">
      <p>暂无数据</p>
    </div>

    <van-popup v-model:show="showPlatformPopup" position="bottom" round class="custom-popup">
      <div class="popup-title-row">
        <span>平台选择</span>
        <img :src="iconClose" alt="close"  @click="showPlatformPopup = false">
      </div>
      <div class="option-list">
        <button
          v-for="item in gamePlatforms"
          :key="item.value"
          type="button"
          class="option-item"
          :class="{ active: selectedPlatform === item.value }"
          @click="selectPlatform(item.value)"
        >
          <span>{{ item.label }}</span>
          <img v-if="selectedPlatform === item.value" class="selected-icon" :src="iconSelected" alt="selected">
          <span v-else class="circle-icon" />
        </button>
      </div>
    </van-popup>

    <van-popup v-model:show="showStatusPopup" position="bottom" round class="custom-popup game-status-popup">
      <div class="game-status-sheet">
        <div class="popup-title-row">
          <span>状态选择</span>
          <button type="button" class="popup-close" @click="showStatusPopup = false">
            <img :src="iconClose" alt="close">
          </button>
        </div>
        <div class="game-status-list">
          <button
            v-for="item in statusOptions"
            :key="item.value"
            type="button"
            class="game-status-option"
            :class="{ active: selectedStatus === item.value }"
            @click="selectStatus(item.value)"
          >
            <img class="game-status-option__icon" :src="item.icon" alt="">
            <span class="game-status-option__label">{{ item.label }}</span>
            <img
              v-if="selectedStatus === item.value"
              class="selected-icon"
              :src="iconSelected"
              alt="selected"
            >
            <span v-else class="circle-icon" />
          </button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="custom-popup">
      <div class="time-panel">
        <h3>下单时间</h3>
        <div class="quick-row">
          <button
            v-for="item in quickOptions"
            :key="item.label"
            type="button"
            class="quick-item"
            :class="{ active: selectedQuick === item.value }"
            @click="selectQuick(item.value)"
          >
            {{ item.label }}
            <img v-if="selectedQuick === item.value" class="selected-icon" :src="iconSelected" alt="selected">
            <span v-else class="circle-icon" />
          </button>
        </div>

        <div class="range-row">
          <button type="button" class="date-cell" @click="openDatePicker('start')">{{ formatSlashDate(startDate) }}</button>
          <span>-</span>
          <button type="button" class="date-cell" @click="openDatePicker('end')">{{ formatSlashDate(endDate) }}</button>
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
          <span>{{ pickerTarget === 'start' ? '开始时间' : '结束时间' }}</span>
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
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconClose from '@/assets/icon_x.svg'
import toast from '@/components/Toast'
import { gamePlatforms, gameRecords } from './game-record.mock'
import iconCopy from '@/assets/icon_copy.svg'
import iconCny from '@/assets/icon_cny.svg'
import iconSettled from '@/assets/icon_settled.svg'
import iconUnsettled from '@/assets/icon_unsettled.svg'
import iconRevoked from '@/assets/icon_revoked.svg'

const router = useRouter()
const goBack = () => router.back()

const showPlatformPopup = ref(false)
const showStatusPopup = ref(false)
const showTimePopup = ref(false)
const selectedStatus = ref('all')

const statusOptions = [
  { value: 'settled', label: '已结算', icon: iconSettled },
  { value: 'unsettled', label: '未结算', icon: iconUnsettled },
  { value: 'revoked', label: '已撤销', icon: iconRevoked }
]

const statusIconMap = {
  settled: iconSettled,
  unsettled: iconUnsettled,
  revoked: iconRevoked
}

const statusIconByKey = (status) => statusIconMap[status] || iconUnsettled

const openStatusPopup = (status) => {
  if (status && statusIconMap[status]) {
    selectedStatus.value = status
  }
  showStatusPopup.value = true
}

const selectStatus = (value) => {
  selectedStatus.value = value
  showStatusPopup.value = false
}
const showDatePickerPopup = ref(false)
const pickerTarget = ref('start')
const selectedPlatform = ref('all')

const quickOptions = [
  { label: '24小时内', value: '24h' },
  { label: '48小时内', value: '48h' },
  { label: '15天内', value: '15d' },
  { label: '30天内', value: '30d' }
]
const selectedQuick = ref('24h')

const minDate = new Date(2023, 0, 1)
const maxDate = new Date(2026, 11, 31)
const startDate = ref(new Date(2026, 2, 10))
const endDate = ref(new Date(2026, 2, 11))
const pickerDateValues = ref(['2026', '03', '10'])

const currentDateText = computed(() => `${formatDate(startDate.value)}-${formatDate(endDate.value)}`)
const currentPlatformText = computed(
  () => gamePlatforms.find(i => i.value === selectedPlatform.value)?.label || '所有'
)

const formatDate = (date) => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
const formatSlashDate = (date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}/${mm}/${dd}`
}
const inRange = (timeText, start, end) => {
  const d = new Date(timeText.replace(/-/g, '/'))
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  return d >= s && d <= e
}

const filteredRecords = computed(() => gameRecords.filter((item) => {
  const platformOk = selectedPlatform.value === 'all' || item.platformType === selectedPlatform.value
  const dateOk = inRange(item.orderTime, startDate.value, endDate.value)
  const statusOk = selectedStatus.value === 'all' || item.status === selectedStatus.value
  return platformOk && dateOk && statusOk
}))

const summary = computed(() => filteredRecords.value.reduce((acc, item) => {
  acc.orderCount += 1
  acc.betAmount += item.amount
  acc.validBet += item.validBet
  acc.winLoss += item.winLoss
  return acc
}, { orderCount: 0, betAmount: 0, validBet: 0, winLoss: 0 }))

const selectPlatform = (value) => {
  selectedPlatform.value = value
  showPlatformPopup.value = false
}

const selectQuick = (value) => {
  selectedQuick.value = value
  const daysMap = { '24h': 1, '48h': 2, '15d': 15, '30d': 30 }
  const days = daysMap[value]
  const end = new Date(2026, 2, 11)
  const start = new Date(end)
  start.setDate(end.getDate() - days + 1)
  startDate.value = start
  endDate.value = end
}

const openDatePicker = (target) => {
  pickerTarget.value = target
  const date = target === 'start' ? startDate.value : endDate.value
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
    startDate.value = picked
  } else {
    endDate.value = picked
  }
  if (startDate.value > endDate.value) {
    const temp = startDate.value
    startDate.value = endDate.value
    endDate.value = temp
  }
  selectedQuick.value = ''
  showDatePickerPopup.value = false
}

const resetTime = () => {
  selectedQuick.value = '24h'
  startDate.value = new Date(2026, 2, 10)
  endDate.value = new Date(2026, 2, 11)
}
const confirmTime = () => {
  showTimePopup.value = false
}

const goDetail = (id) => router.push({ name: 'gameRecordDetail', query: { id } })

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
@import '@/styles/pages/game-record.less';
</style>

<template>
  <div class="transaction-record-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>交易记录</h1>
    </header>

    <section class="record-tabs">
      <button
        v-for="item in typeTabs"
        :key="item.value"
        type="button"
        class="tab-btn"
        :class="{ active: activeType === item.value }"
        @click="activeType = item.value"
      >
        {{ item.label }}
      </button>
    </section>

    <section class="record-filters">
      <button type="button" class="filter-btn wide" @click="showDatePopup = true">
        <span>{{ currentDateText }}</span>
        <van-icon name="arrow-down" />
      </button>
      <button type="button" class="filter-btn" @click="showCategoryPopup = true">
        <span>{{ currentCategoryText }}</span>
        <van-icon name="arrow-down" />
      </button>
    </section>

    <section v-if="filteredRecords.length" class="record-list">
      <article
        v-for="item in filteredRecords"
        :key="item.id"
        class="record-item"
        role="button"
        tabindex="0"
        @click="goDetail(item.id)"
        @keydown.enter.prevent="goDetail(item.id)"
      >
        <div class="item-left">
          <div class="item-title">{{ item.title }}</div>
          <div class="item-time">{{ item.time }}</div>
        </div>
        <div class="item-amount" :class="item.amount >= 0 ? 'positive' : 'negative'">
          {{ item.amount >= 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
        </div>
      </article>
    </section>

    <div v-else class="record-empty">
      <img :src="noDataImage" alt="no-data">
      <p>暂无数据</p>
    </div>

    <van-calendar
      v-model:show="showDatePopup"
      title="日期选择"
      type="range"
      :show-confirm="true"
      switch-mode="month"
      :min-date="minDate"
      :max-date="maxDate"
      :default-date="selectedDateRange"
      @confirm="onConfirmDateRange"
    />

    <van-popup v-model:show="showCategoryPopup" position="bottom" round class="custom-popup">
      <div class="popup-title-row">
        <span>分类选择</span>
        <button type="button" class="popup-close" @click="showCategoryPopup = false">
          <img :src="iconClose" alt="close">
        </button>
      </div>
      <div class="category-list">
        <button
          v-for="item in categories"
          :key="item.value"
          type="button"
          class="category-item"
          :class="{ active: selectedCategory === item.value }"
          @click="selectCategory(item.value)"
        >
          <span>{{ item.label }}</span>
          <img
            v-if="selectedCategory === item.value"
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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSelected from '@/assets/icon_sel.svg'
import iconClose from '@/assets/icon_x.svg'
import { transactionRecords } from '@/views/user/records/transaction-record.mock'

const router = useRouter()

const typeTabs = [
  { label: '所有', value: 'all' },
  { label: '充值', value: 'deposit' },
  { label: '提现', value: 'withdraw' },
  { label: '活动', value: 'activity' }
]
const activeType = ref('all')

const categories = [
  { label: '所有', value: 'all' },
  { label: '充值', value: 'deposit' },
  { label: '提现', value: 'withdraw' },
  { label: '游戏记录', value: 'game' },
  { label: '彩票返水', value: 'rebate' },
  { label: '活动', value: 'activity' },
  { label: '流水返利', value: 'flowRebate' }
]

const records = ref([...transactionRecords])
const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2030, 11, 31)
const selectedDateRange = ref([new Date(2026, 2, 10), new Date(2026, 2, 11)])
const selectedCategory = ref('all')

const showDatePopup = ref(false)
const showCategoryPopup = ref(false)

const formatDate = (date) => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
const currentDateText = computed(() => {
  const [start, end] = selectedDateRange.value
  return `${formatDate(start)}-${formatDate(end)}`
})
const currentCategoryText = computed(
  () => categories.find(i => i.value === selectedCategory.value)?.label || '所有'
)

const inRange = (timeText, startDate, endDate) => {
  const d = new Date(timeText.replace(/-/g, '/'))
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
  return d >= start && d <= end
}

const mapTabToTypes = {
  all: ['deposit', 'withdraw', 'activity', 'game', 'rebate', 'flowRebate'],
  deposit: ['deposit'],
  withdraw: ['withdraw'],
  activity: ['activity']
}

const filteredRecords = computed(() => {
  const [start, end] = selectedDateRange.value
  return records.value.filter((item) => {
    const matchTab = mapTabToTypes[activeType.value].includes(item.type)
    const matchCategory = selectedCategory.value === 'all' || item.type === selectedCategory.value
    const matchDate = inRange(item.time, start, end)
    return matchTab && matchCategory && matchDate
  })
})

const goBack = () => router.back()
const goDetail = (id) => router.push({ name: 'transactionRecordDetail', query: { id: String(id) } })
const onConfirmDateRange = (dates) => {
  if (!Array.isArray(dates) || dates.length !== 2) return
  selectedDateRange.value = dates
  showDatePopup.value = false
}
const selectCategory = (value) => {
  selectedCategory.value = value
  showCategoryPopup.value = false
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/transaction-record.less';
</style>

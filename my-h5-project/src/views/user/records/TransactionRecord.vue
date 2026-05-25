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
        @click="onTabChange(item.value)"
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

    <van-list
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="loadRecords"
    >
      <section v-if="records.length" class="record-list">
        <article
          v-for="item in records"
          :key="item.id"
          class="record-item"
          role="button"
          tabindex="0"
          @click="goDetail(item)"
          @keydown.enter.prevent="goDetail(item)"
        >
          <div class="item-left">
            <div class="item-title">{{ item.typeLabel }}</div>
            <div class="item-time">{{ item.createdAt || item.time }}</div>
            <div v-if="item.statusName" class="item-status">{{ item.statusName }}</div>
          </div>
          <div
            class="item-amount"
            :class="item.displayAmount >= 0 ? 'positive' : 'negative'"
          >
            {{ item.displayAmount >= 0 ? '+' : '' }}{{ formatAmount(item.displayAmount) }}
          </div>
        </article>
      </section>

      <div v-else-if="!loading && initialized" class="record-empty">
        <img :src="noDataImage" alt="no-data">
        <p>暂无数据</p>
      </div>
    </van-list>

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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSelected from '@/assets/icon_sel.svg'
import iconClose from '@/assets/icon_x.svg'
import { fetchTransactionRecords, formatRecordDateTime } from '@/api/record'
import { setTransactionRecordCache } from '@/utils/transactionRecordCache'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const PAGE_SIZE = 20

const typeTabs = [
  { label: '所有', value: 'all' },
  { label: '充值', value: 'recharge' },
  { label: '提现', value: 'withdraw' },
  { label: '活动', value: 'activity' }
]

const categories = [
  { label: '所有', value: 'all' },
  { label: '充值', value: 'recharge' },
  { label: '提现', value: 'withdraw' },
  { label: '活动', value: 'activity' }
]

const activeType = ref('all')
const records = ref([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)
const initialized = ref(false)
const resetting = ref(false)

const minDate = new Date(2020, 0, 1)
const maxDate = new Date()

const createDefaultDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  return [start, end]
}

const selectedDateRange = ref(createDefaultDateRange())
const selectedCategory = ref('all')

const showDatePopup = ref(false)
const showCategoryPopup = ref(false)

const formatDate = (date) => `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

const currentDateText = computed(() => {
  const [start, end] = selectedDateRange.value
  if (!start || !end) return '--'
  return `${formatDate(start)}-${formatDate(end)}`
})

const currentCategoryText = computed(
  () => categories.find((i) => i.value === selectedCategory.value)?.label || '所有'
)

const formatAmount = (value) => {
  const n = Number(value)
  return (Number.isNaN(n) ? 0 : n).toFixed(2)
}

/** @returns {import('@/api/record').TransactionRecordType} */
const resolveApiType = () => {
  if (selectedCategory.value !== 'all') {
    return selectedCategory.value
  }
  return activeType.value
}

const buildQueryParams = () => {
  const [start, end] = selectedDateRange.value
  return {
    page: page.value,
    page_size: PAGE_SIZE,
    type: resolveApiType(),
    start_time: start ? formatRecordDateTime(start, false) : undefined,
    end_time: end ? formatRecordDateTime(end, true) : undefined
  }
}

const resetAndReload = () => {
  resetting.value = true
  page.value = 1
  total.value = 0
  records.value = []
  finished.value = false
  initialized.value = false
  loading.value = true
  loadRecords()
}

const loadRecords = async () => {
  if (!userStore.isLogin) {
    loading.value = false
    finished.value = true
    router.replace({ name: 'login', query: { redirect: '/transaction-record' } })
    return
  }

  try {
    const res = await fetchTransactionRecords(buildQueryParams())
    if (page.value === 1) {
      records.value = res.list
    } else {
      records.value = [...records.value, ...res.list]
    }
    total.value = res.total
    finished.value = records.value.length >= total.value || res.list.length < PAGE_SIZE
    if (!finished.value) {
      page.value += 1
    }
  } catch (error) {
    console.error('加载交易记录失败:', error)
    finished.value = true
  } finally {
    loading.value = false
    initialized.value = true
    if (resetting.value) {
      resetting.value = false
    }
  }
}

const onTabChange = (value) => {
  if (activeType.value === value) return
  activeType.value = value
  if (selectedCategory.value !== 'all') {
    selectedCategory.value = 'all'
  }
  resetAndReload()
}

const goBack = () => router.back()

const goDetail = (item) => {
  setTransactionRecordCache(item)
  router.push({ name: 'transactionRecordDetail', query: { id: String(item.id) } })
}

const onConfirmDateRange = (dates) => {
  if (!Array.isArray(dates) || dates.length !== 2) return
  selectedDateRange.value = dates
  showDatePopup.value = false
  resetAndReload()
}

const selectCategory = (value) => {
  selectedCategory.value = value
  showCategoryPopup.value = false
  resetAndReload()
}

onMounted(() => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/transaction-record' } })
    return
  }
  resetAndReload()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/transaction-record.less';
</style>

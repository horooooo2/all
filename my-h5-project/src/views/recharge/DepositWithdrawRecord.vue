<template>
  <div class="deposit-withdraw-record-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('交易记录') }}</h1>
    </header>

    <main class="content">
      <section class="filters">
        <button type="button" class="filter-btn" @click="showTimePopup = true">
          <span>{{ timeText }}</span>
          <van-icon name="arrow-down" />
        </button>
        <button type="button" class="filter-btn" @click="showCategoryPopup = true">
          <span>{{ categoryText }}</span>
          <van-icon name="arrow-down" />
        </button>
      </section>

      <section v-if="filteredList.length" class="list">
        <article
          v-for="item in filteredList"
          :key="item.id"
          class="cell"
          role="button"
          tabindex="0"
          @click="goDetail(item.id)"
          @keydown.enter.prevent="goDetail(item.id)"
        >
          <div class="cell-left">
            <div class="cell-title">
              <span class="cell-title-text">{{ item.categoryLabel }}</span>
              <img
                v-if="item.channel === 'cny'"
                class="tag-cny"
                :src="iconCny"
                alt="CNY"
              >
              <span v-else class="tag" :class="item.channel">{{ item.channelLabel }}</span>
            </div>
            <div class="cell-sub">
              <span class="cell-sub__label">{{ $t('时间：') }}</span>
              <span class="cell-sub__value">{{ item.time }}</span>
            </div>
            <div class="cell-sub cell-sub--order">
              <span class="cell-sub__label">{{ $t('订单号：') }}</span>
              <span class="cell-sub__value">{{ item.orderNo }}</span>
              <button type="button" class="copy-icon" @click.stop="copy(item.orderNo)">
                <img :src="iconCopy" alt="copy">
              </button>
            </div>
          </div>

          <div class="cell-right">
            <div class="amount" :class="item.kind">{{ item.kind === 'deposit' ? '+' : '-' }}{{ item.amount }}</div>
            <div class="status" :class="item.status">{{ item.statusLabel }}</div>
          </div>
        </article>
      </section>

      <section v-else class="empty">
        <img :src="noDataImage" alt="no-data" />
        <div class="empty-text">{{ $t('暂无数据') }}</div>
      </section>
    </main>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="sheet-popup">
      <div class="sheet">
        <div class="sheet-header">
          <div class="sheet-title">{{ $t('时间选择') }}</div>
          <button type="button" class="sheet-close" @click="showTimePopup = false">
            <img :src="iconClose" alt="close">
          </button>
        </div>

        <button
          v-for="opt in timeOptions"
          :key="opt.value"
          type="button"
          class="sheet-option"
          :class="{ active: selectedTime === opt.value }"
          @click="selectTime(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <span class="sheet-indicator" :class="{ active: selectedTime === opt.value }" />
        </button>
      </div>
    </van-popup>

    <van-popup v-model:show="showCategoryPopup" position="bottom" round class="sheet-popup">
      <div class="sheet">
        <div class="sheet-header">
          <div class="sheet-title">{{ $t('分类选择') }}</div>
          <button type="button" class="sheet-close" @click="showCategoryPopup = false">
            <img :src="iconClose" alt="close">
          </button>
        </div>

        <button
          v-for="opt in categoryOptions"
          :key="opt.value"
          type="button"
          class="sheet-option"
          :class="{ active: selectedCategory === opt.value }"
          @click="selectCategory(opt.value)"
        >
          <span>{{ opt.label }}</span>
          <span class="sheet-indicator" :class="{ active: selectedCategory === opt.value }" />
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
import toast from '@/components/Toast'
import iconBack from '@/assets/icon_dack.svg'
import iconClose from '@/assets/icon_x.svg'
import iconCopy from '@/assets/icon_copy.svg'
import iconCny from '@/assets/icon_cny.svg'
import noDataImage from '@/assets/no_data.svg'
import { depositWithdrawRecords } from '@/views/recharge/deposit-withdraw-record.mock'

const router = useRouter()
const showTimePopup = ref(false)
const showCategoryPopup = ref(false)

const timeOptions = [
  { label: t('所有'), value: 'all' },
  { label: t('24小时内'), value: '24h' },
  { label: t('7天内'), value: '7d' },
  { label: t('15天内'), value: '15d' },
  { label: t('30天内'), value: '30d' }
]

const categoryOptions = [
  { label: t('所有'), value: 'all' },
  { label: t('存款'), value: 'deposit' },
  { label: t('取款'), value: 'withdraw' },
  { label: t('成功'), value: 'success' },
  { label: t('失败'), value: 'failed' },
  { label: t('处理中'), value: 'processing' }
]

const selectedTime = ref('all')
const selectedCategory = ref('all')

const list = ref(depositWithdrawRecords)

const timeText = computed(() => timeOptions.find(x => x.value === selectedTime.value)?.label || t('所有'))
const categoryText = computed(() => categoryOptions.find(x => x.value === selectedCategory.value)?.label || t('所有'))

const filteredList = computed(() => {
  const now = Date.now()
  const inTime = (t) => {
    if (selectedTime.value === 'all') return true
    const ts = new Date(String(t).replace(/-/g, '/')).getTime()
    const diff = now - ts
    const day = 24 * 60 * 60 * 1000
    if (selectedTime.value === '24h') return diff <= day
    if (selectedTime.value === '7d') return diff <= 7 * day
    if (selectedTime.value === '15d') return diff <= 15 * day
    if (selectedTime.value === '30d') return diff <= 30 * day
    return true
  }

  const inCategory = (item) => {
    const c = selectedCategory.value
    if (c === 'all') return true
    if (c === 'deposit' || c === 'withdraw') return item.kind === c
    if (c === 'success') return item.status === 'success'
    if (c === 'failed') return item.status === 'failed'
    if (c === 'processing') return item.status === 'processing'
    return true
  }

  return list.value.filter((x) => inTime(x.time) && inCategory(x))
})

const goBack = () => router.back()

const goDetail = (id) => {
  router.push({ name: 'depositWithdrawRecordDetail', query: { id } })
}

const selectTime = (value) => {
  selectedTime.value = value
  showTimePopup.value = false
}

const selectCategory = (value) => {
  selectedCategory.value = value
  showCategoryPopup.value = false
}

const copy = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(t('已复制'))
  } catch (e) {
    toast.warning(text)
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/deposit-withdraw-record.less';
</style>


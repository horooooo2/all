<template>
  <div class="transaction-record-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>交易记录</h1>
    </header>

    <main v-if="detail" class="detail-main">
      <section class="detail-card">
        <div class="detail-amount" :class="detail.displayAmount >= 0 ? 'positive' : 'negative'">
          {{ detail.displayAmount >= 0 ? '+' : '-' }}¥{{ displayAmountText }}
        </div>

        <div class="detail-rows">
          <div class="detail-row">
            <span class="detail-label">交易类型</span>
            <span class="detail-value">{{ detail.typeLabel }}</span>
          </div>
          <div v-if="detail.statusName" class="detail-row">
            <span class="detail-label">状态</span>
            <span class="detail-value">{{ detail.statusName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">订单编号</span>
            <div class="detail-value-wrap">
              <span class="detail-value detail-value--order">{{ detail.orderNo || '--' }}</span>
              <button
                v-if="detail.orderNo"
                type="button"
                class="copy-btn"
                @click="copyOrderNo"
              >
                复制
              </button>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-label">金额</span>
            <span class="detail-value">¥{{ formatAmount(detail.amount) }}</span>
          </div>
          <div
            v-if="showActualAmount"
            class="detail-row"
          >
            <span class="detail-label">实际金额</span>
            <span class="detail-value">¥{{ formatAmount(detail.actualAmount) }}</span>
          </div>
          <div v-if="detail.remark" class="detail-row">
            <span class="detail-label">备注</span>
            <span class="detail-value">{{ detail.remark }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ detail.createdAt || '--' }}</span>
          </div>
        </div>
      </section>
    </main>

    <div v-else class="detail-empty">
      <p>记录不存在或已删除</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'
import { getTransactionRecordCache } from '@/utils/transactionRecordCache'
import { copyTextToClipboard } from '@/utils/copyText'

const route = useRoute()
const router = useRouter()
const detail = ref(null)

const formatAmount = (value) => {
  const n = Number(value)
  return (Number.isNaN(n) ? 0 : Math.abs(n)).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const displayAmountText = computed(() => {
  if (!detail.value) return '0.00'
  return formatAmount(detail.value.displayAmount)
})

const showActualAmount = computed(() => {
  if (!detail.value) return false
  return Number(detail.value.actualAmount) !== Number(detail.value.amount)
})

const load = () => {
  const id = route.query.id
  detail.value = id ? getTransactionRecordCache(id) : null
}

const goBack = () => router.back()

const copyOrderNo = async () => {
  const text = detail.value?.orderNo
  if (!text) return
  const ok = await copyTextToClipboard(text)
  if (ok) {
    toast.success('已复制')
  } else {
    toast.warning(text)
  }
}

onMounted(() => {
  load()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/transaction-record-detail.less';
</style>

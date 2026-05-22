<template>
  <div class="transaction-record-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>交易记录</h1>
    </header>

    <main v-if="detail" class="detail-main">
      <section class="detail-card">
        <div class="detail-amount" :class="detail.amount >= 0 ? 'positive' : 'negative'">
          {{ detail.amount >= 0 ? '' : '-' }}¥{{ amountText }}
        </div>

        <div class="detail-rows">
          <div class="detail-row">
            <span class="detail-label">交易类型</span>
            <span class="detail-value">{{ detail.typeLabel }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">订单编号</span>
            <div class="detail-value-wrap">
              <span class="detail-value detail-value--order">{{ detail.orderNo }}</span>
              <button type="button" class="copy-btn" @click="copyOrderNo">复制</button>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-label">目标</span>
            <span class="detail-value">{{ detail.target }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">完成时间</span>
            <span class="detail-value">{{ detail.completedAt }}</span>
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
import { getTransactionRecordById } from '@/views/user/records/transaction-record.mock'

const route = useRoute()
const router = useRouter()
const detail = ref(null)

const amountText = computed(() => {
  if (!detail.value) return '0.00'
  return Math.abs(detail.value.amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

const load = () => {
  const id = route.query.id
  detail.value = id ? getTransactionRecordById(id) : null
}

const goBack = () => router.back()

const copyOrderNo = async () => {
  const text = detail.value?.orderNo
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制')
  } catch (e) {
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

<template>
  <div class="dw-record-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ pageTitle }}</h1>
    </header>

    <template v-if="detail">
      <main class="detail-main">
        <section class="detail-card">
          <div class="detail-hero">
            <div class="detail-amount-line">
              <span v-if="detail.amountSymbol" class="detail-amount-symbol">{{ detail.amountSymbol }}</span>
              <span class="detail-amount-num">{{ displayAmount }}</span>
              <span v-if="detail.amountUnit" class="detail-amount-unit">{{ detail.amountUnit }}</span>
            </div>
            <p v-if="isPaymentPending" class="detail-countdown">
              请在 <span class="detail-countdown__time">{{ countdownText }}</span> 内完成支付
            </p>
          </div>

          <div class="detail-rows">
            <div
              v-for="row in infoRows"
              :key="row.key"
              class="detail-row"
              :class="{ 'detail-row--multiline': row.multiline }"
            >
              <span class="detail-label">{{ row.label }}</span>
              <span class="detail-value">{{ row.value }}</span>
              <button
                v-if="row.copyable"
                type="button"
                class="detail-copy"
                aria-label="复制"
                @click="copyText(row.value)"
              >
                <img :src="iconCopy" alt="copy">
              </button>
            </div>
          </div>

          <div v-if="isPaymentPending" class="detail-qr">
            <div class="detail-qr__box">
              <img
                v-if="detail.qrCodeUrl"
                class="detail-qr__img"
                :src="detail.qrCodeUrl"
                alt="支付二维码"
              >
            </div>
            <button type="button" class="detail-qr__save" @click="onSaveQr">保存二维码</button>
          </div>
        </section>
      </main>

      <footer v-if="isPaymentPending" class="detail-footer">
        <button type="button" class="detail-footer__cancel" @click="onCancelDeposit">
          未付款并取消存款
        </button>
        <button type="button" class="detail-footer__submit" @click="onUploadProof">
          已付款并上传凭证
        </button>
      </footer>
    </template>

    <div v-else class="detail-empty">
      <p>记录不存在或已删除</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconCopy from '@/assets/icon_copy.svg'
import toast from '@/components/Toast'
import { getDepositWithdrawRecordById } from '@/views/recharge/deposit-withdraw-record.mock'

const route = useRoute()
const router = useRouter()
const detail = ref(null)
const countdownSeconds = ref(0)
let countdownTimer = null

const isPaymentPending = computed(
  () => detail.value?.kind === 'deposit' && detail.value?.status === 'processing'
)

const pageTitle = computed(() => {
  if (!detail.value) return '详情'
  if (detail.value.kind === 'deposit' && isPaymentPending.value) return '存款信息'
  return detail.value.kind === 'withdraw' ? '取款详情' : '存款详情'
})

const displayAmount = computed(() => {
  if (!detail.value) return ''
  return detail.value.amountValue || detail.value.amount
})

const countdownText = computed(() => {
  const s = Math.max(0, countdownSeconds.value)
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
})

const infoRows = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  if (isPaymentPending.value) {
    return [
      { key: 'orderNo', label: '订单号码：', value: d.orderNo, copyable: true },
      { key: 'protocol', label: '协议名称：', value: d.protocolName || '—', copyable: false },
      {
        key: 'wallet',
        label: '钱包地址：',
        value: d.walletAddress || '—',
        copyable: true,
        multiline: true
      },
      { key: 'name', label: '收款姓名：', value: d.recipientName || '—', copyable: true },
      { key: 'remark', label: '备注：', value: d.remark || '—', copyable: true },
      { key: 'createdAt', label: '创建时间：', value: d.createdAt || d.time, copyable: true }
    ]
  }
  return [
    { key: 'orderNo', label: '订单号：', value: d.orderNo, copyable: true },
    { key: 'payMethod', label: '支付方式：', value: d.payMethod || '—', copyable: false },
    { key: 'time', label: '下单时间：', value: d.time, copyable: false },
    { key: 'completedAt', label: '完成时间：', value: d.completedAt || '—', copyable: false },
    { key: 'status', label: '状态：', value: d.statusLabel, copyable: false }
  ]
})

const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const startCountdown = () => {
  clearCountdown()
  if (!isPaymentPending.value) return
  const total = Number(detail.value?.payCountdownSeconds) || 0
  countdownSeconds.value = total > 0 ? total : 0
  if (countdownSeconds.value <= 0) return
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value <= 0) {
      clearCountdown()
      return
    }
    countdownSeconds.value -= 1
  }, 1000)
}

const load = () => {
  const id = route.query.id
  detail.value = id ? getDepositWithdrawRecordById(id) : null
  startCountdown()
}

const goBack = () => router.back()

const copyText = async (text) => {
  if (!text || text === '—') return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制')
  } catch {
    toast.warning(text)
  }
}

const onSaveQr = () => {
  if (!detail.value?.qrCodeUrl) {
    toast.success('保存二维码（待对接）')
    return
  }
  toast.success('保存二维码（待对接）')
}

const onCancelDeposit = () => {
  toast.success('取消存款（待对接）')
}

const onUploadProof = () => {
  router.push({
    name: 'depositUploadProof',
    query: { id: route.query.id }
  })
}

onMounted(() => {
  load()
})

onUnmounted(() => {
  clearCountdown()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/deposit-withdraw-record-detail.less';
</style>

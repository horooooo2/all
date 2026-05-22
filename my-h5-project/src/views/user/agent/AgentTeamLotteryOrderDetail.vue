<template>
  <div v-if="order" class="agent-subpage atl-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>订单详情</h1>
    </header>

    <div class="atl-detail-body">
      <section class="atl-detail-card">
        <div class="atl-detail-head">
          <span class="atl-detail-tag" :class="resultTagClass(order.betResult)">{{ resultLabel(order.betResult) }}</span>
          <h2 class="atl-detail-game">{{ order.gameName }}</h2>
        </div>

        <div class="atl-detail-summary">
          <div class="atl-detail-col">
            <p class="atl-detail-kv"><span>倍数:</span> {{ order.multiplier }}</p>
            <p class="atl-detail-kv"><span>有效投注:</span> ¥{{ fmtMoney(order.validBet) }}</p>
            <p class="atl-detail-kv"><span>奖金:</span> ¥{{ fmtMoney(order.bonus) }}</p>
          </div>
          <div class="atl-detail-col">
            <p class="atl-detail-kv"><span>下注:</span> ¥{{ fmtMoney(order.amount) }}</p>
            <p class="atl-detail-kv"><span>奖金模式:</span> {{ order.prizeMode }}</p>
          </div>
        </div>

        <div class="atl-detail-divider" aria-hidden="true" />

        <div class="atl-detail-rows">
          <div class="atl-detail-row">
            <span class="atl-detail-row__k">开奖号码</span>
            <span class="atl-detail-row__v">{{ order.drawNumbers }}</span>
          </div>
          <div class="atl-detail-row">
            <span class="atl-detail-row__k">开奖时间</span>
            <span class="atl-detail-row__v">{{ order.drawTime || '—' }}</span>
          </div>
          <div class="atl-detail-row">
            <span class="atl-detail-row__k">下单时间</span>
            <span class="atl-detail-row__v">{{ order.orderTime }}</span>
          </div>
          <div class="atl-detail-row atl-detail-row--copy">
            <span class="atl-detail-row__k">下单编号</span>
            <span class="atl-detail-row__r">
              <span class="atl-detail-row__v">{{ order.memberAccount }}</span>
              <button type="button" class="atl-detail-copy" aria-label="复制下单编号" @click="copyText(order.memberAccount)">
                <img :src="iconCopy" alt="">
              </button>
            </span>
          </div>
          <div class="atl-detail-row atl-detail-row--copy">
            <span class="atl-detail-row__k">订单编号</span>
            <span class="atl-detail-row__r">
              <span class="atl-detail-row__v atl-detail-row__v--mono">{{ order.orderNo }}</span>
              <button type="button" class="atl-detail-copy" aria-label="复制订单编号" @click="copyText(order.orderNo)">
                <img :src="iconCopy" alt="">
              </button>
            </span>
          </div>
          <div class="atl-detail-row atl-detail-row--copy">
            <span class="atl-detail-row__k">投注期号</span>
            <span class="atl-detail-row__r">
              <span class="atl-detail-row__v">{{ order.issueNo }}</span>
              <button type="button" class="atl-detail-copy" aria-label="复制投注期号" @click="copyText(order.issueNo)">
                <img :src="iconCopy" alt="">
              </button>
            </span>
          </div>
          <div class="atl-detail-row atl-detail-row--last">
            <span class="atl-detail-row__k">投注内容</span>
            <span class="atl-detail-row__v">{{ order.betPick }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconCopy from '@/assets/icon_copy.svg'
import toast from '@/components/Toast'
import { getTeamLotteryOrderById } from './agent-team-lottery-records.mock'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => {
  const raw = route.query.id
  if (Array.isArray(raw)) return raw[0] ?? ''
  return raw ?? ''
})

const order = computed(() => getTeamLotteryOrderById(orderId.value))

watch(
  orderId,
  (id) => {
    if (!id || !getTeamLotteryOrderById(id)) {
      toast.error('未找到订单')
      router.replace({ name: 'agentTeamLotteryRecords' })
    }
  },
  { immediate: true }
)

const resultLabel = (r) => {
  if (r === 'pending') return '未开奖'
  if (r === 'won') return '已中奖'
  return '未中奖'
}

const resultTagClass = (r) => {
  if (r === 'pending') return 'atl-detail-tag--pending'
  if (r === 'won') return 'atl-detail-tag--won'
  return 'atl-detail-tag--lost'
}

const fmtMoney = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  return v.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'agentTeamLotteryRecords' })
}

const copyText = async (text) => {
  try {
    const s = String(text ?? '')
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(s)
    } else {
      const input = document.createElement('input')
      input.value = s
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    toast.success('已复制')
  } catch {
    toast.error('复制失败')
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-team-lottery-order-detail.less';
</style>

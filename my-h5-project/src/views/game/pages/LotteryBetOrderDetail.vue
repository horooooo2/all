<template>
  <div v-if="order" class="lbod">
    <header class="lbod-header">
      <img :src="iconBack" alt="" class="lbod-header__back" @click="goBack" />
      <h1 class="lbod-header__title">订单详情</h1>
      <span class="lbod-header__pad" aria-hidden="true" />
    </header>

    <div class="lbod-scroll">
      <section class="lbod-card lbod-card--summary">
        <div class="lbod-summary__top">
          <span class="lbod-pill" :class="`is-${order.statusKey}`">{{ order.statusText }}</span>
          <p class="lbod-summary__title">{{ order.betTitle }}</p>
        </div>
        <div class="lbod-summary__grid">
          <div class="lbod-kv"><span class="lbod-kv__k">倍数:</span> <span class="lbod-kv__v">{{ order.multiplier }}</span></div>
          <div class="lbod-kv"><span class="lbod-kv__k">奖金:</span> <span class="lbod-kv__v">{{ order.bonus }}</span></div>
          <div class="lbod-kv"><span class="lbod-kv__k">返水:</span> <span class="lbod-kv__v">{{ order.rebate }}</span></div>
          <div class="lbod-kv"><span class="lbod-kv__k">下注:</span> <span class="lbod-kv__v">{{ order.betStake }}</span></div>
          <div class="lbod-kv lbod-kv--span2"><span class="lbod-kv__k">赔率:</span> <span class="lbod-kv__v">{{ order.odds }}</span></div>
        </div>
      </section>

      <section class="lbod-card lbod-card--detail">
        <div class="lbod-row">
          <span class="lbod-row__k">开奖号/span>
          <span class="lbod-row__v">{{ order.drawNumbers }}</span>
        </div>
        <div class="lbod-row">
          <span class="lbod-row__k">开奖时/span>
          <span class="lbod-row__v">{{ order.drawTime }}</span>
        </div>
        <div class="lbod-row">
          <span class="lbod-row__k">下单时间</span>
          <span class="lbod-row__v">{{ order.orderTime }}</span>
        </div>
        <div class="lbod-row lbod-row--copy">
          <span class="lbod-row__k">下单账户</span>
          <span class="lbod-row__r">
            <span class="lbod-row__v">{{ order.account }}</span>
            <button type="button" class="lbod-copy" aria-label="复制账户" @click="copyText(order.account)">
              <img :src="iconCopy" alt="" />
            </button>
          </span>
        </div>
        <div class="lbod-row lbod-row--copy">
          <span class="lbod-row__k">订单编号</span>
          <span class="lbod-row__r">
            <span class="lbod-row__v lbod-row__v--mono">{{ order.orderNo }}</span>
            <button type="button" class="lbod-copy" aria-label="复制订单编号" @click="copyText(order.orderNo)">
              <img :src="iconCopy" alt="" />
            </button>
          </span>
        </div>
        <div class="lbod-row lbod-row--copy">
          <span class="lbod-row__k">投注期号</span>
          <span class="lbod-row__r">
            <span class="lbod-row__v">{{ order.issue }}</span>
            <button type="button" class="lbod-copy" aria-label="复制期号" @click="copyText(order.issue)">
              <img :src="iconCopy" alt="" />
            </button>
          </span>
        </div>
        <div class="lbod-row lbod-row--copy lbod-row--last">
          <span class="lbod-row__k">投注内容</span>
          <span class="lbod-row__r">
            <span class="lbod-row__v">{{ order.betContent }}</span>
            <button type="button" class="lbod-copy" aria-label="复制投注内容" @click="copyText(order.betContent)">
              <img :src="iconCopy" alt="" />
            </button>
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/components/Toast'
import iconBack from '@/assets/icon_dack.svg'
import iconCopy from '@/assets/icon_copy.svg'
import { getDemoBetOrderById } from './lottery-bet-records.mock'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => {
  const raw = route.query.id
  if (Array.isArray(raw)) return raw[0] ?? ''
  return raw ?? ''
})

const order = computed(() => getDemoBetOrderById(orderId.value))

watch(
  orderId,
  (id) => {
    if (!id || !getDemoBetOrderById(id)) {
      toast.error('未找到订)
      router.replace({ name: 'lotteryBetRecord' })
    }
  },
  { immediate: true }
)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'lotteryBetRecord' })
}

async function copyText(text) {
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
    toast.success('已复)
  } catch {
    toast.error('复制失败')
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lbod {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f7fa;
  box-sizing: border-box;
  padding-top: 44px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.lbod-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 44px;
  padding: 0 @spacing-md;
  display: grid;
  grid-template-columns: 28px 1fr 28px;
  align-items: center;
  background: var(--bg-module);
  box-sizing: border-box;
}

.lbod-header__back {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
  cursor: pointer;
  justify-self: start;
}

.lbod-header__title {
  margin: 0;
  font-size: @font-size-lg;
  font-weight: 600;
  color: #1d2433;
  text-align: center;
}

.lbod-header__pad {
  justify-self: end;
  width: 28px;
}

.lbod-scroll {
  padding: @spacing-md;
  box-sizing: border-box;
}

.lbod-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 14px 12px;
  margin-bottom: @spacing-md;
  box-sizing: border-box;
}

.lbod-summary__top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 10px;
  margin-bottom: 14px;
}

.lbod-pill {
  flex-shrink: 0;
  height: 22px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.lbod-pill.is-pending {
  background: #ff9f43;
}

.lbod-pill.is-loss {
  background: #07c160;
}

.lbod-pill.is-win {
  background: #ee0a24;
}

.lbod-pill.is-canceled {
  background: #969799;
}

.lbod-summary__title {
  flex: 1 1 160px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1d2433;
  line-height: 1.45;
}

.lbod-summary__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 8px;
  font-size: 13px;
}

.lbod-kv__k {
  color: #2f3b58;
  font-weight: 500;
}

.lbod-kv__v {
  color: #0065ff;
  font-weight: 600;
}

.lbod-kv--span2 {
  grid-column: span 2;
}

.lbod-card--detail {
  padding: 0 14px;

  .lbod-row__k,
  .lbod-row__v,
  .lbod-row__v--mono {
    color: #8d9fc7;
  }

  .lbod-copy img {
    width: 15px;
    height: 15px;
  }
}

.lbod-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 48px;
  padding: 4px 0;
  border-bottom: 1px solid #eef1f6;
  font-size: 13px;
}

.lbod-row--last {
  border-bottom: none;
}

.lbod-row__k {
  flex-shrink: 0;
  font-weight: 500;
}

.lbod-row__v {
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.lbod-row__v--mono {
  font-variant-numeric: tabular-nums;
}

.lbod-row--copy .lbod-row__r {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.lbod-copy {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    display: block;
    object-fit: contain;
  }
}
</style>

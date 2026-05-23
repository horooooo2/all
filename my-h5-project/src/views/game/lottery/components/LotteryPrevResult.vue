<template>
  <section ref="rootRef" class="lottery-prev" :class="{ 'lottery-prev--lhc': variant === 'lhc' }" aria-label="上期开>
    <div class="lottery-prev__row1">
      <span class="lottery-prev__issue">{{ issueText }}</span>
      <div class="room-tabs-actions">
        <div class="amount-box" aria-label="金额信息">
          <div class="amount-ticker" aria-live="polite">
            <div class="amount-ticker__track" :class="{ 'is-second': amountTickerIndex === 1 }">
              <div class="amount-ticker__item" aria-label="上期盈亏">
                <span class="amount-box__label">上期盈亏</span>
                <span class="amount-box__value" :class="pnlClass">{{ pnlText }}</span>
              </div>
              <div class="amount-ticker__item" aria-label="余额">
                <span class="amount-box__label">余额</span>
                <span class="amount-box__value is-balance">{{ balanceText }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="plus-btn"
          role="button"
          tabindex="0"
          aria-label="加号"
          @click="$emit('plus')"
          @keydown.enter.prevent="$emit('plus')"
          @keydown.space.prevent="$emit('plus')"
        >
          <img class="plus-btn__icon" :src="iconPlus" alt="" aria-hidden="true" />
        </div>

        <div
          class="mi-btn"
          role="button"
          tabindex="0"
          aria-label="咪牌"
          @click="$emit('mipai')"
          @keydown.enter.prevent="$emit('mipai')"
          @keydown.space.prevent="$emit('mipai')"
        >
          <span class="mi-btn__text">咪牌</span>
        </div>
      </div>
    </div>

    <div class="lottery-prev__row2">
      <div class="lottery-balls" aria-hidden="false">
        <span v-for="(n, i) in balls" :key="i" class="lottery-ball">{{ n }}</span>
      </div>
      <button type="button" class="lottery-prev__expand" aria-label="展开" @click="$emit('expand')">
        <img class="lottery-prev__expand-icon" :src="iconDack" alt="" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, defineExpose, ref } from 'vue'
import iconPlus from '@/assets/icon_add.svg'
import iconDack from '@/assets/icon_dack.svg'

const rootRef = ref(null)

const props = defineProps({
  issue: { type: [String, Number], default: '' },
  balls: { type: Array, default: () => [] },
  /** 六合彩等多球时略缩小球尺寸并允许换行 */
  variant: { type: String, default: '' },
  amountTickerIndex: { type: Number, default: 0 },
  pnl: { type: [String, Number], default: 0 },
  balance: { type: [String, Number], default: 0 }
})

defineEmits(['expand', 'plus', 'mipai'])

defineExpose({
  getEl: () => rootRef.value
})

const issueText = computed(() => {
  const v = String(props.issue ?? '').trim()
  return v ? `${v}期` : ''
})

const pnlNum = computed(() => Number(props.pnl) || 0)
const pnlText = computed(() => {
  const v = pnlNum.value
  const abs = Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  if (v < 0) return `-${abs}`
  return `${abs}`
})

const pnlClass = computed(() => {
  const v = pnlNum.value
  if (v < 0) return 'is-negative'
  if (v > 0) return 'is-positive'
  return ''
})

const balanceText = computed(() => {
  const v = Number(props.balance)
  if (!Number.isFinite(v)) return '0.00'
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lottery-prev {
  margin: 0;
  padding: 10px 12px;
  border-radius: 0;
  background: var(---J2-BJ, linear-gradient(180deg, #fff 0%, #eaf1ff 100%));
  box-shadow: 0 1px 0 rgba(218, 228, 246, 0.9);
}

.lottery-prev__row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.lottery-prev__issue {
  flex: 1;
  min-width: 0;
  font-size: @font-size-sm;
  font-weight: 600;
  color: var(--text-color);
}

/* 对齐自营PL5 room-tabs-actions 视觉 */
.room-tabs-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
}

.amount-box {
  width: 122px;
  height: 28px;
  border-radius: 4px;
  background: var(--s-6-d-7-e-2-f-5, #d7e2f5);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.amount-ticker {
  width: 100%;
  height: 28px;
  overflow: hidden;
  display: block;
}

.amount-ticker__track {
  display: flex;
  flex-direction: column;
  transform: translate3d(0, 0, 0);
  transition: transform 420ms ease;
  will-change: transform;
}

.amount-ticker__track.is-second {
  transform: translate3d(0, -28px, 0);
}

.amount-ticker__item {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.amount-box__label {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #6a7892;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
}

.amount-box__value {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: right;
  color: #1d1d1f;
}

.amount-box__value.is-balance {
  color: #0065ff;
}

.amount-box__value.is-positive {
  color: #08d836;
}

.amount-box__value.is-negative {
  color: #ff3b30;
}

.mi-btn__text {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #ffffff;
  line-height: 1;
  white-space: nowrap;
}

.mi-btn {
  width: 44px;
  height: 26px;
  border-radius: 4px;
  background: var(--p-00065-ff, #0065ff);
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.plus-btn {
  width: 26px;
  height: 26px;
  border: none;
  padding: 0;
  border-radius: 4px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.plus-btn__icon {
  width: 26px;
  height: 26px;
  display: block;
  object-fit: contain;
}

.lottery-prev__row2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lottery-balls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.lottery-ball {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1d1d1f;
  background: url('@/assets/pl5_num_back.png') center / contain no-repeat;
}

.lottery-prev--lhc .lottery-balls {
  flex-wrap: wrap;
  row-gap: 6px;
  column-gap: 6px;
}

.lottery-prev--lhc .lottery-ball {
  width: 36px;
  height: 36px;
  font-size: 14px;
}

.lottery-prev__expand {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  padding: 0;
  border-radius: 8px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a7892;
}

.lottery-prev__expand-icon {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
  transform: rotate(270deg) !important;
}
</style>


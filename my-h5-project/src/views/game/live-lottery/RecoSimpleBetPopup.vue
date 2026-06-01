<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    teleport="body"
    :z-index="2560"
    :safe-area-inset-bottom="true"
    class="rsb-popup"
  >
    <div v-if="row" class="rsb" @click.stop>
      <header class="rsb__head">
        <h2 class="rsb__title">{{ row.betTitle }}</h2>
        <div
          class="rsb__close"
          role="button"
          tabindex="0"
          :aria-label="$t('关闭')"
          @click="close"
          @keydown.enter.prevent="close"
          @keydown.space.prevent="close"
        >
          <img :src="iconX" alt="" aria-hidden="true">
        </div>
      </header>

      <div class="rsb__game-row">
        <span class="rsb__game-name">{{ row.gameName }}</span>
        <span class="rsb__issue">{{ row.issue }}</span>
        <span class="rsb__countdown">{{ row.countdown }}</span>
      </div>

      <div class="rsb__pick">
        <button
          v-for="opt in row.options"
          :key="opt.playKey"
          type="button"
          class="rsb__pick-btn"
          :class="{ 'is-selected': selectedKey === opt.playKey }"
          @click="selectedKey = opt.playKey"
        >
          <span class="rsb__pick-prefix">投</span>
          <span class="rsb__pick-name" :class="opt.accent === 'red' ? 'is-red' : 'is-blue'">{{ opt.label }}</span>
          <span class="rsb__pick-odds">({{ formatOdds(opt.odds) }})</span>
        </button>
      </div>

      <input
        v-model="amount"
        class="rsb__input"
        type="text"
        inputmode="decimal"
        placeholder="请输入金额"
        autocomplete="off"
      />

      <div class="rsb__finance">
        <p class="rsb__balance">余额: {{ balanceText }}</p>
        <p class="rsb__summary">
          <span>单注: {{ stakeText }}</span>
          <span class="rsb__summary-gap" />
          <span>单数: {{ betCount }}</span>
          <span class="rsb__summary-gap" />
          <span>{{ $t('可盈金额:') }} <em class="rsb__profit">{{ profitTextFixed }}</em></span>
        </p>
      </div>

      <div class="rsb__foot">
        <button type="button" class="rsb__foot-btn rsb__foot-btn--chase" @click="onChase">{{ $t('我要追号') }}</button>
        <button type="button" class="rsb__foot-btn rsb__foot-btn--bet" :disabled="submitDisabled" @click="onBet">{{ $t('投注') }}</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import iconX from '@/assets/icon_x.png'

const { t } = useI18n()
const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  row: { type: Object, default: null },
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['submit', 'chase'])

const amount = ref('1')
const selectedKey = ref('')

const stakeNum = computed(() => {
  const n = Number(String(amount.value).trim())
  return Number.isFinite(n) && n > 0 ? n : 0
})

const selectedOption = computed(() => {
  const opts = props.row?.options
  if (!Array.isArray(opts)) return null
  return opts.find((o) => o.playKey === selectedKey.value) ?? opts[0] ?? null
})

const stakeText = computed(() => (stakeNum.value > 0 ? String(stakeNum.value) : '0'))

const betCount = computed(() => 1)

const profitTextFixed = computed(() => {
  const odds = Number(selectedOption.value?.odds)
  const stake = stakeNum.value
  if (!Number.isFinite(odds) || stake <= 0) return '0.00'
  const profit = stake * (odds - 1)
  return profit.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const balanceText = computed(() => {
  const n = Number(props.balance)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const submitDisabled = computed(() => stakeNum.value <= 0 || !selectedOption.value)

watch(show, (v) => {
  if (!v || !props.row) return
  amount.value = '1'
  const def = props.row.defaultPlayKey
  const keys = (props.row.options ?? []).map((o) => o.playKey)
  selectedKey.value = keys.includes(def) ? def : (keys[0] ?? '')
})

function formatOdds(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n.toFixed(2).replace(/\.00$/, '')
}

function close() {
  show.value = false
}

function onChase() {
  emit('chase')
  close()
}

function onBet() {
  if (submitDisabled.value || !props.row) return
  emit('submit', {
    row: props.row,
    amount: stakeNum.value,
    playKey: selectedKey.value
  })
  close()
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.rsb-popup {
  width: 375px;
  max-width: 100vw;
}

.rsb {
  .layout-padding-bottom(12px);
  padding-top: 14px;
  padding-left: 16px;
  padding-right: 16px;
  background: #fff;
  box-sizing: border-box;
}

.rsb__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.rsb__title {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  font-size: @font-size-lg;
  line-height: 22px;
  font-weight: 700;
  color: #1d1d1f;
}

/* 对齐 bet-record-panel__close */
.rsb__close {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rsb__close img {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.rsb__game-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 14px;
  font-size: @font-size-sm;
  line-height: 18px;
  color: #1d1d1f;
}

.rsb__game-name {
  font-weight: 500;
}

.rsb__issue {
  font-weight: 400;
  color: #333;
}

.rsb__countdown {
  margin-left: auto;
  font-weight: 700;
  font-size: @font-size-md;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
}

.rsb__pick {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.rsb__pick-btn {
  flex: 1 1 0;
  min-width: 0;
  height: 48px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 400;
  color: #1d1d1f;
  cursor: pointer;
  box-sizing: border-box;
}

.rsb__pick-btn.is-selected {
  border: 2px solid #0065ff;
  padding: 0 7px;
}

.rsb__pick-prefix {
  margin-right: 2px;
}

.rsb__pick-name.is-red {
  color: #ff3b30;
  font-weight: 600;
}

.rsb__pick-name.is-blue {
  color: #0065ff;
  font-weight: 600;
}

.rsb__pick-odds {
  color: #08d836;
  font-weight: 400;
}

.rsb__input {
  display: block;
  width: 100%;
  height: 44px;
  margin-bottom: 12px;
  padding: 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  font-size: @font-size-md;
  color: #1d1d1f;
  outline: none;
  box-sizing: border-box;
}

.rsb__input::placeholder {
  color: #bbb;
}

.rsb__finance {
  margin-bottom: 16px;
}

.rsb__balance {
  margin: 0 0 8px;
  font-size: @font-size-sm;
  line-height: 18px;
  font-weight: 400;
  color: #1d1d1f;
}

.rsb__summary {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  font-size: @font-size-sm;
  line-height: 18px;
  font-weight: 400;
  color: #1d1d1f;
}

.rsb__summary-gap {
  display: none;
}

.rsb__profit {
  font-style: normal;
  font-weight: 600;
  color: #0065ff;
}

.rsb__foot {
  display: flex;
  gap: 10px;
}

.rsb__foot-btn {
  flex: 1;
  height: 46px;
  border-radius: 8px;
  border: none;
  font-size: @font-size-md;
  font-weight: 400;
  cursor: pointer;
}

.rsb__foot-btn--chase {
  background: #e8f2ff;
  color: #2b4a7c;
}

.rsb__foot-btn--bet {
  background: #0065ff;
  color: #fff;
}

.rsb__foot-btn--bet:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

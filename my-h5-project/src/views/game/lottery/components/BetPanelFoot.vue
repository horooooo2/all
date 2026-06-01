<template>
  <footer class="bet-panel__foot" aria-label="投注操作">
    <transition name="bet-stats-fade">
      <div v-if="showBetStats" class="bet-stats" role="status" aria-live="polite">
        共选{{ betCount }}共{{ totalStakeText }}
      </div>
    </transition>

    <div class="op-top">
      <div class="op-btn op-btn--delete" role="button" tabindex="0" aria-label="删除" @click="emit('clear')">
        <img class="op-icon" :src="iconDel" alt="" aria-hidden="true" />
      </div>

      <template v-if="isBzp">
        <div class="bzp-group" aria-label="标准盘投注参数">
          <div class="bzp-item bzp-item--prize">
            <div class="bzp-item__label">奖金:</div>
            <div class="bzp-prize-wrap">
              <div
                class="bzp-prize"
                role="button"
                tabindex="0"
                aria-label="选择奖金"
                @click="onPrizeClick"
                @keydown.enter.prevent="onPrizeClick"
                @keydown.space.prevent="onPrizeClick"
              >
                <span class="bzp-prize__value">{{ prizeValue }}</span>
                <span class="bzp-prize__divider" aria-hidden="true"></span>
                <span class="bzp-prize__chev" aria-label="展开奖金" role="button" tabindex="-1" @click.stop="togglePrizePopup"></span>
              </div>

              <div v-if="prizeOpen" class="bzp-prize-mask" aria-hidden="true" @click="closePrizePopup"></div>
              <div v-if="prizeOpen" class="bzp-prize-pop" role="dialog" aria-label="选择奖金" @click.stop>
                <button type="button" class="bzp-prize-pop__btn" @click="selectPrize(1)">1</button>
                <button type="button" class="bzp-prize-pop__btn" @click="selectPrize(2)">2</button>
              </div>
            </div>
          </div>

          <div class="bzp-item bzp-item--multi">
            <div class="bzp-item__label">倍数:</div>
            <div class="bzp-stepper" role="group" aria-label="倍数调节">
              <button
                type="button"
                class="bzp-stepper__btn"
                aria-label="倍数减一"
                :disabled="multiNumber <= 1"
                @click="stepMulti(-1)"
              >
                
              </button>
              <input
                :value="multiInput"
                class="bzp-stepper__input"
                inputmode="numeric"
                aria-label="倍数"
                @input="onMultiInput"
                @blur="onMultiBlur"
              />
              <button type="button" class="bzp-stepper__btn" aria-label="倍数加一" @click="stepMulti(1)">+</button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <QuickChipPicker v-model="activeChip" @change="onChipPick" />

        <input
          :value="amount"
          class="amount-input"
          inputmode="decimal"
          placeholder="输入金额"
          aria-label="输入金额"
          @input="onAmountInput"
        />
      </template>
    </div>

    <div class="op-bottom">
      <template v-if="showMenuButtons">
        <div class="bottom-btn bottom-btn--stack bottom-btn--recent" role="button" tabindex="0" @click="emit('recent')">
          <img v-if="recentIcon" class="bottom-btn__icon" :src="recentIcon" alt="" aria-hidden="true" />
          <div>近期投注</div>
        </div>

        <div class="bottom-btn bottom-btn--stack bottom-btn--basket" role="button" tabindex="0" @click="emit('basket')">
          <span v-if="basketBadgeText" class="bottom-btn__badge" aria-label="购彩篮注单数">{{ basketBadgeText }}</span>
          <img v-if="basketIcon" class="bottom-btn__icon" :src="basketIcon" alt="" aria-hidden="true" />
          <div>购彩篮</div>
        </div>

        <div class="bottom-btn bottom-btn--stack bottom-btn--add" role="button" tabindex="0" @click="emit('add-pick')">
          <img v-if="addIcon" class="bottom-btn__icon" :src="addIcon" alt="" aria-hidden="true" />
          <div>新增选号</div>
        </div>
      </template>

      <div
        class="bottom-btn bottom-btn--primary"
        role="button"
        tabindex="0"
        :aria-disabled="submitDisabled ? 'true' : 'false'"
        :class="{ 'is-disabled': submitDisabled }"
        @click="!submitDisabled && emit('bet')"
      >
        <div class="primary__title">立即投注</div>
        <div class="primary__sub">余额:{{ balanceText }}</div>
      </div>
      <div class="bottom-btn bottom-btn--chase" role="button" tabindex="0" @click="emit('chase')">追号</div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import QuickChipPicker from '@/views/game/components/QuickChipPicker.vue'
import iconDel from '@/assets/icon_del.svg'

const props = defineProps({
  mode: { type: String, default: 'smp' },
  balance: { type: [String, Number], default: 0 },
  amount: { type: String, default: '' },
  betCount: { type: Number, default: 0 },
  totalStakeText: { type: String, default: '0' },
  showBetStats: { type: Boolean, default: false },
  submitDisabled: { type: Boolean, default: true },
  recentIcon: { type: String, default: '' },
  basketIcon: { type: String, default: '' },
  addIcon: { type: String, default: '' },
  basketCount: { type: Number, default: 0 },
  showMenuButtons: { type: Boolean, default: true }
})

const emit = defineEmits(['update:amount', 'clear', 'recent', 'basket', 'add-pick', 'bet', 'chase', 'chip', 'prize'])

const isBzp = computed(() => String(props.mode) === 'bzp')

const basketBadgeText = computed(() => {
  const n = Number(props.basketCount) || 0
  if (n <= 0) return ''
  return n > 99 ? '99+' : String(n)
})

// 演示：奖金值（后续可对接接口上层状态）
const prizeValue = ref(2)
const prizeOpen = ref(false)
function togglePrizePopup() {
  prizeOpen.value = !prizeOpen.value
}
function closePrizePopup() {
  prizeOpen.value = false
}
function selectPrize(v) {
  prizeValue.value = Number(v) === 2 ? 2 : 1
  emit('prize', prizeValue.value)
  prizeOpen.value = false
}
function onPrizeClick() {
  // 保留：点击整个区域也可打开，兼容触
  togglePrizePopup()
}

function onDocClick(e) {
  if (!prizeOpen.value) return
  const target = /** @type {HTMLElement} */ (e.target)
  const inside = target?.closest?.('.bzp-prize-wrap')
  if (!inside) prizeOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true)
})

const multiInput = ref('')
watch(
  [() => props.amount, () => isBzp.value],
  ([v, bzp]) => {
    const str = String(v ?? '')
    if (bzp && str.trim() === '') {
      multiInput.value = '1'
      emit('update:amount', '1')
      return
    }
    multiInput.value = str
  },
  { immediate: true }
)

const multiNumber = computed(() => {
  const n = parseInt(String(multiInput.value || '').trim(), 10)
  if (!Number.isFinite(n) || n <= 0) return 1
  return n
})

/** 快捷金额展示值，与输入框独立；点击快捷金额时才写入输入框 */
const activeChip = ref(1)

const balanceText = computed(() => {
  const n = Number(props.balance)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

function onAmountInput(e) {
  const el = /** @type {HTMLInputElement} */ (e.target)
  emit('update:amount', String(el.value ?? ''))
}

function onMultiInput(e) {
  const el = /** @type {HTMLInputElement} */ (e.target)
  const raw = String(el.value ?? '')
  // 仅保留数
  multiInput.value = raw.replace(/[^\d]/g, '')
  emit('update:amount', multiInput.value)
}

function onMultiBlur() {
  const n = multiNumber.value
  multiInput.value = String(n)
  emit('update:amount', multiInput.value)
}

function stepMulti(delta) {
  const next = Math.max(1, multiNumber.value + Number(delta || 0))
  multiInput.value = String(next)
  emit('update:amount', multiInput.value)
}

function onChipPick(v) {
  const amt = String(v ?? '')
  emit('update:amount', amt)
  emit('chip', v)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.bet-panel__foot {
  height: 96px;
  background: #ffffff;
  border-top: 0.5px solid #dae4f6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px calc(8px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.bet-stats {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 4px);
  transform: translateX(-50%);
  z-index: 5;
  max-width: calc(100vw - 32px);
  padding: 6px 12px;
  border-radius: 999px;
  background: #ff3b30;
  color: #ffffff;
  font-size: @font-size-sm;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.bet-stats-fade-enter-active,
.bet-stats-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.bet-stats-fade-enter-from,
.bet-stats-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
.bet-stats-fade-enter-to,
.bet-stats-fade-leave-from {
  transform: translateX(-50%) translateY(0);
}

.op-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.op-btn {
  border: none;
  background: #d7e2f5;
  color: #6a7892;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.op-btn--switch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.op-btn--delete {
  width: 40px;
  height: 35px;
  border-radius: 5px;
}

.op-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.amount-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 35px;
  border-radius: 8px;
  border: 1px solid #dae4f6;
  background: #f7faff;
  padding: 0 10px;
  box-sizing: border-box;
  font-size: @font-size-sm;
  outline: none;
}

.bzp-group {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.bzp-item {
  flex: 0 0 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bzp-item--prize {
  flex: 0 0 auto;
}

.bzp-item--multi {
  flex: 1 1 auto;
  margin-left: 10px;
}

.bzp-item__label {
  flex: 0 0 auto;
  font-size: @font-size-xs;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1;
  white-space: nowrap;
}

.bzp-prize {
  width: 80px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #dae4f6;
  background: #ffffff;
  padding: 0 10px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #1d1d1f;
  cursor: pointer;
}

.bzp-prize-wrap {
  position: relative;
  flex: 0 0 auto;
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
}

.bzp-prize__value {
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.bzp-prize__divider {
  width: 1px;
  height: 18px;
  background: #dae4f6;
  flex: 0 0 auto;
}

.bzp-prize__chev {
  flex: 0 0 14px;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
}

.bzp-prize__chev::before {
  content: '';
  width: 8px;
  height: 8px;
  border-right: 2px solid #1d1d1f;
  border-bottom: 2px solid #1d1d1f;
  /* 朝上 */
  transform: rotate(-135deg);
  display: block;
}

.bzp-prize-pop {
  position: absolute;
  left: 0;
  bottom: calc(100% + 6px);
  width: 80px;
  height: 76px;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.12);
  z-index: 10;
}

.bzp-prize-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 9;
}

.bzp-prize-pop__btn {
  width: 72px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #d7e2f5;
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
}

.bzp-prize-pop__btn:active {
  transform: scale(0.98);
}

.bzp-stepper {
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
  border-radius: 10px;
  background: #d7e2f5;
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: stretch;
  overflow: hidden;
}

.bzp-stepper__btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #d7e2f5;
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 400;
  line-height: 32px;
  cursor: pointer;
  padding: 0;
  user-select: none;
}

.bzp-stepper__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bzp-stepper__input {
  width: 79px;
  height: 32px;
  border: none;
  background: #ffffff;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  outline: none;
  font-variant-numeric: tabular-nums;
  color: #1d1d1f;
}

.bzp-stepper__input::-webkit-outer-spin-button,
.bzp-stepper__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bzp-stepper__input[type='number'] {
  -moz-appearance: textfield;
}

.quick-wrap {
  position: relative;
  height: 44px;
  flex: 0 0 auto;
}

.quick-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 30px;
  height: 30px;
  transform: translate3d(-50%, -50%, 0);
  object-fit: contain;
  pointer-events: none;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.quick-single {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #1d1d1f;
  font-size: @font-size-sm;
  font-weight: 800;
  line-height: 30px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  margin: 7px auto;
}

.op-bottom {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.bottom-btn {
  height: 44px;
  border-radius: 6px;
  border: none;
  padding: 0;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.bottom-btn--stack {
  width: 60px;
  flex-direction: column;
  gap: 2px;
  font-size: @font-size-xs;
  line-height: 1.05;
  color: #ffffff;
}

.bottom-btn--recent {
  border: 1px solid #08d836;
  background: #08d836;
}

.bottom-btn--basket {
  position: relative;
  background: #ffa800;
}

.bottom-btn__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  z-index: 1;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff3b30;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
  pointer-events: none;
}

.bottom-btn--add {
  background: #5d2af7;
}

.bottom-btn__icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}

.bottom-btn--primary {
  width: 95px;
  background: var(---J17, linear-gradient(90deg, #fac03d 0%, #ff710d 100%));
  color: #ffffff;
  flex-direction: column;
  gap: 2px;
}

.bottom-btn--primary.is-disabled {
  opacity: 0.55;
  pointer-events: none;
}

.primary__title {
  font-size: @font-size-sm;
  font-weight: 700;
  line-height: 1.05;
}

.primary__sub {
  font-size: @font-size-xs;
  font-weight: 400;
  opacity: 0.92;
  font-variant-numeric: tabular-nums;
  line-height: 1.05;
}

.bottom-btn--chase {
  width: 60px;
  background: linear-gradient(90deg, #4c5dff 0%, #111bf1 100%);
  color: #ffffff;
  font-size: @font-size-xs;
  font-weight: 700;
}
</style>


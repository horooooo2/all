<template>
  <div class="reco-panel">
    <div class="reco-scroll">
      <p class="reco-page-title">推荐好路</p>
      <ul class="reco-list" aria-label="推荐好路列表（静态示意）">
        <li
          v-for="row in staticRecoRows"
          :key="row.id"
          class="reco-list__cell"
          role="button"
          tabindex="0"
          @click="openBet(row)"
          @keydown.enter.prevent="openBet(row)"
        >
          <div class="reco-list__cell-inner">
            <div class="reco-list__cell-row">
              <span class="reco-list__cell-tl">{{ row.gameName }}</span>
              <span class="reco-list__cell-tr">{{ row.countdown }}</span>
            </div>
            <div class="reco-list__cell-row">
              <span class="reco-list__cell-bl">{{ row.playLine }}</span>
              <span class="reco-list__cell-br">{{ row.streakText }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <button
      type="button"
      class="reco-streak-fab"
      aria-haspopup="dialog"
      :aria-expanded="streakPopupOpen ? 'true' : 'false'"
      aria-label="选择连出期数"
      @click="streakPopupOpen = true"
    >
      <span class="reco-streak-fab__label">连出期数</span>
      <span class="reco-streak-fab__value">{{ streakFabText }}</span>
    </button>

    <van-popup
      v-model:show="streakPopupOpen"
      position="bottom"
      round
      class="reco-streak-popup"
      :z-index="2500"
      :safe-area-inset-bottom="true"
      teleport="body"
    >
      <div class="reco-streak-popup__head">
        <span class="reco-streak-popup__title">选择连出期数</span>
        <img
          class="reco-streak-popup__close"
          :src="iconX"
          alt=""
          role="button"
          tabindex="0"
          aria-label="关闭"
          @click="streakPopupOpen = false"
          @keydown.enter.prevent="streakPopupOpen = false"
          @keydown.space.prevent="streakPopupOpen = false"
        />
      </div>
      <div class="reco-streak-popup__body">
        <div class="reco-streak-popup__rate-row">
          <span>预出率</span>
          <span>{{ streakRateRight }}</span>
        </div>
        <div class="reco-streak-slider-wrap">
          <van-slider
            v-model="tempRange"
            range
            :min="STREAK_MIN"
            :max="STREAK_MAX"
            :step="1"
            :bar-height="8"
            :button-size="22"
            active-color="#0065FF"
            inactive-color="#E8EDF8"
          />
          <div class="reco-streak-slider__readout" aria-live="polite">
            <span>{{ tempPair[0] }}</span>
            <span>{{ tempPair[1] }}</span>
          </div>
        </div>
        <div class="reco-streak-popup__actions">
          <button type="button" class="reco-streak-popup__btn reco-streak-popup__btn--ghost" @click="resetTempRangeDefault">
            恢复默认
          </button>
          <button type="button" class="reco-streak-popup__btn reco-streak-popup__btn--primary" @click="confirmStreakRange">
            确定
          </button>
        </div>
      </div>
    </van-popup>

    <RecoSimpleBetPopup
      v-model:show="betOpen"
      :row="betRow"
      :balance="balance"
      @submit="onBetSubmit"
      @chase="emit('chase')"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import iconX from '@/assets/icon_x.png'
import RecoSimpleBetPopup from './RecoSimpleBetPopup.vue'

defineProps({
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['submit', 'chase'])

const STREAK_STORAGE_KEY = 'groupVote.recoStreakPeriods.v1'
const STREAK_MIN = 2
const STREAK_MAX = 15
/** 恢复默认 / 无本地记录时的连出期数区间 */
const DEFAULT_STREAK_PAIR = Object.freeze([3, 8])

/** 主列表静态示意（仅样式占位，后续接接口替换） */
const staticRecoRows = [
  {
    id: 's1',
    gameName: '加拿大28',
    countdown: '02:15:33',
    playLine: '大小单双大小 - 大',
    streakText: '连出5期',
    betTitle: '大小单双-大小',
    issue: '43423411',
    options: [
      { playKey: 'big', label: '大', odds: 1.98, accent: 'red' },
      { playKey: 'small', label: '小', odds: 1.98, accent: 'blue' }
    ],
    defaultPlayKey: 'big'
  },
  {
    id: 's2',
    gameName: '台湾宾果28',
    countdown: '00:08:12',
    playLine: '大小单双大小 - 小单',
    streakText: '连出3期',
    betTitle: '大小单双-小单',
    issue: '3123111108',
    options: [
      { playKey: 'small-odd', label: '小单', odds: 1.98, accent: 'red' },
      { playKey: 'big-odd', label: '大单', odds: 1.98, accent: 'blue' }
    ],
    defaultPlayKey: 'small-odd'
  },
  {
    id: 's3',
    gameName: '加拿大28',
    countdown: '01:42:06',
    playLine: '大小单双大小 - 双',
    streakText: '连出4期',
    betTitle: '大小单双-单双',
    issue: '3123111107',
    options: [
      { playKey: 'even', label: '双', odds: 1.98, accent: 'red' },
      { playKey: 'odd', label: '单', odds: 1.98, accent: 'blue' }
    ],
    defaultPlayKey: 'even'
  },
  {
    id: 's4',
    gameName: '比特币28',
    countdown: '00:59:41',
    playLine: '大小单双大小 - 大单',
    streakText: '连出6期',
    betTitle: '大小单双-大单',
    issue: '3123111106',
    options: [
      { playKey: 'big-odd', label: '大单', odds: 1.98, accent: 'red' },
      { playKey: 'small-even', label: '小双', odds: 1.98, accent: 'blue' }
    ],
    defaultPlayKey: 'big-odd'
  }
]

const streakRange = ref(readStoredRange())
const tempRange = ref([...streakRange.value])
const streakPopupOpen = ref(false)

const betOpen = ref(false)
const betRow = ref(null)

const streakFabText = computed(() => formatRangeLabel(streakRange.value))

const tempPair = computed(() => normalizePair(tempRange.value))

const streakRateRight = computed(() => {
  const [a, b] = tempPair.value
  return `${a}-(${b}+)`
})

watch(streakPopupOpen, (open) => {
  if (open) tempRange.value = [...normalizePair(streakRange.value)]
})

function normalizePair(pair) {
  if (!Array.isArray(pair) || pair.length < 2) return [...DEFAULT_STREAK_PAIR]
  let a = Math.floor(Number(pair[0]))
  let b = Math.floor(Number(pair[1]))
  if (!Number.isFinite(a)) a = STREAK_MIN
  if (!Number.isFinite(b)) b = STREAK_MAX
  a = Math.min(Math.max(a, STREAK_MIN), STREAK_MAX)
  b = Math.min(Math.max(b, STREAK_MIN), STREAK_MAX)
  if (a > b) [a, b] = [b, a]
  if (a === b) {
    if (b < STREAK_MAX) b += 1
    else if (a > STREAK_MIN) a -= 1
  }
  return [a, b]
}

function formatRangeLabel(pair) {
  const [a, b] = normalizePair(pair)
  if (a === b) return `${a}期`
  return `${a}～${b}期`
}

function readStoredRange() {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!raw) return [...DEFAULT_STREAK_PAIR]
    const v = JSON.parse(raw)
    if (Array.isArray(v) && v.length >= 2) {
      return normalizePair([v[0], v[1]])
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      const n = Math.floor(v)
      const c = Math.min(Math.max(n, STREAK_MIN), STREAK_MAX)
      return normalizePair([Math.max(STREAK_MIN, c - 2), Math.min(STREAK_MAX, c + 2)])
    }
  } catch {
    // ignore
  }
  return [...DEFAULT_STREAK_PAIR]
}

function persistRange(pair) {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(normalizePair(pair)))
  } catch {
    // ignore
  }
}

function confirmStreakRange() {
  streakRange.value = normalizePair(tempRange.value)
  persistRange(streakRange.value)
  streakPopupOpen.value = false
}

function resetTempRangeDefault() {
  tempRange.value = [...DEFAULT_STREAK_PAIR]
}

function openBet(row) {
  betRow.value = row
  betOpen.value = true
}

function onBetSubmit(payload) {
  const pk = payload.playKey ?? ''
  emit('submit', {
    tab: 'reco',
    playKey: pk,
    playKeys: pk ? [pk] : [],
    amount: payload.amount,
    recoRow: payload.row
  })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.reco-panel {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f3f6fc;
}

.reco-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 0 64px;
  box-sizing: border-box;
}

.reco-page-title {
  margin: 0 0 8px;
  padding: 0 12px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

.reco-list {
  margin: 0;
  padding: 0 8px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reco-list__cell {
  width: 359px;
  max-width: 100%;
  margin: 0 auto;
  height: 80px;
  border-radius: 8px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J2-BJ, linear-gradient(180deg, #fff 0%, #eaf1ff 100%));
  box-sizing: border-box;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
}

.reco-list__cell:focus-visible {
  outline: 2px solid rgba(0, 101, 255, 0.35);
  outline-offset: 2px;
}

.reco-list__cell-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.reco-list__cell-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.reco-list__cell-tl {
  flex: 1 1 auto;
  min-width: 0;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 700;
  color: #1d1d1f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reco-list__cell-tr {
  flex: 0 0 auto;
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 600;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.reco-list__cell-bl {
  flex: 1 1 auto;
  min-width: 0;
  font-size: @font-size-sm;
  line-height: 16px;
  color: #6a7892;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reco-list__cell-br {
  flex: 0 0 auto;
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 600;
  color: #5d2af7;
  white-space: nowrap;
}

.reco-streak-fab {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  min-width: 112px;
  max-width: 140px;
  width: max-content;
  height: 44px;
  padding: 0 10px;
  border: none;
  border-radius: 6px;
  background: #5d2af7;
  color: #ffffff;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  line-height: 1.15;
  box-sizing: border-box;
}

.reco-streak-fab__label {
  font-size: @font-size-xs;
  line-height: 12px;
  font-weight: 500;
  opacity: 0.95;
}

.reco-streak-fab__value {
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.reco-streak-popup {
  width: 375px;
  max-width: 100vw;
}

.reco-streak-popup__head {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border-bottom: 0.5px solid #e7edf8;
}

.reco-streak-popup__title {
  font-size: @font-size-lg;
  line-height: 22px;
  font-weight: 600;
  color: #1d1d1f;
}

.reco-streak-popup__close {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  cursor: pointer;
}

.reco-streak-popup__body {
  padding: 12px 0 0;
  background: #ffffff;
}

.reco-streak-popup__rate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px 10px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 400;
  color: #1d1d1f;
}

.reco-streak-slider-wrap {
  padding: 0 20px 0;
  box-sizing: border-box;
  --van-slider-active-background: #0065ff;
  --van-slider-inactive-background: #e8edf8;
  --van-slider-bar-height: 8px;
  --van-slider-button-width: 22px;
  --van-slider-button-height: 22px;
  --van-slider-button-radius: 50%;
  --van-slider-button-background: #ffffff;
  --van-slider-button-shadow: 0 1px 4px rgba(0, 101, 255, 0.25);
}

.reco-streak-slider-wrap :deep(.van-slider) {
  margin: 4px 0 0;
}

.reco-streak-slider-wrap :deep(.van-slider__button) {
  border: 2px solid #0065ff;
  box-sizing: border-box;
}

.reco-streak-slider__readout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 0;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
}

.reco-streak-popup__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.reco-streak-popup__btn {
  flex: 1 1 0;
  min-width: 0;
  height: 44px;
  border-radius: 8px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 400;
  padding: 0 12px;
  box-sizing: border-box;
}

.reco-streak-popup__btn--ghost {
  border: 1px solid #dae4f6;
  background: #ffffff;
  color: #1d1d1f;
}

.reco-streak-popup__btn--primary {
  border: none;
  background: #0065ff;
  color: #ffffff;
}
</style>

<template>
  <div class="long-panel">
    <div class="long-scroll">
      <p class="long-page-title">{{ pageTitle }}</p>

      <ul v-if="visibleRows.length" class="long-list" :aria-label="`${pageTitle}列表`">
        <li
          v-for="row in visibleRows"
          :key="row.id"
          class="long-list__cell"
          role="button"
          tabindex="0"
          @click="onRowClick(row)"
          @keydown.enter.prevent="onRowClick(row)"
        >
          <div class="long-list__cell-inner">
            <div class="long-list__cell-row">
              <span class="long-list__cell-tl">{{ row.topLeft }}</span>
              <span v-if="row.topRight" class="long-list__cell-tr">{{ row.topRight }}</span>
            </div>
            <div class="long-list__cell-row">
              <span class="long-list__cell-bl">{{ row.bottomLeft }}</span>
              <span class="long-list__cell-br">{{ row.bottomRight }}</span>
            </div>
          </div>
        </li>
      </ul>

      <p v-else class="long-empty">暂无符合条件的长/p>
    </div>

    <button
      v-if="showStreakFab"
      type="button"
      class="long-streak-fab"
      aria-haspopup="dialog"
      :aria-expanded="streakPopupOpen ? 'true' : 'false'"
      aria-label="选择连出期数"
      @click="streakPopupOpen = true"
    >
      <span class="long-streak-fab__label">连出期数</span>
      <span class="long-streak-fab__value">{{ streakFabText }}</span>
    </button>

    <van-popup
      v-if="showStreakFab"
      v-model:show="streakPopupOpen"
      position="bottom"
      round
      class="long-streak-popup"
      :z-index="2500"
      :safe-area-inset-bottom="true"
      teleport="body"
    >
      <div class="long-streak-popup__head">
        <span class="long-streak-popup__title">选择连出期数</span>
        <img
          class="long-streak-popup__close"
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
      <div class="long-streak-popup__body">
        <div class="long-streak-popup__rate-row">
          <span>预出/span>
          <span>{{ streakRateRight }}</span>
        </div>
        <div class="long-streak-slider-wrap">
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
          <div class="long-streak-slider__readout" aria-live="polite">
            <span>{{ tempPair[0] }}</span>
            <span>{{ tempPair[1] }}</span>
          </div>
        </div>
        <div class="long-streak-popup__actions">
          <button type="button" class="long-streak-popup__btn long-streak-popup__btn--ghost" @click="resetTempRangeDefault">
            恢复默认
          </button>
          <button type="button" class="long-streak-popup__btn long-streak-popup__btn--primary" @click="confirmStreakRange">
            确定
          </button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import iconX from '@/assets/icon_x.svg'

/**
 * @typedef {{
 *   id: string,
 *   topLeft: string,
 *   topRight?: string,
 *   bottomLeft: string,
 *   bottomRight: string,
 *   streak?: number,
 *   betPopupRow?: object
 * }} LongDragonRow
 */

const props = defineProps({
  pageTitle: { type: String, default: '长龙' },
  /** @type {import('vue').PropType<LongDragonRow[]>} */
  rows: { type: Array, default: () => [] },
  streakStorageKey: { type: String, default: 'lottery.longDragon.streakPeriods.v1' },
  showStreakFab: { type: Boolean, default: true }
})

const emit = defineEmits(['select-row'])

const STREAK_MIN = 2
const STREAK_MAX = 15
const DEFAULT_STREAK_PAIR = Object.freeze([3, 8])

const streakRange = ref(readStoredRange())
const tempRange = ref([...streakRange.value])
const streakPopupOpen = ref(false)

const streakFabText = computed(() => formatRangeLabel(streakRange.value))
const tempPair = computed(() => normalizePair(tempRange.value))
const streakRateRight = computed(() => {
  const [a, b] = tempPair.value
  return `${a}-(${b}+)`
})

const visibleRows = computed(() => {
  const [a, b] = normalizePair(streakRange.value)
  return (props.rows || []).filter((r) => {
    const n = r?.streak
    if (n == null || !Number.isFinite(Number(n))) return true
    const k = Math.floor(Number(n))
    return k >= a && k <= b
  })
})

watch(
  () => props.streakStorageKey,
  () => {
    streakRange.value = readStoredRange()
  }
)

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
  return `${a}{b}期`
}

function readStoredRange() {
  try {
    const raw = localStorage.getItem(props.streakStorageKey)
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
    localStorage.setItem(props.streakStorageKey, JSON.stringify(normalizePair(pair)))
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

function onRowClick(row) {
  emit('select-row', row)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.long-panel {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f3f6fc;
}

.long-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 0 64px;
  box-sizing: border-box;
}

.long-page-title {
  margin: 0 0 8px;
  padding: 0 12px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 700;
  color: #1d1d1f;
}

.long-empty {
  margin: 24px 16px 0;
  text-align: center;
  font-size: @font-size-sm;
  color: #6a7892;
}

.long-list {
  margin: 0;
  padding: 0 8px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.long-list__cell {
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

.long-list__cell:focus-visible {
  outline: 2px solid rgba(0, 101, 255, 0.35);
  outline-offset: 2px;
}

.long-list__cell-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
}

.long-list__cell-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.long-list__cell-tl {
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

.long-list__cell-tr {
  flex: 0 0 auto;
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 600;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.long-list__cell-bl {
  flex: 1 1 auto;
  min-width: 0;
  font-size: @font-size-sm;
  line-height: 16px;
  color: #6a7892;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.long-list__cell-br {
  flex: 0 0 auto;
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 600;
  color: #5d2af7;
  white-space: nowrap;
}

.long-streak-fab {
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

.long-streak-fab__label {
  font-size: @font-size-xs;
  line-height: 12px;
  font-weight: 500;
  opacity: 0.95;
}

.long-streak-fab__value {
  font-size: @font-size-sm;
  line-height: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.long-streak-popup {
  width: 375px;
  max-width: 100vw;
}

.long-streak-popup__head {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  border-bottom: 0.5px solid #e7edf8;
}

.long-streak-popup__title {
  font-size: @font-size-lg;
  line-height: 22px;
  font-weight: 600;
  color: #1d1d1f;
}

.long-streak-popup__close {
  width: @icon-x-size;
  height: @icon-x-size;
  display: block;
  object-fit: contain;
  cursor: pointer;
}

.long-streak-popup__body {
  padding: 12px 0 0;
  background: #ffffff;
}

.long-streak-popup__rate-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 20px 10px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 400;
  color: #1d1d1f;
}

.long-streak-slider-wrap {
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

.long-streak-slider-wrap :deep(.van-slider) {
  margin: 4px 0 0;
}

.long-streak-slider-wrap :deep(.van-slider__button) {
  border: 2px solid #0065ff;
  box-sizing: border-box;
}

.long-streak-slider__readout {
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

.long-streak-popup__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.long-streak-popup__btn {
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

.long-streak-popup__btn--ghost {
  border: 1px solid #dae4f6;
  background: #ffffff;
  color: #1d1d1f;
}

.long-streak-popup__btn--primary {
  border: none;
  background: #0065ff;
  color: #ffffff;
}
</style>

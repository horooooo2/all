<template>
  <div class="lhc-tema" :aria-label="$t('特码')">
    <div class="lhc-tema__mode" role="tablist" :aria-label="$t('特码玩法')">
      <div class="lhc-tema__mode-row">
        <button
          type="button"
          role="tab"
          class="lhc-tema__mode-btn"
          :class="{ active: subMode === 'a' }"
          :aria-selected="subMode === 'a' ? 'true' : 'false'"
          @click="subMode = 'a'"
        >{{ $t('特A') }}</button>
        <button
          type="button"
          role="tab"
          class="lhc-tema__mode-btn"
          :class="{ active: subMode === 'b' }"
          :aria-selected="subMode === 'b' ? 'true' : 'false'"
          @click="subMode = 'b'"
        >{{ $t('特B') }}</button>
        <button
          type="button"
          role="tab"
          class="lhc-tema__mode-btn"
          :class="{ active: subMode === 'c' }"
          :aria-selected="subMode === 'c' ? 'true' : 'false'"
          @click="subMode = 'c'"
        >{{ $t('特C') }}</button>
      </div>
    </div>

    <div class="lhc-tema__head">
      <span class="lhc-tema__title">{{ modeTitle }}</span>
    </div>

    <div class="lhc-tema__grid" role="group" :aria-label="`${modeTitle}投注项`">
      <button
        v-for="item in gridItems"
        :key="item.key"
        type="button"
        class="lhc-tema__ball"
        :class="{ active: isItemActive(item) }"
        @click="selectItem(item)"
      >
        <span class="lhc-tema__num">{{ itemLabel(item) }}</span>
        <span class="lhc-tema__odds">{{ itemOdds(item) }}</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { initModePickSets, isLhcPickActive, toggleLhcPick } from './lhc-multi-pick.js'
import { labelsFromNumSet, labelsFromTextKeys } from '../lottery-basket-collect.js'
import { TEMA_A_TEXT_OPTS } from './lhc-text-opts.js'

const emit = defineEmits(['update:betCount'])

/** 特码号码 019 */
const TEMA_NUMS = Object.freeze(Array.from({ length: 49 }, (_, i) => i + 1))

const TEMA_TEXT_KEYS = TEMA_A_TEXT_OPTS.map((o) => o.key)

/** 特A / 特B / 特C 各自独立选号（号码多选，特A 中文项单选） */
const subMode = ref('a')
const picks = ref(initModePickSets(['a', 'b', 'c']))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

/** 019 与特A中文项同一网格按序排列 */
const gridItems = computed(() => {
  const nums = TEMA_NUMS.map((n) => ({
    type: 'num',
    key: `num-${n}`,
    value: n
  }))
  if (subMode.value !== 'a') return nums
  const texts = TEMA_A_TEXT_OPTS.map((o) => ({
    type: 'text',
    key: o.key,
    ...o
  }))
  return [...nums, ...texts]
})

const modeTitle = computed(() => {
  const m = subMode.value
  if (m === 'a') return t('特A')
  if (m === 'b') return t('特B')
  return t('特C')
})

function itemLabel(item) {
  return item.type === 'num' ? String(item.value).padStart(2, '0') : item.label
}

function itemOdds(item) {
  return item.type === 'num' ? oddsForNum(item.value) : item.odds
}

function isItemActive(item) {
  return isLhcPickActive(activePicked.value, item)
}

function selectItem(item) {
  const m = subMode.value
  const textKeys = subMode.value === 'a' ? TEMA_TEXT_KEYS : []
  picks.value = {
    ...picks.value,
    [m]: toggleLhcPick(picks.value[m], item, textKeys)
  }
}

function oddsForNum(n) {
  if (subMode.value === 'a') return '48.8'
  const base = 47 + (n % 7)
  return base.toFixed(1)
}

const betCount = computed(() => activePicked.value.size)

watch(
  betCount,
  (c) => emit('update:betCount', c),
  { immediate: true }
)

watch(subMode, () => {
  emit('update:betCount', betCount.value)
})

function resetPicks() {
  subMode.value = 'a'
  picks.value = initModePickSets(['a', 'b', 'c'])
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  if (!set.size) return null
  const nums = labelsFromNumSet(set)
  const texts = labelsFromTextKeys(set, TEMA_A_TEXT_OPTS)
  const parts = [...nums, ...texts]
  return {
    betCount: betCount.value,
    leftLabel: `特码 ${modeTitle.value} ${parts.join(',')}`,
    raw: { play: 'tema', subMode: subMode.value, modeTitle: modeTitle.value, picks: [...set] }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-tema {
  min-height: 0;
}

.lhc-tema__mode {
  margin-bottom: 10px;
}

.lhc-tema__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.lhc-tema__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-tema__mode-row {
  display: grid;
  grid-template-columns: repeat(3, 97px);
  gap: 7px;
  justify-content: start;
}

.lhc-tema__mode-btn {
  width: 97px;
  height: 28px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  font-size: @font-size-sm;
  font-weight: 600;
  color: #1d1d1f;
  padding: 0;
  cursor: pointer;
}

.lhc-tema__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-tema__grid {
  display: grid;
  grid-template-columns: repeat(3, 96.67px);
  gap: 7px;
  justify-content: start;
}

.lhc-tema__ball {
  width: 96.67px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  box-sizing: border-box;
}

.lhc-tema__ball.active {
  .lottery-num-ball-active();
}

.lhc-tema__num {
  font-size: 13px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.lhc-tema__odds {
  font-size: 10px;
  font-weight: 600;
  color: #8d9fc7;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>

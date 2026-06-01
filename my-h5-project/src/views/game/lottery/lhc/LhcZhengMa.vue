<template>
  <div class="lhc-zm" :aria-label="$t('正码')">
    <div class="lhc-zm__mode" role="tablist" :aria-label="$t('正码玩法')">
      <div class="lhc-zm__mode-row">
        <button
          type="button"
          role="tab"
          class="lhc-zm__mode-btn"
          :class="{ active: subMode === 'a' }"
          :aria-selected="subMode === 'a' ? 'true' : 'false'"
          @click="subMode = 'a'"
        >{{ $t('正码A') }}</button>
        <button
          type="button"
          role="tab"
          class="lhc-zm__mode-btn"
          :class="{ active: subMode === 'b' }"
          :aria-selected="subMode === 'b' ? 'true' : 'false'"
          @click="subMode = 'b'"
        >{{ $t('正码B') }}</button>
        <div class="lhc-zm__mode-slot" aria-hidden="true" />
      </div>
    </div>

    <div class="lhc-zm__head">
      <span class="lhc-zm__title">{{ modeTitle }}</span>
    </div>

    <div class="lhc-zm__grid" role="group" :aria-label="`${modeTitle}投注项`">
      <button
        v-for="item in gridItems"
        :key="item.key"
        type="button"
        class="lhc-zm__ball"
        :class="{ active: isItemActive(item) }"
        @click="selectItem(item)"
      >
        <span class="lhc-zm__num">{{ itemLabel(item) }}</span>
        <span class="lhc-zm__odds">{{ itemOdds(item) }}</span>
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
import { ZM_TEXT_OPTS } from './lhc-text-opts.js'

const emit = defineEmits(['update:betCount'])

/** 正码号码 019 */
const ZM_NUMS = Object.freeze(Array.from({ length: 49 }, (_, i) => i + 1))

const ZM_TEXT_KEYS = ZM_TEXT_OPTS.map((o) => o.key)

/** 正码A / 正码B 各自独立选号（号码多选，中文项单选） */
const subMode = ref('a')
const picks = ref(initModePickSets(['a', 'b']))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

const gridItems = computed(() => {
  const nums = ZM_NUMS.map((n) => ({
    type: 'num',
    key: `num-${n}`,
    value: n
  }))
  const texts = ZM_TEXT_OPTS.map((o) => ({
    type: 'text',
    key: o.key,
    ...o
  }))
  return [...nums, ...texts]
})

const modeTitle = computed(() => (subMode.value === 'a' ? t('正码A') : t('正码B')))

function itemLabel(item) {
  return item.type === 'num' ? String(item.value).padStart(2, '0') : item.label
}

function itemOdds(item) {
  if (item.type === 'text') return item.odds
  const base = 47 + (item.value % 7)
  return base.toFixed(1)
}

function isItemActive(item) {
  return isLhcPickActive(activePicked.value, item)
}

function selectItem(item) {
  const m = subMode.value
  picks.value = {
    ...picks.value,
    [m]: toggleLhcPick(picks.value[m], item, ZM_TEXT_KEYS)
  }
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
  picks.value = initModePickSets(['a', 'b'])
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  if (!set.size) return null
  const nums = labelsFromNumSet(set)
  const texts = labelsFromTextKeys(set, ZM_TEXT_OPTS)
  const parts = [...nums, ...texts]
  return {
    betCount: betCount.value,
    leftLabel: `正码 ${modeTitle.value} ${parts.join(',')}`,
    raw: { play: 'zhengma', subMode: subMode.value, modeTitle: modeTitle.value, picks: [...set] }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-zm {
  min-height: 0;
}

.lhc-zm__mode {
  margin-bottom: 10px;
}

.lhc-zm__mode-row {
  display: grid;
  grid-template-columns: repeat(3, 97px);
  gap: 7px;
  justify-content: start;
}

.lhc-zm__mode-btn {
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

.lhc-zm__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-zm__mode-slot {
  width: 97px;
  height: 28px;
  pointer-events: none;
}

.lhc-zm__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.lhc-zm__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-zm__grid {
  display: grid;
  grid-template-columns: repeat(3, 96.67px);
  gap: 7px;
  justify-content: start;
}

.lhc-zm__ball {
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

.lhc-zm__ball.active {
  .lottery-num-ball-active();
}

.lhc-zm__num {
  font-size: 13px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.lhc-zm__odds {
  font-size: 10px;
  font-weight: 600;
  color: #8d9fc7;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>

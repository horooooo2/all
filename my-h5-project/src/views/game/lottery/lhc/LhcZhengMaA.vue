<template>
  <div class="lhc-zmt" :aria-label="$t('正特码A')">
    <div class="lhc-zmt__mode" role="tablist" :aria-label="$t('正特码A玩法')">
      <div class="lhc-zmt__mode-grid">
        <button
          v-for="m in PLAY_MODES"
          :key="m.key"
          type="button"
          role="tab"
          class="lhc-zmt__mode-btn"
          :class="{ active: subMode === m.key }"
          :aria-selected="subMode === m.key ? 'true' : 'false'"
          @click="subMode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="lhc-zmt__head">
      <span class="lhc-zmt__title">{{ modeTitle }}</span>
    </div>

    <div class="lhc-zmt__grid" role="group" :aria-label="`${modeTitle}投注项`">
      <button
        v-for="item in gridItems"
        :key="item.key"
        type="button"
        class="lhc-zmt__ball"
        :class="{ active: isItemActive(item) }"
        @click="selectItem(item)"
      >
        <span class="lhc-zmt__num">{{ itemLabel(item) }}</span>
        <span class="lhc-zmt__odds">{{ itemOdds(item) }}</span>
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
import { ZMT_TEXT_OPTS } from './lhc-text-opts.js'

const emit = defineEmits(['update:betCount'])

const ZMT_NUMS = Object.freeze(Array.from({ length: 49 }, (_, i) => i + 1))

const PLAY_MODES = Object.freeze([
  { key: 'z1', label: t('正一A') },
  { key: 'z2', label: t('正二A') },
  { key: 'z3', label: t('正三A') },
  { key: 'z4', label: t('正四A') },
  { key: 'z5', label: t('正五A') },
  { key: 'z6', label: t('正六A') }
])

const NUM_ODDS = '48.015'

const ZMT_TEXT_KEYS = ZMT_TEXT_OPTS.map((o) => o.key)

const subMode = ref('z1')

const picks = ref(initModePickSets(PLAY_MODES.map((m) => m.key)))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

const currentMode = computed(() => PLAY_MODES.find((m) => m.key === subMode.value) ?? PLAY_MODES[0])

const modeTitle = computed(() => currentMode.value.label)

const gridItems = computed(() => {
  const nums = ZMT_NUMS.map((n) => ({
    type: 'num',
    key: `num-${n}`,
    value: n
  }))
  const texts = ZMT_TEXT_OPTS.map((o) => ({
    type: 'text',
    key: o.key,
    ...o
  }))
  return [...nums, ...texts]
})

function itemLabel(item) {
  return item.type === 'num' ? String(item.value).padStart(2, '0') : item.label
}

function itemOdds(item) {
  return item.type === 'num' ? NUM_ODDS : item.odds
}

function isItemActive(item) {
  return isLhcPickActive(activePicked.value, item)
}

function selectItem(item) {
  const m = subMode.value
  picks.value = {
    ...picks.value,
    [m]: toggleLhcPick(picks.value[m], item, ZMT_TEXT_KEYS)
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
  subMode.value = 'z1'
  picks.value = initModePickSets(PLAY_MODES.map((m) => m.key))
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  if (!set.size) return null
  const nums = labelsFromNumSet(set)
  const texts = labelsFromTextKeys(set, ZMT_TEXT_OPTS)
  const parts = [...nums, ...texts]
  return {
    betCount: betCount.value,
    leftLabel: `正特码A ${modeTitle.value} ${parts.join(',')}`,
    raw: { play: 'zhengmada', subMode: subMode.value, modeTitle: modeTitle.value, picks: [...set] }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-zmt {
  min-height: 0;
}

.lhc-zmt__mode {
  margin-bottom: 10px;
}

.lhc-zmt__mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 97px);
  gap: 7px;
  justify-content: start;
}

.lhc-zmt__mode-btn {
  width: 97px;
  min-height: 28px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  font-size: @font-size-sm;
  font-weight: 600;
  color: #6a7892;
  padding: 4px 2px;
  line-height: 1.2;
  cursor: pointer;
  white-space: normal;
  word-break: break-all;
}

.lhc-zmt__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-zmt__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.lhc-zmt__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-zmt__grid {
  display: grid;
  grid-template-columns: repeat(3, 96.67px);
  gap: 7px;
  justify-content: start;
}

.lhc-zmt__ball {
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

.lhc-zmt__ball.active {
  .lottery-num-ball-active();
}

.lhc-zmt__num {
  font-size: 13px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.lhc-zmt__odds {
  font-size: 10px;
  font-weight: 600;
  color: #8d9fc7;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
</style>

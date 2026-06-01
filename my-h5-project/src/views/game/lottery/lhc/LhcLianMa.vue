<template>
  <div class="lhc-lm" :aria-label="$t('连码')">
    <div class="lhc-lm__mode" role="tablist" :aria-label="$t('连码玩法')">
      <div class="lhc-lm__mode-grid">
        <button
          v-for="m in PLAY_MODES"
          :key="m.key"
          type="button"
          role="tab"
          class="lhc-lm__mode-btn"
          :class="{ active: subMode === m.key }"
          :aria-selected="subMode === m.key ? 'true' : 'false'"
          @click="subMode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="lhc-lm__head">
      <span class="lhc-lm__title">{{ modeTitle }}</span>
    </div>

    <div class="lhc-lm__grid" role="group" :aria-label="`${modeTitle}号码`">
      <button
        v-for="n in LIANMA_NUMS"
        :key="n"
        type="button"
        class="lhc-lm__ball"
        :class="{ active: activePicked.has(n) }"
        @click="toggle(n)"
      >
        <span class="lhc-lm__num">{{ String(n).padStart(2, '0') }}</span>
        <span class="lhc-lm__odds" :class="{ 'lhc-lm__odds--dual': currentMode.dualOdds }">{{ oddsFor(n) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { LIANMA_PLAY_MODES, lianmaBetCount, lianmaOddsText } from './lhc-lianma-bet-count.js'
import { labelsFromNumSet } from '../lottery-basket-collect.js'

const emit = defineEmits(['update:betCount'])

const LIANMA_NUMS = Object.freeze(Array.from({ length: 49 }, (_, i) => i + 1))

const PLAY_MODES = LIANMA_PLAY_MODES

const subMode = ref('s4qz')

const picks = ref(
  Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()]))
)

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

const currentMode = computed(() => PLAY_MODES.find((m) => m.key === subMode.value) ?? PLAY_MODES[0])

const modeTitle = computed(() => currentMode.value.label)

function oddsFor(n) {
  return lianmaOddsText(currentMode.value, n)
}

function toggle(n) {
  const key = subMode.value
  const next = new Set(picks.value[key])
  if (next.has(n)) next.delete(n)
  else next.add(n)
  picks.value = { ...picks.value, [key]: next }
}

function betCountForMode(modeKey) {
  const mode = PLAY_MODES.find((m) => m.key === modeKey)
  const set = picks.value[modeKey]
  if (!mode || !set?.size) return 0
  return lianmaBetCount(set.size, mode)
}

const betCount = computed(() => betCountForMode(subMode.value))

watch(
  betCount,
  (c) => emit('update:betCount', c),
  { immediate: true }
)

watch(subMode, () => {
  emit('update:betCount', betCount.value)
})

function resetPicks() {
  subMode.value = 's4qz'
  picks.value = Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()]))
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  const count = betCount.value
  if (!set.size || !count) return null
  const nums = labelsFromNumSet(set)
  return {
    betCount: count,
    leftLabel: `连码 ${modeTitle.value} ${nums.join(',')}`,
    raw: { play: 'lianma', subMode: subMode.value, modeTitle: modeTitle.value, picks: [...set] }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-lm {
  min-height: 0;
}

.lhc-lm__mode {
  margin-bottom: 10px;
}

.lhc-lm__mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 97px);
  gap: 7px;
  justify-content: start;
}

.lhc-lm__mode-btn {
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

.lhc-lm__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-lm__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.lhc-lm__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-lm__grid {
  display: grid;
  grid-template-columns: repeat(3, 96.67px);
  gap: 7px;
  justify-content: start;
}

.lhc-lm__ball {
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

.lhc-lm__ball.active {
  .lottery-num-ball-active();
}

.lhc-lm__num {
  font-size: 13px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.lhc-lm__odds {
  font-size: 10px;
  font-weight: 600;
  color: #8d9fc7;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.lhc-lm__odds--dual {
  font-size: 9px;
  letter-spacing: -0.2px;
}
</style>

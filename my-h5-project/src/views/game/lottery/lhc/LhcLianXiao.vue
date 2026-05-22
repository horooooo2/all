<template>
  <div class="lhc-lx" aria-label="连肖">
    <div class="lhc-lx__mode" role="tablist" aria-label="连肖玩法">
      <div class="lhc-lx__mode-grid">
        <button
          v-for="m in PLAY_MODES"
          :key="m.key"
          type="button"
          role="tab"
          class="lhc-lx__mode-btn"
          :class="{ active: subMode === m.key }"
          :aria-selected="subMode === m.key ? 'true' : 'false'"
          @click="subMode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="lhc-lx__head">
      <span class="lhc-lx__title">{{ modeTitle }}</span>
    </div>

    <ul class="lhc-lx__list">
      <li v-for="z in zodiacRows" :key="z.key" class="lhc-lx__row">
        <div
          class="lhc-lx__label"
          role="button"
          tabindex="0"
          :class="{ active: activePicked.has(z.key) }"
          :aria-pressed="activePicked.has(z.key) ? 'true' : 'false'"
          @click="toggle(z.key)"
          @keydown.enter.prevent="toggle(z.key)"
          @keydown.space.prevent="toggle(z.key)"
        >
          <div class="lhc-lx__pick">
            <span class="lhc-lx__name">{{ z.label }}</span>
          </div>
          <div class="lhc-lx__odds">{{ z.odds }}</div>
        </div>

        <div class="lhc-lx__nums" role="group" :aria-label="`${z.label}号码`">
          <button
            v-for="n in z.nums"
            :key="`${z.key}-${n}`"
            type="button"
            class="lhc-lx__num"
            :class="[waveBallClass(n), { active: activePicked.has(z.key) }]"
            :aria-pressed="activePicked.has(z.key) ? 'true' : 'false'"
            @click="toggle(z.key)"
          >
            {{ pad2(n) }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { LHC_ZODIACS, zodiacLabel } from './lhc-zodiac-data.js'
import { LIANXIAO_MODES, lianxiaoBetCount } from './lhc-lianxiao-config.js'
import { waveKey } from './lhc-ptyx-data.js'

const emit = defineEmits(['update:betCount'])

const PLAY_MODES = LIANXIAO_MODES

const subMode = ref('x2')

const picks = ref(Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()])))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

const currentMode = computed(() => PLAY_MODES.find((m) => m.key === subMode.value) ?? PLAY_MODES[0])

const modeTitle = computed(() => currentMode.value.label)

const zodiacRows = computed(() =>
  LHC_ZODIACS.map((z) => ({
    ...z,
    odds: currentMode.value.odds
  }))
)

function pad2(n) {
  return String(n).padStart(2, '0')
}

function waveBallClass(n) {
  const w = waveKey(n)
  if (w === 'red') return 'lhc-lx__num--red'
  if (w === 'blue') return 'lhc-lx__num--blue'
  return 'lhc-lx__num--green'
}

function toggle(key) {
  const modeKey = subMode.value
  const next = new Set(picks.value[modeKey])
  if (next.has(key)) next.delete(key)
  else next.add(key)
  picks.value = { ...picks.value, [modeKey]: next }
}

function betCountForMode(modeKey) {
  const mode = PLAY_MODES.find((m) => m.key === modeKey)
  const set = picks.value[modeKey]
  if (!mode || !set?.size) return 0
  return lianxiaoBetCount(set.size, mode)
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
  subMode.value = 'x2'
  picks.value = Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()]))
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  const count = betCount.value
  if (!set.size || !count) return null
  const labels = [...set].map((k) => zodiacLabel(k))
  return {
    betCount: count,
    leftLabel: `连肖 ${modeTitle.value} ${labels.join(',')}`,
    raw: {
      play: 'lianxiao',
      subMode: subMode.value,
      modeTitle: modeTitle.value,
      comboSize: currentMode.value.comboSize,
      picks: [...set]
    }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-lx {
  min-height: 0;
}

.lhc-lx__mode {
  margin-bottom: 10px;
}

.lhc-lx__mode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.lhc-lx__mode-btn {
  min-height: 28px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  font-size: @font-size-sm;
  font-weight: 400;
  color: #6a7892;
  padding: 4px 2px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
}

.lhc-lx__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-lx__head {
  margin-bottom: 8px;
}

.lhc-lx__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-lx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lhc-lx__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lhc-lx__label {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  user-select: none;
}

.lhc-lx__pick {
  display: flex;
  height: 60px;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  box-sizing: border-box;
}

.lhc-lx__label.active .lhc-lx__pick {
  border-color: #0065ff;
  box-shadow: 0 0 0 1px #0065ff inset;
}

.lhc-lx__name {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1.1;
  color: #1d1d1f;
  text-align: center;
}

.lhc-lx__odds {
  height: 20px;
  margin-top: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 400;
  color: #8d9fc7;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
}

.lhc-lx__nums {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 60px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 26px;
  row-gap: 26px;
  align-content: center;
  box-sizing: border-box;
}

.lhc-lx__num {
  display: flex;
  width: 26px;
  height: 26px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  justify-self: center;
  border-radius: 13px;
  border: 0.813px solid #dae4f6;
  background: #ffffff;
  font-size: 11px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  box-sizing: border-box;
  padding: 0;
  cursor: pointer;
}

.lhc-lx__num.active {
  .lottery-num-ball-active();
}

.lhc-lx__num--red {
  border-color: #ee1818;
  color: #ee1818;
}

.lhc-lx__num--green {
  border-color: #08d836;
  color: #08d836;
}

.lhc-lx__num--blue {
  border-color: #007aff;
  color: #007aff;
}
</style>

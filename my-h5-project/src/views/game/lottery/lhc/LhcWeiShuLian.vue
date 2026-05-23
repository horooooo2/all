<template>
  <div class="lhc-wsl" aria-label="尾数连">
    <div class="lhc-wsl__mode" role="tablist" aria-label="尾数连玩法">
      <div class="lhc-wsl__mode-grid">
        <button
          v-for="m in PLAY_MODES"
          :key="m.key"
          type="button"
          role="tab"
          class="lhc-wsl__mode-btn"
          :class="{ active: subMode === m.key }"
          :aria-selected="subMode === m.key ? 'true' : 'false'"
          @click="subMode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="lhc-wsl__head">
      <span class="lhc-wsl__title">{{ modeTitle }}</span>
    </div>

    <ul class="lhc-wsl__list">
      <li v-for="t in tailRows" :key="t.key" class="lhc-wsl__row">
        <div
          class="lhc-wsl__label"
          role="button"
          tabindex="0"
          :class="{ active: activePicked.has(t.key) }"
          :aria-pressed="activePicked.has(t.key) ? 'true' : 'false'"
          @click="toggle(t.key)"
          @keydown.enter.prevent="toggle(t.key)"
          @keydown.space.prevent="toggle(t.key)"
        >
          <div class="lhc-wsl__pick">
            <span class="lhc-wsl__name">{{ t.label }}</span>
          </div>
          <div class="lhc-wsl__odds">{{ t.odds }}</div>
        </div>

        <div class="lhc-wsl__nums" role="group" :aria-label="`${t.label}号码`">
          <button
            v-for="n in t.nums"
            :key="`${t.key}-${n}`"
            type="button"
            class="lhc-wsl__num"
            :class="[waveBallClass(n), { active: activePicked.has(t.key) }]"
            :aria-pressed="activePicked.has(t.key) ? 'true' : 'false'"
            @click="toggle(t.key)"
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
import { WEISHU_TAILS, WEISHULIAN_MODES, tailLabel, weishulianBetCount } from './lhc-weishulian-config.js'
import { waveKey } from './lhc-ptyx-data.js'

const emit = defineEmits(['update:betCount'])

const PLAY_MODES = WEISHULIAN_MODES

const subMode = ref('w2')

const picks = ref(Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()])))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

const currentMode = computed(() => PLAY_MODES.find((m) => m.key === subMode.value) ?? PLAY_MODES[0])

const modeTitle = computed(() => currentMode.value.label)

const tailRows = computed(() =>
  WEISHU_TAILS.map((t) => ({
    ...t,
    odds: currentMode.value.odds
  }))
)

function pad2(n) {
  return String(n).padStart(2, '0')
}

function waveBallClass(n) {
  const w = waveKey(n)
  if (w === 'red') return 'lhc-wsl__num--red'
  if (w === 'blue') return 'lhc-wsl__num--blue'
  return 'lhc-wsl__num--green'
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
  return weishulianBetCount(set.size, mode)
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
  subMode.value = 'w2'
  picks.value = Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()]))
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  const count = betCount.value
  if (!set.size || !count) return null
  const labels = [...set].map((k) => tailLabel(k))
  return {
    betCount: count,
    leftLabel: `尾数${modeTitle.value} ${labels.join(',')}`,
    raw: {
      play: 'weishulian',
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

.lhc-wsl {
  min-height: 0;
}

.lhc-wsl__mode {
  margin-bottom: 10px;
}

.lhc-wsl__mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}

.lhc-wsl__mode-btn {
  min-height: 28px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  font-size: @font-size-sm;
  font-weight: 400;
  color: #6a7892;
  padding: 4px 6px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
}

.lhc-wsl__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-wsl__head {
  margin-bottom: 8px;
}

.lhc-wsl__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-wsl__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lhc-wsl__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lhc-wsl__label {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  user-select: none;
}

.lhc-wsl__pick {
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

.lhc-wsl__label.active .lhc-wsl__pick {
  border-color: #0065ff;
  box-shadow: 0 0 0 1px #0065ff inset;
}

.lhc-wsl__name {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1.1;
  color: #1d1d1f;
  text-align: center;
}

.lhc-wsl__odds {
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

.lhc-wsl__nums {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 60px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: 26px;
  row-gap: 26px;
  align-content: center;
  box-sizing: border-box;
}

.lhc-wsl__num {
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

.lhc-wsl__num.active {
  .lottery-num-ball-active();
}

.lhc-wsl__num--red {
  border-color: #ee1818;
  color: #ee1818;
}

.lhc-wsl__num--green {
  border-color: #08d836;
  color: #08d836;
}

.lhc-wsl__num--blue {
  border-color: #007aff;
  color: #007aff;
}
</style>

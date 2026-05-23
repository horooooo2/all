<template>
  <div class="lhc-ptyx" aria-label="平特一肖尾数">
    <div class="lhc-ptyx__mode" role="tablist" aria-label="平特一肖尾数玩法">
      <div class="lhc-ptyx__mode-grid">
        <button
          v-for="m in PLAY_MODES"
          :key="m.key"
          type="button"
          role="tab"
          class="lhc-ptyx__mode-btn"
          :class="{ active: subMode === m.key }"
          :aria-selected="subMode === m.key ? 'true' : 'false'"
          @click="subMode = m.key"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <ul class="lhc-ptyx__list">
      <li v-for="opt in options" :key="opt.key" class="lhc-ptyx__row">
        <div
          class="lhc-ptyx__label"
          role="button"
          tabindex="0"
          :class="{ active: isActive(opt.key) }"
          :aria-pressed="isActive(opt.key) ? 'true' : 'false'"
          @click="toggle(opt.key)"
          @keydown.enter.prevent="toggle(opt.key)"
          @keydown.space.prevent="toggle(opt.key)"
        >
          <div class="lhc-ptyx__pick">
            <span class="lhc-ptyx__name">{{ opt.label }}</span>
          </div>
          <div class="lhc-ptyx__odds">{{ opt.odds }}</div>
        </div>

        <div class="lhc-ptyx__nums" role="group" :aria-label="`${opt.label}号码`">
          <button
            v-for="n in opt.nums"
            :key="`${opt.key}-${n}`"
            type="button"
            class="lhc-ptyx__num"
            :class="[waveBallClass(n), { active: isActive(opt.key) }]"
            :aria-pressed="isActive(opt.key) ? 'true' : 'false'"
            @click="toggle(opt.key)"
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
import { PTYX_MODES, ptyxModeLabel, ptyxOptionsForMode, waveKey } from './lhc-ptyx-data.js'

const emit = defineEmits(['update:betCount'])

const PLAY_MODES = PTYX_MODES

const subMode = ref('sx-a')

const picks = ref(Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()])))

const options = computed(() => ptyxOptionsForMode(subMode.value))

const activePicked = computed(() => picks.value[subMode.value] ?? new Set())

function pad2(n) {
  return String(n).padStart(2, '0')
}

function waveBallClass(n) {
  const w = waveKey(n)
  if (w === 'red') return 'lhc-ptyx__num--red'
  if (w === 'blue') return 'lhc-ptyx__num--blue'
  return 'lhc-ptyx__num--green'
}

function isActive(key) {
  return activePicked.value.has(key)
}

function toggle(key) {
  const modeKey = subMode.value
  const next = new Set(picks.value[modeKey])
  if (next.has(key)) next.delete(key)
  else next.add(key)
  picks.value = { ...picks.value, [modeKey]: next }
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
  subMode.value = 'sx-a'
  picks.value = Object.fromEntries(PLAY_MODES.map((m) => [m.key, new Set()]))
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const set = activePicked.value
  if (!set.size) return null
  const modeLabel = ptyxModeLabel(subMode.value)
  const prefix = subMode.value.startsWith('ws') ? '平特尾数' : '平特一肖'
  const keys = [...set]
  const labels = keys.map((key) => options.value.find((o) => o.key === key)?.label ?? key)
  return {
    betCount: keys.length,
    leftLabel: `${prefix} ${modeLabel} ${labels.join(',')}`,
    splits: keys.map((key) => {
      const opt = options.value.find((o) => o.key === key)
      return {
        leftLabel: `${prefix} ${modeLabel} ${opt?.label ?? ''}`,
        raw: { play: 'ptyx', subMode: subMode.value, key }
      }
    })
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-ptyx {
  min-height: 0;
}

.lhc-ptyx__mode {
  margin-bottom: 10px;
}

.lhc-ptyx__mode-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 7px;
}

.lhc-ptyx__mode-btn {
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

.lhc-ptyx__mode-btn.active {
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}

.lhc-ptyx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lhc-ptyx__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lhc-ptyx__label {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  user-select: none;
}

.lhc-ptyx__pick {
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

.lhc-ptyx__label.active .lhc-ptyx__pick {
  border-color: #0065ff;
  box-shadow: 0 0 0 1px #0065ff inset;
}

.lhc-ptyx__name {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1.1;
  color: #1d1d1f;
  text-align: center;
}

.lhc-ptyx__odds {
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

.lhc-ptyx__nums {
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

.lhc-ptyx__num {
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

.lhc-ptyx__num.active {
  .lottery-num-ball-active();
}

.lhc-ptyx__num--red {
  border-color: #ee1818;
  color: #ee1818;
}

.lhc-ptyx__num--green {
  border-color: #08d836;
  color: #08d836;
}

.lhc-ptyx__num--blue {
  border-color: #007aff;
  color: #007aff;
}
</style>

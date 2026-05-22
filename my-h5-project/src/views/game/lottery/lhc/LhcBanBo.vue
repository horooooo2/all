<template>
  <div class="lhc-bb" aria-label="半波">
    <ul class="lhc-bb__list">
      <li v-for="opt in options" :key="opt.key" class="lhc-bb__row">
        <div
          class="lhc-bb__label"
          role="button"
          tabindex="0"
          :class="{ active: isActive(opt.key) }"
          :aria-pressed="isActive(opt.key) ? 'true' : 'false'"
          @click="toggle(opt.key)"
          @keydown.enter.prevent="toggle(opt.key)"
          @keydown.space.prevent="toggle(opt.key)"
        >
          <div class="lhc-bb__pick">
            <span class="lhc-bb__name">{{ opt.label }}</span>
          </div>
          <div class="lhc-bb__odds">{{ opt.odds }}</div>
        </div>

        <div class="lhc-bb__nums" role="group" :aria-label="`${opt.label}号码`">
          <button
            v-for="n in opt.nums"
            :key="`${opt.key}-${n}`"
            type="button"
            class="lhc-bb__num"
            :class="[waveBallClass(opt.wave), { active: isActive(opt.key) }]"
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
import { BANBO_OPTIONS } from './lhc-banbo-data.js'

const emit = defineEmits(['update:betCount'])

const options = BANBO_OPTIONS

const picked = ref(new Set())

function pad2(n) {
  return String(n).padStart(2, '0')
}

function waveBallClass(wave) {
  if (wave === 'red') return 'lhc-bb__num--red'
  if (wave === 'blue') return 'lhc-bb__num--blue'
  return 'lhc-bb__num--green'
}

function isActive(key) {
  return picked.value.has(key)
}

function toggle(key) {
  const next = new Set(picked.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  picked.value = next
}

const betCount = computed(() => picked.value.size)

watch(
  betCount,
  (c) => emit('update:betCount', c),
  { immediate: true }
)

function resetPicks() {
  picked.value = new Set()
  emit('update:betCount', 0)
}

function getBasketDraft() {
  if (!picked.value.size) return null
  const keys = [...picked.value]
  const labels = keys.map((key) => options.find((o) => o.key === key)?.label ?? key)
  return {
    betCount: keys.length,
    leftLabel: `半波 ${labels.join(',')}`,
    splits: keys.map((key) => {
      const opt = options.find((o) => o.key === key)
      return {
        leftLabel: `半波 ${opt?.label ?? key}`,
        raw: { play: 'banbo', key }
      }
    })
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-bb {
  min-height: 0;
}

.lhc-bb__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lhc-bb__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lhc-bb__label {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  user-select: none;
}

.lhc-bb__pick {
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

.lhc-bb__label.active .lhc-bb__pick {
  border-color: #0065ff;
  box-shadow: 0 0 0 1px #0065ff inset;
}

.lhc-bb__name {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1.1;
  color: #1d1d1f;
  text-align: center;
}

.lhc-bb__odds {
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

.lhc-bb__nums {
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

.lhc-bb__num {
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

.lhc-bb__num.active {
  .lottery-num-ball-active();
}

.lhc-bb__num--red {
  border-color: #ee1818;
  color: #ee1818;
}

.lhc-bb__num--green {
  border-color: #08d836;
  color: #08d836;
}

.lhc-bb__num--blue {
  border-color: #007aff;
  color: #007aff;
}
</style>

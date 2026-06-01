<template>
  <div class="lhc-tx" :aria-label="$t('特肖')">
    <div class="lhc-tx__head">
      <span class="lhc-tx__title">{{ $t('特肖') }}</span>
    </div>

    <ul class="lhc-tx__list">
      <li v-for="z in zodiacs" :key="z.key" class="lhc-tx__row">
        <div
          class="lhc-tx__label"
          role="button"
          tabindex="0"
          :class="{ active: pick === z.key }"
          :aria-pressed="pick === z.key ? 'true' : 'false'"
          @click="toggle(z.key)"
          @keydown.enter.prevent="toggle(z.key)"
          @keydown.space.prevent="toggle(z.key)"
        >
          <div class="lhc-tx__pick">
            <span class="lhc-tx__name">{{ z.label }}</span>
          </div>
          <div class="lhc-tx__odds">{{ z.odds }}</div>
        </div>

        <div class="lhc-tx__nums" role="group" :aria-label="`${z.label}号码`">
          <button
            v-for="n in z.nums"
            :key="`${z.key}-${n}`"
            type="button"
            class="lhc-tx__num"
            :class="[waveBallClass(n), { active: pick === z.key }]"
            :aria-pressed="pick === z.key ? 'true' : 'false'"
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
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { LHC_ZODIACS } from './lhc-zodiac-data.js'
import { waveKey } from './lhc-ptyx-data.js'

const emit = defineEmits(['update:betCount'])

const zodiacs = LHC_ZODIACS.map((z) => ({ ...z, odds: '11.7' }))

const pick = ref('')

function pad2(n) {
  return String(n).padStart(2, '0')
}

function waveBallClass(n) {
  const w = waveKey(n)
  if (w === 'red') return 'lhc-tx__num--red'
  if (w === 'blue') return 'lhc-tx__num--blue'
  return 'lhc-tx__num--green'
}

function toggle(key) {
  pick.value = pick.value === key ? '' : key
}

const betCount = computed(() => (pick.value ? 1 : 0))

watch(
  betCount,
  (c) => emit('update:betCount', c),
  { immediate: true }
)

function resetPicks() {
  pick.value = ''
  emit('update:betCount', 0)
}

function getBasketDraft() {
  if (!pick.value) return null
  const z = zodiacs.find((x) => x.key === pick.value)
  return {
    betCount: 1,
    leftLabel: `特肖 ${z?.label ?? pick.value}`,
    raw: { play: 'texiao', key: pick.value }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-tx {
  min-height: 0;
}

.lhc-tx__head {
  margin-bottom: 8px;
}

.lhc-tx__title {
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
}

.lhc-tx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.lhc-tx__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.lhc-tx__label {
  width: 52px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: pointer;
  user-select: none;
}

.lhc-tx__pick {
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

.lhc-tx__label.active .lhc-tx__pick {
  border-color: #0065ff;
  box-shadow: 0 0 0 1px #0065ff inset;
}

.lhc-tx__name {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1.1;
  color: #1d1d1f;
  text-align: center;
}

.lhc-tx__odds {
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

.lhc-tx__nums {
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

.lhc-tx__num {
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

.lhc-tx__num.active {
  .lottery-num-ball-active();
}

.lhc-tx__num--red {
  border-color: #ee1818;
  color: #ee1818;
}

.lhc-tx__num--green {
  border-color: #08d836;
  color: #08d836;
}

.lhc-tx__num--blue {
  border-color: #007aff;
  color: #007aff;
}
</style>

<template>
  <div class="lhc-hub pl5-smp">
    <aside class="lhc-hub__tabs" :aria-label="$t('玩法分类')">
      <button
        v-for="t in sideTabs"
        :key="t.key"
        type="button"
        class="lhc-hub__tab"
        :class="{ active: activeSide === t.key }"
        @click="activeSide = t.key"
      >
        <span class="lhc-hub__tab-text">{{ t.label }}</span>
      </button>
    </aside>

    <main class="lhc-hub__content" :aria-label="$t('投注选项')">
      <template v-if="activeSide === 'lht'">
        <section v-for="g in groups" :key="g.key" class="pl5-smp__group">
          <div class="pl5-smp__group-title">{{ g.title }}</div>
          <div class="pl5-smp__grid">
            <button
              v-for="opt in options"
              :key="`${g.key}-${opt.key}`"
              type="button"
              class="pl5-smp__cell"
              :class="{ active: pick[g.key] === opt.key }"
              @click="setPick(g.key, opt.key)"
            >
              <span class="pl5-smp__cell-name">{{ opt.label }}</span>
              <span class="pl5-smp__cell-odds">{{ formatOdds(opt.odds) }}</span>
            </button>
          </div>
        </section>
      </template>

      <div v-else class="pl5-smp__placeholder">
        <p>{{ sideTabs.find((x) => x.key === activeSide)?.label }}（演示：后续接玩法）</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { SMP_DRAGON_TIGER_GROUPS, SMP_DRAGON_TIGER_OPTIONS } from './smp-dragon-tiger.js'

const emit = defineEmits(['update:betCount'])

const sideTabs = [
  { key: 'lht', label: t('龙虎') },
  { key: 'sm', label: t('双面') },
  { key: 'sz', label: t('数字盘') }
]

const activeSide = ref('lht')
const groups = SMP_DRAGON_TIGER_GROUPS
const options = SMP_DRAGON_TIGER_OPTIONS

/** @type {Record<string, string>} rowKey -> 'long'|'tie'|'hu' */
const pick = ref({})

function setPick(rowKey, optKey) {
  const cur = pick.value[rowKey]
  pick.value = { ...pick.value, [rowKey]: cur === optKey ? '' : optKey }
}

const betCount = computed(() => Object.values(pick.value).filter(Boolean).length)

watch(
  betCount,
  (n) => emit('update:betCount', n),
  { immediate: true }
)

watch(activeSide, () => {
  pick.value = {}
  emit('update:betCount', 0)
})

function formatOdds(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n.toFixed(2).replace(/\.00$/, '')
}

function resetPicks() {
  pick.value = {}
  emit('update:betCount', 0)
}

function getBasketDraft() {
  if (activeSide.value !== 'lht') return null
  const entries = Object.entries(pick.value).filter(([, v]) => v)
  if (!entries.length) return null
  const lines = entries.map(([rowKey, optKey]) => {
    const g = groups.find((x) => x.key === rowKey)
    const o = options.find((x) => x.key === optKey)
    return `${g?.title ?? rowKey}${o?.label ?? optKey}`
  })
  return {
    betCount: entries.length,
    leftLabel: `双面龙虎 ${lines.join(' ')}`,
    raw: { play: 'smp-lht', picks: { ...pick.value } }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
@import '@/styles/pages/lottery-play-hub.less';

.pl5-smp__group + .pl5-smp__group {
  margin-top: 12px;
}

.pl5-smp__group-title {
  font-size: @font-size-sm;
  color: #1d1d1f;
  margin: 6px 2px 8px;
  font-weight: 700;
}

.pl5-smp__grid {
  display: grid;
  grid-template-columns: repeat(3, 70px);
  gap: 10px;
}

.pl5-smp__cell {
  width: 70px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  padding: 0 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #252e3a;
}

.pl5-smp__cell.active {
  .lottery-num-ball-active();
}

.pl5-smp__cell-name {
  font-size: @font-size-md;
  font-weight: 700;
  line-height: 1;
  color: #252e3a;
}

.pl5-smp__cell-odds {
  font-size: @font-size-xs;
  color: #252e3a;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.pl5-smp__placeholder {
  padding: 24px 12px;
  text-align: center;
  font-size: @font-size-sm;
  color: #6a7892;
}

.pl5-smp__placeholder p {
  margin: 0;
}
</style>

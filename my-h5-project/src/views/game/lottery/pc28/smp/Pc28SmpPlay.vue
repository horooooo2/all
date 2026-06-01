<template>
  <div class="lhc-hub pc28-smp">
    <aside class="lhc-hub__tabs" aria-label="玩法分类">
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

    <main class="lhc-hub__content" aria-label="投注选项">
      <section v-for="g in activeGroups" :key="g.key" class="pc28-smp__group">
        <div class="pc28-smp__group-title">{{ g.title }}</div>
        <div class="pc28-smp__grid" :style="{ gridTemplateColumns: `repeat(${g.columns || 4}, minmax(0, 1fr))` }">
          <button
            v-for="opt in g.options"
            :key="opt.key"
            type="button"
            class="pc28-smp__cell"
            :class="{ active: pickedKeys.has(opt.key) }"
            @click="togglePick(opt)"
          >
            <span class="pc28-smp__cell-name">{{ opt.label }}</span>
            <span class="pc28-smp__cell-odds">{{ formatOdds(opt.odds) }}</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['update:betCount'])

const sideTabs = [
  { key: 'tema', label: '特码整合' },
  { key: 'shape', label: '三位形态' },
  { key: 'single', label: '单点' }
]

const activeSide = ref('tema')

function formatOdds(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n.toFixed(2).replace(/\.00$/, '')
}

const temaGroups = computed(() => [
    {
      key: 'bsse',
      title: '大小单双',
      columns: 4,
      options: [
        { key: 'pc28-bs-big', label: '大', odds: 2.28 },
        { key: 'pc28-bs-small', label: '小', odds: 2.28 },
        { key: 'pc28-bs-odd', label: '单', odds: 2.28 },
        { key: 'pc28-bs-even', label: '双', odds: 2.28 }
      ]
    },
    {
      key: 'combo',
      title: '大小单双组合',
      columns: 4,
      options: [
        { key: 'pc28-combo-big-odd', label: '大单', odds: 4.2 },
        { key: 'pc28-combo-small-odd', label: '小单', odds: 5 },
        { key: 'pc28-combo-big-even', label: '大双', odds: 5 },
        { key: 'pc28-combo-small-even', label: '小双', odds: 4.2 }
      ]
    },
    {
      key: 'extreme',
      title: '极值大小',
      columns: 4,
      options: [
        { key: 'pc28-extreme-big', label: '极大', odds: 16 },
        { key: 'pc28-extreme-small', label: '极小', odds: 16 }
      ]
    }
])

const shapeGroups = computed(() => [
  {
    key: 'special',
    title: '特殊',
    columns: 4,
    options: [
      { key: 'pc28-shape-leopard', label: '豹子', odds: 1.98 },
      { key: 'pc28-shape-straight', label: '顺子', odds: 1.98 },
      { key: 'pc28-shape-pair', label: '对子', odds: 1.98 }
    ]
  }
])

const singleGroups = computed(() => [
  {
    key: 'sum',
    title: '和值',
    columns: 4,
    options: Array.from({ length: 28 }, (_, i) => {
      const n = i
      const odds = n === 0 ? 888 : n === 1 ? 300 : n === 2 ? 150 : 9.8
      return { key: `pc28-sum-${n}`, label: String(n), odds }
    })
  }
])

const activeGroups = computed(() => {
  if (activeSide.value === 'shape') return shapeGroups.value
  if (activeSide.value === 'single') return singleGroups.value
  return temaGroups.value
})

const pickedKeys = ref(new Set())
const pickedMeta = ref({})

function togglePick(opt) {
  const next = new Set(pickedKeys.value)
  if (next.has(opt.key)) {
    next.delete(opt.key)
  } else {
    next.add(opt.key)
  }
  pickedKeys.value = next
  pickedMeta.value = { ...pickedMeta.value, [opt.key]: { label: opt.label, odds: opt.odds } }
}

const betCount = computed(() => (activeSide.value === 'tema' ? pickedKeys.value.size : 0))

watch(
  betCount,
  (n) => emit('update:betCount', n),
  { immediate: true }
)

watch(activeSide, () => {
  resetPicks()
})

function resetPicks() {
  pickedKeys.value = new Set()
  pickedMeta.value = {}
  emit('update:betCount', 0)
}

function getBasketDraft() {
  const keys = Array.from(pickedKeys.value)
  if (!keys.length) return null
  const lines = keys.map((k) => pickedMeta.value?.[k]?.label || k)
  const sideLabel = sideTabs.find((x) => x.key === activeSide.value)?.label || ''
  return {
    betCount: keys.length,
    leftLabel: `${sideLabel} ${lines.join(' ')}`.trim(),
    raw: { play: `pc28-${activeSide.value}`, picks: keys }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
@import '@/styles/pages/lottery-play-hub.less';

.pc28-smp__group + .pc28-smp__group {
  margin-top: 12px;
}

.pc28-smp__group-title {
  font-size: @font-size-sm;
  color: #1d1d1f;
  margin: 6px 2px 8px;
  font-weight: 700;
}

.pc28-smp__grid {
  display: grid;
  gap: 10px;
}

.pc28-smp__cell {
  height: 44px;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  padding: 0 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #252e3a;
}

.pc28-smp__cell.active {
  .lottery-num-ball-active();
}

.pc28-smp__cell-name {
  font-size: @font-size-md;
  font-weight: 400;
  line-height: 1;
  color: #252e3a;
}

.pc28-smp__cell-odds {
  font-size: @font-size-xs;
  color: #252e3a;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.pc28-smp__placeholder {
  padding: 24px 12px;
  text-align: center;
  font-size: @font-size-sm;
  color: #6a7892;
}

.pc28-smp__placeholder p {
  margin: 0;
}
</style>


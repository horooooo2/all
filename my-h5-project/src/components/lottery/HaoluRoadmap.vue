<template>
  <div class="haolu-roadmap">
    <div class="haolu-roadmap__body">
      <aside class="haolu-roadmap__left" aria-label="球序">
        <div v-for="(label, i) in ballLabels" :key="`${i}-${label}`" class="ball-label">
          <span class="ball-label__text" aria-hidden="true">
            <span v-for="(ch, idx) in labelChars(label)" :key="`${i}-${idx}-${ch}`" class="ball-label__ch">{{ ch }}</span>
          </span>
          <span class="sr-only">{{ label }}</span>
        </div>
      </aside>

      <div class="haolu-roadmap__right">
        <div class="modes" role="tablist" aria-label="路子图筛选">
          <button
            v-for="m in modes"
            :key="m.key"
            type="button"
            class="mode-btn"
            :class="{ active: activeMode === m.key }"
            role="tab"
            :aria-selected="activeMode === m.key"
            @click="activeMode = m.key"
          >
            {{ m.label }}
          </button>
        </div>

        <div class="haolu-roadmap__content">
          <div class="grid-wrap" role="region" aria-label="路子图网格">
            <div class="grid">
              <template v-for="(rowCells, rowIdx) in gridRows" :key="`r-${rowIdx}`">
                <div v-for="(cell, idx) in rowCells" :key="`c-${rowIdx}-${idx}`" class="cell" :class="cell.cls">
                  <span v-if="cell.kind === 'text'" class="text">{{ cell.text }}</span>
                  <span v-else-if="cell.kind === 'ring'" class="ring" />
                  <span v-else-if="cell.kind === 'dot'" class="dot" />
                  <span v-else-if="cell.kind === 'slash'" class="slash" />
                </div>
              </template>
            </div>
          </div>

          <aside class="stats" aria-label="统计信息">
            <div class="stat-card">
              <div class="stat-title">大(62%)</div>
              <div class="next">
                <div class="next-title">下期大</div>
                <div class="next-icons" aria-hidden="true">
                  <span class="ring red" />
                  <span class="dot red" />
                  <span class="slash red" />
                </div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-title">小(38%)</div>
              <div class="next">
                <div class="next-title">下期小</div>
                <div class="next-icons" aria-hidden="true">
                  <span class="ring blue" />
                  <span class="dot blue" />
                  <span class="slash blue" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  ballLabels: {
    type: Array,
    default: () => ['第一球', '第二球', '第三球', '第四球', '第五球']
  },
  modes: {
    type: Array,
    default: () => [
      { key: 'sum', label: '总和' },
      { key: 'size', label: '大小' },
      { key: 'oddeven', label: '单双' },
      { key: 'prime', label: '质合' }
    ]
  },
  defaultMode: { type: String, default: 'size' }
})

const activeMode = ref(String(props.defaultMode || 'size'))

function labelChars(label) {
  return Array.from(String(label ?? '')).filter((x) => x !== ' ' && x !== '\n' && x !== '\t')
}

const COLS = 11
const MIN_ROWS = 6

function padToSize(arr, size) {
  const out = arr.slice(0, size)
  while (out.length < size) out.push({ kind: 'empty', cls: '', text: '' })
  return out
}

function buildMockRow(modeKey, rowIdx) {
  // 仅用于占位：mode + 行号生成稳定的红蓝分
  const base = []
  const total = COLS * MIN_ROWS
  for (let i = 0; i < total; i++) {
    const t = (i + rowIdx * 3) % 6
    const isRed = (i + rowIdx) % 2 === 0
    const cls = isRed ? 'red' : 'blue'
    const empty = t === 0 || t === 5
    if (empty) {
      base.push({ kind: 'empty', cls: '', text: '' })
      continue
    }
    if (modeKey === 'size') {
      base.push({ kind: 'text', cls, text: isRed ? '大' : '小' })
    } else if (modeKey === 'oddeven') {
      base.push({ kind: (t % 2 === 0 ? 'ring' : 'dot'), cls, text: '' })
    } else if (modeKey === 'prime') {
      base.push({ kind: 'slash', cls, text: '' })
    } else {
      // sum
      base.push({ kind: 'text', cls, text: String(((i + rowIdx) % 10) || 0) })
    }
  }
  return padToSize(base, total)
}

const gridRows = computed(() => {
  const modeKey = String(activeMode.value || 'size')
  return (props.ballLabels || []).map((_, idx) => buildMockRow(modeKey, idx))
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.haolu-roadmap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px 0 12px;
  box-sizing: border-box;
}

.haolu-roadmap__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.haolu-roadmap__left {
  flex: 0 0 55px;
  width: 55px;
  background: #ffffff;
  border-right: 0.5px solid #dae4f6;
  border-radius: 0 20px 20px 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ball-label {
  height: 60px;
  display: grid;
  place-items: center;
  border-top: 0.5px solid #edf2fb;
}

.ball-label:first-child {
  border-top: none;
}

.ball-label__text {
  display: grid;
  grid-template-columns: repeat(2, 1em);
  grid-auto-rows: 1em;
  place-content: center;
  place-items: center;
  gap: 2px;
  font-size: @font-size-sm;
  line-height: 1;
  font-weight: 700;
  color: #6a7892;
}

.ball-label__ch {
  width: 1em;
  height: 1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.haolu-roadmap__right {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.modes {
  display: inline-flex;
  gap: 8px;
  margin-bottom: 8px;
  flex: 0 0 auto;
}

.mode-btn {
  width: 72px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #d7e2f5;
  background: #ffffff;
  color: #6a7892;
  font-size: 14px;
  font-weight: 700;
}

.mode-btn.active {
  border-color: transparent;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
}

.haolu-roadmap__content {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 10px;
}

.grid-wrap {
  min-width: 0;
  min-height: 0;
  border: 1px solid #dbe7ff;
  background: #ffffff;
  overflow: hidden;
}

.grid {
  display: grid;
  grid-template-columns: repeat(11, 20px);
  grid-auto-rows: 20px;
  width: fit-content;
}

.grid-wrap {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.grid-wrap::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.cell {
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-right: 1px solid #e2ebff;
  border-bottom: 1px solid #e2ebff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 400;
}

.grid .cell:nth-child(11n) {
  border-right: none;
}

.text {
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-block;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.slash {
  width: 12px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  display: inline-block;
  transform: rotate(-45deg);
}

.red {
  color: #ff2f2f;
}

.blue {
  color: #0065ff;
}

.stats {
  min-height: 0;
  overflow: auto;
}

.stat-card + .stat-card {
  margin-top: 14px;
}

.stat-title {
  font-size: 14px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.next {
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
}

.next-title {
  font-size: 12px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.next-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.next-icons .ring,
.next-icons .dot,
.next-icons .slash {
  width: 14px;
  height: 14px;
}

.next-icons .ring {
  border-width: 2px;
  background: transparent;
}

.next-icons .dot {
  width: 14px;
  height: 14px;
}

.next-icons .slash {
  width: 14px;
  height: 2px;
}
</style>


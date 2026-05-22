<template>
  <div class="roadmap">
    <div class="top-modes" role="tablist" aria-label="路子图模式">
      <button type="button" class="mode-btn" :class="{ active: mode === 'sum' }" @click="mode = 'sum'">总和</button>
      <button type="button" class="mode-btn" :class="{ active: mode === 'size' }" @click="mode = 'size'">大小</button>
      <button type="button" class="mode-btn" :class="{ active: mode === 'oddeven' }" @click="mode = 'oddeven'">单双</button>
    </div>

    <div class="layout">
      <aside class="roadmap__tabs" aria-label="第几球">
        <button
          v-for="t in ballTabs"
          :key="t.key"
          type="button"
          class="tab"
          :class="{ active: activeBall === t.key }"
          @click="activeBall = t.key"
        >
          <span class="tab__text" aria-hidden="true">
            <span v-for="(ch, i) in labelChars(t.label)" :key="`${t.key}-${i}-${ch}`" class="tab__ch">{{ ch }}</span>
          </span>
          <span class="sr-only">{{ t.label }}</span>
        </button>
      </aside>

      <div class="boards">
        <div v-show="activeBall === 1" class="board" aria-label="第一球路子图">
          <div class="grid grid--text">
            <div v-for="(c, idx) in board1" :key="`b1-${idx}`" class="cell" :class="c.cls">{{ c.text }}</div>
          </div>
        </div>

        <div v-show="activeBall === 2" class="board" aria-label="第二球路子图">
          <div class="grid grid--circle">
            <div v-for="(c, idx) in board2" :key="`b2-${idx}`" class="cell" :class="c.cls">
              <span v-if="c.kind === 'ring'" class="ring" />
              <span v-else-if="c.kind === 'dot'" class="dot" />
            </div>
          </div>
        </div>

        <div v-show="activeBall === 3" class="board" aria-label="第三球路子图">
          <div class="grid grid--slash">
            <div v-for="(c, idx) in board3" :key="`b3-${idx}`" class="cell" :class="c.cls">
              <span v-if="c.kind === 'slash'" class="slash" />
            </div>
          </div>
        </div>
      </div>

      <aside class="right-info" aria-label="统计信息">
        <div class="ratio">
          <div class="ratio-item">
            <div class="ratio-title">大(62%)</div>
            <div class="next-card">
              <div class="next-title">下期大</div>
              <div class="next-icons">
                <span class="ring red" />
                <span class="dot red" />
                <span class="slash red" />
              </div>
            </div>
          </div>

          <div class="ratio-item">
            <div class="ratio-title">小(38%)</div>
            <div class="next-card">
              <div class="next-title">下期大</div>
              <div class="next-icons">
                <span class="ring blue" />
                <span class="dot blue" />
                <span class="slash blue" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const mode = ref('size') // sum | size | oddeven

const ballTabs = [
  { key: 1, label: '第一球' },
  { key: 2, label: '第二球' },
  { key: 3, label: '第三球' }
]
const activeBall = ref(1)

function labelChars(label) {
  return Array.from(String(label ?? '')).filter((x) => x !== ' ' && x !== '\n' && x !== '\t')
}

const ROADMAP_COLS = 11
const ROADMAP_MIN_ROWS = 6

/** 至少铺满 ROADMAP_MIN_ROWS 行，数据多于最小行数时按整行向上取整 */
function padToGrid(arr) {
  const neededRows = Math.max(ROADMAP_MIN_ROWS, Math.ceil(arr.length / ROADMAP_COLS))
  const size = ROADMAP_COLS * neededRows
  const out = arr.slice(0, size)
  while (out.length < size) {
    out.push({ kind: 'empty', cls: '', text: '' })
  }
  return out
}

const board1 = computed(() => {
  // 简单占位：红/蓝 “大/小”交替，带一些空格
  const base = [
    { kind: 'text', text: '大', cls: 'red' },
    { kind: 'text', text: '小', cls: 'blue' },
    { kind: 'text', text: '大', cls: 'red' },
    { kind: 'text', text: '小', cls: 'blue' },
    { kind: 'text', text: '大', cls: 'red' },
    { kind: 'text', text: '小', cls: 'blue' },
    { kind: 'empty', text: '', cls: '' },
    { kind: 'text', text: '大', cls: 'red' },
    { kind: 'text', text: '小', cls: 'blue' },
    { kind: 'empty', text: '', cls: '' },
    { kind: 'text', text: '大', cls: 'red' }
  ]
  return padToGrid(base)
})

const board2 = computed(() => {
  // 简单占位：空心圈/实心点（红/蓝）
  const base = [
    { kind: 'ring', cls: 'red' },
    { kind: 'ring', cls: 'blue' },
    { kind: 'ring', cls: 'red' },
    { kind: 'ring', cls: 'blue' },
    { kind: 'ring', cls: 'red' },
    { kind: 'dot', cls: 'blue' },
    { kind: 'dot', cls: 'red' },
    { kind: 'dot', cls: 'blue' },
    { kind: 'empty', cls: '' },
    { kind: 'dot', cls: 'red' }
  ]
  return padToGrid(base)
})

const board3 = computed(() => {
  // 简单占位：斜杠（红/蓝）
  const base = [
    { kind: 'slash', cls: 'blue' },
    { kind: 'slash', cls: 'red' },
    { kind: 'slash', cls: 'blue' },
    { kind: 'slash', cls: 'red' },
    { kind: 'slash', cls: 'blue' },
    { kind: 'empty', cls: '' },
    { kind: 'slash', cls: 'red' }
  ]
  return padToGrid(base)
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.roadmap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 0 12px;
  box-sizing: border-box;
  overflow: hidden;
}

.top-modes {
  display: inline-flex;
  flex-shrink: 0;
  gap: 10px;
  margin-bottom: 10px;
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

.layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 55px 1fr 116px;
  grid-template-rows: minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}

.roadmap__tabs {
  width: 55px;
  background: #ffffff;
  border-right: 0.5px solid #dae4f6;
  border-radius: 0 20px 20px 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0;
  overflow: hidden;
}

.tab {
  width: 100%;
  height: 60px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #1d1d1f;
  font-size: @font-size-sm;
  font-weight: 400;
  padding: 0;
  text-align: center;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.tab.active {
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
}

.tab__text {
  display: grid;
  grid-template-columns: repeat(2, 1em);
  grid-auto-rows: 1em;
  place-content: center;
  place-items: center;
  gap: 2px 2px;
  line-height: 1;
  font-weight: 700;
}

.tab__ch {
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

.boards {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.boards::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.board {
  min-width: 0;
  border: 1px solid #dbe7ff;
  background: #ffffff;
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.board::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.grid {
  display: grid;
}

.cell {
  border-right: 1px solid #e2ebff;
  border-bottom: 1px solid #e2ebff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.grid .cell:nth-child(11n) {
  border-right: none;
}

.boards .grid {
  grid-template-columns: repeat(11, 20px);
  grid-auto-rows: 20px;
  width: fit-content;
}

.boards .cell {
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: 400;
}

.boards .ring {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.boards .dot {
  width: 12px;
  height: 12px;
}

.boards .slash {
  width: 12px;
  height: 2px;
}

.red {
  color: #ff2f2f;
}

.blue {
  color: #0065ff;
}

.ring {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: inline-block;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

.slash {
  width: 16px;
  height: 3px;
  border-radius: 999px;
  background: currentColor;
  display: inline-block;
  transform: rotate(-45deg);
}

.right-info {
  padding-top: 10px;
}

.ratio {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 12px;
}

.ratio-title {
  font-size: 14px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.ratio .next-card {
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px;
}

.ratio .next-title {
  font-size: 12px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.ratio .next-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ratio .next-icons .ring {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.ratio .next-icons .dot {
  width: 14px;
  height: 14px;
}

.ratio .next-icons .slash {
  width: 14px;
  height: 2px;
}

.ratio .next-icons .ring,
.ratio .next-icons .dot,
.ratio .next-icons .slash {
  color: inherit;
}

.ratio .next-icons .red {
  color: #ff2f2f;
}

.ratio .next-icons .blue {
  color: #0065ff;
}
</style>


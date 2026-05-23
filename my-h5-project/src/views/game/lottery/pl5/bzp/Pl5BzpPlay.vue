<template>
  <div class="pl5-bzp">
    <!-- 第一行：近期玩法 + 筛-->
    <div class="pl5-bzp__row pl5-bzp__row--history">
      <div class="pl5-bzp__pills" role="list" aria-label="近期玩法">
        <div
          v-for="p in recentPlays"
          :key="p.id"
          role="button"
          tabindex="0"
          class="pl5-bzp__pill"
          :class="{ 'is-active': activePlayId === p.id }"
          @click="activePlayId = p.id"
          @keydown="(e) => keyActivate(e, () => { activePlayId = p.id })"
        >
          {{ p.label }}
        </div>
      </div>
      <div
        role="button"
        tabindex="0"
        class="pl5-bzp__filter-btn"
        @click="onFilterClick"
        @keydown="(e) => keyActivate(e, onFilterClick)"
      >
        <img class="pl5-bzp__filter-icon" :src="iconSx" alt="" aria-hidden="true" />
        <span class="pl5-bzp__filter-txt">筛选</span>
      </div>
    </div>

    <!-- 第二行：奖金 + 玩法说明；遗漏/ 冷热（单选） -->
    <div class="pl5-bzp__row pl5-bzp__row--meta">
      <div class="pl5-bzp__prize-line">
        <span class="pl5-bzp__prize-label">奖金:</span>
        <span class="pl5-bzp__prize-num">{{ prizeDisplay }}</span>
        <div
          role="button"
          tabindex="0"
          class="pl5-bzp__rule-btn"
          aria-label="玩法说明"
          @click="onPlayRuleClick"
          @keydown="(e) => keyActivate(e, onPlayRuleClick)"
        >
          <img class="pl5-bzp__rule-icon" :src="iconGz" alt="" aria-hidden="true" />
        </div>
      </div>
      <van-radio-group v-model="statMode" direction="horizontal" class="pl5-bzp__radio-group">
        <van-radio name="omission" icon-size="18px">遗漏</van-radio>
        <van-radio name="hotcold" icon-size="18px">冷热</van-radio>
      </van-radio-group>
    </div>

    <!-- 号码区：每块左侧玩法名、中0 两行每行5个、右侧快-->
    <section v-for="row in rows" :key="row.key" class="pl5-bzp__panel">
      <div class="pl5-bzp__panel-row">
        <div class="pl5-bzp__side-name" aria-hidden="false">
          <span v-for="(ch, ci) in splitLabel(row.label)" :key="ci" class="pl5-bzp__side-ch">{{ ch }}</span>
        </div>
        <div class="pl5-bzp__panel-main">
          <div class="pl5-bzp__nums-grid">
            <div
              v-for="digit in digits"
              :key="`${row.key}-${digit}`"
              role="button"
              tabindex="0"
              class="pl5-bzp__num"
              :class="{ active: isNumActive(row.key, digit) }"
              :aria-pressed="isNumActive(row.key, digit)"
              @click="toggleNum(row.key, digit)"
              @keydown="(e) => keyActivate(e, () => toggleNum(row.key, digit))"
            >
              <span class="pl5-bzp__num-ball">{{ digit }}</span>
              <span v-if="statMode === 'omission'" class="pl5-bzp__sub pl5-bzp__sub--omit">{{ omission[row.key][digit] }}</span>
              <span v-else class="pl5-bzp__sub pl5-bzp__sub--hot">{{ hotCold[row.key][digit] }}</span>
            </div>
          </div>
        </div>
        <div
          class="pl5-bzp__quick-wrap"
          data-pl5-bzp-quick
          :class="{ 'is-quick-open': quickOpenKey === row.key }"
        >
          <div
            v-if="quickOpenKey === row.key"
            class="pl5-bzp__quick-mask"
            aria-hidden="true"
            @click="closeQuick"
          />
          <div
            role="button"
            tabindex="0"
            class="pl5-bzp__quick-btn"
            aria-label="快捷选择"
            :aria-expanded="quickOpenKey === row.key"
            @click.stop="toggleQuick(row.key)"
            @keydown.stop="(e) => keyActivate(e, () => toggleQuick(row.key))"
          >
            <div class="pl5-bzp__quick-icon" aria-hidden="true">
              <span v-for="n in 3" :key="n" class="pl5-bzp__quick-dot" />
            </div>
          </div>
          <div
            v-show="quickOpenKey === row.key"
            class="pl5-bzp__quick-pop"
            role="group"
            aria-label="快捷选择"
            @click.stop
          >
            <div
              v-for="opt in QUICK_OPTS"
              :key="opt.action"
              role="button"
              tabindex="0"
              class="pl5-bzp__quick-opt"
              @click="applyQuickSelect(row.key, opt.action)"
              @keydown="(e) => keyActivate(e, () => applyQuickSelect(row.key, opt.action))"
            >
              {{ opt.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <van-popup
      v-model:show="filterPopupOpen"
      position="center"
      class="pl5-bzp-filter"
      :overlay="true"
      :close-on-click-overlay="true"
      :z-index="3000"
      teleport="body"
    >
      <div class="pl5-bzp-filter__panel" role="dialog" aria-modal="true" aria-label="全部玩法">
        <div class="pl5-bzp-filter__body">
          <div class="pl5-bzp-filter__subs">
            <div
              v-for="s in currentFilterSubs"
              :key="s.id"
              role="button"
              tabindex="0"
              class="pl5-bzp-filter__sub"
              @click="onPickSubPlay(s)"
              @keydown="(e) => keyActivate(e, () => onPickSubPlay(s))"
            >
              {{ s.label }}
            </div>
          </div>
          <aside class="pl5-bzp-filter__mains" aria-label="大玩法">
            <div class="pl5-bzp-filter__mains-head">
              <img class="pl5-bzp-filter__mains-head-icon" :src="iconSx" alt="" aria-hidden="true" />
              <span>全部玩法</span>
            </div>
            <div class="pl5-bzp-filter__main-list">
              <div
                v-for="m in PLAY_FILTER_TREE"
                :key="m.id"
                role="button"
                tabindex="0"
                class="pl5-bzp-filter__main"
                :class="{ 'is-active': filterPopupMainId === m.id }"
                @click="filterPopupMainId = m.id"
                @keydown="(e) => keyActivate(e, () => { filterPopupMainId = m.id })"
              >
                {{ m.label }}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { showConfirmDialog } from 'vant'
import { BZP_ZX120_ROWS, mockOmission } from './bzp-zx120.js'
import { PLAY_FILTER_TREE, findMainIdBySubId } from './bzp-play-filter.js'
import iconSx from '@/assets/icon_sx_lottery.png'
import iconGz from '@/assets/icon_gz.svg'

const emit = defineEmits(['update:betCount'])

/** @param {KeyboardEvent} e @param {() => void} fn */
function keyActivate(e, fn) {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  fn()
}

const rows = BZP_ZX120_ROWS
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** / / / / / */
const QUICK_OPTS = [
  { action: 'all', label: '全' },
  { action: 'big', label: '大' },
  { action: 'small', label: '小' },
  { action: 'odd', label: '单' },
  { action: 'even', label: '双' },
  { action: 'clear', label: '清' }
]

/** @type {import('vue').Ref<string | null>} */
const quickOpenKey = ref(null)

const filterPopupOpen = ref(false)
/** 弹窗内当前大玩法（仅影响左侧小玩法列表） */
const filterPopupMainId = ref(findMainIdBySubId(PLAY_FILTER_TREE, 'zx120'))

const currentFilterSubs = computed(() => {
  const m = PLAY_FILTER_TREE.find((x) => x.id === filterPopupMainId.value)
  return m?.subs ?? []
})

const recentPlays = ref([
  { id: 'zx120', label: '五星-五星组合20' },
  { id: 'hs-zx', label: '后四-后四组4' }
])
const activePlayId = ref('zx120')

const prizeDisplay = ref('9821')
/** @type {import('vue').Ref<'omission'|'hotcold'>} */
const statMode = ref('omission')

const omission = reactive({
  triple: mockOmission(1),
  single: mockOmission(3)
})

const hotCold = reactive({
  triple: Array.from({ length: 10 }, (_, i) => (i % 3 === 0 ? '热' : '冷')),
  single: Array.from({ length: 10 }, (_, i) => (i % 4 === 0 ? '热' : '冷'))
})

/** @type {Record<string, number[]>} */
const selected = reactive({
  triple: [],
  single: []
})

function isNumActive(rowKey, digit) {
  return (selected[rowKey] ?? []).includes(digit)
}

function toggleNum(rowKey, digit) {
  const arr = selected[rowKey] ?? []
  const i = arr.indexOf(digit)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(digit)
}

const betCount = computed(() => {
  const a = selected.triple.length
  const b = selected.single.length
  if (a === 0 && b === 0) return 0
  return a + b
})

watch(
  betCount,
  (n) => emit('update:betCount', n),
  { immediate: true }
)

function closeQuick() {
  quickOpenKey.value = null
}

function toggleQuick(rowKey) {
  quickOpenKey.value = quickOpenKey.value === rowKey ? null : rowKey
}

function applyQuickSelect(rowKey, action) {
  const cur = selected[rowKey]
  if (!Array.isArray(cur)) return
  let next = []
  switch (action) {
    case 'all':
      next = [...digits]
      break
    case 'big':
      next = [5, 6, 7, 8, 9]
      break
    case 'small':
      next = [0, 1, 2, 3, 4]
      break
    case 'odd':
      next = [1, 3, 5, 7, 9]
      break
    case 'even':
      next = [0, 2, 4, 6, 8]
      break
    case 'clear':
      next = []
      break
    default:
      return
  }
  selected[rowKey] = next
  closeQuick()
}

function onDocPointerDown(ev) {
  const t = ev.target
  if (t && typeof t.closest === 'function' && t.closest('[data-pl5-bzp-quick]')) return
  closeQuick()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
})

function resetPicks() {
  closeQuick()
  filterPopupOpen.value = false
  selected.triple = []
  selected.single = []
  emit('update:betCount', 0)
}

function onFilterClick() {
  filterPopupMainId.value = findMainIdBySubId(PLAY_FILTER_TREE, activePlayId.value)
  filterPopupOpen.value = true
}

/** @param {{ id: string, label: string }} sub */
function onPickSubPlay(sub) {
  activePlayId.value = sub.id
  const main = PLAY_FILTER_TREE.find((x) => x.id === filterPopupMainId.value)
  const mainLabel = main?.label ?? ''
  const label = `${mainLabel}-${sub.label}`
  const idx = recentPlays.value.findIndex((p) => p.id === sub.id)
  if (idx >= 0) recentPlays.value.splice(idx, 1)
  recentPlays.value.unshift({ id: sub.id, label })
  if (recentPlays.value.length > 10) recentPlays.value.pop()
  closeQuick()
  filterPopupOpen.value = false
}

function splitLabel(s) {
  return Array.from(String(s ?? ''))
}

function onPlayRuleClick() {
  showConfirmDialog({
    title: '玩法说明',
    message:
      '【演示】当前为排列五标准盘示例。五星组合20：从0-9中选择5个不同号码组成一注；实际规则、奖金与限额以平台公告及投注单为准。',
    confirmButtonText: '我知道了',
    showCancelButton: false
  }).catch(() => {})
}

function getBasketDraft() {
  const parts = []
  for (const row of rows) {
    const nums = selected[row.key]
    if (nums?.length) {
      const sorted = [...nums].sort((a, b) => a - b).join('')
      parts.push(`${row.label}${sorted}`)
    }
  }
  const count = betCount.value
  if (!count) return null
  const playLabel = recentPlays.value.find((p) => p.id === activePlayId.value)?.label ?? '标准盘'
  return {
    betCount: count,
    leftLabel: `标准${playLabel} ${parts.join(' ')}`,
    raw: {
      play: 'bzp',
      playId: activePlayId.value,
      playLabel,
      selected: {
        triple: [...selected.triple],
        single: [...selected.single]
      }
    }
  }
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.pl5-bzp {
  flex: 1 1 auto;
  min-height: 0;
  padding: 8px 12px 12px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f3f6fc;
}

.pl5-bzp__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.pl5-bzp__row--history {
  min-height: 36px;
}

.pl5-bzp__pills {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.pl5-bzp__pill {
  flex: 0 1 auto;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #dae4f6;
  background: #ffffff;
  font-size: @font-size-xs;
  font-weight: 600;
  color: #252e3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.pl5-bzp__pill.is-active {
  border-color: transparent;
  color: #ffffff;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
}

.pl5-bzp__filter-btn {
  flex: 0 0 auto;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 44px;
  padding: 4px 0;
  border: 1px solid #dae4f6;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
}

.pl5-bzp__filter-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}

.pl5-bzp__filter-txt {
  font-size: 10px;
  line-height: 1.1;
  color: #6a7892;
  white-space: nowrap;
}

.pl5-bzp__row--meta {
  align-items: center;
}

.pl5-bzp__prize-line {
  flex: 1 1 auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pl5-bzp__prize-label {
  font-size: @font-size-sm;
  font-weight: 600;
  color: #252e3a;
}

.pl5-bzp__prize-num {
  font-size: @font-size-sm;
  font-weight: 600;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
}

.pl5-bzp__rule-btn {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.pl5-bzp__rule-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}

.pl5-bzp__radio-group {
  flex: 0 0 auto;
  --van-primary-color: #0065ff;
  --van-radio-checked-icon-color: #0065ff;
  --van-radio-label-color: #252e3a;
}

.pl5-bzp__radio-group :deep(.van-radio__label) {
  font-size: 12px;
}

.pl5-bzp__radio-group :deep(.van-radio) {
  margin-right: 14px;
  align-items: center;
}

.pl5-bzp__radio-group :deep(.van-radio:last-child) {
  margin-right: 0;
}

.pl5-bzp__panel {
  margin-bottom: 10px;
}

.pl5-bzp__panel-row {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 10px;
  background: #e8f0ff;
  box-sizing: border-box;
  position: relative;
  overflow: visible;
}

.pl5-bzp__side-name {
  flex: 0 0 auto;
  width: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  line-height: 1.05;
}

.pl5-bzp__side-ch {
  font-size: 11px;
  font-weight: 700;
  color: #252e3a;
}

.pl5-bzp__panel-main {
  flex: 1 1 auto;
  min-width: 0;
}

.pl5-bzp__nums-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: repeat(2, auto);
  gap: 8px 6px;
}

.pl5-bzp__num {
  border: none;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  min-width: 0;
}

.pl5-bzp__num-ball {
  width: 32px;
  height: 32px;
  max-width: 100%;
  border-radius: 50%;
  border: 1px solid #dae4f6;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-md;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #252e3a;
  box-sizing: border-box;
}

.pl5-bzp__num.active .pl5-bzp__num-ball {
  .lottery-num-ball-active();
}

.pl5-bzp__sub {
  font-size: 10px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.pl5-bzp__sub--omit {
  color: #7b61ff;
}

.pl5-bzp__sub--hot {
  color: #ff710d;
}

.pl5-bzp__quick-wrap {
  position: relative;
  flex: 0 0 auto;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.pl5-bzp__quick-wrap.is-quick-open {
  z-index: 200;
}

.pl5-bzp__quick-mask {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}

.pl5-bzp__quick-btn {
  position: relative;
  z-index: 1;
  flex: 1 1 auto;
  width: 40px;
  min-height: 0;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  box-sizing: border-box;
}

.pl5-bzp__quick-icon {
  width: 17px;
  height: 41px;
  border-radius: 6px;
  background: var(--s-2-ffffff, #fff);
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

.pl5-bzp__quick-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #000;
  flex-shrink: 0;
}

.pl5-bzp__quick-pop {
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  box-sizing: border-box;
  width: 204px;
  height: 44px;
  padding: 0 8px;
  border-radius: 46px;
  background: var(---A94, #7354ff);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  pointer-events: auto;
}

.pl5-bzp__quick-opt {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  background: var(--s-2-ffffff, #fff);
  fill: var(--s-2-ffffff, #fff);
  color: #252e3a;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
}
</style>

<style lang="less">
/* 玩法筛选：teleport body；右下贴边；仅左上圆角；200px / 100px */
.pl5-bzp-filter.van-popup {
  overflow: hidden;
  background: transparent;
  top: auto !important;
  left: auto !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  transform: none !important;
  height: 664px !important;
  max-height: min(664px, 100vh);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.pl5-bzp-filter__panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 16px 0 0 0;
  box-shadow: 0 11px 37px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  box-sizing: border-box;
  font-size: 12px;
  font-weight: 400;
}

.pl5-bzp-filter__body {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 200px 100px;
  gap: 0;
  align-items: stretch;
  padding: 0;
  box-sizing: border-box;
}

.pl5-bzp-filter__subs {
  width: 200px;
  min-width: 0;
  min-height: 0;
  background: #ffffff;
  padding: 16px 8px 16px 12px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  align-content: start;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.pl5-bzp-filter__sub {
  width: 100%;
  min-width: 0;
  height: 39px;
  border-radius: 5px;
  background: var(--b-2-d-9-e-8-ff, #d9e8ff);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  color: #252e3a;
  line-height: 1.15;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pl5-bzp-filter__mains {
  width: 100px;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #e5efff;
  padding: 12px 6px 12px 6px;
}

.pl5-bzp-filter__mains-head {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 8px;
  flex-shrink: 0;
  color: #252e3a;
  line-height: 1.2;
  text-align: center;
}

.pl5-bzp-filter__mains-head-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
  display: block;
  flex-shrink: 0;
}

.pl5-bzp-filter__main-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.pl5-bzp-filter__main {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  box-sizing: border-box;
  background: var(--b-3-ffffff, #fff);
  color: #252e3a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.pl5-bzp-filter__main.is-active {
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}
</style>

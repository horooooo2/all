<template>
  <div class="bet-panel-core">
    <div class="bet-panel__body">
      <aside class="bet-panel__tabs" aria-label="玩法分类">
        <button
          v-for="t in tabs"
          :key="t.key"
          type="button"
          class="tab"
          :class="{ active: t.key === activeTab }"
          @click="activeTab = t.key"
        >
          <span class="tab__text" aria-hidden="true">
            <span v-for="(ch, i) in labelChars(t.label)" :key="`${t.key}-${i}-${ch}`" class="tab__ch">{{ ch }}</span>
          </span>
          <span class="sr-only">{{ t.label }}</span>
        </button>
      </aside>

      <main class="bet-panel__content" aria-label="投注选项">
        <div v-for="g in activeGroups" :key="g.key" class="group">
          <div class="group__title">{{ g.title }}</div>
          <div class="grid">
            <button
              v-for="it in g.items"
              :key="it.key"
              type="button"
              class="cell"
              :class="{ active: isCellActive(it.key), 'cell--num-multi': isMultiSelectTab }"
              @click="onCellClick(it.key)"
            >
              <div class="cell__name" :class="toneClass(it.tone)">{{ it.name }}</div>
              <div class="cell__odds">{{ formatOdds(it.odds) }}</div>
            </button>
          </div>
        </div>
      </main>
    </div>

    <footer class="bet-panel__foot" aria-label="投注操作">
      <transition name="bet-stats-fade">
        <div
          v-if="showBetStats"
          class="bet-stats"
          role="status"
          aria-live="polite"
        >
          共选{{ betCount }}注,共{{ totalStakeText }}
        </div>
      </transition>

      <div class="op-top">
        <div class="op-btn op-btn--delete" role="button" tabindex="0" aria-label="删除" @click="onClear">
          <img class="op-icon" :src="iconDel" alt="" aria-hidden="true" />
        </div>

        <div class="quick-wrap" aria-label="快捷金额">
          <div class="quick-bg" :style="{ backgroundImage: `url(${quickBgImg})` }" aria-hidden="true" />
          <div class="quick-single" role="button" tabindex="0" @click="onChipClick(activeChip)">
            {{ formatChip(activeChip) }}
          </div>
        </div>

        <div
          class="op-btn op-btn--switch"
          role="button"
          tabindex="0"
          aria-label="切换快捷金额"
          @click="quickSwitchOpen = !quickSwitchOpen"
        >
          <img class="op-icon" :src="iconSwitch" alt="" aria-hidden="true" />
        </div>

        <input v-model="amount" class="amount-input" inputmode="decimal" placeholder="输入金额" aria-label="输入金额" />
      </div>

      <div class="op-bottom">
        <div class="bottom-btn bottom-btn--ghost" role="button" tabindex="0" @click="emit('open-recent')">近期投注</div>
        <div
          class="bottom-btn bottom-btn--primary"
          role="button"
          tabindex="0"
          :aria-disabled="submitDisabled ? 'true' : 'false'"
          :class="{ 'is-disabled': submitDisabled }"
          @click="!submitDisabled && onSubmit()"
        >
          <div class="primary__title">立即投注</div>
          <div class="primary__sub">余额:{{ formatMoney(balance) }}</div>
        </div>
        <div class="bottom-btn bottom-btn--ghost" role="button" tabindex="0" @click="emit('chase')">追号</div>
      </div>

      <transition name="quick-fade">
        <div v-if="quickSwitchOpen" class="quick-pop-mask" @click.self="quickSwitchOpen = false">
          <div class="quick-pop" role="dialog" aria-modal="true" aria-label="选择快捷金额" @click.stop>
            <div class="quick-pop__row" aria-hidden="true">
              <div
                v-for="c in chipOptions"
                :key="`p-${c}`"
                class="quick-pop__chip"
                :class="{ active: Number(c) === Number(activeChip) }"
                :style="chipPopChipStyle(c)"
                role="button"
                tabindex="0"
                @click="selectQuickChip(c)"
              >
                {{ formatChip(c) }}
              </div>
            </div>
            <div class="quick-pop__edit" role="button" tabindex="0" aria-label="编辑筹码" @click.stop="openChipEditor">
              <span class="pencil" aria-hidden="true">✎</span>
            </div>
          </div>
        </div>
      </transition>

      <van-popup
        v-model:show="chipEditorOpen"
        position="bottom"
        class="chip-editor-popup"
        :overlay="true"
        :z-index="99999"
        :safe-area-inset-bottom="true"
      >
        <section class="chip-editor" role="dialog" aria-modal="true" aria-label="个性化筹码">
          <header class="chip-editor__head">
            <div class="chip-editor__title">个性化筹码</div>
            <div class="chip-editor__close" role="button" tabindex="0" aria-label="关闭" @click="chipEditorOpen = false">
              <img class="chip-editor__close-icon" :src="iconX" alt="" aria-hidden="true" />
            </div>
          </header>

          <div class="chip-editor__grid" aria-label="筹码设置">
            <input
              v-for="(v, i) in chipEditorValues"
              :key="`cev-${i}`"
              v-model="chipEditorValues[i]"
              class="chip-editor__input"
              inputmode="numeric"
              placeholder="0"
              aria-label="筹码值"
            />
          </div>

          <footer class="chip-editor__foot">
            <div class="chip-editor__btn chip-editor__btn--ghost" role="button" tabindex="0" @click="restoreDefaultChips">
              恢复默认
            </div>
            <div class="chip-editor__btn chip-editor__btn--primary" role="button" tabindex="0" @click="saveCustomChips">保存</div>
          </footer>
        </section>
      </van-popup>
    </footer>
  </div>
</template>

<script setup>
import { computed, defineExpose, ref, watch } from 'vue'
import { toast } from '@/components/Toast'
import {
  BET_PANEL_STORAGE_KEY,
  BET_PANEL_TABS,
  DEFAULT_CHIPS,
  MULTI_SELECT_TAB_KEYS,
  PLAY_GROUPS_BY_TAB
} from './bet-panel-constants'
import iconDel from '@/assets/icon_del.png'
import iconSwitch from '@/assets/icon_qh_sel.png'
import iconX from '@/assets/icon_x.png'
import quickBgImg from '@/assets/kuaijie_money_back.png'

const props = defineProps({
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['submit', 'chase', 'open-recent'])

const STORAGE_KEY = BET_PANEL_STORAGE_KEY
const defaultChips = DEFAULT_CHIPS
const multiSelectTabs = MULTI_SELECT_TAB_KEYS
const tabs = BET_PANEL_TABS
const activeTab = ref(tabs[0].key)
const selectedKeys = ref([])
const amount = ref('')

const isMultiSelectTab = computed(() => multiSelectTabs.has(activeTab.value))

const quickSwitchOpen = ref(false)
const chipEditorOpen = ref(false)

const chipOptions = ref(loadCustomChips() ?? defaultChips)
const chipEditorValues = ref(chipOptions.value.map((x) => String(x)))
const activeChip = ref(chipOptions.value?.[0] ?? 1)

const activeGroups = computed(() => PLAY_GROUPS_BY_TAB[activeTab.value] ?? [])

const betCount = computed(() => selectedKeys.value.length)

const totalStake = computed(() => {
  const unit = Number(String(amount.value).trim())
  if (!Number.isFinite(unit) || unit <= 0) return 0
  return betCount.value * unit
})

const totalStakeText = computed(() => {
  if (betCount.value <= 0) return '0'
  const n = totalStake.value
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (Number.isInteger(n)) return String(n)
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})

const showBetStats = computed(() => betCount.value > 0)

const submitDisabled = computed(() => {
  const a = Number(String(amount.value).trim())
  if (selectedKeys.value.length === 0) return true
  if (!Number.isFinite(a) || a <= 0) return true
  return false
})

watch(
  () => activeTab.value,
  () => {
    selectedKeys.value = []
  }
)

function resetForPopupOpen() {
  amount.value = ''
}

function onClear() {
  selectedKeys.value = []
  amount.value = ''
}

function isCellActive(key) {
  return selectedKeys.value.includes(key)
}

function onCellClick(key) {
  if (isMultiSelectTab.value) {
    const arr = selectedKeys.value.slice()
    const i = arr.indexOf(key)
    if (i >= 0) arr.splice(i, 1)
    else arr.push(key)
    selectedKeys.value = arr
  } else {
    selectedKeys.value = key === selectedKeys.value[0] ? [] : [key]
  }
}

function onSubmit() {
  if (submitDisabled.value) return
  const playKeys = selectedKeys.value.slice()
  const unit = Number(String(amount.value).trim())
  const payload = {
    tab: activeTab.value,
    playKey: playKeys[0] ?? '',
    playKeys,
    amount: unit
  }
  emit('submit', payload)
}

function onChipClick(v) {
  amount.value = String(v)
}

function selectQuickChip(v) {
  activeChip.value = Number(v) || activeChip.value
  quickSwitchOpen.value = false
}

function openChipEditor() {
  chipEditorValues.value = chipOptions.value.map((x) => String(x))
  chipEditorOpen.value = true
}

function restoreDefaultChips() {
  chipEditorValues.value = defaultChips.map((x) => String(x))
}

function saveCustomChips() {
  const parsed = chipEditorValues.value
    .map((x) => Number(String(x).trim()))
    .map((x) => (Number.isFinite(x) && x > 0 ? Math.floor(x) : 0))
    .filter((x) => x > 0)

  const out = normalizeFive(parsed.length ? parsed : defaultChips)
  chipOptions.value = out
  if (!out.some((x) => Number(x) === Number(activeChip.value))) activeChip.value = out[0] ?? 1
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {
    // ignore
  }
  chipEditorOpen.value = false
  toast.success('已保存')
}

function normalizeFive(arr) {
  const a = Array.from(arr ?? []).slice(0, 5)
  while (a.length < 5) a.push(a[a.length - 1] ?? 1)
  return a
}

function loadCustomChips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (!Array.isArray(v)) return null
    const nums = v
      .map((x) => Number(x))
      .filter((x) => Number.isFinite(x) && x > 0)
      .map((x) => Math.floor(x))
    if (!nums.length) return null
    return normalizeFive(nums)
  } catch {
    return null
  }
}

function formatChip(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  if (n < 1000) return String(Math.floor(n))
  if (n < 10000) return `${floor1(n / 1000)}k`
  return `${floor1(n / 10000)}w`
}

function chipPopChipStyle(c) {
  const isActive = Number(c) === Number(activeChip.value)
  const img = `url(${quickBgImg})`
  const overlay = isActive ? 'linear-gradient(rgba(0, 101, 255, 0.12), rgba(0, 101, 255, 0.12))' : 'none'
  return { backgroundImage: `${overlay ? `${overlay},` : ''}${img}` }
}

function floor1(x) {
  const n = Number(x)
  if (!Number.isFinite(n)) return '0'
  const v = Math.floor(n * 10) / 10
  return String(v).replace(/\.0$/, '')
}

function toneClass(tone) {
  if (tone === 'red') return 'is-red'
  if (tone === 'green') return 'is-green'
  return 'is-blue'
}

function formatOdds(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n.toFixed(2).replace(/\.00$/, '')
}

function formatMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function labelChars(label) {
  return Array.from(String(label ?? '')).filter((x) => x !== ' ' && x !== '\n' && x !== '\t')
}

defineExpose({ resetForPopupOpen })
</script>

<style lang="less" scoped>
@import './bet-panel-play-shared.less';
</style>

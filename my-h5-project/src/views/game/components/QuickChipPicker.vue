<template>
  <div class="qcp">
    <div class="quick-wrap" aria-label="快捷金额">
      <img class="quick-bg" :src="quickBgImg" alt="" aria-hidden="true" />
      <div class="quick-single" role="button" tabindex="0" @click="onQuickWrapClick(activeChip)">
        {{ formatChip(activeChip) }}
      </div>
    </div>

    <div class="op-btn op-btn--switch" role="button" tabindex="0" aria-label="切换快捷金额" @click="quickSwitchOpen = !quickSwitchOpen">
      <img class="op-icon" :src="iconSwitch" alt="" aria-hidden="true" />
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
              role="button"
              tabindex="0"
              @click="selectQuickChip(c)"
            >
              <img class="quick-pop__chip-bg" :src="quickBgImg" alt="" aria-hidden="true" />
              <span class="quick-pop__chip-text">{{ formatChip(c) }}</span>
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
          <div class="chip-editor__btn chip-editor__btn--ghost" role="button" tabindex="0" @click="restoreDefaultChips">恢复默认</div>
          <div class="chip-editor__btn chip-editor__btn--primary" role="button" tabindex="0" @click="saveCustomChips">保存</div>
        </footer>
      </section>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import iconSwitch from '@/assets/icon_qh_sel.svg'
import iconX from '@/assets/icon_x.svg'
import quickBgImg from '@/assets/kuaijie_money_back.png'

const STORAGE_KEY = 'betpanel.customChips.v1'
const DEFAULT_CHIPS = [1, 10, 100, 500, 1000]

const props = defineProps({
  modelValue: { type: [String, Number], default: 1 },
  /** 仅用于展示当前“单个快捷金额”的值（不传则取 modelValue）*/
  active: { type: [String, Number], default: undefined }
})

const emit = defineEmits(['update:modelValue', 'change'])

const quickSwitchOpen = ref(false)
const chipEditorOpen = ref(false)

const chipOptions = ref(loadCustomChips() ?? DEFAULT_CHIPS)
const chipEditorValues = ref(chipOptions.value.map((x) => String(x)))

const activeChip = computed(() => {
  if (props.active !== undefined && props.active !== null && props.active !== '') return props.active
  return props.modelValue
})

watch(
  () => props.modelValue,
  (v) => {
    // 外部变更时若不在候选内，不强制写回；仅用于展示
    if (v === undefined || v === null || v === '') return
    if (!chipOptions.value.some((x) => Number(x) === Number(v))) return
  }
)

/** 仅更新当前展示的快捷金额（切换弹窗选筹码、保存自定义筹码）*/
function setActiveChip(v) {
  emit('update:modelValue', String(v ?? ''))
}

/** 点击 quick-wrap：同步展示并通知父级写入投注金额 */
function onQuickWrapClick(v) {
  setActiveChip(v)
  emit('change', Number(v) || 0)
}

function selectQuickChip(v) {
  quickSwitchOpen.value = false
  setActiveChip(v)
}

function openChipEditor() {
  chipEditorValues.value = chipOptions.value.map((x) => String(x))
  chipEditorOpen.value = true
}

function restoreDefaultChips() {
  chipEditorValues.value = DEFAULT_CHIPS.map((x) => String(x))
}

function saveCustomChips() {
  const parsed = chipEditorValues.value
    .map((x) => Number(String(x).trim()))
    .map((x) => (Number.isFinite(x) && x > 0 ? Math.floor(x) : 0))
    .filter((x) => x > 0)

  const out = normalizeFive(parsed.length ? parsed : DEFAULT_CHIPS)
  chipOptions.value = out
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {
    // ignore
  }
  chipEditorOpen.value = false

  // 如果当前值不在新筹码列表里，自动切换到第一
  if (!out.some((x) => Number(x) === Number(props.modelValue))) {
    setActiveChip(out[0] ?? 1)
  }
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

function floor1(x) {
  const n = Number(x)
  if (!Number.isFinite(n)) return '0'
  const v = Math.floor(n * 10) / 10
  return String(v).replace(/\.0$/, '')
}

function formatChip(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  if (n < 1000) return String(Math.floor(n))
  if (n < 10000) return `${floor1(n / 1000)}k`
  return `${floor1(n / 10000)}w`
}

</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.qcp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.op-btn {
  border: none;
  background: #d7e2f5;
  color: #6a7892;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.op-btn--switch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.op-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.quick-wrap {
  position: relative;
  height: 44px;
  flex: 0 0 auto;
}

.quick-bg {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 30px;
  height: 30px;
  transform: translate3d(-50%, -50%, 0);
  object-fit: contain;
  pointer-events: none;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.quick-single {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #1d1d1f;
  font-size: @font-size-sm;
  font-weight: 800;
  line-height: 30px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  margin: 7px auto;
}

.quick-fade-enter-active,
.quick-fade-leave-active {
  transition: opacity 140ms ease;
}
.quick-fade-enter-from,
.quick-fade-leave-to {
  opacity: 0;
}

.quick-pop-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: transparent;
}

.quick-pop {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(96px + @layout-bottom-inset + 6px);
  width: 350px;
  height: 42px;
  border-radius: 8px;
  border: 1px solid #dae4f6;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  box-sizing: border-box;
}

.quick-pop__row {
  flex: 1 1 auto;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  justify-items: center;
  gap: 0;
}

.quick-pop__chip {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d7e2f5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  box-sizing: border-box;
}

.quick-pop__chip-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.quick-pop__chip-text {
  position: relative;
  z-index: 2;
  font-size: @font-size-xs;
  font-weight: 700;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
}

.quick-pop__chip.active {
  border-color: #0065ff;
}

.quick-pop__chip.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 101, 255, 0.12);
  z-index: 1;
  pointer-events: none;
}

.quick-pop__edit {
  width: 35px;
  height: 35px;
  border-radius: 8px;
  background: transparent;
  font-size: @font-size-md;
  color: #6a7892;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chip-editor-popup {
  width: 375px;
  max-width: 100vw;
  height: 266px;
  border-radius: 0;
  overflow: hidden;
  z-index: 99999;
}

.chip-editor {
  background: #ffffff;
  height: 266px;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  border-radius: 0;
}

.chip-editor__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.chip-editor__title {
  font-size: @font-size-xl;
  font-weight: 700;
  color: #1d1d1f;
}

.chip-editor__close {
  width: 34px;
  height: 34px;
  border-radius: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.chip-editor__close-icon {
  width: @icon-x-size;
  height: @icon-x-size;
  display: block;
  object-fit: contain;
}

.chip-editor__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.chip-editor__input {
  width: 78px;
  height: 36px;
  border-radius: 0;
  border: 1px solid #cfe0ff;
  background: #ffffff;
  font-size: @font-size-lg;
  font-weight: 600;
  text-align: center;
  outline: none;
  padding: 0 8px;
  box-sizing: border-box;
}

.chip-editor__foot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chip-editor__btn {
  width: 170px;
  height: 45px;
  border-radius: 5px;
  border: none;
  font-size: @font-size-lg;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chip-editor__btn--ghost {
  background: #d8e7ff;
  color: rgba(29, 29, 31, 0.45);
}

.chip-editor__btn--primary {
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
}
</style>


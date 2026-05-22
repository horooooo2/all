<template>
  <van-popup
    :show="show"
    position="center"
    round
    class="dashang-popup"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.5)' }"
    teleport="body"
    @update:show="$emit('update:show', $event)"
  >
    <div class="dashang-panel" role="dialog" aria-modal="true" aria-labelledby="dashang-title" @click.stop>
      <h2 id="dashang-title" class="dashang-panel__title">打赏主播</h2>

      <div class="dashang-panel__label">打赏金额</div>

      <div class="dashang-panel__chips" role="group" aria-label="快捷金额">
        <button
          v-for="n in presets"
          :key="n"
          type="button"
          class="chip"
          :class="{ 'is-active': activePreset === n && !String(customAmount).trim() }"
          @click="onPickPreset(n)"
        >
          {{ n }}
        </button>
      </div>

      <input
        v-model="customAmount"
        class="dashang-panel__input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        placeholder="自定义金额"
        aria-label="自定义金额"
      />

      <div class="dashang-panel__actions">
        <button type="button" class="btn btn--ghost" @click="onCancel">取消</button>
        <button type="button" class="btn btn--primary" @click="onConfirm">确认打赏</button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { toast } from '@/components/Toast'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'confirm'])

const presets = [18, 66, 88, 520]
const activePreset = ref(18)
const customAmount = ref('')

watch(
  () => props.show,
  (v) => {
    if (v) {
      activePreset.value = 18
      customAmount.value = ''
    }
  }
)

watch(customAmount, () => {
  if (String(customAmount.value).trim()) {
    activePreset.value = null
  } else if (activePreset.value == null) {
    activePreset.value = 18
  }
})

function onPickPreset(n) {
  activePreset.value = n
  customAmount.value = ''
}

function parseAmount() {
  const raw = String(customAmount.value).trim()
  if (raw) {
    const n = Number.parseFloat(raw.replace(/,/g, ''))
    if (!Number.isFinite(n) || n <= 0) return null
    return Math.round(n * 100) / 100
  }
  if (activePreset.value != null) return activePreset.value
  return null
}

function onCancel() {
  emit('update:show', false)
}

function onConfirm() {
  const amount = parseAmount()
  if (amount == null || amount <= 0) {
    toast('请选择或输入打赏金额')
    return
  }
  emit('confirm', { amount })
  emit('update:show', false)
}
</script>

<style lang="less" scoped>
.dashang-popup {
  max-width: calc(100vw - 32px);
  overflow: visible;
}

.dashang-panel {
  width: 300px;
  max-width: calc(100vw - 32px);
  padding: 16px 16px 14px;
  box-sizing: border-box;
  background: #ffffff;
}

.dashang-panel__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #1d1d1f;
  text-align: center;
  line-height: 1.25;
}

.dashang-panel__label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1.2;
}

.dashang-panel__chips {
  display: flex;
  gap: 8px;
}

.chip {
  flex: 1 1 0;
  min-width: 0;
  height: 34px;
  padding: 0 4px;
  border: 1px solid #dbe7ff;
  border-radius: 8px;
  background: #ffffff;
  font-size: 12px;
  font-weight: 500;
  color: #4a5a72;
  cursor: pointer;
}

.chip.is-active {
  border-color: #0065ff;
  color: #0065ff;
  background: #e9f2ff;
}

.dashang-panel__input {
  width: 100%;
  height: 36px;
  margin-top: 10px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
  background: #eff4fa;
  font-size: 12px;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1.2;
}

.dashang-panel__input::placeholder {
  color: #8c9aaf;
}

.dashang-panel__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.btn {
  height: 36px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

.btn--ghost {
  flex: 0 0 30%;
  max-width: 96px;
  background: #e5efff;
  color: #0065ff;
}

.btn--primary {
  flex: 1 1 auto;
  min-width: 0;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
}
</style>

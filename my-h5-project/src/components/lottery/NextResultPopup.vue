<template>
  <teleport to="body">
    <transition name="next-result-popup-fade">
      <div
        v-if="show"
        class="next-result-popup-mask"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="next-result-popup-panel" :style="{ top: topCss }" @click.stop>
          <div class="next-result-popup-panel__body">
            <slot />
          </div>

          <div v-if="showFooter" class="next-result-popup-panel__footer">
            <button type="button" class="btn btn-ghost" @click="close">{{ cancelText }}</button>
            <button v-if="primaryText" type="button" class="btn btn-primary" @click="$emit('primary')">
              {{ primaryText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  top: { type: [String, Number], default: 0 },
  showFooter: { type: Boolean, default: true },
  cancelText: { type: String, default: '返回' },
  primaryText: { type: String, default: '' }
})

const emit = defineEmits(['update:show', 'primary'])

const topCss = computed(() => {
  const v = props.top
  if (typeof v === 'number') return `${Math.max(0, v)}px`
  if (typeof v === 'string' && v.trim()) return v
  return '0px'
})

function close() {
  emit('update:show', false)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.next-result-popup-fade-enter-active,
.next-result-popup-fade-leave-active {
  transition: opacity 140ms ease;
}

.next-result-popup-fade-enter-from,
.next-result-popup-fade-leave-to {
  opacity: 0;
}

.next-result-popup-mask {
  position: fixed;
  inset: 0;
  z-index: 98;
  background: rgba(0, 0, 0, 0.5);
}

.next-result-popup-panel {
  position: fixed;
  left: 50%;
  width: 376px;
  height: 308px;
  transform: translateX(-50%);
  background: #fff;
  overflow: hidden;
}

.next-result-popup-panel__body {
  height: 248px;
  overflow: hidden;
}

.next-result-popup-panel__footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 12px;
  box-sizing: border-box;
  background: #e5efff;
}

.btn {
  height: 34px;
  border: none;
  border-radius: 6px;
  font-size: @font-size-md;
  font-weight: 400;
}

.btn-ghost {
  width: 120px;
  background: var(--s-5-b-8-c-8-e-3, #b8c8e3);
  color: #ffffff;
}

.btn-primary {
  width: 221px;
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
}
</style>


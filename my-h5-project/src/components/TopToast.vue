<template>
  <transition name="slide-down">
    <div v-if="show" class="top-toast" :class="type">
      <div class="toast-content">
        <div class="toast-icon">
          <img v-if="type === 'success'" src="@/assets/icon_yes.svg" alt="success" />
          <img v-else-if="type === 'error'" src="@/assets/icon_cw.svg" alt="error" />
          <img v-else-if="type === 'warning'" src="@/assets/icon_tip.svg" alt="warning" />
          <div v-else-if="type === 'loading'" class="loading-spinner"></div>
        </div>
        <span class="toast-message">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  type: String,
  message: String
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.top-toast {
  position: fixed;
  top: 30px;
  left: @spacing-xl;
  right: @spacing-xl;
  z-index: (@z-index-popup + 2000);
  padding: 0 @spacing-lg;
  height: 40px;
  background: var(--bg-module);
  border-radius: @border-radius-md;
  box-shadow: 0 10px 24px rgba(18, 41, 85, 0.14);
  display: flex;
  align-items: center;
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: @spacing-sm;
  width: 100%;
}

.toast-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 20px;
    object-fit: contain;
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid color-mix(in srgb, var(--primary-color) 20%, transparent);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.toast-message {
  font-size: @font-size-sm;
  color: var(--text-color);
  line-height: 1.4;
  flex: 1;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.26s ease;
}

.slide-down-enter-from {
  transform: translate3d(0, -22px, 0) scale(0.98);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translate3d(0, -14px, 0) scale(0.98);
  opacity: 0;
}
</style>

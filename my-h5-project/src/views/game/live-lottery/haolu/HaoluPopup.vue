<template>
  <div class="haolu-popup" :style="popupStyle" @click.stop>
    <van-tabs
      v-model:active="active"
      class="haolu-tabs"
      shrink
      line-height="4px"
      :line-width="44"
      color="#0065FF"
      title-inactive-color="#8C8C8C"
      title-active-color="#1D1D1F"
      :animated="false"
    >
      <van-tab name="unopened" title="未开咨询">
        <section class="haolu-body" role="tabpanel" aria-label="未开咨询">
          <UnopenedConsult />
        </section>
      </van-tab>
      <van-tab name="roadmap" title="路子图">
        <section class="haolu-body" role="tabpanel" aria-label="路子图">
          <Roadmap />
        </section>
      </van-tab>

      <template #nav-right>
        <div
          class="haolu-tabs__trailing"
          role="button"
          tabindex="0"
          aria-label="收起"
          @click="$emit('close')"
          @keydown.enter.prevent="$emit('close')"
          @keydown.space.prevent="$emit('close')"
        >
          <van-icon name="arrow-down" class="haolu-collapse" />
        </div>
      </template>
    </van-tabs>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import UnopenedConsult from './UnopenedConsult.vue'
import Roadmap from './Roadmap.vue'

const props = defineProps({
  top: { type: Number, default: 0 }
})

defineEmits(['close'])

const active = ref('unopened')
const popupStyle = computed(() => {
  const top = Math.max(0, Number(props.top || 0))
  return {
    top: `${top}px`,
    bottom: 'var(--browser-ui-bottom, 0px)'
  }
})
</script>

<style lang="less" scoped>
.haolu-popup {
  position: fixed;
  left: 50%;
  z-index: 97;
  transform: translate3d(-50%, 0, 0);
  width: 375px;
  background: #f3f7ff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 由 GameRoom 外层 <transition name="haolu-popup-slide"> 驱动，对齐 van-popup-slide-bottom */
.haolu-popup-slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.haolu-popup-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.haolu-popup-slide-enter-from,
.haolu-popup-slide-leave-to {
  transform: translate3d(-50%, 100%, 0);
}

.haolu-tabs {
  flex: 1 1 auto;
  min-height: 0;
  background: #f3f7ff;
  display: flex;
  flex-direction: column;
}

.haolu-tabs :deep(.van-tabs__wrap) {
  flex-shrink: 0;
  height: 44px;
  padding: 0 12px;
  box-sizing: border-box;
  background: #f3f7ff;
  border-bottom: 1px solid #dbe7ff;
}

.haolu-tabs :deep(.van-tabs__nav) {
  background: transparent;
  align-items: center;
  justify-content: flex-start;
}

.haolu-tabs :deep(.van-tab) {
  flex: 0 0 auto;
  font-size: 16px;
  font-weight: 700;
}

.haolu-tabs :deep(.van-tabs__line) {
  border-radius: 999px;
}

.haolu-tabs :deep(.van-tabs__content) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.haolu-tabs :deep(.van-tab__panel) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.haolu-tabs__trailing {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
  min-width: 36px;
  min-height: 36px;
  cursor: pointer;
  color: #6a7892;
}

.haolu-collapse {
  font-size: 18px;
  display: block;
}

.haolu-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.haolu-body::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.placeholder {
  padding: 20px 12px;
  color: #6a7892;
  font-size: 14px;
}
</style>


<template>
  <div class="consult-road-popup" :style="{ top: topCss }" @click.stop>
    <div class="tabs">
      <van-tabs
        v-model:active="active"
        shrink
        line-height="3px"
        color="#0065FF"
        title-inactive-color="#1D1D1F"
        title-active-color="#1D1D1F"
        :animated="false"
      >
        <van-tab name="unopened" title="未开咨询">
          <UnopenedConsult />
        </van-tab>
        <van-tab name="roadmap" title="路子图">
          <div class="placeholder">路子图后续放到这里实现</div>
        </van-tab>
      </van-tabs>
    </div>

    <div class="footer">
      <button type="button" class="btn btn-ghost" @click="$emit('close')">返回</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import UnopenedConsult from './UnopenedConsult.vue'

const props = defineProps({
  top: { type: Number, default: 0 }
})

defineEmits(['close'])

const active = ref('unopened')
const topCss = computed(() => `${Math.max(0, Number(props.top || 0))}px`)
</script>

<style lang="less" scoped>
.consult-road-popup {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 376px;
  height: 360px;
  background: #fff;
  overflow: hidden;
}

.tabs {
  height: 300px;
  overflow: hidden;
}

.tabs :deep(.van-tabs__wrap) {
  height: 44px;
}

.tabs :deep(.van-tabs__nav) {
  align-items: center;
  justify-content: flex-start;
}

.tabs :deep(.van-tab) {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 700;
}

.tabs :deep(.van-tabs__content) {
  height: calc(300px - 44px);
  overflow: auto;
}

.footer {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 13px 12px;
  box-sizing: border-box;
  background: #e5efff;
}

.btn {
  height: 34px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 400;
}

.btn-ghost {
  width: 120px;
  background: #b8c8e3;
  color: #ffffff;
}

.placeholder {
  padding: 20px 12px;
  color: #6a7892;
  font-size: 14px;
}
</style>


<template>
  <footer class="lottery-footer" :aria-label="$t('投注操作')">
    <div class="lottery-footer__wide">
      <button type="button" class="lottery-footer__bet" @click="$emit('bet')">{{ primaryText }}</button>
      <button type="button" class="lottery-footer__chase" @click="$emit('chase')">{{ $t('追号') }}</button>
    </div>
  </footer>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({
  primaryText: { type: String, default: t('立即投注') }
})
defineEmits(['bet', 'chase'])
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lottery-footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 375px;
  max-width: 100%;
  box-sizing: border-box;
  z-index: 30;
  background: #fff;
  border-top: 0.5px solid #dae4f6;
  padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
}

.lottery-footer__wide {
  display: flex;
  gap: 8px;
  box-sizing: border-box;
}

.lottery-footer__bet {
  flex: 1;
  min-width: 0;
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: @font-size-sm;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #ffb74d 0%, #ff9800 100%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 8px;
}

.lottery-footer__chase {
  flex: 0 0 88px;
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1f78ff;
  cursor: pointer;
  background: #e9f2ff;
  border: 1px solid #cfe0ff;
}
</style>


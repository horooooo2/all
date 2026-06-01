<template>
  <div class="lottery-issue-bar-wrap">
    <div class="lottery-issue-bar" role="status" aria-live="polite">
      <span class="lottery-issue-bar__issue">{{ issueText }}</span>
      <div class="lottery-issue-bar__right">
        <span class="lottery-issue-bar__status">{{ statusText }}</span>
        <div class="lottery-issue-bar__timer">
          <span class="lottery-issue-bar__timer-text">{{ countdownText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps({
  issue: { type: [String, Number], default: '' },
  statusText: { type: String, default: t('投注中') },
  countdownText: { type: String, default: '00:00:00' }
})

const issueText = computed(() => {
  const v = String(props.issue ?? '').trim()
  return v ? `${v}期` : ''
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lottery-issue-bar-wrap {
  flex-shrink: 0;
  margin: 10px 0;
  box-sizing: border-box;
}

.lottery-issue-bar {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #fff;
}

.lottery-issue-bar__issue {
  flex: 1;
  min-width: 0;
  font-size: @font-size-md;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lottery-issue-bar__right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lottery-issue-bar__status {
  font-size: @font-size-sm;
  font-weight: 600;
  color: #1f78ff;
  white-space: nowrap;
}

.lottery-issue-bar__timer {
  width: 82px;
  height: 32px;
  border-radius: 4px;
  background: var(--s-6-d-7-e-2-f-5, #d7e2f5);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.lottery-issue-bar__timer-text {
  color: var(--p-00065-ff, #0065ff);
  font-feature-settings: 'liga' off, 'clig' off;
  font-family: DINPro, 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  font-variant-numeric: tabular-nums;
}
</style>


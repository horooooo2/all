<template>
  <div class="withdraw-deposit-page">
    <div class="header">
      <div class="header-tabs">
        <span
            class="tab-item"
            :class="{ active: activeTab === 'deposit' }"
            @click="switchTab('deposit')"
        >{{ $t('充值') }}</span>
        <span
            class="tab-item"
            :class="{ active: activeTab === 'withdraw' }"
            @click="switchTab('withdraw')"
        >{{ $t('取款') }}</span>
      </div>

      <div class="header-right" role="button" tabindex="0" @click="goDepositWithdrawRecord" @keydown.enter.prevent="goDepositWithdrawRecord">
        <img class="header-icon" src="@/assets/icon_usdt.svg" alt="us" />
        <span class="balance">¥89,685.50</span>
        <img class="header-icon" src="@/assets/icon_us.png" alt="us" />
      </div>
    </div>

    <div class="tab-content">
      <DepositPage v-if="activeTab === 'deposit'" />
      <WithdrawPage v-else-if="activeTab === 'withdraw'" />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DepositPage from './recharge/DepositPage.vue'
import WithdrawPage from './recharge/WithdrawPage.vue'

const route = useRoute()
const router = useRouter()

const tabFromQuery = () => {
  const t = route.query.tab
  return t === 'withdraw' || t === 'deposit' ? t : 'deposit'
}
const activeTab = ref(tabFromQuery())

const switchTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

const goDepositWithdrawRecord = () => {
  router.push({ name: 'depositWithdrawRecord' })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

@recharge-tabbar-height: 50px;

.withdraw-deposit-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: @recharge-tabbar-height;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background-color: var(--bg-color);
  z-index: 1;
}

.header {
  .flex-between;
  flex-shrink: 0;
  padding: @spacing-sm @spacing-md 0 @spacing-md;
  height: 45px;
  background: var(--bg-module);
  z-index: 10;

  .header-right {
    .flex-center;
    gap: @spacing-xs;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .header-icon {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .header-tabs {
    display: flex;
    gap: 24px;

    .tab-item {
      position: relative;
      font-size: @font-size-md;
      font-weight: 500;
      color: var(--text-color-secondary);
      cursor: pointer;
      padding-bottom: @spacing-sm;

      &.active {
        color: var(--primary-color);

        &::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: url('@/assets/tab_active_bottom.svg') no-repeat center / contain;
        }
      }
    }
  }

  .balance {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-color);
  }
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: @spacing-md;
  box-sizing: border-box;
}
</style>

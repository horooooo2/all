<template>
  <div class="wallet-recycle-page">
    <header class="wallet-recycle-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1 class="header-title">{{ $t('转账至主钱包') }}</h1>
    </header>

    <main class="wallet-recycle-content">
      <section
        v-for="(item, index) in wallets"
        :key="item.id"
        class="wallet-card"
      >
        <div class="wallet-info">
          <div class="wallet-name">{{ item.name }}</div>
          <div class="wallet-amount">
            <img class="wallet-amount-icon" src="@/assets/icon_cny.svg" alt="cny" />
            <span>¥{{ item.amount }}</span>
          </div>
        </div>
        <button
          type="button"
          class="wallet-action-btn"
        >
          {{ index === 0 ? '回收全部' : '回收' }}
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const wallets = computed(() => [
  { id: 1, name: t('账户余额'), amount: '89,685.50' },
  { id: 2, name: t('QQ德州扑克'), amount: '89,685.50' },
  { id: 3, name: 'SlotLive', amount: '89,685.50' },
  { id: 4, name: t('区块链百家乐乐'), amount: '89,685.50' },
  { id: 5, name: t('HH电子'), amount: '89,685.50' }
])

const goBack = () => {
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/wallet-recycle.less';
</style>


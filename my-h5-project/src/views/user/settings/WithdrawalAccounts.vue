<template>
  <div class="withdrawal-accounts-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('提款账户') }}</h1>
      <button type="button" class="service-btn" @click="goService" :aria-label="$t('客服')">
        <img :src="iconService" alt="">
      </button>
    </header>

    <main class="content">
      <div v-if="loading" class="loading-state">{{ $t('加载中...') }}</div>

      <template v-else-if="accounts.length === 0">
        <div class="empty-state">
          <img :src="imgEmpty" class="empty-img" alt="">
          <div class="empty-text">{{ $t('暂无提款账户，去添加') }}</div>
        </div>
      </template>

      <template v-else>
        <div class="card-list">
          <div
            v-for="item in accounts"
            :key="item.id"
            class="account-card"
          >
            <div class="card-left">
              <div class="card-icon">
                <img :src="methodIcon(item.method)" alt="">
              </div>
              <div class="card-text">
                <div class="card-title">{{ displayMap[item.id]?.title }}</div>
                <div class="card-subtitle">{{ displayMap[item.id]?.subTitle }}</div>
              </div>
            </div>

            <div class="card-no">{{ displayMap[item.id]?.display }}</div>
          </div>
        </div>
      </template>
    </main>

    <div class="bottom-bar">
      <button type="button" class="add-btn" @click="goAdd">{{ $t('添加提款账户') }}</button>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, onActivated, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import toast from '@/components/Toast'
import { useUserStore } from '@/stores/user'
import iconBack from '@/assets/icon_dack.svg'
import iconService from '@/assets/icon_zxkf.svg'
import imgEmpty from '@/assets/no_data.svg'
import iconUsdt from '@/assets/icon_usdtsm.svg'
import iconBank from '@/assets/icon_wyzf.svg'
import iconWallet from '@/assets/icon_dzqb.svg'
import { fetchWithdrawalAccounts, maskAccountDisplay } from '@/utils/withdrawalAccounts'

const router = useRouter()
const userStore = useUserStore()
const accounts = ref([])
const loading = ref(true)

const METHOD_ICONS = {
  usdt: iconUsdt,
  bank: iconBank,
  wallet: iconWallet
}

const methodIcon = (method) => METHOD_ICONS[method] || iconWallet

const displayMap = computed(() => {
  const map = {}
  for (const a of accounts.value) {
    map[a.id] = maskAccountDisplay(a.method, a.data)
  }
  return map
})

const loadAccounts = async () => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/withdrawal-accounts' } })
    return
  }

  loading.value = true
  try {
    accounts.value = await fetchWithdrawalAccounts()
  } catch (error) {
    console.error(t('加载提款账户失败:'), error)
    accounts.value = []
    toast.error(t('加载提款账户失败'))
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()
const goService = () => router.push({ name: 'service' })
const goAdd = () => router.push({ name: 'withdrawalAccountEdit', query: { mode: 'create' } })

onMounted(() => {
  loadAccounts()
})

onActivated(() => {
  if (userStore.isLogin && !loading.value) {
    loadAccounts()
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/withdrawal-accounts.less';

.withdrawal-accounts-page .loading-state {
  padding: 48px 0;
  text-align: center;
  font-size: 14px;
  color: #8aa2d6;
}
</style>

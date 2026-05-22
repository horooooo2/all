<template>
  <div class="withdrawal-accounts-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>提款账户</h1>
      <button type="button" class="service-btn" @click="goService" aria-label="客服">
        <img :src="iconService" alt="">
      </button>
    </header>

    <main class="content">
      <template v-if="accounts.length === 0">
        <div class="empty-state">
          <img :src="imgEmpty" class="empty-img" alt="">
          <div class="empty-text">暂无提款账户，去添加</div>
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
                <img :src="iconCardLeft" alt="">
              </div>
              <div class="card-text">
                <div class="card-title">{{ displayMap[item.id]?.title }}</div>
                <div class="card-subtitle">{{ displayMap[item.id]?.subTitle }}</div>
              </div>
            </div>

            <div
              class="delete-btn"
              role="button"
              tabindex="0"
              aria-label="??"
              @click.stop="onDelete(item.id)"
            >
              <img :src="iconCardDel" alt="">
            </div>

            <div class="card-no">{{ displayMap[item.id]?.display }}</div>
          </div>
        </div>
      </template>
    </main>

    <div class="bottom-bar">
      <button type="button" class="add-btn" @click="goAdd">添加提款账户</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import toast from '@/components/Toast'
import iconBack from '@/assets/icon_dack.svg'
import iconService from '@/assets/icon_zxkf.svg'
import imgEmpty from '@/assets/no_data.svg'
import iconCardDel from '@/assets/icon_card_del.svg'
import iconCardLeft from '@/assets/icon_zfb.svg'
import { deleteWithdrawalAccount, getWithdrawalAccounts, maskAccountDisplay } from '@/utils/withdrawalAccounts'

const router = useRouter()
const accounts = ref([])

const displayMap = computed(() => {
  const map = {}
  for (const a of accounts.value) {
    map[a.id] = maskAccountDisplay(a.method, a.data)
  }
  return map
})

const refresh = () => {
  accounts.value = getWithdrawalAccounts()
}

const goBack = () => router.back()
const goService = () => router.push({ name: 'service' })
const goAdd = () => router.push({ name: 'withdrawalAccountEdit', query: { mode: 'create' } })

const onDelete = async (id) => {
  try {
    await showConfirmDialog({
      title: '\u63d0\u793a',
      message: '\u786e\u5b9a\u8981\u5220\u9664\u8be5\u63d0\u6b3e\u8d26\u6237\u5417\uff1f'
    })
    deleteWithdrawalAccount(id)
    toast.success('\u5df2\u5220\u9664')
    refresh()
  } catch (e) {}
}

onMounted(() => {
  refresh()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/withdrawal-accounts.less';
</style>

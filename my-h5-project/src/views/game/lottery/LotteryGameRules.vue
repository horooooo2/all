<template>
  <div class="legal-doc-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ pageTitle }}</h1>
    </header>

    <div class="legal-body">
      <div v-if="loading" class="legal-loading">
        <van-loading type="spinner" size="24px" />
      </div>
      <div v-else-if="!html" class="legal-empty">{{ $t('暂无内容') }}</div>
      <div v-else class="legal-rich" v-html="html" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { getLotteryRule } from '@/api/lottery'
import toast from '@/components/Toast'
import { resolveLotteryGameRulesCode } from '@/utils/lotteryGameRulesNavigate'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const html = ref('')
const detailTitle = ref('')

const pageTitle = computed(() => {
  return String(route.query.gameName || detailTitle.value || route.meta.title || '')
})

const load = async () => {
  const code = resolveLotteryGameRulesCode(route.query.gameId, route.query.gameName)
  if (!code) {
    html.value = ''
    detailTitle.value = ''
    loading.value = false
    return
  }

  loading.value = true
  html.value = ''
  detailTitle.value = ''

  try {
    const detail = await getLotteryRule(code)
    detailTitle.value = detail.title
    html.value = detail.content
  } catch (error) {
    console.error('加载玩法规则失败:', error)
    html.value = ''
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

onMounted(load)
watch(
  () => [route.query.gameId, route.query.gameName],
  () => load()
)
</script>

<style lang="less" scoped>
@import '@/styles/pages/legal-document.less';
</style>

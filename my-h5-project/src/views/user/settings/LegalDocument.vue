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
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { fetchContentDetail, resolveLegalContentCode } from '@/api/content'
import toast from '@/components/Toast'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const html = ref('')
const detailTitle = ref('')

const pageTitle = computed(() => detailTitle.value || route.meta.title || '')

const load = async () => {
  const code = resolveLegalContentCode(route.meta.legalKind)
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
    const detail = await fetchContentDetail({ code })
    detailTitle.value = detail.title
    html.value = detail.content
    if (detail.title) {
      document.title = detail.title
    }
  } catch (error) {
    console.error('加载内容详情失败:', error)
    html.value = ''
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

onMounted(load)
watch(
  () => route.name,
  () => load()
)
</script>

<style lang="less" scoped>
@import '@/styles/pages/legal-document.less';
</style>

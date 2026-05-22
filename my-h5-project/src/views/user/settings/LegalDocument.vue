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
      <div v-else-if="!html" class="legal-empty">暂无内容</div>
      <div v-else class="legal-rich" v-html="html" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const html = ref('')

const pageTitle = computed(() => route.meta.title || '')

/** 二级页面暂不请求接口，后续接入 content 模块时在此调用 API */
function load() {
  html.value = ''
  loading.value = false
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

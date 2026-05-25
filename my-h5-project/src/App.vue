<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteStore } from '@/stores/site'

const route = useRoute()
const router = useRouter()
const siteStore = useSiteStore()

onMounted(() => {
  siteStore.fetchBrand().catch(() => {})
})

watch(() => route.fullPath, (newPath, oldPath) => {
  document.title = route.meta.title || 'PC28'
  console.log(`路由从 ${oldPath} 切换到 ${newPath}`)
}, { immediate: true })

router.onError((error) => {
  console.error('路由加载失败:', error)
})
</script>

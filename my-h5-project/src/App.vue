<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

watch(() => route.fullPath, (newPath, oldPath) => {
  document.title = route.meta.title || 'PC28'
  console.log(`路由从 ${oldPath} 切换到 ${newPath}`)
}, { immediate: true })

router.onError((error) => {
  console.error('路由加载失败:', error)
})
</script>

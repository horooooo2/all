<template>
  <img
    v-bind="$attrs"
    :src="siteStore.displayLogo"
    @error="onLogoError"
  >
</template>

<script setup>
import { useSiteStore } from '@/stores/site'
import logoFallback from '@/assets/logo.svg'

defineOptions({ inheritAttrs: true })

const siteStore = useSiteStore()

const onLogoError = (e) => {
  const el = e?.target
  if (!el || el.src === logoFallback) return
  el.src = logoFallback
}
</script>

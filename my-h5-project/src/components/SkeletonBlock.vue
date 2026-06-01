<template>
  <div
    class="skeleton-block shimmer"
    :class="customClass"
    :style="blockStyle"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  width: { type: String, default: '' },
  height: { type: String, default: '' },
  radius: { type: String, default: '' },
  customClass: { type: String, default: '' }
})

const blockStyle = computed(() => {
  const style = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  if (props.radius) style.borderRadius = props.radius
  return style
})
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
</style>

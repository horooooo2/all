<template>
  <div class="theme-switcher">
    <van-button
        :type="isDark ? 'primary' : 'default'"
        size="small"
        @click="toggleDark()"
    >
      <van-icon :name="isDark ? 'night' : 'light'" />
      {{ isDark ? '暗黑模式' : '白天模式' }}
    </van-button>
  </div>
</template>

<script setup>
import { useDark, useToggle } from '@vueuse/core'
import { watch } from 'vue'

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
})

const toggleDark = useToggle(isDark)

watch(isDark, (val) => {
  console.log('主题切换到:', val ? '暗黑' : '白天')
})
</script>

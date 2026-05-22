<template>
  <div class="lang-switcher">
    <van-space>
      <van-button
          v-for="lang in languages"
          :key="lang.code"
          :type="currentLang === lang.code ? 'primary' : 'default'"
          size="small"
          :loading="loadingLang === lang.code"
          @click="switchLang(lang.code)"
      >
        {{ lang.name }}
      </van-button>
    </van-space>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { showLoadingToast, closeToast } from 'vant'
import { loadLanguageAsync } from '@/i18n'

const { locale } = useI18n()
const loadingLang = ref('')

const languages = [
  { code: 'zh', name: '简体' },
  { code: 'zht', name: '繁體' },
  { code: 'en', name: 'English' }
]

const currentLang = computed(() => locale.value)

const switchLang = async (lang) => {
  if (lang === locale.value) return

  loadingLang.value = lang

  try {
    await loadLanguageAsync(lang)
    localStorage.setItem('locale', lang)
    setTimeout(closeToast, 500)
  } catch (error) {
    console.error('切换失败:', error)
    setTimeout(closeToast, 500)
  } finally {
    loadingLang.value = ''
  }
}
</script>

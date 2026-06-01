<template>
  <div class="questions-page">
    <div class="header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <span class="title">{{ $t('常见问题') }}</span>
    </div>

    <div v-if="loading" class="question-loading">{{ $t('加载中...') }}</div>

    <div v-else-if="questions.length" class="question-list">
      <div class="question-item" v-for="item in questions" :key="item.id">
        <button type="button" class="question-title" @click="toggleQuestion(item.id)">
          <span>{{ item.title }}</span>
          <img
            class="question-arrow"
            :src="expandedIds.includes(item.id) ? iconDetailsTop : iconDetailsDown"
            alt="arrow"
          >
        </button>
        <div
          v-show="expandedIds.includes(item.id)"
          class="question-desc"
          v-html="item.content"
        />
      </div>
    </div>

    <div v-else class="question-empty">{{ $t('暂无常见问题') }}</div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchHelpList } from '@/api/content'
import iconBack from '@/assets/icon_dack.svg'
import iconDetailsDown from '@/assets/icon_details_down2.svg'
import iconDetailsTop from '@/assets/icon_details_top.svg'
import toast from '@/components/Toast'

const router = useRouter()
const loading = ref(false)
const questions = ref([])
const expandedIds = ref([])

const loadQuestions = async () => {
  loading.value = true
  try {
    const list = await fetchHelpList()
    questions.value = list
    expandedIds.value = list.length ? [list[0].id] : []
  } catch (error) {
    console.error(t('加载常见问题失败:'), error)
    questions.value = []
    expandedIds.value = []
    toast.error(t('加载常见问题失败'))
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

/** @param {number|string} id */
const toggleQuestion = (id) => {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter((item) => item !== id)
    return
  }
  expandedIds.value.push(id)
}

onMounted(loadQuestions)
</script>

<style lang="less" scoped>
@import '@/styles/pages/common-questions.less';
</style>

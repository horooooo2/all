<template>
  <div class="activity-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ pageTitle }}</h1>
    </header>

    <div class="activity-detail-body">
      <div v-if="loading && !detail" class="activity-detail-loading">
        <van-loading type="spinner" size="24px" />
      </div>

      <template v-else-if="detail">
        <div v-if="detail.image" class="activity-detail-banner">
          <img :src="detail.image" :alt="detail.title || 'activity'">
        </div>

        <div class="activity-detail-content">
          <h2 v-if="detail.title" class="activity-detail-title">{{ detail.title }}</h2>
          <p v-if="detail.subtitle" class="activity-detail-subtitle">{{ detail.subtitle }}</p>

          <div v-if="detail.content" class="activity-detail-rich" v-html="detail.content" />
          <div v-else class="activity-detail-empty">{{ $t('暂无活动内容') }}</div>
        </div>
      </template>

      <div v-else class="activity-detail-empty">活动不存在或已下架</div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { fetchActivityDetail } from '@/api/activity'
import { getActivityCache } from '@/utils/activityCache'
import toast from '@/components/Toast'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref(null)

const activityId = computed(() => String(route.query.id || '').trim())

const pageTitle = computed(() => detail.value?.title || '活动详情')

const loadDetail = async () => {
  const id = activityId.value
  if (!id) {
    detail.value = null
    return
  }

  const cached = getActivityCache(id)
  if (cached) {
    detail.value = cached
  }

  loading.value = true
  try {
    detail.value = await fetchActivityDetail({ id })
  } catch (error) {
    console.error('加载活动详情失败:', error)
    if (!cached) {
      detail.value = null
    }
    toast.error('加载活动详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => router.back()

onMounted(loadDetail)
watch(activityId, loadDetail)
</script>

<style lang="less" scoped>
@import '@/styles/pages/activity-detail.less';
</style>

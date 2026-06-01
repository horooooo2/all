<template>
  <div class="activity-page">
    <header class="activity-header">
      <h1 class="activity-title">{{ $t('活动中心') }}</h1>
    </header>

    <div class="activity-list">
      <div v-if="loading" class="activity-loading">{{ $t('加载中...') }}</div>

      <template v-else-if="activityList.length">
        <button
          v-for="item in activityList"
          :key="item.id"
          type="button"
          class="activity-card"
          @click="goDetail(item)"
        >
          <div class="activity-card-cover">
            <img
              v-if="showActivityImage(item)"
              :src="item.image"
              alt=""
              class="activity-card-image"
              @error="onImageError(item.id)"
            >
            <div v-else class="activity-card-placeholder" />
          </div>
        </button>
      </template>

      <div v-else class="activity-empty">
        <img :src="noDataImage" alt="no-data">
        <p>{{ $t('暂无活动') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchActivityList } from '@/api/activity'
import { setActivityCache } from '@/utils/activityCache'
import noDataImage from '@/assets/no_data.svg'
import toast from '@/components/Toast'

const router = useRouter()
const loading = ref(false)
const activityList = ref([])
const brokenImageIds = ref(new Set())

/** @param {import('@/api/activity').ActivityItem} item */
const showActivityImage = (item) => {
  return Boolean(item.image) && !brokenImageIds.value.has(String(item.id))
}

/** @param {number|string} id */
const onImageError = (id) => {
  const next = new Set(brokenImageIds.value)
  next.add(String(id))
  brokenImageIds.value = next
}

const loadActivities = async () => {
  loading.value = true
  brokenImageIds.value = new Set()
  try {
    activityList.value = await fetchActivityList()
  } catch (error) {
    console.error(t('加载活动列表失败:'), error)
    activityList.value = []
    toast.error(t('加载活动列表失败'))
  } finally {
    loading.value = false
  }
}

/** @param {import('@/api/activity').ActivityItem} item */
const goDetail = (item) => {
  setActivityCache(item)
  router.push({
    name: 'activityDetail',
    query: { id: String(item.id) }
  })
}

onMounted(loadActivities)
</script>

<style lang="less" scoped>
@import '@/styles/pages/activity.less';
</style>

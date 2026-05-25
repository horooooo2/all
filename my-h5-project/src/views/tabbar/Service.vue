<template>
  <div class="service-page">
    <div class="bg-wrapper">
      <div class="user-section">
        <div
          class="left-info"
          :class="{ 'left-info--clickable': !isLogin }"
          role="button"
          :tabindex="isLogin ? -1 : 0"
          @click="!isLogin && goLogin()"
          @keydown.enter.prevent="!isLogin && goLogin()"
          @keydown.space.prevent="!isLogin && goLogin()"
        >
          <img
            class="default-avatar"
            :src="displayAvatar"
            alt="avatar"
            :class="{ 'avatar-placeholder': !avatarUrl }"
          >
          <div class="text-group">
            <div class="login-text">{{ displayName }}</div>
            <div class="sub-text">欢迎来到客服中心</div>
          </div>
        </div>

        <img class="right-avatar" src="@/assets/img_customer_service.png" alt="customer">
      </div>
    </div>

    <div class="service-card">
      <div v-if="loading" class="service-loading">加载中...</div>

      <template v-else-if="serviceList.length">
        <div
          v-for="item in serviceList"
          :key="item.id"
          class="service-item"
          role="button"
          tabindex="0"
          @click="onServiceClick(item)"
          @keydown.enter.prevent="onServiceClick(item)"
        >
          <div class="item-left">
            <div class="item-icon" :class="{ 'item-icon--placeholder': !showServiceIcon(item) }">
              <img
                v-if="showServiceIcon(item)"
                :src="item.image"
                :alt="item.title"
                @error="onImageError(item.id)"
              >
            </div>
            <span class="item-name">{{ item.title }}</span>
          </div>
          <img class="item-arrow" :src="iconArrow" alt="arrow">
        </div>
      </template>

      <div v-else class="service-empty">暂无客服入口</div>
    </div>

    <div class="bottom-placeholder" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchServiceList } from '@/api/content'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { useUserStore } from '@/stores/user'
import iconArrow from '@/assets/icon_dack_line.svg'
import toast from '@/components/Toast'
import { navigateSiteLink } from '@/utils/siteNavigate'

const router = useRouter()
const userStore = useUserStore()
const { avatarUrl, displayAvatar, refreshProfile } = useUserAvatar()

const isLogin = computed(() => userStore.isLogin)

const displayName = computed(() => {
  if (!isLogin.value) {
    return 'Hi，请登录/注册'
  }
  const info = userStore.userInfo
  return info?.username || info?.name || '用户'
})

const goLogin = () => {
  router.push({ name: 'login', query: { redirect: '/service' } })
}

const loading = ref(false)
const serviceList = ref([])
const brokenImageIds = ref(new Set())

/** @param {import('@/api/content').ServiceEntry} item */
const showServiceIcon = (item) => {
  return Boolean(item.image) && !brokenImageIds.value.has(String(item.id))
}

/** @param {number|string} id */
const onImageError = (id) => {
  const next = new Set(brokenImageIds.value)
  next.add(String(id))
  brokenImageIds.value = next
}

const loadServiceList = async () => {
  loading.value = true
  brokenImageIds.value = new Set()
  try {
    serviceList.value = await fetchServiceList()
  } catch (error) {
    console.error('加载客服列表失败:', error)
    serviceList.value = []
    toast.error('加载客服列表失败')
  } finally {
    loading.value = false
  }
}

/** @param {import('@/api/content').ServiceEntry} item */
const onServiceClick = (item) => {
  const linkValue = String(item.linkValue || '').trim()
  if (!linkValue) {
    toast.error('暂无法打开')
    return
  }

  if (navigateSiteLink(router, item)) {
    return
  }

  if (linkValue.startsWith('/')) {
    router.push(linkValue)
    return
  }

  window.location.href = linkValue
}

onMounted(() => {
  if (userStore.isLogin) {
    refreshProfile()
  }
  loadServiceList()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/service.less';
</style>

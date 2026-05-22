<template>
  <div class="service-page">
    <div class="bg-wrapper">
      <div class="user-section">
        <div class="left-info">
          <img class="default-avatar" src="@/assets/touxiang2.png" alt="avatar" />
          <div class="text-group">
            <div class="login-text">Hi，请登录/注册</div>
            <div class="sub-text">欢迎来到客服中心</div>
          </div>
        </div>

        <img class="right-avatar" src="@/assets/img_customer_service.png" alt="customer" />
      </div>
    </div>

    <div class="service-card">
      <div
        class="service-item"
        v-for="item in serviceList"
        :key="item.id"
        role="button"
        tabindex="0"
        @click="goDetail(item)"
        @keydown.enter.prevent="goDetail(item)"
      >
        <div class="item-left">
          <div class="item-icon" :class="{ 'item-icon--placeholder': !item.icon }">
            <img v-if="item.icon" :src="item.icon" :alt="item.name" />
          </div>
          <span class="item-name">{{ item.name }}</span>
        </div>
        <img class="item-arrow" :src="iconArrow" alt="arrow" />
      </div>
    </div>

    <div class="bottom-placeholder"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconArrow from '@/assets/icon_dack_line.svg'

const router = useRouter()

const serviceList = ref([
  { id: 1, name: '在线客服', key: 'online', icon: '' },
  { id: 2, name: '财务客服', key: 'finance', icon: '' },
  { id: 3, name: 'TG客服', key: 'tg', icon: '' }
])

const goDetail = (item) => {
  router.push({ name: 'serviceDetail', query: { type: item.key } })
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/service.less';
</style>

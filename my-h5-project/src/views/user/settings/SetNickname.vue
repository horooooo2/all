<template>
  <div class="profile-form-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>设置昵称</h1>
    </header>

    <main class="content">
      <div class="label">昵称</div>
      <input
        v-model.trim="nickname"
        class="input"
        type="text"
        maxlength="10"
        placeholder="请输入昵称"
      >

      <button type="button" class="confirm-btn" :disabled="!nickname" @click="onSubmit">
        确认
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { useUserStore } from '@/stores/user'
import toast from '@/components/Toast'

const router = useRouter()
const userStore = useUserStore()
const nickname = ref(userStore.userInfo?.nickname || 'AC0088')

const goBack = () => router.back()

const onSubmit = () => {
  const value = nickname.value.trim()

  if (!value) {
    toast.warning('请输入昵称')
    return
  }
  if (value.length > 10) {
    toast.warning('昵称最多10字符')
    return
  }
  if (!/^[\u4e00-\u9fa5A-Za-z0-9_]+$/.test(value)) {
    toast.warning('昵称仅支持平台语言种类')
    return
  }

  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, nickname: value }
  toast.success('设置成功')
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/profile-form.less';
</style>


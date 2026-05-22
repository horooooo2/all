<template>
  <div class="profile-form-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>设置姓名</h1>
    </header>

    <main class="content">
      <div class="label">姓名</div>
      <input
        v-model.trim="realName"
        class="input"
        type="text"
        maxlength="20"
        placeholder="请输入真实姓名"
      >

      <button type="button" class="confirm-btn" :disabled="!realName" @click="onSubmit">
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
const realName = ref(userStore.userInfo?.realName || '')

const goBack = () => router.back()

const onSubmit = () => {
  const value = realName.value.trim()

  if (!value) {
    toast.warning('请输入真实姓名')
    return
  }
  if (!/^[\u4e00-\u9fa5A-Za-z·\s]{2,20}$/.test(value)) {
    toast.warning('姓名格式不正确')
    return
  }

  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, realName: value }
  toast.success('设置成功')
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/profile-form.less';
</style>


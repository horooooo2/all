<template>
  <div class="profile-form-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>设置联系方式</h1>
    </header>

    <main class="content">
      <section class="hero-card">
        <div class="hero-figure">
          <img :src="heroIcon" alt="contact" class="hero-icon">
        </div>
        <div class="hero-title">联系方式</div>
      </section>

      <input
        v-model.trim="contactInfo"
        class="input"
        type="tel"
        maxlength="11"
        placeholder="请输入联系方式"
      >

      <button
        type="button"
        class="confirm-btn"
        :disabled="!contactInfo || isSubmitting"
        @click="onSubmit"
      >
        {{ isSubmitting ? '提交中...' : '确认' }}
      </button>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { useUserStore } from '@/stores/user'
import { useProfileSave } from '@/composables/useProfileSave'
import toast from '@/components/Toast'

import heroIcon from '@/assets/img_contact_information.png'

const router = useRouter()
const userStore = useUserStore()
const { isSubmitting, saveProfile } = useProfileSave()
const contactInfo = ref(userStore.userInfo?.contact || '')

const goBack = () => router.back()

const onSubmit = async () => {
  if (isSubmitting.value) return

  const value = contactInfo.value.trim()

  if (!/^1\d{10}$/.test(value)) {
    toast.warning('请输入正确的11位手机号')
    return
  }

  const ok = await saveProfile({ contact: value })
  if (ok) {
    router.back()
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/profile-form.less';
</style>

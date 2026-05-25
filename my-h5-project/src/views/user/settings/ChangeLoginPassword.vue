<template>
  <div class="password-setting-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>修改登录密码</h1>
    </header>

    <main class="content">
      <section class="hero-card">
        <div class="hero-figure">
          <img :src="heroIcon" alt="password" class="hero-icon">
        </div>
        <div class="hero-title">修改密码</div>
      </section>

      <div class="field">
        <img :src="lockIcon" alt="" class="field-icon">
        <input
          v-model="form.oldPassword"
          class="field-input"
          :type="showOld ? 'text' : 'password'"
          placeholder="请输入旧密码"
          autocomplete="current-password"
        >
        <button type="button" class="toggle-btn" @click="showOld = !showOld">
          <img :src="showOld ? visibleIcon : hiddenIcon" alt="toggle">
        </button>
      </div>

      <div class="field-group">
        <div class="field">
          <img :src="lockIcon" alt="" class="field-icon">
          <input
            v-model="form.newPassword"
            class="field-input"
            :type="showNew ? 'text' : 'password'"
            placeholder="请输入新密码"
            autocomplete="new-password"
          >
          <button type="button" class="toggle-btn" @click="showNew = !showNew">
            <img :src="showNew ? visibleIcon : hiddenIcon" alt="toggle">
          </button>
        </div>

        <div class="field">
          <img :src="lockIcon" alt="" class="field-icon">
          <input
            v-model="form.confirmPassword"
            class="field-input"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="请确认您的新密码"
            autocomplete="new-password"
          >
          <button type="button" class="toggle-btn" @click="showConfirm = !showConfirm">
            <img :src="showConfirm ? visibleIcon : hiddenIcon" alt="toggle">
          </button>
        </div>

        <PasswordMismatchHint :visible="showPasswordMismatch" />
      </div>

      <button
        type="button"
        class="confirm-btn"
        :disabled="!canSubmit || isSubmitting"
        @click="onSubmit"
      >
        {{ isSubmitting ? '提交中...' : '确认' }}
      </button>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'
import { useUserStore } from '@/stores/user'
import {
    buildPasswordChangePayload,
    changeLoginPassword
} from '@/api/profile'
import { usePasswordChange } from '@/composables/usePasswordChange'
import PasswordMismatchHint from '@/components/PasswordMismatchHint.vue'

import heroIcon from '@/assets/img_change_password.png'
import lockIcon from '@/assets/icon_login_password.svg'
import visibleIcon from '@/assets/icon_login_visible.svg'
import hiddenIcon from '@/assets/icon_login_invisible_dark.svg'

const router = useRouter()
const userStore = useUserStore()
const { isSubmitting, submitPasswordChange } = usePasswordChange(changeLoginPassword)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const showPasswordMismatch = computed(
  () => !!form.confirmPassword && form.newPassword !== form.confirmPassword
)

const canSubmit = computed(
  () =>
    form.oldPassword &&
    form.newPassword &&
    form.confirmPassword &&
    !showPasswordMismatch.value
)

onMounted(() => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/change-login-password' } })
  }
})

const goBack = () => router.back()

const onSubmit = async () => {
  if (isSubmitting.value || !canSubmit.value) return

  if (form.newPassword.length < 6) {
    toast.warning('新密码至少6位')
    return
  }
  if (form.newPassword === form.oldPassword) {
    toast.warning('新密码不能与旧密码相同')
    return
  }

  let payload
  try {
    payload = buildPasswordChangePayload({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
      requireOld: true
    })
  } catch (error) {
    toast.warning(error.message || '请检查输入')
    return
  }

  const ok = await submitPasswordChange(payload, {
    successMessage: '登录密码已修改',
    onSuccess: async () => {
      router.back()
    }
  })
  if (!ok) {
    return
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/password-setting.less';
</style>

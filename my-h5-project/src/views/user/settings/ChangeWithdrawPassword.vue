<template>
  <div class="password-setting-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ pageTitle }}</h1>
    </header>

    <main class="content">
      <template v-if="hasWithdrawPassword">
        <section class="hero-card">
          <div class="hero-figure">
            <img :src="heroIcon" alt="password" class="hero-icon">
          </div>
          <div class="hero-title">{{ $t('修改取款密码') }}</div>
        </section>

        <div class="field">
          <img :src="lockIcon" alt="" class="field-icon">
          <input
            v-model="form.oldPassword"
            class="field-input"
            :type="showOld ? 'text' : 'password'"
            placeholder="请输入旧取款密码"
            autocomplete="current-password"
          >
          <button type="button" class="toggle-btn" @click="showOld = !showOld">
            <img :src="showOld ? visibleIcon : hiddenIcon" alt="toggle">
          </button>
        </div>
      </template>

      <div class="label">{{ hasWithdrawPassword ? '新取款密码' : '支付密码' }}</div>
      <div class="field-group" :class="{ 'field-group--first': !hasWithdrawPassword }">
        <div class="field">
          <img :src="lockIcon" alt="" class="field-icon">
          <input
            v-model="form.newPassword"
            class="field-input"
            :type="showNew ? 'text' : 'password'"
            :placeholder="hasWithdrawPassword ? '请输入新取款密码' : '请输入支付密码'"
            autocomplete="new-password"
          >
          <button type="button" class="toggle-btn" @click="showNew = !showNew">
            <img :src="showNew ? visibleIcon : hiddenIcon" alt="toggle">
          </button>
        </div>

        <div class="label">{{ hasWithdrawPassword ? '确认新取款密码' : '确认支付密码' }}</div>
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

      <template v-if="!hasWithdrawPassword">
        <div class="label">{{ $t('联系方式') }}</div>
        <div class="field">
          <img :src="phoneIcon" alt="" class="field-icon">
          <input
            v-model="form.contact"
            class="field-input"
            :placeholder="$t('请输入联系方式')"
          >
        </div>

        <div class="hint-box">
          请确认您的联系方式，因为您是第一次提取现金，为了确保您的资金安全，请确认您的联系方式是否正确。后续如有异常或信息确认，客服将以联系方式为准。
        </div>
      </template>

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
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'
import { useUserStore } from '@/stores/user'
import {
    buildPasswordChangePayload,
    changeWithdrawPassword,
    updateProfile
} from '@/api/profile'
import { usePasswordChange } from '@/composables/usePasswordChange'
import PasswordMismatchHint from '@/components/PasswordMismatchHint.vue'

import heroIcon from '@/assets/img_change_password.png'
import lockIcon from '@/assets/icon_login_passwordy.svg'
import phoneIcon from '@/assets/icon_contact_information.png'
import visibleIcon from '@/assets/icon_login_visible.svg'
import hiddenIcon from '@/assets/icon_login_invisible_dark.svg'

const router = useRouter()
const userStore = useUserStore()
const { isSubmitting, submitPasswordChange } = usePasswordChange(changeWithdrawPassword)

const hasWithdrawPassword = computed(() => !!userStore.userInfo?.hasWithdrawPassword)
const pageTitle = computed(() =>
  hasWithdrawPassword.value ? t('更改取款密码') : t('提款密码设置')
)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  contact: userStore.userInfo?.contact || ''
})
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const showPasswordMismatch = computed(
  () => !!form.confirmPassword && form.newPassword !== form.confirmPassword
)

const canSubmit = computed(() => {
  const base =
    form.newPassword &&
    form.confirmPassword &&
    !showPasswordMismatch.value
  if (hasWithdrawPassword.value) {
    return base && form.oldPassword
  }
  return base && form.contact.trim()
})

onMounted(() => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/change-withdraw-password' } })
  }
})

const markWithdrawPasswordSet = () => {
  if (!userStore.userInfo) return
  userStore.userInfo = {
    ...userStore.userInfo,
    hasWithdrawPassword: true
  }
}

const saveContactIfNeeded = async () => {
  const contact = form.contact.trim()
  if (!contact || contact === (userStore.userInfo?.contact || '')) {
    return
  }
  await updateProfile({ contact })
  if (userStore.userInfo) {
    userStore.userInfo = { ...userStore.userInfo, contact }
  }
}

const goBack = () => router.back()

const onSubmit = async () => {
  if (isSubmitting.value || !canSubmit.value) return

  if (form.newPassword.length < 6) {
    toast.warning('密码至少6位')
    return
  }
  if (hasWithdrawPassword.value && form.newPassword === form.oldPassword) {
    toast.warning('新密码不能与旧密码相同')
    return
  }

  let payload
  try {
    payload = buildPasswordChangePayload({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
      requireOld: hasWithdrawPassword.value
    })
  } catch (error) {
    toast.warning(error.message || '请检查输入')
    return
  }

  const ok = await submitPasswordChange(payload, {
    successMessage: hasWithdrawPassword.value ? '取款密码已修改' : '取款密码设置成功',
    onSuccess: async () => {
      if (!hasWithdrawPassword.value) {
        try {
          await saveContactIfNeeded()
        } catch (error) {
          console.error('更新联系方式失败:', error)
        }
      }
      markWithdrawPasswordSet()
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

.password-setting-page .field-group--first {
  margin-top: 0;
}

.password-setting-page .field-group .label {
  margin: 16px 0 @spacing-sm;
}
</style>

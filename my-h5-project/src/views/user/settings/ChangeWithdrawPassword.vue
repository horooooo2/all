<template>
  <div class="password-setting-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>提款密码设置</h1>
    </header>

    <main class="content">
      <div class="label">支付密码</div>
      <div class="field">
        <img :src="lockIcon" alt="" class="field-icon">
        <input
          v-model="form.payPassword"
          class="field-input"
          :type="showPay ? 'text' : 'password'"
          placeholder="请输入支付密码"
        >
        <button type="button" class="toggle-btn" @click="showPay = !showPay">
          <img :src="showPay ? visibleIcon : hiddenIcon" alt="toggle">
        </button>
      </div>

      <div class="label">确认支付密码</div>
      <div class="field">
        <img :src="lockIcon" alt="" class="field-icon">
        <input
          v-model="form.confirmPassword"
          class="field-input"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="请确认您的新密码"
        >
        <button type="button" class="toggle-btn" @click="showConfirm = !showConfirm">
          <img :src="showConfirm ? visibleIcon : hiddenIcon" alt="toggle">
        </button>
      </div>

      <div class="label">联系方式</div>
      <div class="field">
        <img :src="phoneIcon" alt="" class="field-icon">
        <input
          v-model="form.contact"
          class="field-input"
          placeholder="请输入联系方式"
        >
      </div>

      <div class="hint-box">
        请确认您的联系方式，因为您是第一次提取现金，为了确保您的资金安全，请确认您的联系方式是否正确。后续如有异常或信息确认，客服将以联系方式为准。
      </div>

      <button type="button" class="confirm-btn" :disabled="!canSubmit" @click="onSubmit">
        确认
      </button>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'

import lockIcon from '@/assets/icon_login_passwordy.svg'
import phoneIcon from '@/assets/icon_contact_information.png'
import visibleIcon from '@/assets/icon_login_visible.svg'
import hiddenIcon from '@/assets/icon_login_invisible_dark.svg'

const router = useRouter()
const form = reactive({
  payPassword: '',
  confirmPassword: '',
  contact: ''
})
const showPay = ref(false)
const showConfirm = ref(false)

const canSubmit = computed(() => form.payPassword && form.confirmPassword && form.contact)

const goBack = () => router.back()

const onSubmit = () => {
  if (form.payPassword.length < 6) {
    toast.warning('支付密码至少6位')
    return
  }
  if (form.payPassword !== form.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }
  toast.success('设置成功')
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/password-setting.less';
</style>


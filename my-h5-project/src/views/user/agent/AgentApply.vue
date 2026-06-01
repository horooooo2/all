<template>
  <div class="agent-apply-page">
    <header class="agent-header">
      <button type="button" class="agent-header-back" @click="goBack">
        <img :src="iconBack" alt="back">
      </button>
      <h1 class="agent-header-title">{{ $t('代理中心') }}</h1>
    </header>

    <div class="agent-account-bar">
      <div class="agent-account-row">
        <span>{{ $t('代理账户') }}</span>
        <span>{{ accountName }}</span>
      </div>
      <div class="agent-account-row">
        <span>{{ $t('代理ID') }}</span>
        <span>{{ agentId }}</span>
      </div>
    </div>

    <form class="agent-form" @submit.prevent="onSubmit">
      <div class="agent-field">
        <label class="agent-field-label" for="realName"><span class="req">*</span>{{ $t('真实姓名') }}</label>
        <input
          id="realName"
          v-model="form.realName"
          class="agent-input"
          type="text"
          autocomplete="name"
          :placeholder="$t('请输入真实姓名')"
        >
      </div>
      <div class="agent-field">
        <label class="agent-field-label" for="mobile">{{ $t('手机号码') }}</label>
        <input
          id="mobile"
          v-model="form.mobile"
          class="agent-input"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          :placeholder="$t('请输入手机号码')"
        >
      </div>
      <div class="agent-field">
        <label class="agent-field-label" for="telegram">Telegram</label>
        <input
          id="telegram"
          v-model="form.telegram"
          class="agent-input"
          type="text"
          autocomplete="off"
          :placeholder="$t('请输入telegram账号')"
        >
      </div>
      <div class="agent-field">
        <label class="agent-field-label" for="whatsapp">WhatsApp</label>
        <input
          id="whatsapp"
          v-model="form.whatsapp"
          class="agent-input"
          type="text"
          autocomplete="off"
          :placeholder="$t('请输入WhatsApp账号')"
        >
      </div>
      <div class="agent-field">
        <label class="agent-field-label" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          class="agent-input"
          type="email"
          autocomplete="email"
          :placeholder="$t('请输入email邮箱')"
        >
      </div>

      <div class="agent-submit-wrap">
        <button type="submit" class="agent-submit-btn">{{ $t('提交申请') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'

const router = useRouter()
const accountName = ref('6669_2203456')
const agentId = ref('10195')

const form = reactive({
  realName: '',
  mobile: '',
  telegram: '',
  whatsapp: '',
  email: ''
})

const goBack = () => router.back()

const onSubmit = () => {
  if (!form.realName.trim()) {
    toast.warning(t('请输入真实姓名'))
    return
  }
  toast.success('已提交（示例）')
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-apply.less';
</style>

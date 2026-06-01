<template>
  <div class="settings-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('设置') }}</h1>
    </header>

    <section class="settings-menu">
      <button type="button" class="settings-row" @click="goAboutUs">
        <span>{{ $t('关于我们') }}</span>
        <van-icon name="arrow" />
      </button>
      <button type="button" class="settings-row" @click="goUserAgreement">
        <span>{{ $t('用户协议') }}</span>
        <van-icon name="arrow" />
      </button>
      <button type="button" class="settings-row" @click="goPrivacyPolicy">
        <span>{{ $t('隐私政策') }}</span>
        <van-icon name="arrow" />
      </button>
      <button type="button" class="settings-row" @click="goUserAgreement">
        <span>{{ $t('当前版本') }}</span>
        v{{ appVersion }}
      </button>
    </section>

    <section class="settings-menu settings-menu--logout">
      <button
        type="button"
        class="settings-row settings-row--logout"
        :disabled="isLoggingOut"
        @click="onLogout"
      >
        <span>{{ isLoggingOut ? t('退出中...') : t('退出登录') }}</span>
      </button>
    </section>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import iconBack from '@/assets/icon_dack.svg'
import { useUserStore } from '@/stores/user'
import { toast } from '@/components/Toast'

const router = useRouter()
const userStore = useUserStore()
const isLoggingOut = ref(false)

const appVersion = __APP_VERSION__

const goBack = () => router.back()
const goAboutUs = () => router.push({ name: 'aboutUs' })
const goUserAgreement = () => router.push({ name: 'userAgreement' })
const goPrivacyPolicy = () => router.push({ name: 'privacyPolicy' })

const onLogout = () => {
  if (isLoggingOut.value) return
  showConfirmDialog({
    title: t('温馨提示'),
    message: t('退出后，您需要重新登录才能继续访问账户与相关功能。')
  })
    .then(async () => {
      if (isLoggingOut.value) return
      isLoggingOut.value = true
      toast.loading(t('退出中...'))
      try {
        await userStore.logout()
        toast.success(t('已退出登录'), 500)
        setTimeout(() => {
          router.replace({ name: 'home' })
        }, 500)
      } catch (error) {
        console.error(t('退出失败:'), error)
        toast.hideLoading()
        isLoggingOut.value = false
      }
    })
    .catch(() => {})
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/settings.less';
</style>

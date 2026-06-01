<template>
  <div class="profile-form-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('设置姓名') }}</h1>
    </header>

    <main class="content">
      <div class="label">{{ $t('姓名') }}</div>
      <input
        v-model.trim="realName"
        class="input"
        type="text"
        maxlength="20"
        :placeholder="$t('请输入真实姓名')"
      >

      <button
        type="button"
        class="confirm-btn"
        :disabled="!realName || isSubmitting"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { useUserStore } from '@/stores/user'
import { useProfileSave } from '@/composables/useProfileSave'
import toast from '@/components/Toast'

const router = useRouter()
const userStore = useUserStore()
const { isSubmitting, saveProfile } = useProfileSave()
const realName = ref(userStore.userInfo?.realName || '')

const goBack = () => router.back()

const onSubmit = async () => {
  if (isSubmitting.value) return

  const value = realName.value.trim()

  if (!value) {
    toast.warning(t('请输入真实姓名'))
    return
  }
  if (!/^[\u4e00-\u9fa5A-Za-z·\s]{2,20}$/.test(value)) {
    toast.warning('姓名格式不正确')
    return
  }

  const ok = await saveProfile({ real_name: value })
  if (ok) {
    router.back()
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/profile-form.less';
</style>

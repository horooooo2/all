<template>
  <div class="selection-sheet-page" @click.self="goBack">
    <div class="sheet">
      <div class="sheet-header">
        <div class="sheet-title">{{ $t('性别') }}</div>
        <button type="button" class="close-btn" @click="goBack">
          <img :src="iconClose" alt="close">
        </button>
      </div>

      <button
        v-for="item in genderOptions"
        :key="item"
        type="button"
        class="option"
        :class="{ active: gender === item }"
        @click="selectGender(item)"
      >
        <span>{{ item }}</span>
        <span class="indicator" :class="{ active: gender === item }" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import toast from '@/components/Toast'

import iconClose from '@/assets/icon_x.svg'

const router = useRouter()
const userStore = useUserStore()
const genderOptions = ['男', '女']
const gender = ref(userStore.userInfo?.gender || '女')

const goBack = () => router.back()

const selectGender = (value) => {
  gender.value = value
  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, gender: value }
  toast.success(t('设置成功'))
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/selection-sheet.less';
</style>


<template>
  <div class="selection-sheet-page" @click.self="goBack">
    <div class="sheet">
      <div class="sheet-header">
        <div class="sheet-title">生日选择</div>
        <button type="button" class="confirm-btn" @click="confirmBirthday">确认</button>
      </div>

      <div class="picker-wrap">
        <van-date-picker
          v-model="pickerValues"
          :columns-type="['year', 'month', 'day']"
          :min-date="minDate"
          :max-date="maxDate"
          :show-toolbar="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import toast from '@/components/Toast'

const router = useRouter()
const userStore = useUserStore()

const minDate = new Date(1970, 0, 1)
const maxDate = new Date()

const parseBirthday = (value) => {
  if (!value) return new Date()
  const [year, month, day] = value.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

const currentBirthday = parseBirthday(userStore.userInfo?.birthday)
const pickerValues = ref([
  `${currentBirthday.getFullYear()}`,
  `${currentBirthday.getMonth() + 1}`.padStart(2, '0'),
  `${currentBirthday.getDate()}`.padStart(2, '0')
])

const goBack = () => router.back()

const confirmBirthday = () => {
  const [year, month, day] = pickerValues.value
  const value = `${year}-${month}-${day}`
  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, birthday: value }
  toast.success('设置成功')
  router.back()
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/selection-sheet.less';
</style>


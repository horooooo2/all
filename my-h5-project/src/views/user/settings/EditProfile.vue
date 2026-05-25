<template>
  <div class="edit-profile-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>编辑个人资料</h1>
    </header>

    <section class="profile-card">
      <div class="profile-main">
        <div class="avatar-wrap">
          <img :src="displayAvatar" alt="avatar">
        </div>
        <div class="profile-text">
          <div class="profile-name">{{ user.name }}</div>
          <div class="profile-id">ID:{{ user.id }}</div>
        </div>
      </div>
      <img :src="iconEdit" alt="edit" class="profile-edit-btn" @click="onAvatarEdit">
    </section>

    <section class="menu-card">
      <button type="button" class="menu-row" @click="onCopyAccount">
        <span class="menu-row-inner">
          <img :src="iconAccount" alt="" class="menu-icon-img">
          <span>账号</span>
        </span>
        <span class="right-wrap">
          <span class="right-text">{{ user.account }}</span>
          <img :src="iconCopy" alt="copy" class="right-icon">
        </span>
      </button>

      <button type="button" class="menu-row" @click="onEditNickname">
        <span class="menu-row-inner">
          <img :src="iconNickName" alt="" class="menu-icon-img">
          <span>昵称</span>
        </span>
        <span class="right-wrap">
          <span class="right-text">{{ user.nickname }}</span>
          <img :src="iconGo" alt="go" class="right-icon">
        </span>
      </button>

      <button type="button" class="menu-row" @click="onEditGender">
        <span class="menu-row-inner">
          <img :src="iconGender" alt="" class="menu-icon-img">
          <span>性别</span>
        </span>
        <span class="right-wrap">
          <span class="right-text">{{ user.gender }}</span>
          <img :src="iconGo" alt="go" class="right-icon">
        </span>
      </button>

      <button type="button" class="menu-row" @click="onEditBirthday">
        <span class="menu-row-inner">
          <img :src="iconUpgrade" alt="" class="menu-icon-img">
          <span>生日</span>
        </span>
        <span class="right-wrap">
          <span class="right-text" :class="{ 'right-text--unset': !user.birthday }">
            {{ user.birthday || '未设置' }}
          </span>
          <img :src="iconGo" alt="go" class="right-icon">
        </span>
      </button>

      <button type="button" class="menu-row" @click="onEditRealName">
        <span class="menu-row-inner">
          <img :src="iconName" alt="" class="menu-icon-img">
          <span>姓名</span>
        </span>
        <span class="right-wrap">
          <span class="right-text">{{ user.realName ? '已设置' : '未设置' }}</span>
          <img :src="iconGo" alt="go" class="right-icon">
        </span>
      </button>

      <button type="button" class="menu-row" @click="onEditPhone">
        <span class="menu-row-inner">
          <img :src="iconContactInformation" alt="" class="menu-icon-img">
          <span>联系方式</span>
        </span>
        <span class="right-wrap">
          <span class="right-text">{{ user.phoneMasked }}</span>
          <img :src="iconGo" alt="go" class="right-icon">
        </span>
      </button>
    </section>

    <section class="menu-card menu-card--spaced">
      <button type="button" class="menu-row" @click="onWithdrawAccount">
        <span class="menu-row-inner">
          <img :src="iconWithdrawalAccount" alt="" class="menu-icon-img">
          <span>提款账户</span>
        </span>
        <img :src="iconGo" alt="go" class="right-icon">
      </button>
    </section>

    <section class="menu-card menu-card--spaced">
      <button type="button" class="menu-row" @click="onChangeLoginPwd">
        <span class="menu-row-inner">
          <img :src="iconChangeLoginPassword" alt="" class="menu-icon-img">
          <span>更改登录密码</span>
        </span>
        <img :src="iconGo" alt="go" class="right-icon">
      </button>
      <button type="button" class="menu-row" @click="onChangePayPwd">
        <span class="menu-row-inner">
          <img :src="iconChangeWithdrawalPassword" alt="" class="menu-icon-img">
          <span>更改取款密码</span>
        </span>
        <img :src="iconGo" alt="go" class="right-icon">
      </button>
    </section>

    <van-popup v-model:show="showGenderPopup" position="bottom" round class="selection-popup">
      <div class="selection-sheet">
        <div class="selection-sheet-header">
          <div class="selection-sheet-title">性别</div>
          <div class="selection-close-btn" role="button" tabindex="0" @click="showGenderPopup = false">
            <img :src="iconClose" alt="close">
          </div>
        </div>

        <button
          v-for="item in genderOptions"
          :key="item"
          type="button"
          class="selection-option"
          :class="{ active: user.gender === item }"
          @click="selectGender(item)"
        >
          <span>{{ item }}</span>
          <span class="selection-indicator" :class="{ active: user.gender === item }" />
        </button>
      </div>
    </van-popup>

    <van-action-sheet
      v-model:show="showAvatarSheet"
      :actions="avatarSheetActions"
      cancel-text="取消"
      close-on-click-action
      @select="onAvatarSheetSelect"
    />

    <div class="avatar-uploader-wrap">
      <van-uploader
        ref="avatarUploaderRef"
        accept="image/*"
        :max-count="1"
        :preview-image="false"
        :after-read="onAvatarAfterRead"
      />
    </div>

    <van-popup v-model:show="showBirthdayPopup" position="bottom" round class="selection-popup">
      <div class="selection-sheet">
        <div class="selection-sheet-header">
          <div class="selection-sheet-title">生日选择</div>
          <button type="button" class="selection-confirm-btn" @click="confirmBirthday">确认</button>
        </div>

        <div class="birthday-picker-wrap">
          <van-date-picker
            v-model="birthdayValues"
            :columns-type="['year', 'month', 'day']"
            :min-date="minDate"
            :max-date="maxDate"
            :show-toolbar="false"
          />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import { useUserStore } from '@/stores/user'
import { useUserAvatar } from '@/composables/useUserAvatar'
import toast from '@/components/Toast'
import iconEdit from '@/assets/icon_edit.svg'
import iconAccount from '@/assets/icon_account.svg'
import iconNickName from '@/assets/icon_nick_name.svg'
import iconGender from '@/assets/icon_gender.svg'
import iconUpgrade from '@/assets/icon_upgrade.svg'
import iconName from '@/assets/icon_name.svg'
import iconContactInformation from '@/assets/icon_contact_information.svg'
import iconWithdrawalAccount from '@/assets/icon_withdrawal_account.svg'
import iconChangeLoginPassword from '@/assets/icon_change_login_password.svg'
import iconChangeWithdrawalPassword from '@/assets/icon_change_withdrawal_password.svg'
import iconCopy from '@/assets/icon_copy.svg'
import iconGo from '@/assets/icon_dack_line.svg'
import iconClose from '@/assets/icon_x.svg'

const router = useRouter()
const userStore = useUserStore()
const { displayAvatar: profileAvatar, refreshProfile } = useUserAvatar()

const GENDER_LABELS = { 0: '未知', 1: '男', 2: '女' }

const formatGender = (value) => {
  if (value === 1 || value === '1' || value === '男') return '男'
  if (value === 2 || value === '2' || value === '女') return '女'
  if (value === 0 || value === '0' || value === '未知') return '未知'
  return value || '未知'
}

const showGenderPopup = ref(false)
const showBirthdayPopup = ref(false)
const showAvatarSheet = ref(false)
const avatarUploaderRef = ref(null)
const avatarPreview = ref('')
const avatarSheetActions = [{ name: '上传头像' }]
const genderOptions = ['男', '女']
const minDate = new Date(1970, 0, 1)
const maxDate = new Date()

const parseBirthday = (value) => {
  if (!value) return new Date(2026, 1, 8)
  const [year, month, day] = String(value).split('-')
  return new Date(Number(year), Number(month) - 1, Number(day))
}

const initialBirthday = parseBirthday(userStore.userInfo?.birthday)
const birthdayValues = ref([
  `${initialBirthday.getFullYear()}`,
  `${initialBirthday.getMonth() + 1}`.padStart(2, '0'),
  `${initialBirthday.getDate()}`.padStart(2, '0')
])

const user = computed(() => {
  const u = userStore.userInfo || {}
  const contact = u.contact || u.contactInfo || ''
  const phoneMasked = u.phoneMasked || (
    contact && /^\d{7,}$/.test(String(contact))
      ? String(contact).replace(/^(\d{3})\d+(\d{4})$/, '$1****$2')
      : contact || '--'
  )
  return {
    id: u.id ?? '--',
    name: u.name || u.nickname || u.username || '昵称',
    avatar: u.avatar || '',
    account: u.username || u.account || '--',
    nickname: u.nickname || u.name || '--',
    gender: formatGender(u.gender),
    birthday: u.birthday || '',
    realName: u.realName || '',
    phoneMasked
  }
})

const displayAvatar = computed(() => avatarPreview.value || profileAvatar.value)

onMounted(() => {
  refreshProfile().catch(() => {})
})

const goBack = () => router.back()

const onAvatarEdit = () => {
  showAvatarSheet.value = true
}

const onAvatarSheetSelect = (action) => {
  if (action?.name !== '上传头像') return
  nextTick(() => {
    avatarUploaderRef.value?.chooseFile()
  })
}

const onAvatarAfterRead = (file) => {
  const item = Array.isArray(file) ? file[0] : file
  const rawFile = item?.file
  if (!rawFile) return

  const localUrl = item.content || URL.createObjectURL(rawFile)
  avatarPreview.value = localUrl

  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, avatar: localUrl }
  toast.success('头像已更新')
}

const onCopyAccount = async () => {
  const text = user.value.account
  try {
    await navigator.clipboard.writeText(text)
    toast.success('已复制')
  } catch (e) {
    toast.warning(text)
  }
}

const onEditNickname = () => router.push({ name: 'setNickname' })
const onEditGender = () => {
  showGenderPopup.value = true
}
const onEditBirthday = () => {
  const currentBirthday = parseBirthday(userStore.userInfo?.birthday)
  birthdayValues.value = [
    `${currentBirthday.getFullYear()}`,
    `${currentBirthday.getMonth() + 1}`.padStart(2, '0'),
    `${currentBirthday.getDate()}`.padStart(2, '0')
  ]
  showBirthdayPopup.value = true
}
const onEditRealName = () => router.push({ name: 'setRealName' })
const onEditPhone = () => router.push({ name: 'setContactInfo' })
const onWithdrawAccount = () => router.push({ name: 'withdrawalAccounts' })
const onDeleteAccount = () => toast.warning('敬请期待')
const onChangeLoginPwd = () => router.push({ name: 'changeLoginPassword' })
const onChangePayPwd = () => router.push({ name: 'changeWithdrawPassword' })

const selectGender = (value) => {
  const current = userStore.userInfo || {}
  userStore.userInfo = { ...current, gender: value }
  showGenderPopup.value = false
  toast.success('设置成功')
}

const confirmBirthday = () => {
  const [year, month, day] = birthdayValues.value
  const current = userStore.userInfo || {}
  userStore.userInfo = {
    ...current,
    birthday: `${year}-${month}-${day}`
  }
  showBirthdayPopup.value = false
  toast.success('设置成功')
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/edit-profile.less';
</style>


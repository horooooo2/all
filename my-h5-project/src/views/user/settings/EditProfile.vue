<template>
  <div class="edit-profile-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>编辑个人资料</h1>
    </header>

    <section class="profile-card">
        <div class="profile-main">
          <div class="avatar-wrap">
            <img :src="displayAvatar" alt="avatar" @error="onAvatarError">
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
            <img
              :src="iconCopy"
              alt="复制账号"
              class="right-icon"
              role="button"
              tabindex="0"
              @click.stop="onCopyAccount"
              @keydown.enter.prevent.stop="onCopyAccount"
              @keydown.space.prevent.stop="onCopyAccount"
            >
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
            <span class="right-text" :class="{ 'right-text--unset': !user.realName }">
              {{ user.realName || '未设置' }}
            </span>
            <img :src="iconGo" alt="go" class="right-icon">
          </span>
        </button>

        <button type="button" class="menu-row" @click="onEditPhone">
          <span class="menu-row-inner">
            <img :src="iconContactInformation" alt="" class="menu-icon-img">
            <span>联系方式</span>
          </span>
          <span class="right-wrap">
            <span class="right-text">{{ user.contactDisplay }}</span>
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
            <span>{{ user.hasWithdrawPassword ? '更改取款密码' : '设置取款密码' }}</span>
          </span>
          <span class="right-wrap">
            <span
              class="right-text"
              :class="{ 'right-text--unset': !user.hasWithdrawPassword }"
            >
              {{ user.hasWithdrawPassword ? '已设置' : '未设置' }}
            </span>
            <img :src="iconGo" alt="go" class="right-icon">
          </span>
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
import avatarDefault from '@/assets/touxiang2.png'
import { useUserStore } from '@/stores/user'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { genderLabelToCode, mapUserInfoToEditView } from '@/api/auth'
import { getProfileDetail, pickAvatarUrlFromUpload } from '@/api/profile'
import { uploadAvatar } from '@/api/user'
import { useProfileSave } from '@/composables/useProfileSave'
import toast from '@/components/Toast'
import { copyTextToClipboard } from '@/utils/copyText'
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
const { displayAvatar: profileAvatar } = useUserAvatar()
const { isSubmitting, saveProfile } = useProfileSave()

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
  if (!value) return new Date()
  const [year, month, day] = String(value).split('-')
  const d = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(d.getTime()) ? new Date() : d
}

const birthdayValues = ref(['2000', '01', '01'])

const syncBirthdayPicker = () => {
  const d = parseBirthday(userStore.userInfo?.birthday)
  birthdayValues.value = [
    `${d.getFullYear()}`,
    `${d.getMonth() + 1}`.padStart(2, '0'),
    `${d.getDate()}`.padStart(2, '0')
  ]
}

const user = computed(() => mapUserInfoToEditView(userStore.userInfo))

const displayAvatar = computed(() => avatarPreview.value || profileAvatar.value)

const onAvatarError = (e) => {
  const el = e?.target
  if (!el || el.src === avatarDefault) return
  el.src = avatarDefault
}

const loadProfile = async () => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/edit-profile' } })
    return
  }

  try {
    const detail = await getProfileDetail()
    userStore.setProfile(detail)
    avatarPreview.value = ''
    syncBirthdayPicker()
  } catch (error) {
    console.error('加载个人信息失败:', error)
    toast.error('加载个人资料失败')
  }
}

onMounted(() => {
  if (!userStore.userInfo) {
    loadProfile()
  } else {
    avatarPreview.value = ''
    syncBirthdayPicker()
  }
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

const onAvatarAfterRead = async (file) => {
  if (isSubmitting.value) return

  const item = Array.isArray(file) ? file[0] : file
  const rawFile = item?.file
  if (!rawFile) return

  const localUrl = item.content || URL.createObjectURL(rawFile)
  avatarPreview.value = localUrl

  isSubmitting.value = true
  toast.loading('上传中...')

  try {
    const uploadRes = await uploadAvatar(rawFile)
    const avatarUrl = pickAvatarUrlFromUpload(uploadRes)
    if (!avatarUrl) {
      toast.hideLoading()
      toast.error('头像上传失败，请重试')
      avatarPreview.value = ''
      return
    }
    await userStore.patchProfile({ avatar_url: avatarUrl })
    avatarPreview.value = ''
    toast.hideLoading()
    toast.success('头像已更新')
  } catch (error) {
    toast.hideLoading()
    console.error('更新头像失败:', error)
    avatarPreview.value = ''
  } finally {
    isSubmitting.value = false
  }
}

const onCopyAccount = async () => {
  const text = String(userStore.userInfo?.username || user.value.account || '').trim()
  if (!text || text === '--') {
    toast.warning('暂无可复制账号')
    return
  }
  const ok = await copyTextToClipboard(text)
  if (ok) {
    toast.success('账号已复制')
  } else {
    toast.error('复制失败，请长按账号手动复制')
  }
}

const onEditNickname = () => router.push({ name: 'setNickname' })
const onEditGender = () => {
  showGenderPopup.value = true
}
const onEditBirthday = () => {
  syncBirthdayPicker()
  showBirthdayPopup.value = true
}
const onEditRealName = () => router.push({ name: 'setRealName' })
const onEditPhone = () => router.push({ name: 'setContactInfo' })
const onWithdrawAccount = () => router.push({ name: 'withdrawalAccounts' })
const onChangeLoginPwd = () => router.push({ name: 'changeLoginPassword' })
const onChangePayPwd = () => router.push({ name: 'changeWithdrawPassword' })

const selectGender = async (value) => {
  if (isSubmitting.value) return
  const ok = await saveProfile({ gender: genderLabelToCode(value) })
  if (ok) {
    showGenderPopup.value = false
  }
}

const confirmBirthday = async () => {
  if (isSubmitting.value) return
  const [year, month, day] = birthdayValues.value
  const ok = await saveProfile({ birthday: `${year}-${month}-${day}` })
  if (ok) {
    showBirthdayPopup.value = false
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/edit-profile.less';
</style>

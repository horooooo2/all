<template>
  <div class="register-page">
    <div class="login-top">
    <header class="login-header">
      <div class="login-header-row">
        <BrandLogo class="logo" alt="LOGO" />
        <div class="icon-btn" aria-label="关闭" @click="goBack">
          <img src="@/assets/icon_x.svg" alt="关闭" />
        </div>
      </div>
      <div class="login-header-row">
        <div class="title">用户注册</div>
        <div class="icon-btn" aria-label="语言" @click="showLangPopup = true">
          <img src="@/assets/icon_en.svg" alt="language" />
        </div>
      </div>
    </header>

    <form class="login-form" @submit.prevent="handleRegister">
      <div class="login-field-wrap">
        <div class="icon-placeholder">
          <img src="@/assets/icon_login_account.svg" alt="账号" />
        </div>
        <input
          v-model="username"
          type="text"
          placeholder="输入账号"
          autocomplete="username"
        />
      </div>

      <div class="login-field-wrap">
        <div class="icon-placeholder">
          <img src="@/assets/icon_login_password.svg" alt="密码" />
        </div>
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="输入密码"
          autocomplete="new-password"
        />
        <div class="toggle-pwd" aria-label="切换密码可见" @click="showPassword = !showPassword">
          <div class="icon-placeholder">
            <img
              v-if="showPassword"
              src="@/assets/icon_login_invisible_dark.svg"
              alt="隐藏密码"
            />
            <img
              v-else
              src="@/assets/icon_login_visible.svg"
              alt="查看密码"
            />
          </div>
        </div>
      </div>

      <div class="login-field-group">
        <div class="login-field-wrap">
          <div class="icon-placeholder">
            <img src="@/assets/icon_login_passwordy.svg" alt="确认密码" />
          </div>
          <input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="确认密码"
            autocomplete="new-password"
          />
          <div class="toggle-pwd" aria-label="切换确认密码可见" @click="showConfirmPassword = !showConfirmPassword">
            <div class="icon-placeholder">
              <img
                v-if="showConfirmPassword"
                src="@/assets/icon_login_invisible_dark.svg"
                alt="隐藏密码"
              />
              <img
                v-else
                src="@/assets/icon_login_visible.svg"
                alt="查看密码"
              />
            </div>
          </div>
        </div>
        <div
          v-if="showPasswordMismatch"
          class="register-pwd-hint"
          role="alert"
        >
          <img src="@/assets/icon_exclamation_red.svg" alt="" />
          <span>两次密码不一致，请检查</span>
        </div>
      </div>

      <div class="login-field-wrap">
        <div class="icon-placeholder">
          <img src="@/assets/icon_yqm.svg" alt="邀请码" />
        </div>
        <input
          v-model="inviteCode"
          type="text"
          placeholder="邀请码(非必填)"
        />
      </div>

      <div class="login-field-wrap">
        <div class="icon-placeholder">
          <img src="@/assets/icon_login_account.svg" alt="TG 或手机号" />
        </div>
        <input
          v-model="contact"
          type="text"
          placeholder="填写您的TG用户名或者手机号"
        />
      </div>

      <p class="register-tip">
        为了您的资金安全，添加小助手TG验证优先出款，心中下载网址:xz333.com
        手机加国家区号，如:852 55555555
      </p>

      <button
        type="submit"
        class="login-btn"
        :class="{ disabled: !canSubmit || isSubmitting }"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? '注册中...' : '注册' }}
      </button>
    </form>
    </div>

    <div class="login-divider">
      <span>快捷登录</span>
    </div>
    <div class="login-quick-wrap">
      <div class="quick-icon">
        <img src="@/assets/telegram.svg" alt="telegram" />
      </div>
    </div>

    <div class="login-actions">
      <button type="button" @click="goService">
        <div class="icon-placeholder">
          <img src="@/assets/icon_zxkf.svg" alt="在线客服" />
        </div>
        <span>在线客服</span>
      </button>
      <button type="button" @click="goLogin">
        <div class="icon-placeholder">
          <img src="@/assets/icon_zc.svg" alt="前往登录" />
        </div>
        <span>前往登录</span>
      </button>
    </div>

    <label class="login-agree">
      <input v-model="agree" type="checkbox" />
      <span class="agree-check">
        <img
          v-if="agree"
          src="@/assets/icon_sel.svg"
          alt="checked"
        />
        <img
          v-else
          src="@/assets/icon_usel.svg"
          alt="unchecked"
        />
      </span>
      <span class="text">
        登录/注册表示您已同步本平台的
        <a class="link" href="#">用户协议</a>
        和
        <a class="link" href="#">隐私协议</a>
      </span>
    </label>

    <LangPopup v-model:show="showLangPopup" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LangPopup from '@/components/LangPopup.vue'
import { toast } from '@/components/Toast'
import { register } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const inviteCode = ref('')
const contact = ref('')
const agree = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLangPopup = ref(false)
const isSubmitting = ref(false)

const showPasswordMismatch = computed(
  () => !!confirmPassword.value && password.value !== confirmPassword.value
)

const canSubmit = computed(() =>
  !!username.value &&
  !!password.value &&
  !!confirmPassword.value &&
  !showPasswordMismatch.value &&
  !!contact.value &&
  agree.value
)

const goBack = () => router.replace('/')
const goLogin = () => router.push('/login')
const goService = () => router.push('/service')

const handleRegister = async () => {
  if (isSubmitting.value || !canSubmit.value) return
  isSubmitting.value = true
  toast.loading('注册中...')
  try {
    const result = await register({
      username: username.value,
      password: password.value,
      confirm_password: confirmPassword.value,
      invite_code: inviteCode.value,
      contact: contact.value
    })
    await userStore.establishSession(result)
    toast.success('注册成功', 500)
    setTimeout(() => {
      router.replace('/')
    }, 500)
  } catch (error) {
    console.error('注册失败:', error)
    toast.hideLoading()
    isSubmitting.value = false
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/register.less';
</style>


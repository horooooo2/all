<template>
  <div class="login-page">
    <div class="login-top">
    <header class="login-header">
      <div class="login-header-row">
        <BrandLogo class="logo" alt="LOGO" />
        <div class="icon-btn" aria-label="关闭" @click="goBack">
          <img src="@/assets/icon_x.svg" alt="关闭" />
        </div>
      </div>
      <div class="login-header-row">
        <div class="title">用户登录</div>
        <div type="button" class="icon-btn" aria-label="语言" @click="showLangPopup = true">
          <img src="@/assets/icon_en.svg" alt="language" />
        </div>
      </div>
    </header>

    <form class="login-form" @submit.prevent="handleLogin">
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
          autocomplete="current-password"
        />
        <div type="button" class="toggle-pwd" aria-label="切换密码可见" @click="showPassword = !showPassword">
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

      <label class="login-remember">
        <input v-model="remember" type="checkbox" />
        <span class="agree-check">
          <img
            v-if="remember"
            src="@/assets/icon_sel.svg"
            alt="checked"
          />
          <img
            v-else
            src="@/assets/icon_usel.svg"
            alt="unchecked"
          />
        </span>
        <span>记住密码</span>
      </label>

      <button
        type="submit"
        class="login-btn"
        :class="{ disabled: !canSubmit || isSubmitting }"
        :disabled="!canSubmit || isSubmitting"
      >
        {{ isSubmitting ? '登录中...' : '登录' }}
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
      <button type="button" @click="goRegister">
        <div class="icon-placeholder">
          <img src="@/assets/icon_zc.svg" alt="用户注册" />
        </div>
        <span>用户注册</span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LangPopup from '@/components/LangPopup.vue'
import { toast } from '@/components/Toast'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import {
  getLoginRemember,
  saveLoginRemember,
  clearLoginRemember
} from '@/utils/loginRemember'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const agree = ref(false)
const showLangPopup = ref(false)
const isSubmitting = ref(false)

const canSubmit = computed(
  () => !!username.value && !!password.value && agree.value
)

const resolveRedirect = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }
  return '/'
}

const persistRemember = () => {
  if (remember.value) {
    saveLoginRemember({
      remember: true,
      username: username.value,
      password: password.value
    })
  } else {
    clearLoginRemember()
  }
}

onMounted(() => {
  const saved = getLoginRemember()
  if (saved.remember) {
    remember.value = true
    username.value = saved.username
    password.value = saved.password
    if (saved.username && saved.password) {
      agree.value = true
    }
  }
})

watch(remember, (checked) => {
  if (!checked) {
    clearLoginRemember()
  }
})

const goBack = () => router.replace('/')
const goRegister = () => router.push('/register')
const goService = () => router.push('/service')

const handleLogin = async () => {
  if (isSubmitting.value || !canSubmit.value) return
  isSubmitting.value = true
  toast.loading('登录中...')
  try {
    const result = await login({
      username: username.value,
      password: password.value
    })
    await userStore.establishSession(result)
    persistRemember()
    toast.success('登录成功', 500)
    setTimeout(() => {
      router.replace(resolveRedirect())
    }, 500)
  } catch (error) {
    console.error('登录失败:', error)
    toast.hideLoading()
    isSubmitting.value = false
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/login.less';
</style>

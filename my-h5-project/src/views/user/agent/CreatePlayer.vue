<template>
  <div class="agent-subpage create-player-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>创建玩家</h1>
    </header>

    <van-tabs
      v-model:active="topTab"
      class="cp-tabs cp-tabs--top"
      :ellipsis="false"
      :line-width="140"
      :line-height="3"
      color="#1f78ff"
      title-active-color="var(--text-color)"
      title-inactive-color="#8D9FC7"
    >
      <van-tab title="账号创建" name="account" />
      <van-tab title="链接创建" name="link" />
    </van-tabs>

    <!-- 账号创建 -->
    <template v-if="topTab === 'account'">
      <div class="cp-form">
        <div class="cp-field">
          <div class="cp-label">玩家账户</div>
          <div class="cp-input-wrap">
            <img class="cp-left-img" :src="iconLoginAccount" alt="">
            <input
              v-model.trim="account"
              class="cp-input"
              type="text"
              autocomplete="off"
              placeholder="请输入6-10位字母数字组合"
            >
          </div>
        </div>

        <div class="cp-field">
          <div class="cp-label">玩家账户</div>
          <div class="cp-input-wrap">
            <img class="cp-left-img" :src="iconLoginPassword" alt="">
            <input
              v-model="password"
              class="cp-input"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="请输入密码"
            >
            <button type="button" class="cp-eye" aria-label="显示/隐藏密码" @click="showPwd = !showPwd">
              <img
                v-if="showPwd"
                class="cp-eye-img"
                :src="iconLoginInvisible"
                alt=""
              >
              <img
                v-else
                class="cp-eye-img"
                :src="iconLoginVisible"
                alt=""
              >
            </button>
          </div>
        </div>
      </div>

      <van-tabs
        v-model:active="midTab"
        class="cp-tabs cp-tabs--mid"
        :ellipsis="false"
        :line-width="140"
        :line-height="3"
        color="#1f78ff"
        title-active-color="var(--text-color)"
        title-inactive-color="#8D9FC7"
      >
        <van-tab title="赚取返水" name="rebate" />
        <van-tab title="待遇设置" name="treatment" />
      </van-tabs>

      <div v-if="midTab === 'rebate'" class="cp-rebate">
        <div class="cp-table">
          <div class="cp-table-head">
            <span class="cp-th">类型</span>
            <span class="cp-th cp-th--right">增减返水</span>
            <button type="button" class="cp-collapse" @click="rebateExpanded = !rebateExpanded">
              <img
                class="cp-collapse-icon"
                :src="rebateExpanded ? iconDetailsTop : iconDetailsDown"
                alt=""
              >
            </button>
          </div>

          <template v-if="rebateExpanded">
            <div
              v-for="row in rebateRows"
              :key="row.key"
              class="cp-row"
            >
              <span class="cp-td">{{ row.label }}</span>
              <span class="cp-td cp-td--right">
                <button type="button" class="cp-percent-btn" @click="openPercentPicker(row)">
                  <span class="cp-percent">{{ row.percent }}</span>
                  <van-icon name="arrow-down" />
                </button>
              </span>
            </div>
          </template>
        </div>

        <div class="cp-divider-title">
          <span>彩票返水</span>
          <button type="button" class="cp-divider-action" @click="lotteryExpanded = !lotteryExpanded">
            <img
              class="cp-divider-icon"
              :src="lotteryExpanded ? iconDetailsTop : iconDetailsDown"
              alt=""
            >
          </button>
        </div>

        <div v-if="lotteryExpanded" class="cp-table cp-table--lottery">
          <div class="cp-table-head">
            <span class="cp-th">类型</span>
            <span class="cp-th cp-th--right">增减返水</span>
          </div>

          <div
            v-for="row in lotteryRows"
            :key="row.key"
            class="cp-row"
          >
            <span class="cp-td">{{ row.label }}</span>
            <span class="cp-td cp-td--right">
              <button type="button" class="cp-percent-btn" @click="openPercentPicker(row)">
                <span class="cp-percent">{{ row.percent }}</span>
                <van-icon name="arrow-down" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <div v-else class="cp-todo">
        <div class="cp-todo-card">
          <div class="cp-todo-title">待遇设置</div>
          <div class="cp-todo-desc">该模块待对接接口后完善</div>
        </div>
      </div>

      <div class="cp-bottom">
        <button type="button" class="cp-primary-btn" @click="onCreateAccount">创建账户</button>
      </div>
    </template>

    <!-- 链接创建 -->
    <template v-else>
      <div class="cp-link-list">
        <div v-for="item in links" :key="item.id" class="cp-link-card">
          <button type="button" class="cp-link-head" @click="goLinkDetail(item)">
            <span class="cp-link-title">链接名称： {{ item.title }}</span>
            <van-icon name="arrow" />
          </button>
          <div class="cp-link-body">
            <div class="cp-link-url">{{ item.url }}</div>
            <button type="button" class="cp-link-copy" @click="copyText(item.url)">复制</button>
          </div>
          <div class="cp-link-foot">
            <button type="button" class="cp-default" @click="defaultLinkId = item.id">
              <img
                class="cp-default-icon"
                :src="defaultLinkId === item.id ? iconYes : iconUncheck"
                alt=""
              >
              <span>设为默认</span>
            </button>
            <button type="button" class="cp-link-qr" @click="toast.success('分享二维码（待对接）')">分享二维码</button>
          </div>
        </div>
      </div>

      <div class="cp-bottom cp-bottom--link">
        <button type="button" class="cp-primary-btn" @click="onGenerateLink">生成链接</button>
      </div>
    </template>

    <van-popup
      v-model:show="pickerVisible"
      position="bottom"
      round
      class="selection-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="selection-sheet">
        <div class="selection-sheet-header">
          <button type="button" class="selection-close-btn" @click="pickerVisible = false">取消</button>
          <div class="selection-sheet-title">{{ pickerTitle }}</div>
          <button type="button" class="selection-confirm-btn" @click="confirmPicker">确认</button>
        </div>
        <div class="cp-picker-wrap">
          <van-picker
            v-model="pickerValues"
            :columns="pickerOptions"
            :show-toolbar="false"
          />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.png'
import iconLoginAccount from '@/assets/icon_login_account.png'
import iconLoginPassword from '@/assets/icon_login_password.png'
import iconLoginVisible from '@/assets/icon_login_visible.png'
import iconLoginInvisible from '@/assets/icon_login_invisible_dark.png'
import iconDetailsDown from '@/assets/icon_details_down.png'
import iconDetailsTop from '@/assets/icon_details_top.png'
import iconYes from '@/assets/icon_yes.png'
import toast from '@/components/Toast'

const router = useRouter()
const goBack = () => router.back()

const topTab = ref('account') // account | link
const midTab = ref('rebate') // rebate | treatment

const account = ref('')
const password = ref('abc123456')
const showPwd = ref(false)
const rebateExpanded = ref(true)
const lotteryExpanded = ref(true)

const rebateRows = ref([
  { key: 'electronic', label: '电子', percent: '0%' },
  { key: 'chess', label: '棋牌', percent: '0%' },
  { key: 'video', label: '视讯', percent: '0%' },
  { key: 'fishing', label: '捕鱼', percent: '0%' },
  { key: 'sports', label: '体育', percent: '0%' },
  { key: 'lottery', label: '彩票', percent: '0%' }
])

const lotteryRows = ref([
  { key: 'c28_1', label: '加拿大28', percent: '0%' },
  { key: 'c28_2', label: '加拿大28', percent: '0%' },
  { key: 'c28_3', label: '加拿大28', percent: '0%' },
  { key: 'c28_4', label: '加拿大28', percent: '0%' },
  { key: 'c28_5', label: '加拿大28', percent: '0%' },
  { key: 'c28_6', label: '加拿大28', percent: '0%' },
  { key: 'c28_7', label: '加拿大28', percent: '0%' },
  { key: 'c28_8', label: '加拿大28', percent: '0%' }
])

const pickerVisible = ref(false)
const pickerRowKey = ref('')
const pickerValues = ref(['0%'])
const pickerTitle = ref('电子')

const pickerOptions = computed(() => ([
  { text: '0%', value: '0%' },
  { text: '0.025%', value: '0.025%' },
  { text: '0.05%', value: '0.05%' },
  { text: '0.075%', value: '0.075%' },
  { text: '0.1%', value: '0.1%' }
]))

const openPercentPicker = (row) => {
  pickerRowKey.value = row.key
  pickerTitle.value = row.label
  pickerValues.value = [row.percent]
  pickerVisible.value = true
}

const confirmPicker = () => {
  const picked = pickerValues.value?.[0] ?? '0%'
  const update = (arr) => {
    const target = arr.value.find((r) => r.key === pickerRowKey.value)
    if (target) target.percent = picked
  }
  update(rebateRows)
  update(lotteryRows)
  pickerVisible.value = false
}

const onCreateAccount = () => {
  toast.success('创建账户（待对接）')
}

// 链接创建
const links = ref([
  {
    id: 'l1',
    title: '该链接赚取返水为0',
    url: 'https://web.bmdeby.com/app/home'
  },
  {
    id: 'l2',
    title: '该链接赚取返水为0',
    url: 'https://web.bmdeby.com/app/home'
  }
])
const defaultLinkId = ref('l1')
const iconUncheck =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="none" stroke="#C4D3F1" stroke-width="2"/></svg>`
  )

const copyText = async (text) => {
  try {
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text)
    else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    toast.success('已复制')
  } catch {
    toast.error('复制失败')
  }
}

const goLinkDetail = (item) => {
  router.push({ name: 'linkDetail', query: { id: item.id } })
}

const onGenerateLink = () => {
  toast.success('生成链接（待对接）')
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/selection-sheet-popup.less';
@import '@/styles/pages/create-player.less';
</style>


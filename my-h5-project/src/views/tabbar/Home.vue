<template>
  <div class="home">
    <div class="header">
      <img class="logo" src="@/assets/logo.svg" alt="LOGO"/>
      <div v-if="userStore.isLogin" class="user-avatar">
        <img src="" alt="avatar"/>
      </div>
      <div v-else class="user-language" @click="showLangPopup = true">
        <img src="@/assets/icon_en.svg" alt="language"/>
      </div>
    </div>

    <div v-if="loading.banner" class="banner-wrapper">
      <div class="skeleton-block banner-skeleton shimmer"></div>
    </div>
    <div v-else class="banner-wrapper">
      <van-swipe class="banner-swipe" :autoplay="3000" :loop="true" @change="current = $event">
        <van-swipe-item v-for="(item, index) in banners" :key="index">
          <img :src="item.image" class="banner-image"/>
        </van-swipe-item>
        <template #indicator>
          <div class="custom-indicator">
            <span v-for="(item, index) in banners" :key="index"
                  class="dot" :class="{ active: current === index }"></span>
          </div>
        </template>
      </van-swipe>
    </div>

    <div class="fund-card">
      <div class="announcement">
        <img class="icon-20" src="@/assets/icon_announcement.png" alt="" />
        <div class="announcement-marquee">
          <div class="notice-bar">{{ $t('马年迎新春，电子老虎机最高领取888元，更有现金') }}</div>
        </div>
      </div>

      <div class="fund-box">
        <div class="fund-section">
          <template v-if="!userStore.isLogin">
            <div class="login-tip">{{ $t('您当前尚未登录') }}</div>
            <div class="login-actions">
              <button class="login-btn" @click="goLogin">{{ $t('登录') }}</button>
              <button class="register-btn" @click="goRegister">{{ $t('注册') }}</button>
            </div>
          </template>
          <template v-else>
            <div class="left-info">
              <div class="vip-row">
                <span>{{ userStore.userInfo?.name || $t('ACYOM VIPO') }}</span>
                <img src="@/assets/icon_vip_00.svg" alt="VIP" />
              </div>
              <div class="balance-row">
                <img src="@/assets/icon_usdt.svg" alt="USDT" />
                <span>$ {{ userStore.userInfo?.balance?.toLocaleString() || '89,685.50' }}</span>
              </div>
            </div>
          </template>
        </div>

        <div class="right-actions">
          <div class="action-btn" v-for="btn in actions" :key="btn.name">
            <img :src="btn.icon" :alt="btn.name" />
            <span>{{ $t(btn.name) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading.games" class="game-section">
      <div class="game-grid">
        <div v-for="i in 4" :key="i" class="game-card-skeleton shimmer"></div>
      </div>
    </div>
    <div v-else class="game-section">
      <div class="game-grid">
        <div
          class="game-card"
          v-for="item in gameList"
          :key="item.id"
          :style="{ backgroundImage: `url(${item.bg})` }"
        >
          <div class="game-name">{{ $t(item.name) }}</div>
          <div class="game-time" :class="{ waiting: item.status === 'waiting' }">
            {{ item.status === 'waiting' ? $t('等待开盘') : formatTime(item.remaining) }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading.category" class="game-category">
      <div class="category-grid">
        <div v-for="i in 6" :key="i" class="category-item-skeleton shimmer"></div>
      </div>
    </div>
    <div v-else class="game-category">
      <div class="category-grid">
        <div
          class="category-item"
          v-for="item in categoryList"
          :key="item.id"
          role="button"
          tabindex="0"
          @click="goGameHall(item.key)"
          @keydown.enter.prevent="goGameHall(item.key)"
        >
          <img :src="item.icon" :alt="item.name" />
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
    </div>

    <div class="help-section">
      <div class="help-left">
        <img src="@/assets/icon_hlepc.png" :alt="$t('帮助中心')" />
        <span>{{ $t('帮助中心') }}</span>
      </div>
      <div class="help-grid">
        <div class="help-item" v-for="item in helpList" :key="item.id">
          <img :src="item.icon" :alt="item.name" />
          <span>{{ $t(item.name) }}</span>
        </div>
      </div>
    </div>

    <div v-if="loading.winners" class="recent-winners-section">
      <div class="section-label">
        <div class="skeleton-block title-skeleton shimmer"></div>
      </div>
      <div class="winners-card">
        <div class="bonus-header-skeleton shimmer"></div>
        <div v-for="i in 4" :key="i" class="list-item-skeleton shimmer"></div>
      </div>
    </div>
    <div v-else class="recent-winners-section">
      <div class="section-label">
        <img src="@/assets/icon_winners.png" :alt="$t('近期大奖')" />
        <span>{{ $t('近期大奖') }}</span>
      </div>
      <div class="winners-card">
        <div class="bonus-header">
          <img src="@/assets/icon_jianj.png" alt="奖金" />
          <div class="bonus-info">
            <span class="label">{{ $t('过去30天内发放的奖金') }}</span>
            <div class="amount">
              <img src="@/assets/icon_cny.svg" alt="CNY" />
              <span>¥890,685.50</span>
            </div>
          </div>
        </div>
        <div class="winners-list">
          <div class="list-item" v-for="(item, index) in winnerList" :key="index">
            <div class="user-info">
              <img :src="item.avatar" alt="avatar" class="avatar" />
              <span class="name">{{ $t(item.name) }}</span>
            </div>
            <div class="amount">
              <span>{{ item.amount }}</span>
              <img src="@/assets/icon_cny.svg" alt="CNY" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="community-section">
      <div class="section-label">
        <img src="@/assets/icon_sq.png" :alt="$t('社区')" />
        <span>{{ $t('社区') }}</span>
      </div>
      <div class="community-scroll">
        <div class="community-item" v-for="(item, index) in communityList" :key="index">
          <img :src="item.icon" :alt="item.name" />
        </div>
      </div>
    </div>

    <div class="partners-section">
      <div class="section-label">
        <img src="@/assets/icon_hz.png" :alt="$t('合作供应商')" />
        <span>{{ $t('合作供应商') }}</span>
      </div>
      <div class="partners-grid">
        <div class="partner-item" v-for="(item, index) in partnerList" :key="index">
          {{ $t(item.name) }}
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div class="service-label">{{ $t('服务中心') }}</div>
      <div class="service-links">
        <span>{{ $t('隐私政策') }}</span><span class="dot">·</span>
        <span>{{ $t('用户协议') }}</span><span class="dot">·</span>
        <span>{{ $t('帮助中心') }}</span><span class="dot">·</span>
        <span>{{ $t('关于我们') }}</span>
      </div>
      <div class="company-name">28娱乐</div>
      <div class="company-desc">
        {{ $t('company.description') }}
      </div>
    </div>
    <LangPopup v-model:show="showLangPopup" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LangPopup from '@/components/LangPopup.vue'
import { toast } from '@/components/Toast'
import iconTy from '@/assets/icon_ty.png'
import iconSx from '@/assets/icon_sx.png'
import iconDz from '@/assets/icon_dz.png'
import iconCp from '@/assets/icon_cp.png'
import iconBy from '@/assets/icon_by.png'
import iconQp from '@/assets/icon_qp.png'
import iconDeposit from '@/assets/icon_deposit.svg'
import iconWithdrawal from '@/assets/icon_withdrawal.svg'
import iconActing from '@/assets/icon_acting.svg'
import iconKefu from '@/assets/icon_kefu.png'
import iconUsdtjc from '@/assets/icon_usdtjc.png'
import iconPromotionLink from '@/assets/icon_invitation_link.png'
import iconYqm from '@/assets/icon_yqm.svg'
import iconTelegram from '@/assets/telegram.svg'
import iconWhatsapp from '@/assets/whatsapp.svg'
import iconTeams from '@/assets/teams.svg'
import iconX from '@/assets/x.svg'
import iconSlack from '@/assets/slack.svg'
import iconFacebook from '@/assets/facebook.svg'
import homeBtcIcon from '@/assets/home_btc_icon.png'
import homeTw28Icon from '@/assets/home_tw28_icon.png'
import homeJnd28Icon from '@/assets/home_jnd28_icon.png'
import homeJndx28Icon from '@/assets/home_jndx28_icon.png'
import lunbo1 from '@/assets/lunbo1.png'

const current = ref(0)
const router = useRouter()
const userStore = useUserStore()
const showLangPopup = ref(false)

const loading = ref({
  banner: true,
  games: true,
  category: true,
  winners: true
})

const fetchData = async () => {
  await new Promise(resolve => setTimeout(resolve, 100))

  banners.value = Array.from({ length: 3 }, () => ({ image: lunbo1 }))

  gameList.value = [
    { id: 1, name: '比特币28', key: 'btc', bg: homeBtcIcon, remaining: 176, status: 'playing' },
    { id: 2, name: '台湾宾果28', key: 'tw28', bg: homeTw28Icon, remaining: 0, status: 'waiting' },
    { id: 3, name: '加拿大28', key: 'jnd28', bg: homeJnd28Icon, remaining: 122, status: 'playing' },
    { id: 4, name: '加拿大西28', key: 'jndx28', bg: homeJndx28Icon, remaining: 113, status: 'playing' }
  ]

  categoryList.value = [
    { id: 1, name: '体育', key: 'ty', icon: iconTy },
    { id: 2, name: '视讯', key: 'sx', icon: iconSx },
    { id: 3, name: '电子', key: 'dz', icon: iconDz },
    { id: 4, name: '彩票', key: 'cp', icon: iconCp },
    { id: 5, name: '捕鱼', key: 'by', icon: iconBy },
    { id: 6, name: '棋牌', key: 'qp', icon: iconQp }
  ]

  winnerList.value = [
    { name: '刘德华', avatar: '', amount: '¥890,685.50' },
    { name: '刘德华', avatar: '', amount: '¥890,685.50' },
    { name: '刘德华', avatar: '', amount: '¥890,685.50' },
    { name: '刘德华', avatar: '', amount: '¥890,685.50' }
  ]

  loading.value = {
    banner: false,
    games: false,
    category: false,
    winners: false
  }
}

const banners = ref([])
const categoryList = ref([])
const actions = ref([
  { name: '存款', icon: iconDeposit },
  { name: '取款', icon: iconWithdrawal },
  { name: '代理', icon: iconActing }
])
const gameList = ref([])
const helpList = ref([
  { id: 1, name: '在线客服', icon: iconKefu },
  { id: 2, name: 'USDT教程', icon: iconUsdtjc },
])
const winnerList = ref([])
const communityList = ref([
  { name: 'telegram', icon: iconTelegram },
  { name: 'whatsapp', icon: iconWhatsapp },
  { name: 'teams', icon: iconTeams },
  { name: 'x', icon: iconX },
  { name: 'slack', icon: iconSlack },
  { name: 'facebook', icon: iconFacebook }
])
const partnerList = ref(Array(6).fill({ name: 'PLAYACE' }))

const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

const goLogin = () => router.push('/login')
const goRegister = () => router.push('/register')
const goGameHall = (key) => router.push({ path: '/game-hall', query: { category: key } })

let timer
onMounted(() => {
  fetchData()
  timer = setInterval(() => {
    gameList.value.forEach(item => {
      if (item.status === 'playing' && item.remaining > 0) item.remaining--
    })
  }, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
@import '@/styles/pages/home.less';
</style>

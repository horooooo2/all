<template>
  <div class="home">
    <div class="header">
      <BrandLogo class="logo" alt="LOGO" />
      <div v-if="userStore.isLogin" class="user-avatar">
        <img
          :src="displayAvatar"
          alt="avatar"
          @error="onAvatarError"
        />
      </div>
      <div v-else class="user-language" @click="showLangPopup = true">
        <img src="@/assets/icon_en.svg" alt="language"/>
      </div>
    </div>

    <HomeSectionSkeleton v-if="loading.banner" section="banner" />
    <div v-else class="banner-wrapper">
      <van-swipe
        v-if="banners.length"
        class="banner-swipe"
        :autoplay="3000"
        :loop="banners.length > 1"
        @change="current = $event"
      >
        <van-swipe-item
          v-for="item in banners"
          :key="item.id"
          @click="onBannerClick(item)"
        >
          <img :src="item.image" class="banner-image" alt="">
        </van-swipe-item>
        <template #indicator>
          <div class="custom-indicator">
            <span
              v-for="(item, index) in banners"
              :key="item.id"
              class="dot"
              :class="{ active: current === index }"
            />
          </div>
        </template>
      </van-swipe>
    </div>

    <div class="fund-card">
      <HomeSectionSkeleton v-if="loading.notice" section="notice" />
      <div v-else class="announcement">
        <img class="icon-20" src="@/assets/icon_announcement.png" alt="" />
        <div class="announcement-marquee">
          <div class="notice-bar">{{ noticeMarqueeText }}</div>
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
                <img :src="vipLevelIcon" alt="VIP" />
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

    <HomeSectionSkeleton v-if="loading.games" section="games" />
    <div v-else class="game-section">
      <div class="game-grid">
        <div
          class="game-card"
          :class="{ 'game-card--maintenance': item.isClosed }"
          v-for="item in gameList"
          :key="item.id"
          role="button"
          :tabindex="item.isOpen ? 0 : -1"
          :style="{ backgroundImage: `url(${item.bg})` }"
          @click="goSelfLottery(item)"
          @keydown.enter.prevent="goSelfLottery(item)"
          @keydown.space.prevent="goSelfLottery(item)"
        >
          <div class="game-card__body">
            <div class="game-name">{{ $t(item.name) }}</div>
            <div
              v-if="!item.isClosed"
              class="game-time"
              :class="{ waiting: item.isWaiting }"
            >
              {{ item.isWaiting ? $t('等待开盘') : formatTime(item.remaining) }}
            </div>
          </div>
          <div v-if="item.isClosed" class="game-card__maintenance">
            <div class="game-card__maintenance-title">
              <img
                class="game-card__maintenance-icon"
                :src="iconVenueMaintenance"
                alt=""
                aria-hidden="true"
              />
              <span>场馆维护中</span>
            </div>
            <div class="game-card__maintenance-time">开始：{{ item.maintenanceStart }}</div>
            <div class="game-card__maintenance-time">结束：{{ item.maintenanceEnd }}</div>
          </div>
        </div>
      </div>
    </div>

    <HomeSectionSkeleton v-if="loading.category" section="category" />
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

    <HomeSectionSkeleton v-if="loading.winners" section="winners" />
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
              <span>{{ awardTotalAmount }}</span>
            </div>
          </div>
        </div>
        <div class="winners-list">
          <div
            v-for="(item, index) in winnerList"
            :key="`${item.nickname}-${item.payoutAt}-${index}`"
            class="list-item"
          >
            <div class="user-info">
              <img
                :src="item.gameIconUrl || avatarDefault"
                :alt="item.gameName || item.nickname"
                class="avatar"
                @error="onWinnerAvatarError"
              />
              <span class="name">{{ item.nickname }}</span>
            </div>
            <div class="amount">
              <span>{{ item.displayAmount }}</span>
              <img src="@/assets/icon_cny.svg" alt="CNY" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <HomeSectionSkeleton v-if="loading.siteLinks" section="community" />
    <div v-else class="community-section">
      <div class="section-label">
        <img src="@/assets/icon_sq.svg" :alt="$t('社区')" />
        <span>{{ $t('社区') }}</span>
      </div>
      <div class="community-scroll">
        <div
          v-for="item in communityList"
          :key="item.id"
          class="community-item"
          role="button"
          tabindex="0"
          @click="onSiteLinkClick(item)"
          @keydown.enter.prevent="onSiteLinkClick(item)"
        >
          <img :src="item.image" :alt="item.title">
        </div>
      </div>
    </div>

    <HomeSectionSkeleton v-if="loading.siteLinks" section="partners" />
    <div v-else class="partners-section">
      <div class="section-label">
        <img src="@/assets/icon_hz.svg" :alt="$t('合作供应商')" />
        <span>{{ $t('合作供应商') }}</span>
      </div>
      <div class="partners-grid">
        <div
          v-for="item in partnerList"
          :key="item.id"
          class="partner-item"
        >
          <img v-if="item.image" :src="item.image" :alt="item.title" class="partner-logo">
          <span v-else>{{ item.title }}</span>
        </div>
      </div>
    </div>

    <HomeSectionSkeleton v-if="loading.siteLinks" section="footer-links" />
    <div v-else class="footer-section">
      <div class="service-label">{{ $t('服务中心') }}</div>
      <div class="service-links">
        <template v-for="(item, index) in serviceLinks" :key="item.id">
          <span
            class="service-link-item"
            role="button"
            tabindex="0"
            @click="onServiceLinkClick(item)"
            @keydown.enter.prevent="onServiceLinkClick(item)"
          >{{ $t(getServiceLinkTitle(item)) }}</span>
          <span v-if="index < serviceLinks.length - 1" class="dot">·</span>
        </template>
      </div>
      <div class="company-name">{{ $t('28娱乐') }}</div>
      <div class="company-desc">
        {{ $t('company.description') }}
      </div>
    </div>
    <LangPopup v-model:show="showLangPopup" />
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LangPopup from '@/components/LangPopup.vue'
import HomeSectionSkeleton from '@/components/home/HomeSectionSkeleton.vue'
import { toast } from '@/components/Toast'
import { useUserStore } from '@/stores/user'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { getVipLevelIcon } from '@/utils/vipLevelIcon'
import { getSiteBanners, getSiteNotices, getNoticeDisplayText, getSiteLinks } from '@/api/site'
import { getGameAwards, formatPayoutAmount } from '@/api/game'
import { getLotteryList } from '@/api/lottery'
import { navigateSiteLink, navigateServiceLink } from '@/utils/siteNavigate'
import avatarDefault from '@/assets/touxiang2.png'
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
import homeBtcIcon from '@/assets/home_btc_icon.png'
import homeTw28Icon from '@/assets/home_tw28_icon.png'
import homeJnd28Icon from '@/assets/home_jnd28_icon.png'
import homeJndx28Icon from '@/assets/home_jndx28_icon.png'
import iconVenueMaintenance from '@/assets/icon_venue_under_maintenance.svg'
import lunbo1 from '@/assets/lunbo1.png'

const LOTTERY_BG_BY_CODE = {
  btc28: homeBtcIcon,
  twbg28: homeTw28Icon,
  jnd28: homeJnd28Icon,
  jndx28: homeJndx28Icon
}

const DEFAULT_GAME_LIST = [
  { id: 'btc28', code: 'btc28', name: '比特币28', key: 'btc', bg: homeBtcIcon, remaining: 0, isWaiting: true, isOpen: false, isClosed: false },
  { id: 'twbg28', code: 'twbg28', name: '台湾宾果28', key: 'tw28', bg: homeTw28Icon, remaining: 0, isWaiting: true, isOpen: false, isClosed: false },
  { id: 'jnd28', code: 'jnd28', name: '加拿大28', key: 'jnd28', bg: homeJnd28Icon, remaining: 0, isWaiting: true, isOpen: false, isClosed: false },
  { id: 'jndx28', code: 'jndx28', name: '加拿大西28', key: 'jndx28', bg: homeJndx28Icon, remaining: 0, isWaiting: true, isOpen: false, isClosed: false }
]

function formatLotteryDateTime(timestamp) {
  const n = Number(timestamp)
  if (!Number.isFinite(n) || n <= 0) return '--'
  const d = new Date(n * 1000)
  const pad = (v) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function mapLotteryToGameCard(item) {
  return {
    id: item.code,
    code: item.code,
    name: item.name,
    key: item.gameKey,
    bg: LOTTERY_BG_BY_CODE[item.code] || homeBtcIcon,
    remaining: item.sec,
    isWaiting: item.isWaiting,
    isOpen: item.isOpen,
    isClosed: item.isClosed,
    status: item.status,
    maintenanceStart: formatLotteryDateTime(item.openTime),
    maintenanceEnd: formatLotteryDateTime(item.closeTime),
    maintenanceEndAt: item.closeTime,
    issue: item.issue,
    lastIssue: item.lastIssue,
    lastResult: item.lastResult,
    lastSum: item.lastSum
  }
}

const current = ref(0)
const router = useRouter()
const userStore = useUserStore()
const { displayAvatar, refreshProfile } = useUserAvatar()
const showLangPopup = ref(false)

const vipLevelIcon = computed(() =>
  getVipLevelIcon(userStore.userInfo?.vipLevel)
)

const onAvatarError = (e) => {
  const el = e?.target
  if (!el || el.src === avatarDefault) return
  el.src = avatarDefault
}

const onWinnerAvatarError = (e) => {
  const el = e?.target
  if (!el || el.src === avatarDefault) return
  el.src = avatarDefault
}

const NOTICE_FALLBACK = t('马年迎新春，电子老虎机最高领取888元，更有现金')

const notices = ref([])

const noticeMarqueeText = computed(() => {
  if (!notices.value.length) {
    return NOTICE_FALLBACK
  }
  const text = notices.value
    .map(getNoticeDisplayText)
    .filter(Boolean)
    .join('　　　')
  return text || NOTICE_FALLBACK
})

const loading = ref({
  banner: true,
  notice: true,
  games: true,
  category: true,
  winners: true,
  siteLinks: true
})

const fetchBanners = async () => {
  loading.value.banner = true
  try {
    const list = await getSiteBanners()
    banners.value = list.length
      ? list
      : [{ id: 'fallback', image: lunbo1, linkType: '', linkValue: '' }]
  } catch (error) {
    console.error('加载轮播图失败:', error)
    banners.value = [{ id: 'fallback', image: lunbo1, linkType: '', linkValue: '' }]
  } finally {
    loading.value.banner = false
  }
}

const fetchNotices = async () => {
  loading.value.notice = true
  try {
    notices.value = await getSiteNotices()
  } catch (error) {
    console.error('加载公告失败:', error)
    notices.value = []
  } finally {
    loading.value.notice = false
  }
}

/** 服务中心链接 code → 中文 i18n key（模板里用 $t 翻译，切换语言会生效） */
const SERVICE_LINK_TITLE_KEYS = {
  privacy_policy: '隐私政策',
  user_agreement: '用户协议',
  help_center: '帮助中心',
  about_us: '关于我们'
}

function getServiceLinkTitle(item) {
  const code = String(item?.code || '').toLowerCase()
  if (SERVICE_LINK_TITLE_KEYS[code]) return SERVICE_LINK_TITLE_KEYS[code]
  const title = String(item?.title || '').trim()
  return title || code
}

const DEFAULT_SERVICE_LINKS = [
  { id: 'privacy', title: '隐私政策', code: 'privacy_policy', linkType: '', linkValue: '' },
  { id: 'agreement', title: '用户协议', code: 'user_agreement', linkType: '', linkValue: '' },
  { id: 'help', title: '帮助中心', code: 'help_center', linkType: '', linkValue: '' },
  { id: 'about', title: '关于我们', code: 'about_us', linkType: '', linkValue: '' }
]

const awardTotalAmount = ref(formatPayoutAmount(0))
const winnerList = ref([])

const LOTTERY_POLL_INTERVAL_MS = 10000

let isLotteryRefreshing = false
let lotteryPollTimer = null
/** @type {Map<string, { endAt: number, expiredTriggered: boolean }>} */
const maintenancePollState = new Map()

function getNowSec() {
  return Math.floor(Date.now() / 1000)
}

function isMaintenancePollDue(item, nowSec = getNowSec()) {
  if (!item.isClosed) return false
  const endAt = Number(item.maintenanceEndAt) || 0
  return endAt > 0 && nowSec >= endAt
}

function needsLotteryPolling(list = gameList.value) {
  const nowSec = getNowSec()
  const needsSecPoll = list.some(
    (item) => (item.isOpen || item.isWaiting) && item.remaining <= 0
  )
  const needsMaintenancePoll = list.some((item) => isMaintenancePollDue(item, nowSec))
  return needsSecPoll || needsMaintenancePoll
}

function syncMaintenancePollState(list = gameList.value) {
  list.forEach((item) => {
    if (!item.isClosed) {
      maintenancePollState.delete(item.code)
      return
    }

    const endAt = Number(item.maintenanceEndAt) || 0
    const prev = maintenancePollState.get(item.code)
    if (!prev || prev.endAt !== endAt) {
      maintenancePollState.set(item.code, {
        endAt,
        expiredTriggered: false
      })
    }
  })
}

function collectMaintenancePollRefresh(list = gameList.value) {
  const nowSec = getNowSec()
  let shouldRefresh = false

  list.forEach((item) => {
    if (!isMaintenancePollDue(item, nowSec)) return

    const endAt = Number(item.maintenanceEndAt) || 0
    let state = maintenancePollState.get(item.code)
    if (!state || state.endAt !== endAt) {
      state = { endAt, expiredTriggered: false }
      maintenancePollState.set(item.code, state)
    }
    if (!state.expiredTriggered) {
      state.expiredTriggered = true
      shouldRefresh = true
    }
  })

  return shouldRefresh
}

function stopLotteryPolling() {
  if (!lotteryPollTimer) return
  clearInterval(lotteryPollTimer)
  lotteryPollTimer = null
}

function startLotteryPolling() {
  if (lotteryPollTimer) return
  lotteryPollTimer = setInterval(() => {
    fetchLotteryGames({ showLoading: false })
  }, LOTTERY_POLL_INTERVAL_MS)
}

function syncLotteryPolling() {
  if (needsLotteryPolling()) {
    startLotteryPolling()
  } else {
    stopLotteryPolling()
  }
}

const fetchLotteryGames = async ({ showLoading = true } = {}) => {
  if (isLotteryRefreshing) return
  isLotteryRefreshing = true
  if (showLoading) loading.value.games = true
  try {
    const list = await getLotteryList()
    gameList.value = list.length
      ? list.map(mapLotteryToGameCard)
      : DEFAULT_GAME_LIST
    syncMaintenancePollState(gameList.value)
  } catch (error) {
    console.error('加载彩种列表失败:', error)
    if (showLoading || !gameList.value.length) {
      gameList.value = DEFAULT_GAME_LIST
    }
  } finally {
    if (showLoading) loading.value.games = false
    isLotteryRefreshing = false
    syncLotteryPolling()
  }
}

const tickLotteryCountdown = () => {
  let shouldRefresh = false

  gameList.value.forEach((item) => {
    if (item.isOpen && item.remaining > 0) {
      item.remaining--
      if (item.remaining === 0) shouldRefresh = true
    }
  })

  if (collectMaintenancePollRefresh()) {
    shouldRefresh = true
  }

  if (shouldRefresh) {
    fetchLotteryGames({ showLoading: false })
  }
}

const fetchGameAwards = async () => {
  loading.value.winners = true
  try {
    const data = await getGameAwards()
    awardTotalAmount.value = data.displayTotalAmount
    winnerList.value = data.list
  } catch (error) {
    console.error('加载近期大奖失败:', error)
    awardTotalAmount.value = formatPayoutAmount(0)
    winnerList.value = []
  } finally {
    loading.value.winners = false
  }
}

const fetchSiteLinks = async () => {
  loading.value.siteLinks = true
  try {
    const data = await getSiteLinks()
    communityList.value = data.communities
    partnerList.value = data.providers
    serviceLinks.value = data.serviceLinks.length
      ? data.serviceLinks
      : DEFAULT_SERVICE_LINKS
  } catch (error) {
    console.error('加载站点链接失败:', error)
    communityList.value = []
    partnerList.value = []
    serviceLinks.value = DEFAULT_SERVICE_LINKS
  } finally {
    loading.value.siteLinks = false
  }
}

const fetchData = async () => {
  loading.value.category = true
  await Promise.all([
    fetchBanners(),
    fetchNotices(),
    fetchSiteLinks(),
    fetchGameAwards(),
    fetchLotteryGames()
  ])

  categoryList.value = [
    { id: 1, name: t('体育'), key: 'ty', icon: iconTy },
    { id: 2, name: t('视讯'), key: 'sx', icon: iconSx },
    { id: 3, name: t('电子'), key: 'dz', icon: iconDz },
    { id: 4, name: t('彩票'), key: 'cp', icon: iconCp },
    { id: 5, name: t('捕鱼'), key: 'by', icon: iconBy },
    { id: 6, name: t('棋牌'), key: 'qp', icon: iconQp }
  ]

  loading.value.category = false
}

const onBannerClick = (item) => {
  navigateSiteLink(router, item)
}

const onSiteLinkClick = (item) => {
  navigateSiteLink(router, item)
}

const onServiceLinkClick = (item) => {
  navigateServiceLink(router, item)
}

const banners = ref([])
const categoryList = ref([])
const actions = ref([
  { name: t('存款'), icon: iconDeposit },
  { name: t('取款'), icon: iconWithdrawal },
  { name: t('代理'), icon: iconActing }
])
const gameList = ref([])
const helpList = ref([
  { id: 1, name: t('在线客服'), icon: iconKefu },
  { id: 2, name: t('USDT教程'), icon: iconUsdtjc },
])
const communityList = ref([])
const partnerList = ref([])
const serviceLinks = ref([...DEFAULT_SERVICE_LINKS])

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

function goSelfLottery(item) {
  if (!item.isOpen) return
  router.push({
    name: 'lotteryRoomSelect',
    query: {
      gameId: item.key,
      gameName: item.name
    }
  })
}

let timer
onMounted(() => {
  if (userStore.isLogin) {
    refreshProfile().catch(() => {})
  }
  fetchData()
  timer = setInterval(tickLotteryCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
  stopLotteryPolling()
  maintenancePollState.clear()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/home.less';
</style>

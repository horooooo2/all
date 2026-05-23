<template>
  <div class="lottery-room-page">
    <LotteryNavBar
      :title="pageTitle"
      room-text=""
      :online-count="''"
      :show-dropdown="false"
      :dropdown-open="false"
      :show-timer-issue="false"
      @back="goBack"
      @menu="onMenu"
    />

    <LotteryIssueBar :issue="currentIssue" :status-text="issueStatusText" :countdown-text="countdownText" />

    <main class="lottery-scroll">
      <LotteryPrevResult
        ref="prevRef"
        :issue="prevIssue"
        :balls="prevBalls"
        :amount-ticker-index="amountTickerIndex"
        :pnl="prevPnl"
        :balance="balance"
        :variant="isLhc ? 'lhc' : ''"
        @expand="onExpandPrev"
        @plus="onPlus"
        @deposit="depositPopupOpen = true"
        @mipai="onMiCard"
      />

      <div
        class="pl5-main-tabs"
        role="tablist"
        :aria-label="isLhc ? '六合彩玩法' : '排列5玩法'"
        :style="{ gridTemplateColumns: `repeat(${mainTabs.length}, minmax(0, 1fr))` }"
      >
        <button
          v-for="tab in mainTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="pl5-main-tabs__btn"
          :class="{ active: mainTab === tab.key }"
          :aria-selected="mainTab === tab.key"
          @click="onMainTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="pl5-play-host">
        <template v-if="!isLhc">
          <Pl5SmpPlay v-show="mainTab === 'smp'" ref="smpPlayRef" @update:bet-count="smpBetCount = $event" />
          <Pl5BzpPlay v-show="mainTab === 'bzp'" ref="bzpPlayRef" @update:bet-count="bzpBetCount = $event" />
        </template>
        <template v-else>
          <LhcSmpPlay v-show="mainTab === 'smp'" ref="lhcSmpPlayRef" @update:bet-count="lhcSmpBetCount = $event" />
        </template>
        <div v-show="!isLhc && mainTab === 'trend'" class="pl5-play-roadmap" aria-label="路子图">
          <HaoluRoadmap />
        </div>
        <div v-show="mainTab === 'long'" class="pl5-play-long" aria-label="长龙">
          <LongDragonPanel
            page-title="长龙"
            :streak-storage-key="longDragonStreakKey"
            :rows="longDragonPanelRows"
            @select-row="onLongDragonRow"
          />
        </div>
      </div>
    </main>

    <BetPanelFoot
      v-show="showBetPanelFoot"
      :mode="mainTab"
      :balance="balance"
      :amount="betAmount"
      :bet-count="betCount"
      :total-stake-text="totalStakeText"
      :show-bet-stats="showBetStats"
      :submit-disabled="submitDisabled"
      :recent-icon="recentIcon"
      :basket-icon="basketIcon"
      :add-icon="addIcon"
      :basket-count="betBasketItems.length"
      @update:amount="onBetAmountUpdate"
      @clear="onBetClear"
      @chip="onChipClick"
      @recent="onRecent"
      @basket="onBasket"
      @add-pick="onAddPick"
      @bet="onBet"
      @chase="onChase"
    />

    <NextResultPopup
      v-model:show="prevResultPopupOpen"
      :top="prevResultPopupTopCss"
      primary-text="查看完整走势"
      @primary="onViewFullTrend"
    >
      <div class="lottery-prev-table" aria-label="往期开奖">
        <div class="lottery-prev-row lottery-prev-row--head">
          <div class="lottery-prev-col lottery-prev-col--issue">期号</div>
          <div class="lottery-prev-col lottery-prev-col--nums">开奖号码</div>
        </div>

        <div v-for="(row, rowIdx) in prevRows" :key="row.issue" class="lottery-prev-row">
          <div class="lottery-prev-col lottery-prev-col--issue">{{ row.issue }}</div>
          <div class="lottery-prev-col lottery-prev-col--nums">
            <span
              v-for="(n, i) in row.nums"
              :key="i"
              :class="['lottery-prev-ball', { 'is-latest': rowIdx === 0 }]"
            >
              {{ n }}
            </span>
          </div>
        </div>
      </div>
    </NextResultPopup>

    <MipaiPopup
      v-model:show="miPopupOpen"
      :variant="isLhc ? 'lhc' : 'pl5'"
      :issue="miIssue"
      :nums="miNums"
      :left1="miLeft1"
      :left2="miLeft2"
      @refresh="onMiRefresh"
    />

    <RecentBetsPopup v-model:show="recentOpen" :top="0" @history="() => router.push({ name: 'lotteryBetRecord' })" />

    <LotteryBetBasket
      v-model:show="betBasketOpen"
      :top="0"
      :items="betBasketItems"
      :balance="balance"
      @submit="onBetBasketSubmit"
      @clear="onBetBasketClear"
      @remove="onBetBasketRemove"
      @chase="onChase"
    />

    <RecoSimpleBetPopup
      v-model:show="longDragonBetOpen"
      :row="longDragonBetRow"
      :balance="balance"
      @submit="onLongDragonBetSubmit"
      @chase="onChase"
    />

    <GameDepositPopup v-model:show="depositPopupOpen" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/components/Toast'
import LotteryNavBar from './components/LotteryNavBar.vue'
import LotteryIssueBar from './components/LotteryIssueBar.vue'
import LotteryPrevResult from './components/LotteryPrevResult.vue'
import BetPanelFoot from './components/BetPanelFoot.vue'
import MipaiPopup from '@/views/game/components/MipaiPopup.vue'
import RecentBetsPopup from '@/views/game/components/RecentBetsPopup.vue'
import NextResultPopup from '@/components/lottery/NextResultPopup.vue'
import recentIconSrc from '@/assets/icon_tzjl.svg'
import basketIconSrc from '@/assets/icon_gcl.svg'
import addIconSrc from '@/assets/icon_add_white.svg'
import LotteryBetBasket from '@/components/lottery/LotteryBetBasket.vue'
import HaoluRoadmap from '@/components/lottery/HaoluRoadmap.vue'
import LongDragonPanel from '@/components/lottery/LongDragonPanel.vue'
import RecoSimpleBetPopup from '@/components/lottery/RecoSimpleBetPopup.vue'
import GameDepositPopup from '@/views/game/components/GameDepositPopup.vue'
import Pl5SmpPlay from './pl5/smp/Pl5SmpPlay.vue'
import Pl5BzpPlay from './pl5/bzp/Pl5BzpPlay.vue'
import LhcSmpPlay from './lhc/LhcSmpPlay.vue'
import { buildBasketItemsFromDraft, parseBetAmount } from './lottery-basket-collect.js'

const route = useRoute()
const router = useRouter()

const isLhc = computed(() => route.name === 'lhcRoom')

const PL5_MAIN_TABS = Object.freeze([
  { key: 'smp', label: '双面盘' },
  { key: 'bzp', label: '标准盘' },
  { key: 'trend', label: '路子图' },
  { key: 'long', label: '长龙' }
])
const LHC_MAIN_TABS = Object.freeze([
  { key: 'smp', label: '双面盘' },
  { key: 'long', label: '长龙' }
])
const mainTabs = computed(() => (isLhc.value ? LHC_MAIN_TABS : PL5_MAIN_TABS))

const pageTitle = computed(() => String(route.query.gameName || '彩票'))

const LHC_ISSUE_START = '2025133'

function randomLhcDrawSorted() {
  const picks = []
  while (picks.length < 7) {
    const n = 1 + Math.floor(Math.random() * 49)
    if (!picks.includes(n)) picks.push(n)
  }
  const main = picks.slice(0, 6).sort((a, b) => a - b)
  const special = picks[6]
  return [...main, special]
}

// 演示数据：后续接接口统一由入口页控制
const currentIssue = ref('3123111110')
const prevIssue = ref('3123111109')
const prevPnl = ref('188')
const prevBalls = ref([9, 3, 8, 1, 1])
const balance = ref(8888.5)
const issueStatusText = ref('投注中')
const recentIcon = recentIconSrc
const basketIcon = basketIconSrc
const addIcon = addIconSrc

const recentOpen = ref(false)
const depositPopupOpen = ref(false)
const betBasketOpen = ref(false)
const betBasketItems = ref([])
/** 购彩篮归属彩种：仅在 pl5 / lhc 切换或离开页面时清空 */
const basketOwnerGame = ref(null)

const mainTab = ref('smp')
/** 路子图、长龙不显示投注底栏；双面盘（及排列5标准盘）显示，六合彩与排列五规则一致 */
const showBetPanelFoot = computed(() => {
  if (mainTab.value === 'long' || mainTab.value === 'trend') return false
  return mainTab.value === 'smp' || (!isLhc.value && mainTab.value === 'bzp')
})
const smpPlayRef = ref(null)
const bzpPlayRef = ref(null)
const lhcSmpPlayRef = ref(null)
const smpBetCount = ref(0)
const bzpBetCount = ref(0)
const lhcSmpBetCount = ref(0)

const betAmount = ref('')

const amountTickerIndex = ref(0)
let amountTickerTimer = null

const countdownSec = ref(20)
const countdownText = computed(() => {
  const s = Math.max(0, countdownSec.value)
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(s % 60).padStart(2, '0')
  return `${h}:${m}:${sec}`
})

/** 长龙列表（演示数据）；betPopupRow 与自营彩「推荐好路」同一套下注弹窗数据结构 */
const pl5LongDragonRows = computed(() => {
  const name = String(pageTitle.value || '排列5')
  const cd = countdownText.value
  const issue = String(currentIssue.value || '')
  return [
    {
      id: 'pl5-1',
      topLeft: name,
      topRight: cd,
      bottomLeft: '万位大小',
      bottomRight: '连出4期',
      streak: 4,
      betPopupRow: {
        betTitle: '万位大小',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'pl5-wan-big', label: '大', odds: 1.98, accent: 'red' },
          { playKey: 'pl5-wan-small', label: '小', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'pl5-wan-big'
      }
    },
    {
      id: 'pl5-2',
      topLeft: name,
      topRight: cd,
      bottomLeft: '千位单双',
      bottomRight: '连出3期',
      streak: 3,
      betPopupRow: {
        betTitle: '千位单双',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'pl5-qian-even', label: '双', odds: 1.98, accent: 'red' },
          { playKey: 'pl5-qian-odd', label: '单', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'pl5-qian-even'
      }
    },
    {
      id: 'pl5-3',
      topLeft: name,
      topRight: cd,
      bottomLeft: '百位质合',
      bottomRight: '连出6期',
      streak: 6,
      betPopupRow: {
        betTitle: '百位质合',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'pl5-bai-prime', label: '质', odds: 1.98, accent: 'red' },
          { playKey: 'pl5-bai-composite', label: '合', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'pl5-bai-prime'
      }
    },
    {
      id: 'pl5-4',
      topLeft: name,
      topRight: cd,
      bottomLeft: '十位大小',
      bottomRight: '连出5期',
      streak: 5,
      betPopupRow: {
        betTitle: '十位大小',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'pl5-shi-small', label: '小', odds: 1.98, accent: 'red' },
          { playKey: 'pl5-shi-big', label: '大', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'pl5-shi-small'
      }
    },
    {
      id: 'pl5-5',
      topLeft: name,
      topRight: cd,
      bottomLeft: '个位012路',
      bottomRight: '连出2期',
      streak: 2,
      betPopupRow: {
        betTitle: '个位012路',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'pl5-ge-0', label: '0', odds: 1.97, accent: 'red' },
          { playKey: 'pl5-ge-1', label: '1', odds: 1.97, accent: 'blue' },
          { playKey: 'pl5-ge-2', label: '2', odds: 1.97, accent: 'blue' }
        ],
        defaultPlayKey: 'pl5-ge-0'
      }
    }
  ]
})

const lhcLongDragonRows = computed(() => {
  const name = String(pageTitle.value || '六合彩')
  const cd = countdownText.value
  const issue = String(currentIssue.value || '')
  return [
    {
      id: 'lhc-1',
      topLeft: name,
      topRight: cd,
      bottomLeft: '特码大小',
      bottomRight: '连出5期',
      streak: 5,
      betPopupRow: {
        betTitle: '特码大小',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'lhc-tm-big', label: '大', odds: 1.98, accent: 'red' },
          { playKey: 'lhc-tm-small', label: '小', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'lhc-tm-big'
      }
    },
    {
      id: 'lhc-2',
      topLeft: name,
      topRight: cd,
      bottomLeft: '特码单双',
      bottomRight: '连出3期',
      streak: 3,
      betPopupRow: {
        betTitle: '特码单双',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'lhc-tm-odd', label: '单', odds: 1.98, accent: 'red' },
          { playKey: 'lhc-tm-even', label: '双', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'lhc-tm-odd'
      }
    },
    {
      id: 'lhc-3',
      topLeft: name,
      topRight: cd,
      bottomLeft: '特码波色 红波',
      bottomRight: '连出4期',
      streak: 4,
      betPopupRow: {
        betTitle: '特码波色',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'lhc-tm-red', label: '红波', odds: 2.75, accent: 'red' },
          { playKey: 'lhc-tm-blue', label: '蓝波', odds: 2.85, accent: 'blue' },
          { playKey: 'lhc-tm-green', label: '绿波', odds: 2.85, accent: 'blue' }
        ],
        defaultPlayKey: 'lhc-tm-red'
      }
    },
    {
      id: 'lhc-4',
      topLeft: name,
      topRight: cd,
      bottomLeft: '总和大小',
      bottomRight: '连出6期',
      streak: 6,
      betPopupRow: {
        betTitle: '总和大小',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'lhc-sum-big', label: '总大', odds: 1.98, accent: 'red' },
          { playKey: 'lhc-sum-small', label: '总小', odds: 1.98, accent: 'blue' }
        ],
        defaultPlayKey: 'lhc-sum-big'
      }
    },
    {
      id: 'lhc-5',
      topLeft: name,
      topRight: cd,
      bottomLeft: '正肖',
      bottomRight: '连出2期',
      streak: 2,
      betPopupRow: {
        betTitle: '正肖',
        gameName: name,
        issue,
        countdown: cd,
        options: [
          { playKey: 'lhc-zx-rat', label: '鼠', odds: 11.5, accent: 'red' },
          { playKey: 'lhc-zx-ox', label: '牛', odds: 11.5, accent: 'blue' }
        ],
        defaultPlayKey: 'lhc-zx-rat'
      }
    }
  ]
})

const longDragonPanelRows = computed(() => (isLhc.value ? lhcLongDragonRows.value : pl5LongDragonRows.value))

const longDragonStreakKey = computed(() =>
  isLhc.value ? 'lhc.longDragon.streakPeriods.v1' : 'pl5.longDragon.streakPeriods.v1'
)

function routeGameKey(name) {
  if (name === 'lhcRoom') return 'lhc'
  if (name === 'pl5Room') return 'pl5'
  return null
}

function activePlayPanelRef() {
  if (isLhc.value) {
    if (mainTab.value === 'smp') return lhcSmpPlayRef.value
    return null
  }
  if (mainTab.value === 'smp') return smpPlayRef.value
  if (mainTab.value === 'bzp') return bzpPlayRef.value
  return null
}

function syncBetCountFromPlay() {
  if (isLhc.value) {
    if (mainTab.value === 'smp') lhcSmpBetCount.value = 0
    return
  }
  if (mainTab.value === 'smp') smpBetCount.value = 0
  if (mainTab.value === 'bzp') bzpBetCount.value = 0
}

watch(
  () => route.name,
  (name) => {
    const game = routeGameKey(name)
    if (basketOwnerGame.value && game && basketOwnerGame.value !== game) {
      betBasketItems.value = []
    }
    if (game) basketOwnerGame.value = game

    mainTab.value = 'smp'
    smpBetCount.value = 0
    bzpBetCount.value = 0
    lhcSmpBetCount.value = 0
    betAmount.value = ''
    nextTick(() => {
      smpPlayRef.value?.resetPicks?.()
      bzpPlayRef.value?.resetPicks?.()
      lhcSmpPlayRef.value?.resetPicks?.()
    })
    if (name === 'lhcRoom') {
      currentIssue.value = LHC_ISSUE_START
      prevIssue.value = '2025132'
      prevBalls.value = randomLhcDrawSorted()
    } else {
      currentIssue.value = '3123111110'
      prevIssue.value = '3123111109'
      prevBalls.value = [9, 3, 8, 1, 1]
    }
  },
  { immediate: true }
)

const longDragonBetOpen = ref(false)
const longDragonBetRow = ref(null)

function onLongDragonRow(row) {
  const popup = row?.betPopupRow
  if (!popup) return
  longDragonBetRow.value = popup
  longDragonBetOpen.value = true
}

function onLongDragonBetSubmit(payload) {
  const pk = payload.playKey ?? ''
  const amt = payload.amount
  toast(pk ? `长龙投注 ${pk} × ¥${amt}（演示）` : `长龙投注 × ¥${amt}（演示）`)
}

let timer = null

onMounted(() => {
  timer = window.setInterval(() => {
    if (countdownSec.value <= 0) {
      countdownSec.value = 75
      rollIssueMock()
      return
    }
    countdownSec.value -= 1
  }, 1000)

  amountTickerTimer = window.setInterval(() => {
    amountTickerIndex.value = amountTickerIndex.value === 0 ? 1 : 0
  }, 10000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (amountTickerTimer) clearInterval(amountTickerTimer)
  betBasketItems.value = []
})

function rollIssueMock() {
  prevIssue.value = currentIssue.value
  if (isLhc.value) {
    const n = Number(currentIssue.value)
    currentIssue.value = Number.isFinite(n) ? String(Math.floor(n) + 1) : LHC_ISSUE_START
    prevBalls.value = randomLhcDrawSorted()
    return
  }
  currentIssue.value = String(Number(currentIssue.value) + 1)
  prevBalls.value = prevBalls.value.map(() => Math.floor(Math.random() * 10))
}

// 注数由当前子玩法上报
const betCount = computed(() => {
  if (isLhc.value) {
    if (mainTab.value === 'smp') return lhcSmpBetCount.value
    return 0
  }
  if (mainTab.value === 'smp') return smpBetCount.value
  if (mainTab.value === 'bzp') return bzpBetCount.value
  return 0
})
const totalStakeText = computed(() => {
  const unit = Number(String(betAmount.value).trim())
  if (!Number.isFinite(unit) || unit <= 0) return '0'
  const n = betCount.value * unit
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (Number.isInteger(n)) return String(n)
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})
const showBetStats = computed(() => betCount.value > 0)
const submitDisabled = computed(() => {
  const unit = Number(String(betAmount.value).trim())
  if (!Number.isFinite(unit) || unit <= 0) return true
  if (betCount.value <= 0) return true
  return false
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/game-hall?category=cp')
}

function onMenu() {
  toast('菜单（待接入）')
}

function onExpandPrev() {
  prevResultPopupOpen.value = true
  nextTick(() => {
    measurePrevBottom()
    requestAnimationFrame(() => measurePrevBottom())
  })
}

function onPlus() {
  toast('加号（待接入）')
}

function onMiCard() {
  miIssue.value = prevIssue.value
  miNums.value = [...prevBalls.value]
  miLeft1.value = 11
  miLeft2.value = 21
  miPopupOpen.value = true
}

function onBetAmountUpdate(v) {
  betAmount.value = String(v ?? '')
}

function onMainTab(key) {
  mainTab.value = key
}

function onBetClear() {
  betAmount.value = ''
  smpBetCount.value = 0
  bzpBetCount.value = 0
  lhcSmpBetCount.value = 0
  smpPlayRef.value?.resetPicks?.()
  bzpPlayRef.value?.resetPicks?.()
  lhcSmpPlayRef.value?.resetPicks?.()
  toast('已清空')
}

function onChipClick(v) {
  betAmount.value = String(v ?? '')
}

function onRecent() {
  recentOpen.value = true
}

function onBasket() {
  betBasketOpen.value = true
}

function onAddPick() {
  const panel = activePlayPanelRef()
  if (!panel?.getBasketDraft) {
    toast('当前玩法不支持加入购彩篮')
    return
  }
  const draft = panel.getBasketDraft()
  if (!draft?.betCount) {
    toast('请先选择投注项')
    return
  }
  const unit = parseBetAmount(betAmount.value)
  if (unit <= 0) {
    toast.warning('请输入投注金额')
    return
  }
  const items = buildBasketItemsFromDraft(draft, {
    issue: currentIssue.value,
    unitAmount: unit
  })
  betBasketItems.value = [...betBasketItems.value, ...items]
  panel.resetPicks?.()
  syncBetCountFromPlay()
  const n = items.length
  toast(n > 1 ? `已加入购彩篮 ${n} 注` : '已加入购彩篮')
}

function onBetBasketRemove(id) {
  betBasketItems.value = betBasketItems.value.filter((x) => x.id !== id)
}

function onBetBasketClear() {
  betBasketItems.value = []
}

function onBetBasketSubmit({ items }) {
  const amt = (items ?? []).reduce((s, it) => {
    const v = Number(it.amount ?? it.totalAmount)
    return s + (Number.isFinite(v) ? v : 0)
  }, 0)
  toast(`购彩篮提交：${items?.length ?? 0} 条，合计 ¥${amt}（演示）`)
  betBasketOpen.value = false
  betBasketItems.value = []
}

function onBet() {
  toast('立即投注（待接入）')
}

function onChase() {
  router.push({ path: '/chase-order' })
}

const prevRef = ref(null)
const prevResultPopupOpen = ref(false)
const prevResultPopupTop = ref(0)
const prevResultPopupTopCss = computed(() => `${Math.max(0, Number(prevResultPopupTop.value || 0))}px`)

function measurePrevBottom() {
  const el = prevRef.value?.getEl?.() ?? prevRef.value?.$el
  const rect = el?.getBoundingClientRect?.()
  if (!rect) return
  const bottom = Number(rect.bottom)
  if (!Number.isFinite(bottom) || bottom <= 0) return
  prevResultPopupTop.value = bottom
}

const prevRows = computed(() => {
  const cur = String(prevIssue.value || '')
  const base = parseInt(cur, 10)
  const rows = []
  const len = prevBalls.value.length || (isLhc.value ? 7 : 5)
  for (let i = 0; i < 8; i++) {
    const issue = Number.isFinite(base) ? String(base - i) : `${cur}-${i}`
    const nums =
      i === 0
        ? [...prevBalls.value]
        : isLhc.value
          ? randomLhcDrawSorted()
          : Array.from({ length: len }, () => Math.floor(Math.random() * 10))
    rows.push({ issue, nums })
  }
  return rows
})

function onViewFullTrend() {
  prevResultPopupOpen.value = false
  if (isLhc.value) {
    toast('六合彩完整走势（待接入）')
    return
  }
  router.push({
    name: 'pl5Trend',
    query: {
      gameId: 'pl5',
      gameName: pageTitle.value
    }
  })
}

const miPopupOpen = ref(false)
const miIssue = ref('')
const miNums = ref([0, 0, 0, 0, 0])
const miLeft1 = ref(11)
const miLeft2 = ref(21)

function onMiRefresh() {
  miLeft1.value = 11
  miLeft2.value = 21
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lottery-room-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--browser-ui-bottom, 0px);
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-color);
}

.lottery-room-page > :deep(.game-nav) {
  flex-shrink: 0;
}

.lottery-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
}

.pl5-main-tabs {
  flex-shrink: 0;
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 0.5px solid #dae4f6;
}

.pl5-main-tabs__btn {
  width: 100%;
  min-width: 0;
  height: 34px;
  box-sizing: border-box;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  font-size: @font-size-sm;
  font-weight: 600;
  color: #6a7892;
  padding: 0;
  cursor: pointer;
}

.pl5-main-tabs__btn.active {
  color: #ffffff;
  border: 1px solid var(---A6, #00aeff);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
}

.pl5-play-host {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pl5-play-long {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f3f6fc;
}

.pl5-play-roadmap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f3f6fc;
}

.lottery-prev-table {
  height: 100%;
  overflow: hidden;
}

.lottery-prev-row {
  display: flex;
  align-items: center;
  height: 36px;
  box-sizing: border-box;
  background: #ffffff;
}

.lottery-prev-row--head {
  height: 34px;
  background: #e5efff;
  font-size: @font-size-sm;
  color: #1d1d1f;
  font-weight: 400;
}

.lottery-prev-row:nth-child(even):not(.lottery-prev-row--head) {
  background: #e5efff;
}

.lottery-prev-col {
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: @font-size-sm;
  color: #1d1d1f;
  border-right: 1px solid #dbe7ff;
}

.lottery-prev-row .lottery-prev-col:last-child {
  border-right: none;
}

.lottery-prev-col--issue {
  width: 92px;
}

.lottery-prev-col--nums {
  flex: 1 1 auto;
  min-width: 0;
  justify-content: space-between;
  gap: 0;
  padding: 0 12px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.lottery-prev-ball {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-sm;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #e89261;
  background: transparent;
  border-radius: 50%;
}

.lottery-prev-ball.is-latest {
  border: 1px solid #e89261;
}
</style>


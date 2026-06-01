<template>
  <div class="room-select-page">
    <header class="room-header">
      <div class="room-header__left">
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          aria-label="back"
          @click="goBack"
          @keydown.enter.prevent="goBack"
          @keydown.space.prevent="goBack"
        >
          <img class="icon-img" :src="iconBack" alt="" aria-hidden="true" />
        </div>

        <div
          class="title-btn"
          role="button"
          tabindex="0"
          :aria-expanded="dropdownOpen ? 'true' : 'false'"
          @click="toggleDropdown"
          @keydown.enter.prevent="toggleDropdown"
          @keydown.space.prevent="toggleDropdown"
        >
          <span class="title">{{ currentTitle }}</span>
          <img class="caret" :class="{ open: dropdownOpen }" :src="iconDown" alt="" aria-hidden="true" />
        </div>
      </div>

      <div class="room-header__right">
        <div v-if="!userStore.isLogin" class="login-actions">
          <button class="login-btn" @click="goLogin">{{ $t('登录') }}</button>
          <button class="register-btn" @click="goRegister">{{ $t('注册') }}</button>
        </div>
        <div v-else class="user-brief">
          <img
            class="user-brief__avatar"
            :src="displayAvatar"
            alt="avatar"
            @error="onAvatarError"
          />
          <div class="user-brief__name">{{ displayName }}</div>
          <span class="user-brief__amount">¥ {{ displayBalance }}</span>
        </div>
      </div>
    </header>

    <transition name="game-picker-fade">
      <div
        v-if="dropdownOpen"
        class="game-picker-mask"
        role="dialog"
        aria-modal="true"
        @click.self="closeDropdown"
      >
        <div class="game-picker-panel" @click.stop>
          <div class="game-picker-grid">
            <button
              v-for="it in gameOptions"
              :key="it.key"
              type="button"
              class="game-picker-btn"
              :class="{ active: activeGameId === it.key }"
              @click="onPickGame(it)"
            >
              {{ it.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="room-body">
      <div class="rules-row">
        <div class="rules-link" role="button" tabindex="0" @click="onRules" @keydown.enter.prevent="onRules">
          <img class="rules-icon" :src="iconRules" alt="" aria-hidden="true" />
          <span class="rules-text">{{ $t('玩法规则') }}</span>
        </div>
      </div>

      <div class="card-list">
        <div
          v-for="card in roomCards"
          :key="card.key"
          class="room-card"
          :class="{ 'room-card--disabled': !card.isActive }"
          role="button"
          :tabindex="card.isActive ? 0 : -1"
          :style="{ backgroundImage: `url(${card.bgImg})` }"
          @click="onSelect(card)"
          @keydown.enter.prevent="onSelect(card)"
          @keydown.space.prevent="onSelect(card)"
        >
          <div
            class="room-card__tag"
            :style="{ backgroundImage: `url(${card.tagBgImg})` }"
          >
            {{ $t('赔率说明') }}
          </div>

          <div class="room-card__content">
            <div class="room-card__text">
              <div class="room-card__title">{{ card.title }}</div>
              <div v-if="card.sub1" class="room-card__sub">{{ card.sub1 }}</div>
              <div v-if="card.sub2" class="room-card__sub">{{ card.sub2 }}</div>
            </div>

            <div class="room-card__art">
              <img class="room-card__img" :src="card.icon" alt="" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUserAvatar } from '@/composables/useUserAvatar'
import { goLotteryGameRules } from '@/utils/lotteryGameRulesNavigate'
import {
  getLotteryList,
  getLotteryRooms,
  LOTTERY_GAME_KEY_TO_CODE,
  mapLotteryToGameOption
} from '@/api/lottery'
import avatarDefault from '@/assets/touxiang2.png'
import iconBack from '@/assets/icon_dack.svg'
import iconDown from '@/assets/down_icon.svg'
import iconRules from '@/assets/icon_wfgz.svg'
import iconNormal from '@/assets/img_ptf1.png'
import bgNormal from '@/assets/img_ptf1_back.png'
import tagNormal from '@/assets/ptfb_pv_back.svg'
import iconVip from '@/assets/img_gbf2.png'
import bgVip from '@/assets/img_gbf2_back.png'
import tagVip from '@/assets/gbf_pv_back.svg'
import iconHigh from '@/assets/img_gpv3.png'
import bgHigh from '@/assets/img_gpv3_back.png'
import tagHigh from '@/assets/gpv_pv_back.svg'

const ROOM_VISUAL_BY_LEVEL = Object.freeze({
  1: { roomKey: 'normal', bgImg: bgNormal, tagBgImg: tagNormal, icon: iconNormal },
  2: { roomKey: 'vip', bgImg: bgVip, tagBgImg: tagVip, icon: iconVip },
  3: { roomKey: 'high', bgImg: bgHigh, tagBgImg: tagHigh, icon: iconHigh }
})

const DEFAULT_ROOM_CARDS = Object.freeze([
  {
    key: 'normal',
    roomKey: 'normal',
    roomCode: '1',
    roomLevel: 1,
    title: '普通房1元起',
    sub1: '单期限红20万',
    sub2: '组合4.0–4.1',
    isActive: true,
    ...ROOM_VISUAL_BY_LEVEL[1]
  },
  {
    key: 'vip',
    roomKey: 'vip',
    roomCode: '2',
    roomLevel: 2,
    title: '贵宾房10元起',
    sub1: '单点888倍',
    sub2: '单期限红100万',
    isActive: true,
    ...ROOM_VISUAL_BY_LEVEL[2]
  },
  {
    key: 'high',
    roomKey: 'high',
    roomCode: '3',
    roomLevel: 3,
    title: '高赔率30元起',
    sub1: '单点908倍',
    sub2: '组合4.0–5.0',
    isActive: true,
    ...ROOM_VISUAL_BY_LEVEL[3]
  }
])

function splitOddsText(text) {
  const parts = String(text || '').split(/[｜|]/).map((s) => s.trim()).filter(Boolean)
  return {
    sub1: parts[0] || '',
    sub2: parts[1] || ''
  }
}

function formatMaxBonus(amount) {
  const n = Number(amount)
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n >= 10000) {
    const wan = n / 10000
    return Number.isInteger(wan) ? `单期限红${wan}万` : `单期限红${wan.toFixed(1)}万`
  }
  return `单期限红${n}`
}

function buildRoomCardSubs(room) {
  const { sub1: odds1, sub2: odds2 } = splitOddsText(room.oddsText)
  const bonusLine = formatMaxBonus(room.maxBonusAmount)
  const description = String(room.description || '').trim()

  if (odds2) {
    return { sub1: odds1, sub2: odds2 }
  }
  if (odds1 && bonusLine) {
    return { sub1: odds1, sub2: bonusLine }
  }
  if (description) {
    return { sub1: description, sub2: odds1 }
  }
  return { sub1: odds1 || bonusLine, sub2: bonusLine && odds1 ? bonusLine : '' }
}

function mapRoomToCard(room, index) {
  const fallback = DEFAULT_ROOM_CARDS[index] || DEFAULT_ROOM_CARDS[0]
  const visual = ROOM_VISUAL_BY_LEVEL[room.roomLevel] || {
    roomKey: fallback.roomKey,
    bgImg: fallback.bgImg,
    tagBgImg: fallback.tagBgImg,
    icon: fallback.icon
  }
  const { sub1, sub2 } = buildRoomCardSubs(room)

  return {
    key: room.roomCode || visual.roomKey,
    roomKey: visual.roomKey,
    roomCode: room.roomCode,
    roomLevel: room.roomLevel,
    title: room.name,
    sub1,
    sub2,
    isActive: room.isActive,
    bgImg: visual.bgImg,
    tagBgImg: visual.tagBgImg,
    icon: visual.icon
  }
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { displayAvatar, refreshProfile } = useUserAvatar()

const dropdownOpen = ref(false)

const DEFAULT_GAME_OPTIONS = Object.freeze([
  { key: 'btc', code: 'btc28', shortTitle: '比特币', label: '比特币28' },
  { key: 'tw28', code: 'twbg28', shortTitle: '台湾宾果', label: '台湾宾果28' },
  { key: 'jnd28', code: 'jnd28', shortTitle: '加拿大', label: '加拿大28' },
  { key: 'jndx28', code: 'jndx28', shortTitle: '加拿大西', label: '加拿大西28' }
])

const gameOptions = ref([...DEFAULT_GAME_OPTIONS])

const activeGameId = ref(String(route.query.gameId || 'btc'))

const currentTitle = computed(() => {
  const hit = gameOptions.value.find((it) => it.key === activeGameId.value)
  return hit?.shortTitle || String(route.query.gameName || '比特币')
})

const displayName = computed(() => userStore.userInfo?.name || 'ACYOM')

const displayBalance = computed(() => {
  const b = userStore.userInfo?.balance
  if (b == null || Number.isNaN(Number(b))) return '89,685.50'
  return Number(b).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

function onAvatarError(e) {
  const el = e?.target
  if (!el || el.src === avatarDefault) return
  el.src = avatarDefault
}

const roomCards = ref([...DEFAULT_ROOM_CARDS])
let isRoomsLoading = false
let isGameOptionsLoading = false

async function fetchGameOptions() {
  if (isGameOptionsLoading) return
  isGameOptionsLoading = true
  try {
    const list = await getLotteryList()
    if (!list.length) return

    gameOptions.value = list.map(mapLotteryToGameOption)
    if (!gameOptions.value.some((it) => it.key === activeGameId.value)) {
      activeGameId.value = gameOptions.value[0].key
    }
  } catch (error) {
    console.error('加载彩种列表失败:', error)
    gameOptions.value = [...DEFAULT_GAME_OPTIONS]
  } finally {
    isGameOptionsLoading = false
  }
}

async function fetchRooms() {
  if (isRoomsLoading) return
  isRoomsLoading = true
  const lotteryCode = LOTTERY_GAME_KEY_TO_CODE[activeGameId.value] || 'btc28'
  try {
    const data = await getLotteryRooms(lotteryCode)
    roomCards.value = data.list.length
      ? data.list.map(mapRoomToCard)
      : [...DEFAULT_ROOM_CARDS]
  } catch (error) {
    console.error('加载彩票房间列表失败:', error)
    roomCards.value = [...DEFAULT_ROOM_CARDS]
  } finally {
    isRoomsLoading = false
  }
}

watch(activeGameId, () => {
  fetchRooms()
})

onMounted(async () => {
  if (userStore.isLogin) {
    refreshProfile().catch(() => {})
  }
  await fetchGameOptions()
  fetchRooms()
})

const gameId = computed(() => activeGameId.value)

const SELF_GAME_GROUP_MAP = Object.freeze({
  btc: 'g-1',
  tw28: 'g-2',
  jnd28: 'g-3',
  jndx28: 'g-4'
})

const SELF_ROOM_KEY_MAP = Object.freeze({
  normal: 'r-1',
  vip: 'r-2',
  high: 'r-3'
})

function buildSelfGameRoomQuery(card) {
  const groupId = SELF_GAME_GROUP_MAP[gameId.value] || 'g-1'
  const roomKey = card?.roomKey || 'normal'
  const roomSuffix = SELF_ROOM_KEY_MAP[roomKey] || 'r-1'
  const lotteryCode = LOTTERY_GAME_KEY_TO_CODE[gameId.value] || 'btc28'
  return {
    gameId: groupId,
    roomId: `${groupId}-${roomSuffix}`,
    gameName: currentTitle.value,
    room: roomKey,
    roomCode: card?.roomCode || '',
    lotteryCode
  }
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function onPickGame(it) {
  if (!it?.key) return
  activeGameId.value = it.key
  dropdownOpen.value = false
  router.replace({
    name: 'lotteryRoomSelect',
    query: {
      gameId: it.key,
      gameName: it.shortTitle
    }
  })
}

function goLogin() {
  router.push('/login')
}

function goRegister() {
  router.push('/register')
}

function goBack() {
  closeDropdown()
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function onRules() {
  goLotteryGameRules(router, {
    gameId: activeGameId.value,
    gameName: currentTitle.value
  })
}

function onSelect(card) {
  if (!card?.isActive) return
  router.push({
    name: 'gameRoom',
    query: buildSelfGameRoomQuery(card)
  })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.room-select-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--browser-ui-bottom, 0px);
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f3f6fc;
}

.room-header {
  height: 48px;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 0.5px solid #e7eefb;
}

.room-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  user-select: none;
}

.icon-img {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
}

.title-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  min-width: 0;
}

.title {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.caret {
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
  transition: transform 0.18s ease;
}

.caret.open {
  transform: rotate(180deg);
}

.room-header__right {
  flex: 0 0 auto;
  min-width: 0;
}

.user-brief {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 4px;
  row-gap: 0;
  align-items: center;
  max-width: 150px;
}

.user-brief__avatar {
  grid-row: 1;
  grid-column: 1;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #dae4f6;
  box-sizing: border-box;
}

.user-brief__name {
  grid-row: 1;
  grid-column: 2;
  min-width: 0;
  font-size: @font-size-xs;
  font-weight: 700;
  line-height: 1;
  color: #252e3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-brief__amount {
  grid-row: 2;
  grid-column: 2;
  min-width: 0;
  font-size: @font-size-sm;
  font-weight: 700;
  line-height: 1;
  color: #252e3a;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.login-actions {
  display: flex;
  gap: 10px;

  button {
    width: 62px;
    height: 26px;
    border-radius: 6px;
    border: none;
    font-size: @font-size-xs;
    cursor: pointer;
    background: var(--button-primary);
    color: var(--text-white);
  }

  .register-btn {
    border: 1px solid var(--button-primary);
  }
}

.room-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 14px 14px 18px;
  box-sizing: border-box;
}

.rules-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.rules-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1f78ff;
  font-size: @font-size-sm;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.rules-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.room-card {
  position: relative;
  width: 351px;
  height: 158px;
  border-radius: 12px;
  overflow: hidden;
  padding: 16px 16px;
  box-sizing: border-box;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.room-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.room-card__tag {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background-color: transparent;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-size: @font-size-xs;
  line-height: 22px;
  font-weight: 400;
  z-index: 3;
}

.room-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.room-card__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.room-card__title {
  font-size: 24px;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: 0.2px;
}

.room-card__sub {
  font-size: @font-size-sm;
  line-height: 1.35;
  font-weight: 400;
  opacity: 0.95;
}

.room-card__art {
  position: relative;
  width: 134px;
  height: 134px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-card__img {
  width: 134px;
  height: 134px;
  object-fit: contain;
  position: relative;
  z-index: 2;
}

.game-picker-fade-enter-active,
.game-picker-fade-leave-active {
  transition: opacity 140ms ease;
}

.game-picker-fade-enter-from,
.game-picker-fade-leave-to {
  opacity: 0;
}

.game-picker-fade-enter-active .game-picker-mask,
.game-picker-fade-leave-active .game-picker-mask {
  transition: transform 140ms ease;
}

.game-picker-fade-enter-from .game-picker-mask,
.game-picker-fade-leave-to .game-picker-mask {
  transform: translateY(-6px);
}

.game-picker-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 48px;
  z-index: 60;
  background: rgba(0, 0, 0, 0.5);
  padding: 14px 12px 18px;
  box-sizing: border-box;
}

.game-picker-panel {
  width: 100%;
}

.game-picker-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.game-picker-btn {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid #ffffff;
  background: transparent;
  color: #ffffff;
  font-size: @font-size-md;
  font-weight: 400;
  line-height: 36px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  cursor: pointer;
}

.game-picker-btn.active {
  border: 1px solid var(--p-00065-ff, #0065ff);
  background: var(---J1, linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%));
}
</style>


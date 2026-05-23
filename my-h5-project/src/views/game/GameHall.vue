<template>
  <div class="game-hall-page">
    <header class="game-hall-header">
      <div class="game-hall-header__left">
        <img :src="iconBack" alt="back" class="back-btn" @click="goBack" />
        <h1>{{ $t('游戏大厅') }}</h1>
      </div>
      <div class="game-hall-header__balance">
        <div class="balance-pill">
          <div class="balance-pill__row">
            <img class="currency-icon" src="@/assets/icon_cny.svg" alt="" />
            <span class="amount">¥ {{ displayBalance }}</span>
          </div>
          <div
            class="add-btn"
            role="button"
            tabindex="0"
            aria-label="充值"
            @click="goRecharge"
            @keydown.enter.prevent="goRecharge"
            @keydown.space.prevent="goRecharge"
          >
            <img src="@/assets/icon_add_to.svg" alt="" />
          </div>
        </div>
      </div>
      <div class="game-hall-header__avatar" @click="goUser">
        <img :src="displayAvatar" alt="" />
      </div>
    </header>

    <div class="game-hall-body">
      <div class="game-hall-tabs-wrap">
        <div class="game-hall-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="game-hall-tab"
            :class="{ active: activeKey === tab.key }"
            role="button"
            tabindex="0"
            @click="selectTab(tab.key)"
            @keydown.enter.prevent="selectTab(tab.key)"
            @keydown.space.prevent="selectTab(tab.key)"
          >
            <img :src="tab.icon" :alt="tab.name" />
            <span>{{ $t(tab.name) }}</span>
          </div>
        </div>
      </div>

      <div class="game-hall-search">
        <input
          v-model.trim="searchQuery"
          type="search"
          :placeholder="$t('请输入游戏名称')"
          enterkeyhint="search"
        />
        <img class="search-icon" src="@/assets/icon_search.svg" alt="" />
      </div>

      <div class="game-hall-scroll">
        <section v-if="filteredGames.length" class="game-hall-grid">
          <div
            v-for="item in filteredGames"
            :key="item.id"
            class="game-hall-card"
            @click="onGameClick(item)"
            role="button"
            tabindex="0"
            @keydown.enter.prevent="onGameClick(item)"
            @keydown.space.prevent="onGameClick(item)"
          >
            <img class="cover" :src="item.image" :alt="item.name" />
            <span class="label">{{ $t(item.name) }}</span>
          </div>
        </section>
        <p v-else class="game-hall-empty">{{ $t('暂无游戏') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toast } from '@/components/Toast'
import iconBack from '@/assets/icon_dack.svg'
import avatarDefault from '@/assets/touxiang2.png'
import iconTy from '@/assets/icon_ty.svg'
import iconSx from '@/assets/icon_sx.svg'
import iconDz from '@/assets/icon_dz.svg'
import iconCp from '@/assets/icon_cp.svg'
import iconBy from '@/assets/icon_by.svg'
import iconQp from '@/assets/icon_qp.svg'
import imgHomeSportSb from '@/assets/img_home_sport_sb.png'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const searchQuery = ref('')

/** 接口返回后赋值 `tabs.value = [...]`，项需含 key / name / icon */
const tabs = ref([
  { key: 'ty', name: '体育', icon: iconTy },
  { key: 'sx', name: '视讯', icon: iconSx },
  { key: 'dz', name: '电子', icon: iconDz },
  { key: 'cp', name: '彩票', icon: iconCp },
  { key: 'by', name: '捕鱼', icon: iconBy },
  { key: 'qp', name: '棋牌', icon: iconQp }
])

const gamesByCategory = {
  ty: [
    { id: 'ty-1', name: 'OB体育', image: imgHomeSportSb },
    { id: 'ty-2', name: '沙巴体育', image: imgHomeSportSb }
  ],
  sx: [
    { id: 'sx-1', name: '视讯大厅', image: imgHomeSportSb },
    { id: 'sx-2', name: '真人娱乐', image: imgHomeSportSb }
  ],
  dz: [
    { id: 'dz-1', name: '电子游艺', image: imgHomeSportSb },
    { id: 'dz-2', name: '老虎机', image: imgHomeSportSb }
  ],
  cp: [
    { id: 'cp-pl5', name: '排列5', image: imgHomeSportSb, room: 'pl5' },
    { id: 'cp-lhc', name: '六合彩', image: imgHomeSportSb, room: 'lhc' },
    { id: 'cp-1', name: '彩票中心', image: imgHomeSportSb, room: 'live' },
    { id: 'cp-2', name: '快三', image: imgHomeSportSb, room: 'live' }
  ],
  by: [
    { id: 'by-1', name: '捕鱼达人', image: imgHomeSportSb },
    { id: 'by-2', name: '深海捕鱼', image: imgHomeSportSb }
  ],
  qp: [
    { id: 'qp-1', name: '棋牌大厅', image: imgHomeSportSb },
    { id: 'qp-2', name: '斗地主', image: imgHomeSportSb }
  ]
}

const activeKey = ref('ty')

function firstTabKey() {
  return tabs.value[0]?.key ?? 'ty'
}

function resolveCategoryFromRoute() {
  const q = route.query.category
  if (typeof q === 'string' && tabs.value.some((t) => t.key === q)) return q
  return firstTabKey()
}

function syncTabFromRoute() {
  activeKey.value = resolveCategoryFromRoute()
}

onMounted(() => {
  syncTabFromRoute()
})

watch(
  () => route.query.category,
  () => {
    syncTabFromRoute()
  }
)

watch(
  tabs,
  () => {
    if (!tabs.value.length) return
    if (!tabs.value.some((t) => t.key === activeKey.value)) {
      activeKey.value = firstTabKey()
    }
    syncTabFromRoute()
  },
  { deep: true }
)

const displayBalance = computed(() => {
  const b = userStore.userInfo?.balance
  if (b == null || Number.isNaN(Number(b))) return '89,685.50'
  return Number(b).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const displayAvatar = computed(() => userStore.userInfo?.avatar || avatarDefault)

const filteredGames = computed(() => {
  const list = gamesByCategory[activeKey.value] || []
  const q = searchQuery.value
  if (!q) return list
  return list.filter((g) => g.name.includes(q))
})

function selectTab(key) {
  activeKey.value = key
  router.replace({ path: '/game-hall', query: { ...route.query, category: key } })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function goRecharge() {
  router.push('/recharge')
}

function goUser() {
  router.push('/user')
}

function onGameClick(item) {
  if (activeKey.value === 'cp') {
    const query = { gameId: item.id, gameName: item.name }
    if (item.room === 'pl5') {
      router.push({ name: 'pl5Room', query })
      return
    }
    if (item.room === 'lhc') {
      router.push({ name: 'lhcRoom', query })
      return
    }
    router.push({ path: '/game-room', query })
    return
  }
  toast(t(item.name))
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/game-hall.less';
</style>

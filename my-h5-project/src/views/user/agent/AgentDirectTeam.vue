<template>
  <div class="agent-subpage agent-direct-team-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>直属团队</h1>
    </header>

    <div class="team-tabs">
      <button
        type="button"
        class="team-tab"
        :class="{ 'team-tab--active': activeTab === 'member' }"
        @click="activeTab = 'member'"
      >
        直属会员
      </button>
      <button
        type="button"
        class="team-tab"
        :class="{ 'team-tab--active': activeTab === 'agent' }"
        @click="activeTab = 'agent'"
      >
        下级代理
      </button>
    </div>

    <div v-if="activeTab === 'member'" class="team-filters">
      <div class="team-filter-row">
        <button type="button" class="team-filter-btn" @click="openPicker('time')">
          <span class="team-filter-btn-text">{{ timeRangeLabel }}</span>
          <van-icon name="arrow-down" />
        </button>
        <button type="button" class="team-filter-btn" @click="openPicker('status')">
          <span class="team-filter-btn-text">{{ statusLabel }}</span>
          <van-icon name="arrow-down" />
        </button>
      </div>
      <button type="button" class="team-filter-btn team-filter-full" @click="openPicker('type')">
        <span class="team-filter-btn-text">{{ typeLabel }}</span>
        <van-icon name="arrow-down" />
      </button>
    </div>

    <div class="team-search">
      <img class="team-search__icon" :src="iconSearch" alt="">
      <input
        ref="searchInputRef"
        v-model="keyword"
        class="team-search__input"
        type="search"
        enterkeyhint="search"
        placeholder="请输入搜索账号"
        autocomplete="off"
      >
      <button type="button" class="team-search__btn" @click="onSearchClick">
        搜索
      </button>
    </div>

    <div class="team-toolbar">
      <span>账户 {{ displayList.length }}</span>
      <button type="button" class="team-sort" @click="cycleSort">
        <span>{{ sortDisplay }}</span>
        <img class="team-sort-icon" :src="iconSortAdjustment" alt="" aria-hidden="true">
      </button>
    </div>

    <div v-if="!displayList.length" class="team-empty">
      <img class="team-empty-img" :src="noDataImage" alt="">
      <p class="team-empty-text">暂无数据</p>
    </div>
    <section v-else class="team-list">
      <article v-for="item in displayList" :key="item.id" class="team-item">
        <button type="button" class="team-item-head" @click="toggleItem(item.id)">
          <img class="team-item-avatar" :src="item.avatar || avatarDefault" alt="">
          <div class="team-item-main">
            <span class="team-item-name">{{ item.nickname || item.account }}</span>
            <span v-if="item.isNew" class="team-item-tag">NEW</span>
          </div>
          <span
            class="team-item-pnl"
            :class="item.profitLoss >= 0 ? 'team-item-pnl--pos' : 'team-item-pnl--neg'"
          >
            {{ formatPnL(item.profitLoss) }}
          </span>
          <img
            class="question-arrow"
            :src="isExpanded(item.id) ? iconDetailsTop : iconDetailsDown"
            alt="arrow"
          >
        </button>
        <div v-show="isExpanded(item.id)" class="team-item-body">
          <div
            v-for="(row, index) in detailRows"
            :key="row.key"
            class="team-detail-row"
            :class="{ 'team-detail-row--alt': index % 2 === 1 }"
          >
            <span class="team-detail-label">{{ row.label }}</span>
            <span class="team-detail-value">{{ formatDetailValue(item, row) }}</span>
          </div>
        </div>
      </article>
    </section>

    <van-popup
      v-model:show="pickerVisible"
      position="bottom"
      round
      class="team-picker-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="team-picker-head">
        <span class="team-picker-title">{{ pickerTitle }}</span>
        <button type="button" class="team-picker-close" aria-label="关闭" @click="pickerVisible = false">
          <img :src="iconClose" alt="">
        </button>
      </div>
      <div class="team-picker-list">
        <button
          v-for="opt in pickerOptions"
          :key="opt.value"
          type="button"
          class="team-picker-row"
          :class="{ 'team-picker-row--active': isPickerSelected(opt) }"
          @click="applyPicker(opt)"
        >
          <span class="team-picker-label">{{ opt.label }}</span>
          <img
            v-if="isPickerSelected(opt)"
            class="team-picker-check"
            :src="iconSelected"
            alt=""
          >
          <span v-else class="team-picker-radio" aria-hidden="true" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSearch from '@/assets/icon_search.svg'
import iconSortAdjustment from '@/assets/icon_sort_adjustment.svg'
import iconDetailsDown from '@/assets/icon_details_down2.svg'
import iconDetailsTop from '@/assets/icon_details_top.svg'
import avatarDefault from '@/assets/touxiang2.png'
import { directTeamAgents, directTeamMembers } from './agent-direct-team.mock'

const MEMBER_DETAIL_ROWS = [
  { key: 'validBet', label: '有效投注金额', money: true },
  { key: 'payout', label: '派彩金额', money: true },
  { key: 'deposit', label: '充值金额', money: true },
  { key: 'withdraw', label: '提现金额', money: true },
  { key: 'registerTime', label: '注册时间', money: false }
]

const AGENT_DETAIL_ROWS = [
  { key: 'teamCount', label: '团队人数', money: false },
  { key: 'validBet', label: '有效投注金额', money: true },
  { key: 'payout', label: '派彩金额', money: true },
  { key: 'registerTime', label: '注册时间', money: false }
]

const router = useRouter()

const activeTab = ref('member')
const keyword = ref('')
const searchKeyword = ref('')
const searchInputRef = ref(null)

const onSearchClick = () => {
  searchInputRef.value?.blur()
  searchKeyword.value = keyword.value.trim()
}

const fmtMoney = (n) => {
  const num = Number(n || 0)
  return num.toFixed(2)
}

const formatPnL = (n) => {
  const num = Number(n || 0)
  const prefix = num >= 0 ? '+' : '-'
  return `${prefix}¥${fmtMoney(Math.abs(num))}`
}

const displayList = computed(() => {
  const source = activeTab.value === 'member' ? directTeamMembers : directTeamAgents
  let items = [...source]
  const kw = searchKeyword.value.toLowerCase()
  if (kw) {
    items = items.filter((item) => {
      const name = (item.nickname || item.account).toLowerCase()
      return name.includes(kw) || item.account.toLowerCase().includes(kw)
    })
  }
  if (sortMode.value === 'desc') {
    items.sort((a, b) => b.profitLoss - a.profitLoss)
  } else if (sortMode.value === 'asc') {
    items.sort((a, b) => a.profitLoss - b.profitLoss)
  }
  return items
})

const expandedIds = ref([directTeamMembers[0]?.id].filter(Boolean))

watch(activeTab, () => {
  const source = activeTab.value === 'member' ? directTeamMembers : directTeamAgents
  const first = source[0]?.id
  expandedIds.value = first ? [first] : []
})

const isExpanded = (id) => expandedIds.value.includes(id)

const toggleItem = (id) => {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter((item) => item !== id)
    return
  }
  expandedIds.value.push(id)
}

const detailRows = computed(() =>
  activeTab.value === 'member' ? MEMBER_DETAIL_ROWS : AGENT_DETAIL_ROWS
)

const formatDetailValue = (item, row) => {
  const val = item[row.key]
  if (row.money) return fmtMoney(val)
  if (row.key === 'teamCount') return String(val ?? 0)
  return val ?? '-'
}

/** 时间：对应「时间选择」 */
const timeValue = ref('30d')
const TIME_OPTIONS = [
  { value: 'all', label: '所有' },
  { value: '24h', label: '24小时内' },
  { value: '7d', label: '7天内' },
  { value: '15d', label: '15天内' },
  { value: '30d', label: '30天内' }
]

/** 状态：对应「状态选择」— 全部状态玩家 / 游戏玩家 / 新增玩家 */
const statusValue = ref('all')
const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态玩家' },
  { value: 'gamer', label: '游戏玩家' },
  { value: 'new', label: '新增玩家' }
]

/** 类型：对应稿图「全部类型 / 充值 / 提现」弹层（标题用类型选择） */
const typeValue = ref('all')
const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'deposit', label: '充值' },
  { value: 'withdraw', label: '提现' }
]

const timeRangeLabel = computed(() => TIME_OPTIONS.find((o) => o.value === timeValue.value)?.label ?? '30天内')
const statusLabel = computed(() => STATUS_OPTIONS.find((o) => o.value === statusValue.value)?.label ?? '全部状态玩家')
const typeLabel = computed(() => TYPE_OPTIONS.find((o) => o.value === typeValue.value)?.label ?? '全部类型')

/** 盈亏排序：无 → 降序 → 升序 */
const sortMode = ref('none')
const SORT_CYCLE = ['none', 'desc', 'asc']

const sortDisplay = computed(() => '赢亏')

const cycleSort = () => {
  const i = SORT_CYCLE.indexOf(sortMode.value)
  sortMode.value = SORT_CYCLE[(i + 1) % SORT_CYCLE.length]
}

const pickerVisible = ref(false)
const pickerKind = ref('time')

/* 稿图：玩家状态与账变类型弹层标题均为「状态选择」 */
const pickerTitle = computed(() =>
  pickerKind.value === 'time' ? '时间选择' : '状态选择'
)

const pickerOptions = computed(() => {
  if (pickerKind.value === 'time') return TIME_OPTIONS
  if (pickerKind.value === 'status') return STATUS_OPTIONS
  return TYPE_OPTIONS
})

const openPicker = (kind) => {
  pickerKind.value = kind
  pickerVisible.value = true
}

const currentPickerValue = computed(() => {
  if (pickerKind.value === 'time') return timeValue.value
  if (pickerKind.value === 'status') return statusValue.value
  return typeValue.value
})

const isPickerSelected = (opt) => opt.value === currentPickerValue.value

const applyPicker = (opt) => {
  if (pickerKind.value === 'time') timeValue.value = opt.value
  else if (pickerKind.value === 'status') statusValue.value = opt.value
  else typeValue.value = opt.value
  pickerVisible.value = false
}

const goBack = () => router.back()
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-direct-team.less';

.team-filter-full {
  width: 100%;
}

.team-filter-btn-text {
  flex: 1;
  min-width: 0;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-sort-icon {
  width: 12px;
  height: 12px;
  margin-left: 2px;
  flex-shrink: 0;
  display: block;
  object-fit: contain;
}
</style>

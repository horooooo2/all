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
      <span>账户 {{ list.length }}</span>
      <button type="button" class="team-sort" @click="cycleSort">
        <span>{{ sortDisplay }}</span>
        <span class="team-sort-icon" aria-hidden="true">{{ sortIcon }}</span>
      </button>
    </div>

    <div v-if="!list.length" class="team-empty">
      <img class="team-empty-img" :src="noDataImage" alt="">
      <p class="team-empty-text">暂无数据</p>
    </div>

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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconClose from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconSearch from '@/assets/icon_search.png'

const router = useRouter()

const activeTab = ref('member')
const keyword = ref('')
const searchInputRef = ref(null)
const list = ref([])

const onSearchClick = () => {
  searchInputRef.value?.blur()
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

const sortDisplay = computed(() => '盈亏')

const sortIcon = computed(() => {
  if (sortMode.value === 'desc') return '↓'
  if (sortMode.value === 'asc') return '↑'
  return '⇅'
})

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
  font-size: 12px;
  line-height: 1;
  color: var(--text-color-secondary);
  margin-left: 2px;
  font-family: system-ui, sans-serif;
}
</style>

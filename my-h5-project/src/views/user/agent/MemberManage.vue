<template>
  <div class="agent-subpage member-manage-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>会员管理</h1>
      <div class="header-spacer" />
      <button type="button" class="create-btn" @click="onCreatePlayer">创建玩家</button>
    </header>

    <div class="mm-stats">
      <div class="mm-stat">
        <span class="mm-stat-label">直属代理数：</span>
        <span class="mm-stat-value">{{ stats.directAgentCount }}</span>
      </div>
      <div class="mm-stat mm-stat--right">
        <span class="mm-stat-label">团队玩家总数：</span>
        <span class="mm-stat-value">{{ stats.teamPlayerCount }}</span>
      </div>
    </div>

    <div class="mm-tools">
      <div class="mm-search">
        <img class="mm-search__icon" :src="iconSearch" alt="">
        <input
          v-model.trim="keyword"
          class="mm-search-input"
          type="search"
          enterkeyhint="search"
          placeholder="请输入ID或昵称"
          @keyup.enter="onSearch"
        >
      </div>

      <button type="button" class="mm-filter" @click="openFilter">
        <img class="mm-filter-icon" :src="iconFilter" alt="">
        筛选
      </button>
    </div>

    <div v-if="!list.length" class="mm-empty">
      <img class="mm-empty-img" :src="noDataImage" alt="">
      <p class="mm-empty-text">暂无数据</p>
    </div>
    <div v-else class="mm-list">
      <div v-for="item in list" :key="item.id" class="mm-card">
        <div class="mm-card-left">
          <div class="mm-card-name">{{ item.nickname }}({{ item.mark }})</div>
          <div class="mm-card-id">{{ item.id }}</div>
        </div>
        <div class="mm-card-mid">
          <div class="mm-card-balance">¥{{ formatMoney(item.balance) }}</div>
        </div>
        <div class="mm-card-right">
          <button
            type="button"
            class="mm-card-btn mm-card-btn--primary"
            :disabled="!item.canTransferIn"
            @click="onTransfer(item, 'in')"
          >
            转账
          </button>
          <button
            type="button"
            class="mm-card-btn mm-card-btn--ghost"
            :disabled="!item.canTransferOut"
            @click="onTransfer(item, 'out')"
          >
            转账
          </button>
        </div>
      </div>
    </div>

    <van-popup
      v-model:show="filterVisible"
      position="bottom"
      round
      class="mm-filter-popup"
      :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }"
    >
      <div class="mm-filter-sheet">
        <div class="mm-filter-head">
          <span class="mm-filter-title">筛选搜寻</span>
          <button type="button" class="mm-filter-close" aria-label="关闭" @click="filterVisible = false">
            <img :src="iconClose" alt="">
          </button>
        </div>

        <div class="mm-filter-body">
          <div class="mm-filter-group">
            <div class="mm-filter-label">注册时间</div>
            <button type="button" class="mm-filter-date" @click="openDatePicker('register')">
              <span class="mm-filter-date-text">{{ registerDate }}</span>
              <van-icon name="arrow-down" />
            </button>
          </div>

          <div class="mm-filter-group">
            <div class="mm-filter-label">最后登录时间</div>
            <button type="button" class="mm-filter-date" @click="openDatePicker('lastLogin')">
              <span class="mm-filter-date-text">{{ lastLoginDate }}</span>
              <van-icon name="arrow-down" />
            </button>
          </div>

          <div class="mm-filter-group">
            <div class="mm-filter-label">类型筛选</div>
            <div class="mm-filter-type">
              <button
                v-for="opt in typeOptions"
                :key="opt.value"
                type="button"
                class="mm-type-btn"
                :class="{ 'mm-type-btn--active': typeValue === opt.value }"
                @click="typeValue = opt.value"
              >
                <span class="mm-type-text">{{ opt.label }}</span>
                <span class="mm-type-icon" aria-hidden="true">
                  <img v-if="typeValue === opt.value" :src="iconYes" alt="">
                  <span v-else class="mm-type-radio" />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="mm-filter-actions">
          <button type="button" class="mm-filter-reset" @click="resetFilter">重置</button>
          <button type="button" class="mm-filter-apply" @click="applyFilter">搜寻</button>
        </div>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="calendarVisible"
      :title="calendarTitle"
      :min-date="minDate"
      :max-date="maxDate"
      :show-confirm="true"
      switch-mode="month"
      @confirm="onCalendarConfirm"
    />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconSearch from '@/assets/icon_search.svg'
import iconFilter from '@/assets/icon_filter.svg'
import iconClose from '@/assets/icon_x.svg'
import iconYes from '@/assets/icon_yes.svg'
import noDataImage from '@/assets/no_data.svg'
import toast from '@/components/Toast'

const router = useRouter()
const goBack = () => router.back()

const stats = reactive({
  directAgentCount: 0,
  teamPlayerCount: 1
})

const keyword = ref('')
const list = ref([
  {
    id: '2200191',
    nickname: 'zz111',
    mark: 'TWZcPCvx',
    balance: 10000,
    canTransferIn: true,
    canTransferOut: false
  }
])

const formatMoney = (n) => {
  const num = Number(n || 0)
  return num.toFixed(2)
}

const onSearch = () => {
  toast.success('搜索（待对接）')
}

const onCreatePlayer = () => {
  router.push({ name: 'createPlayer' })
}

const onTransfer = (item, kind) => {
  if (kind === 'in' && !item.canTransferIn) return
  if (kind === 'out' && !item.canTransferOut) return
  toast.success(`转账（待对接）`)
}

const filterVisible = ref(false)
const openFilter = () => {
  filterVisible.value = true
}
const registerDate = ref('2026/03/09')
const lastLoginDate = ref('2026/03/09')
const typeOptions = [
  { value: 'all', label: '所有' },
  { value: 'directAgent', label: '直属代理' },
  { value: 'directPlayer', label: '直属玩家' }
]
const typeValue = ref('all')

const calendarVisible = ref(false)
const calendarKind = ref('register') // register | lastLogin
const calendarTitle = ref('注册时间')
const minDate = new Date(2010, 0, 1)
const maxDate = new Date(2035, 11, 31)

const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

const openDatePicker = (kind) => {
  calendarKind.value = kind
  calendarTitle.value = kind === 'register' ? '注册时间' : '最后登录时间'
  calendarVisible.value = true
}

const onCalendarConfirm = (date) => {
  const v = formatDate(date)
  if (calendarKind.value === 'register') registerDate.value = v
  else lastLoginDate.value = v
  calendarVisible.value = false
}
const resetFilter = () => {
  registerDate.value = '2026/03/09'
  lastLoginDate.value = '2026/03/09'
  typeValue.value = 'all'
  toast.success('已重置（待对接）')
}
const applyFilter = () => {
  filterVisible.value = false
  toast.success('已应用（待对接）')
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/member-manage.less';
</style>


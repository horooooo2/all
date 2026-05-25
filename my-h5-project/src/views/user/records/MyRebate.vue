<template>
  <div class="my-rebate-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>我的返水</h1>
    </header>

    <section class="top-tabs">
      <button
        type="button"
        class="top-tab"
        :class="{ active: activeMainTab === 'record' }"
        @click="activeMainTab = 'record'"
      >
        返水记录
      </button>
      <button
        type="button"
        class="top-tab"
        :class="{ active: activeMainTab === 'treatment' }"
        @click="activeMainTab = 'treatment'"
      >
        返水待遇
      </button>
    </section>

    <section v-if="activeMainTab === 'record'" class="record-tab-panel">
      <div class="income-card">
        <span>今日返水收入</span>
        <strong>¥{{ formatMoney(summary.todayRebateAmount) }}</strong>
      </div>

      <div class="overview-card">
        <div class="overview-row">
          <span>昨天个人有效投注</span>
          <strong>¥{{ formatMoney(summary.yesterdayValidBet) }}</strong>
        </div>
        <div class="overview-row">
          <span>有效结算投注返水</span>
          <strong>¥{{ formatMoney(summary.settledValidBetRebate) }}</strong>
        </div>
        <div class="overview-row">
          <span>本月累计返水量</span>
          <strong>¥{{ formatMoney(summary.monthRebateAmount) }}</strong>
        </div>
      </div>

      <div class="record-table-card">
        <div class="record-switch-row">
          <button
            v-for="item in recordTimeTabs"
            :key="item.value"
            type="button"
            class="switch-btn"
            :class="{ active: activeRecordTimeTab === item.value }"
            @click="selectRecordTimeTab(item.value)"
          >
            {{ item.label }}
          </button>
          <div class="icon-btn">
            <img :src="iconFunction" alt="date-filter" @click="openTimePopup">
          </div>
        </div>

        <div class="table-head">
          <span>时间</span>
          <span>返水有效投注</span>
          <span>返水</span>
        </div>

        <div v-if="loading && !recordGroups.length" class="record-loading">加载中...</div>

        <template v-else-if="recordGroups.length">
          <template v-for="group in recordGroups" :key="group.date">
            <button type="button" class="group-row" @click="toggleGroup(group.date)">
              <span>{{ group.date }}</span>
              <span>¥{{ formatMoney(group.totalValidBet) }}</span>
              <span>¥{{ formatMoney(group.totalRebate) }}</span>
              <img
                class="group-row__arrow"
                :class="{ 'is-up': expandedGroups.includes(group.date) }"
                :src="iconDetailsDown"
                alt=""
              >
            </button>
            <div v-if="expandedGroups.includes(group.date)">
              <div
                v-for="detail in group.items"
                :key="`${group.date}-${detail.time}-${detail.validBet}`"
                class="detail-row"
              >
                <span>{{ detail.time }}</span>
                <span>¥{{ formatMoney(detail.validBet) }}</span>
                <span>¥{{ formatMoney(detail.rebate) }}</span>
              </div>
            </div>
          </template>
        </template>

        <div v-else-if="!loading" class="record-empty record-empty--inline">
          <img :src="noDataImage" alt="no-data">
          <p>暂无数据</p>
        </div>

        <div v-if="recordGroups.length" class="summary-row">
          <span>总计</span>
          <span>¥{{ formatMoney(recordSummary.totalValidBet) }}</span>
          <span>¥{{ formatMoney(recordSummary.totalRebate) }}</span>
        </div>

        <button
          v-if="!loading && !finished && recordGroups.length"
          type="button"
          class="load-more-btn"
          @click="loadRecords"
        >
          加载更多
        </button>

        <div
          v-else-if="!loading && finished && recordGroups.length"
          class="record-finished-tip"
        >
          没有更多了
        </div>
      </div>
    </section>

    <section v-else class="treatment-tab-panel">
      <div v-if="treatmentGameTabs.length" class="game-tabs">
        <button
          v-for="item in treatmentGameTabs"
          :key="item.value"
          type="button"
          class="game-tab-btn"
          :class="{ active: activeTreatmentGameTab === item.value }"
          @click="onTreatmentTabChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <div v-if="treatmentLoading" class="record-loading">加载中...</div>

      <template v-else-if="currentTreatmentRows.length">
        <div class="treatment-table">
          <div class="table-head">
            <span>类型</span>
            <span>最低有效投注</span>
            <span>返水比例(%)</span>
          </div>

          <template v-for="item in currentTreatmentRows" :key="item.type">
            <button type="button" class="group-row treatment-group-row" @click="toggleTreatment(item.type)">
              <span class="treatment-group-row__title">{{ item.type }}</span>
              <img
                class="treatment-group-row__arrow"
                :class="{ 'is-up': expandedTreatment.includes(item.type) }"
                :src="iconDetailsDown"
                alt=""
              >
            </button>
            <div v-if="expandedTreatment.includes(item.type) && item.children?.length">
              <div
                v-for="child in item.children"
                :key="`${item.type}-${child.type}`"
                class="detail-row"
              >
                <span>{{ child.type }}</span>
                <span>{{ child.minValidBet }}</span>
                <span>{{ child.rate }}</span>
              </div>
            </div>
          </template>
        </div>
      </template>

      <div v-else-if="!treatmentLoading" class="record-empty">
        <img :src="noDataImage" alt="no-data">
        <p>暂无数据</p>
      </div>
    </section>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="custom-popup">
      <div class="time-panel">
        <h3>下单时间</h3>
        <div class="quick-row">
          <button
            v-for="item in quickOptions"
            :key="item.label"
            type="button"
            class="quick-item"
            :class="{ active: draftQuick === item.value }"
            @click="selectQuick(item.value)"
          >
            {{ item.label }}
            <img
              v-if="draftQuick === item.value"
              class="selected-icon"
              :src="iconSelected"
              alt="selected"
            >
            <span v-else class="circle-icon" />
          </button>
        </div>

        <div class="range-row">
          <button type="button" class="date-cell" @click="openDatePicker('start')">{{ formatSlashDate(draftStartDate) }}</button>
          <span>-</span>
          <button type="button" class="date-cell" @click="openDatePicker('end')">{{ formatSlashDate(draftEndDate) }}</button>
        </div>

        <div class="action-row">
          <button type="button" class="btn-reset" @click="resetTime">重置</button>
          <button type="button" class="btn-confirm" @click="confirmTime">确定</button>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDatePickerPopup" position="bottom" round class="custom-popup date-picker-popup">
      <div class="date-picker-sheet">
        <div class="popup-title-row">
          <span>{{ datePickerTitle }}</span>
          <button type="button" class="picker-confirm" @click="confirmPickDate">确认</button>
        </div>
        <van-date-picker
          v-model="pickerDateValues"
          :columns-type="['year', 'month', 'day']"
          :min-date="minDate"
          :max-date="maxDate"
          :show-toolbar="false"
        />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import noDataImage from '@/assets/no_data.svg'
import iconFunction from '@/assets/icon_function.svg'
import iconSelected from '@/assets/icon_sel.svg'
import iconDetailsDown from '@/assets/icon_details_down.svg'
import toast from '@/components/Toast'
import {
  buildRebateRecordQuery,
  fetchRebateRecords,
  fetchRebateRules,
  getRebateRangeByPreset,
  groupRebateRecordsByDate
} from '@/api/rebate'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const goBack = () => router.back()

const PAGE_SIZE = 20

const activeMainTab = ref('record')
const recordTimeTabs = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '本周', value: 'week' }
]
const activeRecordTimeTab = ref('today')
const showTimePopup = ref(false)
const quickOptions = [
  { label: '今天', value: 'today' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' }
]
const selectedQuick = ref('today')
const draftQuick = ref('today')

const initRange = getRebateRangeByPreset('today')
const selectedStartDate = ref(initRange.start)
const selectedEndDate = ref(initRange.end)
const draftStartDate = ref(new Date(initRange.start))
const draftEndDate = ref(new Date(initRange.end))

const recordList = ref([])
const summary = ref({
  todayRebateAmount: 0,
  yesterdayValidBet: 0,
  settledValidBetRebate: 0,
  monthRebateAmount: 0
})
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const finished = ref(false)

const formatMoney = (value) => {
  const n = Number(value)
  return (Number.isNaN(n) ? 0 : n).toFixed(2)
}

const recordGroups = computed(() => groupRebateRecordsByDate(recordList.value))

const recordSummary = computed(() =>
  recordGroups.value.reduce(
    (acc, item) => {
      acc.totalValidBet += item.totalValidBet
      acc.totalRebate += item.totalRebate
      return acc
    },
    { totalValidBet: 0, totalRebate: 0 }
  )
)

const selectRecordTimeTab = (value) => {
  activeRecordTimeTab.value = value
  selectedQuick.value = value
  const { start, end } = getRebateRangeByPreset(value)
  selectedStartDate.value = start
  selectedEndDate.value = end
  resetAndLoadRecords()
}

const expandedGroups = ref([])

const loadRecords = async () => {
  if (activeMainTab.value !== 'record') return

  if (!userStore.isLogin) {
    loading.value = false
    finished.value = true
    router.replace({ name: 'login', query: { redirect: '/my-rebate' } })
    return
  }

  if (finished.value && page.value > 1) return

  loading.value = true
  try {
    const params = buildRebateRecordQuery(
      selectedStartDate.value,
      selectedEndDate.value,
      page.value,
      PAGE_SIZE
    )
    const res = await fetchRebateRecords(params)

    if (page.value === 1) {
      recordList.value = res.list
      summary.value = res.summary
      if (res.groups.length) {
        expandedGroups.value = [res.groups[0].date]
      } else {
        expandedGroups.value = []
      }
    } else {
      recordList.value = [...recordList.value, ...res.list]
    }

    total.value = res.total
    finished.value = recordList.value.length >= total.value || res.list.length < PAGE_SIZE
    if (!finished.value) {
      page.value += 1
    }
  } catch (error) {
    console.error('加载返水记录失败:', error)
    if (page.value === 1) {
      recordList.value = []
      expandedGroups.value = []
    }
    finished.value = true
    toast.error('加载返水记录失败')
  } finally {
    loading.value = false
  }
}

const resetAndLoadRecords = () => {
  page.value = 1
  total.value = 0
  recordList.value = []
  finished.value = false
  loadRecords()
}

const toggleGroup = (date) => {
  const index = expandedGroups.value.indexOf(date)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(date)
  }
}

const treatmentGameTabs = ref([])
const treatmentRulesMap = ref({})
const activeTreatmentGameTab = ref('')
const treatmentLoading = ref(false)
const treatmentLoaded = ref(false)

const expandedTreatment = ref([])

const currentTreatmentRows = computed(
  () => treatmentRulesMap.value[activeTreatmentGameTab.value] || []
)

const syncTreatmentExpand = () => {
  const first = currentTreatmentRows.value[0]
  expandedTreatment.value = first?.type ? [first.type] : []
}

const loadTreatmentRules = async () => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/my-rebate' } })
    return
  }

  treatmentLoading.value = true
  try {
    const categories = await fetchRebateRules()
    const tabs = []
    const map = {}

    categories.forEach((cat) => {
      tabs.push({ label: cat.label, value: cat.key })
      map[cat.key] = cat.rows
    })

    treatmentGameTabs.value = tabs
    treatmentRulesMap.value = map
    treatmentLoaded.value = true

    if (!tabs.length) {
      activeTreatmentGameTab.value = ''
      expandedTreatment.value = []
      return
    }

    if (!tabs.some((item) => item.value === activeTreatmentGameTab.value)) {
      activeTreatmentGameTab.value = tabs[0].value
    }
    syncTreatmentExpand()
  } catch (error) {
    console.error('加载返水待遇失败:', error)
    treatmentGameTabs.value = []
    treatmentRulesMap.value = {}
    treatmentLoaded.value = false
    toast.error('加载返水待遇失败')
  } finally {
    treatmentLoading.value = false
  }
}

const onTreatmentTabChange = (value) => {
  activeTreatmentGameTab.value = value
  syncTreatmentExpand()
}
const toggleTreatment = (type) => {
  const index = expandedTreatment.value.indexOf(type)
  if (index > -1) {
    expandedTreatment.value.splice(index, 1)
  } else {
    expandedTreatment.value.push(type)
  }
}

const showDatePickerPopup = ref(false)
const minDate = new Date(2020, 0, 1)
const maxDate = new Date()
const pickerDateValues = ref(['2026', '03', '08'])
const pickerTarget = ref('start')
const datePickerTitle = computed(() => (pickerTarget.value === 'start' ? '开始时间' : '结束时间'))
const formatSlashDate = (date) => {
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}/${mm}/${dd}`
}

const selectQuick = (value) => {
  draftQuick.value = value
  const { start, end } = getRebateRangeByPreset(value)
  draftStartDate.value = start
  draftEndDate.value = end
}

const openTimePopup = () => {
  draftQuick.value = selectedQuick.value
  draftStartDate.value = new Date(selectedStartDate.value)
  draftEndDate.value = new Date(selectedEndDate.value)
  showTimePopup.value = true
}

const openDatePicker = (target = 'start') => {
  pickerTarget.value = target
  const date = target === 'start' ? draftStartDate.value : draftEndDate.value
  pickerDateValues.value = [
    `${date.getFullYear()}`,
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0')
  ]
  showDatePickerPopup.value = true
}

const confirmPickDate = () => {
  const [y, m, d] = pickerDateValues.value
  const picked = new Date(Number(y), Number(m) - 1, Number(d))

  if (pickerTarget.value === 'start') {
    draftStartDate.value = picked
  } else {
    draftEndDate.value = picked
  }
  if (draftStartDate.value > draftEndDate.value) {
    const temp = draftStartDate.value
    draftStartDate.value = draftEndDate.value
    draftEndDate.value = temp
  }
  draftQuick.value = ''
  showDatePickerPopup.value = false
}

const resetTime = () => {
  draftQuick.value = 'today'
  const { start, end } = getRebateRangeByPreset('today')
  draftStartDate.value = start
  draftEndDate.value = end
}

const confirmTime = () => {
  selectedQuick.value = draftQuick.value
  if (recordTimeTabs.some((t) => t.value === draftQuick.value)) {
    activeRecordTimeTab.value = draftQuick.value
  }
  selectedStartDate.value = new Date(draftStartDate.value)
  selectedEndDate.value = new Date(draftEndDate.value)
  showTimePopup.value = false
  resetAndLoadRecords()
}

watch(activeMainTab, (tab) => {
  if (tab === 'record' && !recordList.value.length && !loading.value) {
    resetAndLoadRecords()
  }
  if (tab === 'treatment' && !treatmentLoaded.value && !treatmentLoading.value) {
    loadTreatmentRules()
  }
})

onMounted(() => {
  if (!userStore.isLogin) {
    router.replace({ name: 'login', query: { redirect: '/my-rebate' } })
    return
  }
  resetAndLoadRecords()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/my-rebate.less';
</style>

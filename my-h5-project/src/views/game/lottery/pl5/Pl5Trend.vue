<template>
  <div class="pl5-trend-page">
    <header class="pl5-trend-header" role="banner">
      <div class="pl5-trend-header__left">
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          aria-label="返回"
          @click="goBack"
          @keydown.enter.prevent="goBack"
          @keydown.space.prevent="goBack"
        >
          <img class="icon-img" :src="iconBack" alt="" aria-hidden="true" />
        </div>
        <div class="title">{{ pageTitle }}</div>
      </div>
    </header>

    <div class="pl5-trend-sub">
      <span class="sub-text">{{ currentIssue }} 截止时间:{{ cutoffText }}</span>
      <button type="button" class="bet-btn" @click="goBet">去投注</button>
    </div>

    <div class="pl5-trend-tabs" role="tablist" aria-label="走势切换">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="tab"
        :class="{ active: activeTab === t.key }"
        role="tab"
        :aria-selected="activeTab === t.key"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <main class="pl5-trend-table-wrap" role="main">
      <div v-if="activeTab === 'open'" class="pl5-open-wrap" aria-label="开奖号码表">
        <div class="pl5-trend-table pl5-trend-table--head" role="table" aria-label="体彩排列五走势表">
          <div class="row row--head" role="row">
            <div class="col col-issue" role="columnheader">期号</div>
            <div class="col col-digit" :class="digitColClass(0)" role="columnheader">万位</div>
            <div class="col col-digit" :class="digitColClass(1)" role="columnheader">千位</div>
            <div class="col col-digit" :class="digitColClass(2)" role="columnheader">百位</div>
            <div class="col col-digit" :class="digitColClass(3)" role="columnheader">十位</div>
            <div class="col col-digit" :class="digitColClass(4)" role="columnheader">个位</div>
          </div>
        </div>

        <div class="pl5-open-scroll" role="table" aria-label="体彩排列五走势">
          <div v-for="row in rows" :key="row.issue" class="row" role="row">
            <div class="col col-issue" role="cell">{{ row.issue }}</div>
            <div class="col col-digit" :class="digitColClass(0)" role="cell">{{ row.nums[0] }}</div>
            <div class="col col-digit" :class="digitColClass(1)" role="cell">{{ row.nums[1] }}</div>
            <div class="col col-digit" :class="digitColClass(2)" role="cell">{{ row.nums[2] }}</div>
            <div class="col col-digit" :class="digitColClass(3)" role="cell">{{ row.nums[3] }}</div>
            <div class="col col-digit" :class="digitColClass(4)" role="cell">{{ row.nums[4] }}</div>
          </div>
        </div>
      </div>

      <div v-else class="pl5-dist-wrap" aria-label="号码球分布图">
        <div class="pl5-dist-head" role="table" aria-label="号码球分布图表头">
          <div class="dist-row dist-row--head" role="row">
            <div class="dist-col dist-col--issue" role="columnheader">期号</div>
            <div v-for="n in 10" :key="n" class="dist-col dist-col--num" role="columnheader">{{ n - 1 }}</div>
          </div>
        </div>

        <div class="pl5-dist-scroll" role="table" aria-label="号码球分布图表格">
          <div v-for="row in rows" :key="row.issue" class="dist-row" role="row">
            <div class="dist-col dist-col--issue" role="cell">{{ row.issue }}</div>
            <div v-for="n in 10" :key="`${row.issue}-${n}`" class="dist-col dist-col--num" role="cell">
              <span v-if="activeDigitValue(row) === n - 1" class="dist-ball">{{ n - 1 }}</span>
            </div>
          </div>
        </div>

        <div class="dist-stats" role="rowgroup" aria-label="统计">
          <div v-for="s in statRows" :key="s.key" class="dist-row dist-row--stat" role="row">
            <div class="dist-col dist-col--issue dist-col--stat-label" role="cell">{{ s.label }}</div>
            <div v-for="n in 10" :key="`${s.key}-${n}`" class="dist-col dist-col--num" role="cell">
              {{ statsByNum[n - 1]?.[s.key] ?? '' }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const route = useRoute()

const pageTitle = computed(() => String(route.query.gameName || '体彩排列5'))

const currentIssue = ref(String(route.query.issue || '3415704'))
const remainingSeconds = ref(Number(route.query.left || 51))

function pad2(n) {
  return String(Math.max(0, Number(n) || 0)).padStart(2, '0')
}

const cutoffText = computed(() => {
  const s = Math.max(0, Number(remainingSeconds.value || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${pad2(h)}:${pad2(m)}:${pad2(ss)}`
})

let timer
onMounted(() => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    if (remainingSeconds.value <= 0) return
    remainingSeconds.value -= 1
  }, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const tabs = [
  { key: 'open', label: '开奖号' },
  { key: 'w', label: '万位走势' },
  { key: 'q', label: '千位走势' },
  { key: 'b', label: '百位走势' },
  { key: 's', label: '十位走势' },
  { key: 'g', label: '个位走势' }
]
const activeTab = ref('open')

function digitColClass(idx) {
  const map = { w: 0, q: 1, b: 2, s: 3, g: 4 }
  const activeIdx = map[activeTab.value]
  if (activeIdx == null) return ''
  return activeIdx === idx ? 'is-highlight' : 'is-muted'
}

const activeDigitIdx = computed(() => {
  const map = { w: 0, q: 1, b: 2, s: 3, g: 4 }
  return map[activeTab.value]
})

function activeDigitValue(row) {
  const idx = activeDigitIdx.value
  if (idx == null) return null
  const v = row?.nums?.[idx]
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.max(0, Math.min(9, Math.trunc(n)))
}

const statRows = [
  { key: 'count', label: '总次数' },
  { key: 'avgMiss', label: '平均遗漏' },
  { key: 'maxMiss', label: '最大遗漏' },
  { key: 'maxStreak', label: '最大连出' }
]

const statsByNum = computed(() => {
  // 仅在分布tab 下计算（其它 tab 不展示）
  const idx = activeDigitIdx.value
  const periods = rows.value?.length || 0
  const base = Array.from({ length: 10 }, () => ({
    count: 0,
    avgMiss: '0',
    maxMiss: 0,
    maxStreak: 0,
    _totalMiss: 0,
    _curMiss: 0,
    _curStreak: 0
  }))

  if (idx == null || !periods) return base

  // 按页面展示顺序（从上到下）扫
  for (const r of rows.value) {
    const v = Number(r?.nums?.[idx])
    const hit = Number.isFinite(v) ? Math.max(0, Math.min(9, Math.trunc(v))) : null

    for (let num = 0; num <= 9; num++) {
      const s = base[num]
      if (hit === num) {
        s.count += 1
        s._curStreak += 1
        s.maxStreak = Math.max(s.maxStreak, s._curStreak)
        s._curMiss = 0
      } else {
        s._curStreak = 0
        s._curMiss += 1
        s._totalMiss += 1
        s.maxMiss = Math.max(s.maxMiss, s._curMiss)
      }
    }
  }

  for (let num = 0; num <= 9; num++) {
    const s = base[num]
    // 平均遗漏：按“总遗漏总期数”做一个稳定口径（后续可按接口口径替换
    const avg = periods ? s._totalMiss / periods : 0
    s.avgMiss = avg.toFixed(1).replace(/\.0$/, '')
    delete s._totalMiss
    delete s._curMiss
    delete s._curStreak
  }

  return base
})

// TODO: 接口接入后替换；当前用静态数据走通结
const rows = ref(
  Array.from({ length: 20 }, (_, i) => ({
    issue: String(3333339 - i),
    nums: [9, 0, 4, 3, 1]
  }))
)

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/lottery/pl5/room')
}

function goBet() {
  router.push({
    path: '/lottery/pl5/room',
    query: { gameName: pageTitle.value }
  })
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/pl5-trend.less';
</style>


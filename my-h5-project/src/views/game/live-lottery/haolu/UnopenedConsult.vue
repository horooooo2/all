<template>
  <div class="unopened-consult">
    <div class="table">
      <div class="row head">
        <div class="cell">项目</div>
        <div class="cell">未开期数</div>
        <div class="cell">项目</div>
        <div class="cell">未开期数</div>
      </div>

      <div v-for="r in rows" :key="r.left.key" class="row">
        <div class="cell">{{ r.left.label }}</div>
        <div class="cell">{{ r.left.value }}</div>
        <div class="cell">{{ r.right.label }}</div>
        <div class="cell">{{ r.right.value }}</div>
      </div>

      <div class="row foot">
        <div class="cell cell--k k-red">大</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.big }}</span> 期</div>
        <div class="cell cell--k k-red">大单</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.bigOdd }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k k-green">小</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.small }}</span> 期</div>
        <div class="cell cell--k k-blue">大双</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.bigEven }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k k-blue">单</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.odd }}</span> 期</div>
        <div class="cell cell--k k-green">小单</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.smallOdd }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k k-blue">双</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.even }}</span> 期</div>
        <div class="cell cell--k k-blue">小双</div>
        <div class="cell cell--v">连续 <span class="num">{{ streak.smallEven }}</span> 期</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const items = [
  { label: '0', value: '1200期' },
  { label: '1', value: '111期' },
  { label: '2', value: '21期' },
  { label: '3', value: '1200期' },
  { label: '4', value: '1200期' },
  { label: '5', value: '121期' },
  { label: '6', value: '420期' },
  { label: '7', value: '121期' },
  { label: '8', value: '1200期' },
  { label: '9', value: '1200期' },
  { label: '10', value: '1200期' },
  { label: '11', value: '121期' },
  { label: '12', value: '66期' },
  { label: '13', value: '86期' },
  { label: '14', value: '131期' },
  { label: '15', value: '211期' },
  { label: '16', value: '534期' },
  { label: '17', value: '42期' },
  { label: '18', value: '2期' },
  { label: '19', value: '53期' },
  { label: '20', value: '523期' },
  { label: '21', value: '53期' },
  { label: '22', value: '211期' },
  { label: '23', value: '123期' },
  { label: '24', value: '250期' },
  { label: '25', value: '310期' },
  { label: '26', value: '121期' },
  { label: '27', value: '900期' }
]

const rows = computed(() => {
  const left = items.slice(0, 14)
  const right = items.slice(14).reverse()
  return left.map((l, idx) => ({
    left: { key: l.label, label: l.label, value: l.value },
    right: { key: right[idx]?.label ?? `r-${idx}`, label: right[idx]?.label ?? '', value: right[idx]?.value ?? '' }
  }))
})

const streak = {
  big: 0,
  small: 4,
  odd: 0,
  even: 4,
  bigOdd: 2,
  bigEven: 4,
  smallOdd: 0,
  smallEven: 4
}
</script>

<style lang="less" scoped>
.unopened-consult {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 0;
}

.table {
  width: 100%;
  background: transparent;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1.2fr;
  height: 34px;
  align-items: center;
  background: #f3f7ff;
}

.row:nth-child(even):not(.head):not(.foot) {
  background: #eaf2ff;
}

.row.head {
  height: 34px;
  background: #f3f7ff;
  font-size: 12px;
  color: #1d1d1f;
}

.row.foot {
  height: 34px;
  background: #f3f7ff;
}

.cell {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #1d1d1f;
  box-sizing: border-box;
  border-right: 1px solid #dbe7ff;
  border-bottom: 1px solid #dbe7ff;
}

.cell:nth-child(2),
.cell:nth-child(4) {
  border-right: none;
}

.cell--k {
  font-weight: 700;
}

.k-red {
  color: #ff2f2f;
}

.k-green {
  color: #00d11b;
}

.k-blue {
  color: #0065ff;
}

.cell--v {
  color: #1d1d1f;
}

.num {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
</style>


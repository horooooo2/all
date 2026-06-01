<template>
  <div class="unopened-consult">
    <div class="table">
      <div class="row head">
        <div class="cell">{{ $t('项目') }}</div>
        <div class="cell">{{ $t('未开期数') }}</div>
        <div class="cell">{{ $t('项目') }}</div>
        <div class="cell">{{ $t('未开期数') }}</div>
      </div>

      <div v-for="r in rows" :key="r.left.key" class="row">
        <div class="cell">{{ r.left.label }}</div>
        <div class="cell">{{ r.left.value }}</div>
        <div class="cell">{{ r.right.label }}</div>
        <div class="cell">{{ r.right.value }}</div>
      </div>

      <div class="row foot">
        <div class="cell cell--k">大</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.big }}</span> 期</div>
        <div class="cell cell--k">{{ $t('大单') }}</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.bigOdd }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k">小</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.small }}</span> 期</div>
        <div class="cell cell--k">{{ $t('大双') }}</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.bigEven }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k">单</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.odd }}</span> 期</div>
        <div class="cell cell--k">{{ $t('小单') }}</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.smallOdd }}</span> 期</div>
      </div>
      <div class="row foot">
        <div class="cell cell--k">双</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.even }}</span> 期</div>
        <div class="cell cell--k">{{ $t('小双') }}</div>
        <div class="cell cell--v">{{ $t('连续') }} <span class="num">{{ streak.smallEven }}</span> 期</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const items = [
  { label: '0', value: t('1200期') },
  { label: '1', value: t('111期') },
  { label: '2', value: t('21期') },
  { label: '3', value: t('1200期') },
  { label: '4', value: t('1200期') },
  { label: '5', value: t('121期') },
  { label: '6', value: t('420期') },
  { label: '7', value: t('121期') },
  { label: '8', value: t('1200期') },
  { label: '9', value: t('1200期') },
  { label: '10', value: t('1200期') },
  { label: '11', value: t('121期') },
  { label: '12', value: t('66期') },
  { label: '13', value: t('86期') },
  { label: '14', value: t('131期') },
  { label: '15', value: t('211期') },
  { label: '16', value: t('534期') },
  { label: '17', value: t('42期') },
  { label: '18', value: t('2期') },
  { label: '19', value: t('53期') },
  { label: '20', value: t('523期') },
  { label: '21', value: t('53期') },
  { label: '22', value: t('211期') },
  { label: '23', value: t('123期') },
  { label: '24', value: t('250期') },
  { label: '25', value: t('310期') },
  { label: '26', value: t('121期') },
  { label: '27', value: t('900期') }
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
  padding: 0 12px 12px;
}

.table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dbe7ff;
  background: #fff;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1.2fr;
  height: 34px;
  align-items: center;
  background: #fff;
}

.row:nth-child(even):not(.head):not(.foot) {
  background: #e5efff;
}

.row.head {
  height: 34px;
  background: #e5efff;
  font-size: 12px;
  color: #1d1d1f;
}

.row.foot {
  height: 34px;
  background: #fff;
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
}

.cell:nth-child(2),
.cell:nth-child(4) {
  border-right: none;
}

.cell--k {
  color: #ff3b30;
  font-weight: 700;
}

.cell--v {
  color: #1d1d1f;
}

.num {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
</style>


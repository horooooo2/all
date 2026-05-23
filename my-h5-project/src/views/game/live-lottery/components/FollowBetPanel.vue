<template>
  <div class="follow-bet">
    <div class="follow-bet__list-wrap">
      <ul class="follow-bet__list" aria-label="可跟投注项">
        <li v-for="row in rows" :key="row.id" class="follow-card">
          <div class="follow-card__upper">
            <div class="follow-card__upper-row follow-card__upper-row--head">
              <div class="follow-card__user">
                <span class="follow-card__avatar" aria-hidden="true">{{ row.avatarChar }}</span>
                <span class="follow-card__name">{{ row.maskName }}</span>
              </div>
              <div class="follow-card__total" aria-label="下注总额">
                <span class="follow-card__total-label">下注总额</span>
                <span class="follow-card__total-num">¥{{ formatMoney(row.totalBet) }}</span>
              </div>
            </div>
            <div class="follow-card__upper-row follow-card__upper-row--status">
              <span class="follow-card__status">{{ row.statusText || '投注成功' }}</span>
            </div>
          </div>

          <div class="follow-card__divider" aria-hidden="true" />

          <div class="follow-card__lower">
            <div class="follow-card__lower-rows" aria-label="投注明细">
              <div
                v-for="(nums, ri) in row.ballsRows || []"
                :key="`${row.id}-nums-${ri}`"
                class="follow-card__line"
              >
                <div class="follow-card__line-left">
                  <span
                    v-for="(n, ni) in nums"
                    :key="`${row.id}-${ri}-n${ni}`"
                    class="follow-card__ball"
                    :class="ballToneClass(ni)"
                  >
                    {{ n }}
                  </span>
                </div>
                <div class="follow-card__line-right follow-card__line-right--money" aria-label="该行投注金额">
                  ¥{{ formatMoney(lineStake(row, ri)) }}
                </div>
              </div>

              <div class="follow-card__line follow-card__line--foot">
                <div class="follow-card__line-left">
                  <span class="follow-card__issue-text">{{ row.issue }}</span>
                </div>
                <div class="follow-card__line-right">
                  <button type="button" class="follow-card__btn" @click="onFollow(row)">跟投</button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['follow'])

const rows = ref([
  {
    id: 'f1',
    avatarChar: '玩',
    maskName: '玩家***821',
    totalBet: 2000,
    statusText: '投注成功',
    issue: '123111109',
    playLabel: '大小单双 · 大',
    odds: 1.98,
    stake: 200,
    playKey: 'big',
    ballsRows: [[7, 2, 6]]
  },
  {
    id: 'f2',
    avatarChar: 'L',
    maskName: 'L***06',
    totalBet: 350,
    statusText: '投注成功',
    issue: '123111109',
    playLabel: '大小单双 · 小单',
    odds: 3.6,
    stake: 50,
    playKey: 'small-odd',
    ballsRows: [
      [0, 1, 0],
      [6, 2, 6]
    ],
    lineStakes: [150, 200]
  },
  {
    id: 'f3',
    avatarChar: '匿',
    maskName: '玩家***',
    totalBet: 5000,
    statusText: '投注成功',
    issue: '123111108',
    playLabel: '总和 · 双',
    odds: 1.98,
    stake: 500,
    playKey: 'even',
    ballsRows: [[3, 3, 8]]
  },
  {
    id: 'f4',
    avatarChar: 'K',
    maskName: 'K***88',
    totalBet: 888,
    statusText: '投注成功',
    issue: '123111108',
    playLabel: '第一球 · 大',
    odds: 1.98,
    stake: 100,
    playKey: 'b1-big',
    ballsRows: [
      [9, 5, 1],
      [2, 4, 7],
      [0, 0, 3]
    ],
    lineStakes: [300, 300, 288]
  }
])

function formatMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
}

function ballToneClass(index) {
  return index === 1 ? 'is-blue' : 'is-red'
}

/** 每行号码右侧金额：有 lineStakes 按行，否则用单注 stake */
function lineStake(row, lineIndex) {
  const arr = row.lineStakes
  if (Array.isArray(arr) && arr[lineIndex] != null) {
    const n = Number(arr[lineIndex])
    return Number.isFinite(n) ? n : 0
  }
  return Number(row.stake) || 0
}

function followAmountForRow(row) {
  const arr = row.lineStakes
  if (Array.isArray(arr) && arr.length > 0) {
    return arr.reduce((sum, x) => sum + (Number(x) || 0), 0)
  }
  return Number(row.stake) || 0
}

function onFollow(row) {
  emit('follow', {
    row,
    amount: followAmountForRow(row),
    playKey: row.playKey
  })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.follow-bet {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f1f5ff;
}

.follow-bet__list-wrap {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 10px 10px 8px;
  box-sizing: border-box;
}

.follow-bet__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.follow-card {
  width: 288px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 0 14px;
  box-sizing: border-box;
}

.follow-card__upper {
  width: 100%;
  min-height: 53px;
  border-radius: 10px;
  background: var(--s-2-ffffff, #fff);
  box-sizing: border-box;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.follow-card__upper-row--head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.follow-card__upper-row--status {
  display: flex;
  justify-content: flex-start;
  min-width: 0;
}

.follow-card__divider {
  width: 96%;
  height: 0;
  margin: 0 2%;
  border: none;
  border-top: 1px dashed #dae4f6;
  flex-shrink: 0;
}

.follow-card__lower {
  width: 100%;
  border-radius: 10px;
  background: var(--s-2-ffffff, #fff);
  box-sizing: border-box;
  padding: 10px 10px 12px;
}

.follow-card__lower-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.follow-card__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.follow-card__line-left {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.follow-card__line-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.follow-card__line-right--money {
  font-size: @font-size-sm;
  line-height: 20px;
  font-weight: 400;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.follow-card__issue-text {
  font-size: @font-size-sm;
  line-height: 20px;
  font-weight: 400;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
}

.follow-card__line--foot {
  align-items: center;
}

.follow-card__user {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
}

.follow-card__avatar {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f78ff 0%, #00a1ff 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.follow-card__name {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #0065ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-card__total {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  font-size: @font-size-sm;
  line-height: 18px;
  white-space: nowrap;
}

.follow-card__total-label {
  font-weight: 400;
  color: #6a7892;
}

.follow-card__total-num {
  font-weight: 400;
  color: #0065ff;
  font-variant-numeric: tabular-nums;
}

.follow-card__status {
  font-size: @font-size-xs;
  line-height: 16px;
  font-weight: 400;
  color: #08d836;
}

.follow-card__ball {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
}

.follow-card__ball.is-red {
  border: 1px solid #ffb4b4;
  background: #fff5f5;
  color: #ff2f2f;
}

.follow-card__ball.is-blue {
  border: 1px solid #b4d4ff;
  background: #f0f6ff;
  color: #0065ff;
}

.follow-card__btn {
  flex: 0 0 auto;
  width: 112px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
  background: var(---J5-2, linear-gradient(0deg, #1f78ff 0%, #00a1ff 100%));
  color: #ffffff;
  font-size: @font-size-sm;
  font-weight: 400;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.follow-card__btn:active {
  opacity: 0.92;
}
</style>

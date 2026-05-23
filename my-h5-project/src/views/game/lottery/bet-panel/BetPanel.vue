<template>
  <teleport to="body">
    <van-popup
      :show="show"
      position="bottom"
      class="bet-panel-popup"
      :style="popupStyle"
      :overlay="true"
      :overlay-style="{ background: 'transparent' }"
      :safe-area-inset-bottom="true"
      @update:show="$emit('update:show', $event)"
      @closed="onClosed"
    >
      <section class="bet-panel" role="dialog" aria-modal="true" aria-label="投注面板" @click.stop>
        <div class="bet-panel__handle" role="button" tabindex="0" aria-label="收起" @click="$emit('update:show', false)">
          <img class="bet-panel__handle-icon" :src="iconDown" alt="" aria-hidden="true" />
        </div>

        <BetPanelCore
          ref="coreRef"
          :balance="balance"
          @submit="onCoreSubmit"
          @chase="onCoreChase"
          @open-recent="openRecentBetsPanel"
        />
      </section>
    </van-popup>

    <!-- 独立于主投注面板：避免嵌套在主面板内导致「只开近期」仍展开玩法区 -->
    <van-popup
      v-model:show="recentOpen"
      position="bottom"
      class="recent-popup"
      :style="popupStyle"
      :overlay="true"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.45)' }"
      :safe-area-inset-bottom="true"
      :z-index="2010"
    >
      <section class="recent-panel" role="dialog" aria-modal="true" aria-label="近期投注" @click.stop>
        <header class="recent-panel__header">
          <div class="recent-panel__title">近期投注</div>
          <van-icon name="arrow-down" class="recent-panel__collapse" @click="recentOpen = false" />
        </header>

        <div class="recent-panel__tabs">
          <div
            role="button"
            tabindex="0"
            class="recent-tab"
            :class="{ active: recentTab === 'settled' }"
            @click="recentTab = 'settled'"
          >
            已结注单
          </div>
          <div
            role="button"
            tabindex="0"
            class="recent-tab"
            :class="{ active: recentTab === 'unsettled' }"
            @click="recentTab = 'unsettled'"
          >
            未结注单
          </div>
          <div role="button" tabindex="0" class="recent-history-btn" @click="onRecentHistoryToGameRecord">
            <img :src="iconBetRecordWhite" alt="" aria-hidden="true" class="recent-history-btn__icon">
            <span>投注记录</span>
          </div>
        </div>

        <div v-if="recentTab === 'settled'" class="recent-empty">
          <img :src="noDataImage" alt="no-data" class="recent-empty__img">
          <p class="recent-empty__text">暂无未结算订单</p>
          <div role="button" tabindex="0" class="recent-empty__retry" @click="reloadRecentOrders">刷新试试</div>
        </div>

        <div v-else class="recent-list">
          <article v-for="item in mixedUnsettledOrders" :key="item.id" class="recent-card">
            <template v-if="item.cancelable">
              <div class="recent-card__line recent-card__line--top">
                <div class="recent-card__issue">{{ item.issue }}期</div>
                <div class="recent-card__odds-wrap">
                  <div class="recent-card__odds">{{ item.betText }}</div>
                  <van-icon name="arrow" class="recent-card__arrow" />
                </div>
              </div>
              <div class="recent-card__line recent-card__line--bottom">
                <div />
                <div
                  role="button"
                  tabindex="0"
                  class="recent-card__cancel"
                  @click="openCancelDialog(item)"
                >
                  撤单
                </div>
              </div>
            </template>
            <template v-else>
              <div class="recent-card__line recent-card__line--top">
                <div class="recent-card__left-wrap">
                  <div class="recent-card__status-pill" :class="`is-${item.status}`">{{ statusTextMap[item.status] }}</div>
                  <div class="recent-card__issue">{{ item.issue }}期</div>
                </div>
                <div class="recent-card__money-line">
                  <span class="recent-card__money-label">奖金:</span>
                  <span class="recent-card__money-value">{{ item.bonus ?? '0' }}</span>
                </div>
              </div>
              <div class="recent-card__line recent-card__line--bottom">
                <div class="recent-card__time">{{ item.time }}</div>
                <div class="recent-card__money-line">
                  <span class="recent-card__money-label">返水:</span>
                  <span class="recent-card__money-value">{{ item.rebate ?? '0.004' }}</span>
                </div>
              </div>
            </template>
          </article>
        </div>
      </section>
    </van-popup>

    <!-- 独立于主投注面板：下注面板关闭时也能从房间页「盈亏」打开 -->
    <van-popup
      v-model:show="betRecordOpen"
      position="bottom"
      class="bet-record-popup"
      :overlay="true"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.55)' }"
      :safe-area-inset-bottom="true"
      :z-index="2001"
    >
      <section class="bet-record-panel" role="dialog" aria-modal="true" aria-label="投注记录" @click.stop>
        <header class="bet-record-panel__head">
          <div class="bet-record-panel__title">加拿大28</div>
          <div class="bet-record-panel__close" role="button" tabindex="0" @click="betRecordOpen = false">
            <img :src="iconX" alt="" aria-hidden="true">
          </div>
        </header>

        <div class="bet-record-total">
          <div class="bet-record-total__left">
            <span>赢亏金额</span>
            <strong>¥0</strong>
          </div>
          <div class="bet-record-total__time" role="button" tabindex="0" @click="betRecordTimePopupOpen = true">
            <span>{{ currentBetRecordTimeText }}</span>
            <van-icon name="arrow-down" />
          </div>
        </div>

        <div class="bet-record-formula">赢亏金额=获奖金额-投注金额</div>

        <div class="bet-record-stats">
          <div class="bet-record-stat">
            <span>投注金额</span>
            <strong>¥8</strong>
          </div>
          <div class="bet-record-stat">
            <span>获奖金额</span>
            <strong>¥0</strong>
          </div>
          <div class="bet-record-stat">
            <span>返水奖金</span>
            <strong>¥0</strong>
          </div>
          <div class="bet-record-stat">
            <span>充值金额</span>
            <strong>¥0</strong>
          </div>
          <div class="bet-record-stat">
            <span>提现金额</span>
            <strong>¥0</strong>
          </div>
          <div class="bet-record-stat">
            <span>打赏金额</span>
            <strong>¥0</strong>
          </div>
        </div>

        <div class="bet-record-table-head">
          <span>游戏名字</span>
          <span>盈亏</span>
        </div>

        <div class="bet-record-game-list">
          <div v-for="game in betRecordGames" :key="game.key" class="bet-record-game">
            <div class="bet-record-game__row" role="button" tabindex="0" @click="toggleBetRecordGame(game.key)">
              <span>{{ game.name }}</span>
              <div class="bet-record-game__right">
                <em>¥ {{ game.profit }}</em>
                <van-icon :name="game.expanded ? 'arrow-up' : 'arrow-down'" />
              </div>
            </div>
            <div v-if="game.expanded" class="bet-record-game__detail">
              <div class="bet-record-stat">
                <span>投注金额</span>
                <strong>¥{{ game.betAmount }}</strong>
              </div>
              <div class="bet-record-stat">
                <span>获奖金额</span>
                <strong>¥{{ game.bonusAmount }}</strong>
              </div>
              <div class="bet-record-stat">
                <span>返水奖金</span>
                <strong>¥{{ game.rebateAmount }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </van-popup>

    <van-popup
      v-model:show="betRecordTimePopupOpen"
      position="bottom"
      round
      class="bet-record-time-popup"
      :z-index="2002"
    >
      <div class="bet-record-time-popup__head">
        <span>时间选择</span>
        <img :src="iconX" alt="" @click="betRecordTimePopupOpen = false">
      </div>
      <div class="bet-record-time-popup__list">
        <div
          v-for="item in betRecordTimeOptions"
          :key="item.value"
          class="bet-record-time-popup__item"
          :class="{ active: selectedBetRecordTime === item.value }"
          role="button"
          tabindex="0"
          @click="selectBetRecordTime(item.value)"
        >
          <span>{{ item.label }}</span>
          <img
            v-if="selectedBetRecordTime === item.value"
            class="bet-record-time-popup__selected"
            :src="iconSelected"
            alt=""
          >
          <span v-else class="bet-record-time-popup__circle" />
        </div>
      </div>
    </van-popup>
  </teleport>
</template>

<script setup>
import { computed, defineExpose, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/Toast'
import { showConfirmDialog } from 'vant'
import BetPanelCore from './BetPanelCore.vue'
import iconDown from '@/assets/icon_down_01.svg'
import iconX from '@/assets/icon_x.svg'
import iconSelected from '@/assets/icon_sel.svg'
import noDataImage from '@/assets/no_data.svg'
import iconBetRecordWhite from '@/assets/touzhu_icon_white.svg'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '加拿大28' },
  issue: { type: String, default: '' },
  countdown: { type: String, default: '00:00:00' },
  balance: { type: [String, Number], default: 0 },
  top: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['update:show', 'submit'])
const router = useRouter()
const coreRef = ref(null)

const popupStyle = computed(() => {
  const t = Math.max(0, Number(props.top || 0))
  const topPx = `${t}px`
  return {
    top: topPx,
    bottom: '0px',
    height: `calc(100vh - ${topPx})`
  }
})

watch(
  () => props.show,
  async (open) => {
    if (!open) recentOpen.value = false
    else {
      await nextTick()
      coreRef.value?.resetForPopupOpen?.()
    }
  }
)

const recentOpen = ref(false)
const recentTab = ref('settled')
const pendingCancelId = ref('')
const betRecordOpen = ref(false)
const betRecordTimePopupOpen = ref(false)
const selectedBetRecordTime = ref('today')

const statusTextMap = {
  cancelable: '可撤销',
  loss: '未中奖',
  win: '已中奖',
  canceled: '已撤单'
}

const mixedUnsettledOrders = ref([
  { id: 'uo-1', issue: '3123111111', betText: '1,赔率:9.8', status: 'cancelable', cancelable: true },
  { id: 'uo-2', issue: '3123111111', status: 'loss', cancelable: false, time: '2026-04-03 00:24:31', bonus: '0', rebate: '0.004' },
  { id: 'uo-3', issue: '3123111110', status: 'win', cancelable: false, time: '2026-04-03 00:24:31', bonus: '1', rebate: '0.004' },
  { id: 'uo-4', issue: '3123111109', status: 'canceled', cancelable: false, time: '2026-04-03 00:24:31', bonus: '1', rebate: '0.004' }
])
const betRecordTimeOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近七天', value: 'last7days' },
  { label: '本周', value: 'thisWeek' },
  { label: '上周', value: 'lastWeek' },
  { label: '本月', value: 'thisMonth' }
]
const betRecordGames = ref([
  {
    key: 'btc28',
    name: '比特币28',
    profit: 0,
    expanded: true,
    betAmount: 8,
    bonusAmount: 0,
    rebateAmount: 0
  },
  {
    key: 'tw28',
    name: '台湾宾果28',
    profit: 0,
    expanded: false,
    betAmount: 0,
    bonusAmount: 0,
    rebateAmount: 0
  },
  {
    key: 'ca28',
    name: '加拿大28',
    profit: 0,
    expanded: false,
    betAmount: 0,
    bonusAmount: 0,
    rebateAmount: 0
  }
])
const currentBetRecordTimeText = computed(
  () => betRecordTimeOptions.find((x) => x.value === selectedBetRecordTime.value)?.label || '今天'
)

function onClosed() {
  // 不做强制清理，便于后续“连续下注”扩展
}

function onCoreSubmit(payload) {
  emit('submit', payload)
  emit('update:show', false)
}

function onCoreChase() {
  emit('update:show', false)
  router.push('/chase-order')
}

/** 房间页菜单「投注记录」：先打开下注面板内的「近期投注」弹层 */
function openRecentBetsPanel() {
  recentOpen.value = true
  recentTab.value = 'settled'
}

function reloadRecentOrders() {
  toast.success('已刷新')
}

/** 房间页右侧「盈亏」菜单：打开盈亏汇总弹层（.bet-record-panel） */
function openBetRecordPanel() {
  betRecordOpen.value = true
}

/** 近期投注内「投注记录」：跳转完整投注记录页 */
function onRecentHistoryToGameRecord() {
  recentOpen.value = false
  router.push({ name: 'lotteryBetRecord' })
}

function selectBetRecordTime(value) {
  selectedBetRecordTime.value = value
  betRecordTimePopupOpen.value = false
}

function toggleBetRecordGame(key) {
  const next = betRecordGames.value.map((item) => (
    item.key === key ? { ...item, expanded: !item.expanded } : item
  ))
  betRecordGames.value = next
}

function openCancelDialog(item) {
  pendingCancelId.value = item.id
  showConfirmDialog({
    title: '',
    message: '确定要撤销订单吗?',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    className: 'recent-cancel-dialog'
  })
    .then(() => {
      confirmCancelOrder()
    })
    .catch(() => {
      pendingCancelId.value = ''
    })
}

function confirmCancelOrder() {
  const target = mixedUnsettledOrders.value.find((x) => x.id === pendingCancelId.value)
  if (target) {
    target.status = 'canceled'
    target.cancelable = false
  }
  pendingCancelId.value = ''
  toast.success('撤单成功')
}

defineExpose({
  openBetRecordPanel,
  openRecentBetsPanel
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.bet-panel-popup {
  border-radius: 0;
  overflow: hidden;
}

@import './bet-panel-play-shared.less';

.recent-popup {
  border-radius: 0;
  overflow: hidden;
}

.recent-panel {
  width: 375px;
  max-width: 100vw;
  height: 100%;
  background: #f6f8fc;
  display: flex;
  flex-direction: column;
}

.recent-panel__header {
  height: 56px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e7edf8;
  box-sizing: border-box;
  background: #ffffff;
}

.recent-panel__title {
  font-size: @font-size-md;
  font-weight: 400;
  color: #1f2a44;
  line-height: 1.2;
  margin-right: auto;
}

.recent-panel__collapse {
  color: #7a8aa8;
  font-size: @font-size-xxl;
}

.recent-panel__tabs {
  height: 60px;
  padding: 0 14px;
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 26px;
  align-items: center;
  border-bottom: 1px solid #e7edf8;
  background: #ffffff;
}

.recent-tab {
  border: none;
  background: transparent;
  color: #8d9ab5;
  font-size: @font-size-md;
  font-weight: 400;
  padding: 0;
  line-height: 1;
}

.recent-tab.active {
  color: #24324e;
}

.recent-history-btn {
  justify-self: end;
  width: 83px;
  height: 22px;
  border-radius: 12px;
  border: 0.5px solid #dbe5f6;
  background: #ffffff;
  color: #9ba8c2;
  font-size: @font-size-xs;
  font-weight: 400;
  padding: 0 8px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.recent-history-btn__icon {
  width: 12px;
  height: 12px;
  object-fit: contain;
  display: block;
}

.recent-empty {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.recent-empty__img {
  width: 152px;
  height: 152px;
  object-fit: contain;
}

.recent-empty__text {
  margin: 0;
  font-size: @font-size-sm;
  color: #a0afca;
  font-weight: 400;
}

.recent-empty__retry {
  width: 114px;
  height: 34px;
  border-radius: 17px;
  border: 1px solid #d4e1f6;
  background: #ffffff;
  color: #4f607f;
  font-size: @font-size-sm;
}

.recent-list {
  flex: 1 1 auto;
  overflow: auto;
  padding: 12px 14px 14px;
  box-sizing: border-box;
}

.recent-card {
  width: 351px;
  height: 82px;
  min-height: 82px;
  max-height: 82px;
  border: 1px solid #dfe8f7;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.recent-card + .recent-card {
  margin-top: 12px;
}

.recent-card__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recent-card__line--top {
  margin-bottom: 0;
  white-space: nowrap;
  flex-wrap: nowrap;
}

.recent-card__line--bottom {
  min-height: 28px;
}

.recent-card__left-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.recent-card__status-pill {
  height: 24px;
  padding: 0 10px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: @font-size-sm;
  white-space: nowrap;
  box-sizing: border-box;
}

.recent-card__issue,
.recent-card__odds {
  font-size: @font-size-md;
  font-weight: 400;
  color: #25324c;
  line-height: 1;
  white-space: nowrap;
}

.recent-card__odds-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  white-space: nowrap;
  flex-wrap: nowrap;
}

.recent-card__odds {
  text-align: right;
}

.recent-card__arrow {
  color: #7f8da8;
  font-size: @font-size-md;
}

.recent-card__status {
  font-size: @font-size-xs;
  color: #7e8da8;
  font-weight: 400;
}

.recent-card__status-pill.is-loss {
  background: var(---J11, linear-gradient(180deg, #50CC4B 0%, #279821 100%));
}

.recent-card__status-pill.is-win {
  background: var(---J12, linear-gradient(180deg, #FA6267 0%, #D10D1D 100%));
}

.recent-card__status-pill.is-canceled {
  background: var(---J14, linear-gradient(180deg, #B8B8B8 0%, #3F3F3F 100%));
}

.recent-card__time {
  font-size: @font-size-sm;
  color: #25324c;
  white-space: nowrap;
}

.recent-card__money-line {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  font-size: @font-size-sm;
}

.recent-card__money-label {
  color: #000000;
}

.recent-card__money-value {
  color: #0065FF;
  margin-left: 2px;
}

.recent-card__cancel {
  width: 44px;
  height: 24px;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1.5px solid #0065FF;
  background: #ffffff;
  color: #0065FF;
  font-size: @font-size-sm;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bet-record-popup {
  border-radius: 18px 18px 0 0;
  overflow: hidden;
}

.bet-record-panel {
  width: 375px;
  max-width: 100vw;
  max-height: 76vh;
  background: #edf1fb;
  border-radius: 18px 18px 0 0;
  padding: 12px 14px calc(16px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  overflow: auto;
}

.bet-record-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.bet-record-panel__title {
  font-size: @font-size-xl;
  color: #2b3855;
}

.bet-record-panel__close {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bet-record-panel__close img {
  width: 14px;
  height: 14px;
}

.bet-record-total {
  background: #ffffff;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.bet-record-total__left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: #9caccc;
  font-size: @font-size-sm;
}

.bet-record-total__left strong {
  margin: 0;
  color: #0065ff;
  font-size: calc(@font-size-5xl - 3px);
  line-height: 1;
}

.bet-record-total__time {
  width: 126px;
  height: 39px;
  border-radius: 12px;
  border: 1px solid #d8e2f3;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  box-sizing: border-box;
  color: #2e3a58;
  font-size: @font-size-sm;
}

.bet-record-formula {
  margin: 12px 0 10px;
  color: #3b4866;
  font-size: @font-size-xs;
}

.bet-record-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.bet-record-stat {
  height: 70px;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #a9b6cf;
  font-size: @font-size-sm;
}

.bet-record-stat strong {
  margin: 0;
  color: #2b3855;
  font-size: @font-size-md;
  line-height: 1;
}

.bet-record-table-head {
  margin-top: 12px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #3a4765;
  font-size: @font-size-sm;
  font-weight: 600;
  padding: 0 2px;
  box-sizing: border-box;
}

.bet-record-game-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bet-record-game__row {
  height: 50px;
  border-radius: 10px;
  background: #ffffff;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #2f3b58;
  font-size: @font-size-md;
}

.bet-record-game__right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bet-record-game__right em {
  font-style: normal;
  color: #09c743;
  font-size: @font-size-sm;
}

.bet-record-game__detail {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.bet-record-time-popup {
  width: 375px;
  max-width: 100vw;
}

.bet-record-time-popup__head {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #2b3855;
  font-size: calc(@font-size-xl - 1px);
}

.bet-record-time-popup__head img {
  width: 18px;
  height: 18px;
}

.bet-record-time-popup__list {
  padding: 0 12px calc(16px + env(safe-area-inset-bottom, 0px));
}

.bet-record-time-popup__item {
  height: 56px;
  border-radius: 10px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8fa2c4;
  font-size: @font-size-sm;
}

.bet-record-time-popup__item.active {
  background: #dbe7fb;
  color: #2c3a59;
}

.bet-record-time-popup__selected {
  width: 22px;
  height: 22px;
}

.bet-record-time-popup__circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #8fa2c4;
  box-sizing: border-box;
}

</style>


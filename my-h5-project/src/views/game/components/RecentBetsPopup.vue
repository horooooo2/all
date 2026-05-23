<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    class="recent-popup"
    :style="popupStyle"
    :overlay="true"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.45)' }"
    :safe-area-inset-bottom="true"
    :z-index="zIndex"
  >
    <section class="recent-panel" role="dialog" aria-modal="true" aria-label="近期投注" @click.stop>
      <header class="recent-panel__header">
        <div class="recent-panel__title">近期投注</div>
        <van-icon name="arrow-down" class="recent-panel__collapse" @click="show = false" />
      </header>

      <div class="recent-panel__tabs">
        <div
          role="button"
          tabindex="0"
          class="recent-tab"
          :class="{ active: tab === 'settled' }"
          @click="tab = 'settled'"
        >
          已结注单
        </div>
        <div
          role="button"
          tabindex="0"
          class="recent-tab"
          :class="{ active: tab === 'unsettled' }"
          @click="tab = 'unsettled'"
        >
          未结注单
        </div>
        <div role="button" tabindex="0" class="recent-history-btn" @click="onHistory">
          <img :src="iconBetRecordWhite" alt="" aria-hidden="true" class="recent-history-btn__icon" />
          <span>投注记录</span>
        </div>
      </div>

      <div v-if="tab === 'settled'" class="recent-empty">
        <img :src="noDataImage" alt="no-data" class="recent-empty__img" />
        <p class="recent-empty__text">暂无未结算订/p>
        <div role="button" tabindex="0" class="recent-empty__retry" @click="emit('reload')">刷新试试</div>
      </div>

      <div v-else class="recent-list">
        <article v-for="item in orders" :key="item.id" class="recent-card">
          <template v-if="item.cancelable">
            <div class="recent-card__line recent-card__line--top">
              <div class="recent-card__issue">{{ item.issue }}/div>
              <div class="recent-card__odds-wrap">
                <div class="recent-card__odds">{{ item.betText }}</div>
                <van-icon name="arrow" class="recent-card__arrow" />
              </div>
            </div>
            <div class="recent-card__line recent-card__line--bottom">
              <div />
              <div role="button" tabindex="0" class="recent-card__cancel" @click="emit('cancel', item)">撤单</div>
            </div>
          </template>
          <template v-else>
            <div class="recent-card__line recent-card__line--top">
              <div class="recent-card__left-wrap">
                <div class="recent-card__status-pill" :class="`is-${item.status}`">{{ statusTextMap[item.status] }}</div>
                <div class="recent-card__issue">{{ item.issue }}/div>
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import iconBetRecordWhite from '@/assets/touzhu_icon_white.svg'
import noDataImage from '@/assets/no_data.svg'

const show = defineModel('show', { type: Boolean, default: false })

const props = defineProps({
  top: { type: [String, Number], default: 0 },
  zIndex: { type: [String, Number], default: 2010 },
  /** 外部可传入订单数组；不传时使用演示数*/
  orders: { type: Array, default: null }
})

const emit = defineEmits(['history', 'reload', 'cancel'])

const popupStyle = computed(() => {
  const t = Math.max(0, Number(props.top || 0))
  const topPx = `${t}px`
  // 原半屏约 50vh，再升高1/3 50vh×4/3（≈66.67vh）；top 为预留顶部区
  const h = `min(calc(200vh / 3), calc(100vh - ${topPx}))`
  return {
    top: 'auto',
    bottom: '0px',
    height: h,
    maxHeight: h
  }
})

const tab = ref('settled')

watch(show, (v) => {
  if (!v) return
  tab.value = 'settled'
})

const statusTextMap = {
  cancelable: '可撤销',
  loss: '未中,
  win: '已中,
  canceled: '已撤
}

const demoOrders = [
  { id: 'uo-1', issue: '3123111111', betText: '1,赔率:9.8', status: 'cancelable', cancelable: true },
  { id: 'uo-2', issue: '3123111111', status: 'loss', cancelable: false, time: '2026-04-03 00:24:31', bonus: '0', rebate: '0.004' },
  { id: 'uo-3', issue: '3123111110', status: 'win', cancelable: false, time: '2026-04-03 00:24:31', bonus: '1', rebate: '0.004' },
  { id: 'uo-4', issue: '3123111109', status: 'canceled', cancelable: false, time: '2026-04-03 00:24:31', bonus: '1', rebate: '0.004' }
]

const orders = computed(() => {
  if (Array.isArray(props.orders)) return props.orders
  return demoOrders
})

function onHistory() {
  emit('history')
  show.value = false
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

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

.recent-card__status-pill.is-loss {
  background: var(---J11, linear-gradient(180deg, #50cc4b 0%, #279821 100%));
}

.recent-card__status-pill.is-win {
  background: var(---J12, linear-gradient(180deg, #fa6267 0%, #d10d1d 100%));
}

.recent-card__status-pill.is-canceled {
  background: var(---J14, linear-gradient(180deg, #b8b8b8 0%, #3f3f3f 100%));
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
  color: #0065ff;
  margin-left: 2px;
}

.recent-card__cancel {
  width: 44px;
  height: 24px;
  border-radius: 5px;
  box-sizing: border-box;
  border: 1.5px solid #0065ff;
  background: #ffffff;
  color: #0065ff;
  font-size: @font-size-sm;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>


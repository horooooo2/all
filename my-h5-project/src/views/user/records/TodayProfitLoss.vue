<template>
  <div class="today-profit-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>今日赢亏</h1>
    </header>

    <section class="total-card">
      <div class="total-left">
        <span class="label">赢亏金额</span>
        <strong>¥0</strong>
      </div>
      <button type="button" class="time-btn" @click="showTimePopup = true">
        <span>{{ currentTimeText }}</span>
        <van-icon name="arrow-down" />
      </button>
    </section>

    <p class="formula-text">赢亏金额=获奖金额-投注金额</p>

    <section class="stat-grid">
      <div
        v-for="item in stats"
        :key="item.key"
        class="stat-item"
      >
        <span>{{ item.label }}</span>
        <strong>¥{{ item.value }}</strong>
      </div>
    </section>

    <van-popup v-model:show="showTimePopup" position="bottom" round class="custom-popup">
      <div class="popup-title-row">
        <span>时间选择</span>
        <img :src="iconClose" alt="close" @click="showTimePopup = false">
      </div>
      <div class="time-list">
        <button
          v-for="item in timeOptions"
          :key="item.value"
          type="button"
          class="time-item"
          :class="{ active: selectedTime === item.value }"
          @click="selectTime(item.value)"
        >
          <span>{{ item.label }}</span>
          <img
            v-if="selectedTime === item.value"
            class="selected-icon"
            :src="iconSelected"
            alt="selected"
          >
          <span v-else class="circle-icon" />
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

const router = useRouter()

const stats = [
  { key: 'bet', label: '投注金额', value: 0 },
  { key: 'validBetA', label: '有效投注', value: 0 },
  { key: 'validBetB', label: '有效投注', value: 0 },
  { key: 'bonus', label: '活动奖金', value: 0 },
  { key: 'rebate', label: '流水回馈', value: 0 },
  { key: 'agentRebate', label: '代理佣金返利', value: 0 },
  { key: 'transferFee', label: '转账费用', value: 0 },
  { key: 'deposit', label: '充值金额', value: 0 },
  { key: 'withdraw', label: '提现金额', value: 0 },
  { key: 'transferIn', label: '转账收入', value: 0 },
  { key: 'redSend', label: '红包发送', value: 0 },
  { key: 'redReceive', label: '红包领取', value: 0 }
]

const timeOptions = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近七天', value: 'last7days' },
  { label: '本周', value: 'thisWeek' },
  { label: '上周', value: 'lastWeek' },
  { label: '本月', value: 'thisMonth' }
]

const selectedTime = ref('today')
const showTimePopup = ref(false)
const currentTimeText = computed(() => timeOptions.find(i => i.value === selectedTime.value)?.label || '今天')

const goBack = () => router.back()
const selectTime = (value) => {
  selectedTime.value = value
  showTimePopup.value = false
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/today-profit-loss.less';
</style>

<template>
  <div class="chase-page">
    <header class="chase-header">
      <div class="chase-header__back" role="button" tabindex="0" @click="goBack">
        <img :src="iconBack" alt="back">
      </div>
      <div class="chase-header__title">{{ $t('我要追号') }}</div>
    </header>

    <main class="chase-body">
      <section class="chase-card">
        <div class="chase-row">
          <div class="chase-row__label">{{ $t('已追期数') }}</div>
          <div class="stepper">
            <div class="stepper__btn" role="button" tabindex="0" @click="adjustPeriodCount(-1)">-</div>
            <div class="stepper__value">{{ periodCount }}</div>
            <div class="stepper__btn" role="button" tabindex="0" @click="adjustPeriodCount(1)">+</div>
          </div>
        </div>

        <div class="chase-row">
          <div class="chase-row__label">{{ $t('已追期数') }}</div>
          <div class="stepper">
            <div class="stepper__btn" role="button" tabindex="0" @click="adjustTimesCount(-1)">-</div>
            <div class="stepper__value">{{ timesCount }}</div>
            <div class="stepper__btn" role="button" tabindex="0" @click="adjustTimesCount(1)">+</div>
          </div>
        </div>

        <div class="chase-actions">
          <div class="stop-win" role="button" tabindex="0" @click="stopOnWin = !stopOnWin">
            <van-icon name="success" class="stop-win__icon" />
            <span>{{ $t('中奖即停') }}</span>
          </div>
          <div class="build-btn" role="button" tabindex="0">{{ $t('生成追号单') }}</div>
        </div>
      </section>

      <section class="chase-card">
        <div class="order-head">
          <div class="order-head__left">
            <van-icon name="success" class="order-head__check" />
            <span>(1)34123121</span>
          </div>
          <div class="order-head__right">
            <span>{{ $t('倍数') }}</span>
            <div class="stepper">
              <div class="stepper__btn" role="button" tabindex="0" @click="adjustOrderTimes(-1)">-</div>
              <div class="stepper__value">{{ orderTimes }}</div>
              <div class="stepper__btn" role="button" tabindex="0" @click="adjustOrderTimes(1)">+</div>
            </div>
          </div>
        </div>
        <div class="order-foot">
          <span>{{ $t('注额') }}</span>
          <span>{{ orderAmount }}</span>
        </div>
      </section>
    </main>

    <footer class="chase-footer">
      <div class="chase-summary">
        <div>{{ $t('共追') }} <span class="em">{{ totalPeriods }}</span> {{ $t('期 共计') }} <span class="em">{{ totalAmount }}</span></div>
        <div>{{ $t('余额:') }} <span class="balance">{{ balance }}</span></div>
      </div>
      <div class="confirm-btn" role="button" tabindex="0">{{ $t('确认追号') }}</div>
    </footer>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()
const periodCount = ref(1)
const timesCount = ref(1)
const orderTimes = ref(1)
const stopOnWin = ref(true)
const balance = ref('6,733.4301')

const orderAmount = computed(() => orderTimes.value)
const totalPeriods = computed(() => periodCount.value)
const totalAmount = computed(() => periodCount.value * orderAmount.value)

function goBack() {
  router.back()
}

function adjustPeriodCount(step) {
  periodCount.value = Math.max(1, periodCount.value + step)
}

function adjustTimesCount(step) {
  timesCount.value = Math.max(1, timesCount.value + step)
}

function adjustOrderTimes(step) {
  orderTimes.value = Math.max(1, orderTimes.value + step)
}
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.chase-page {
  min-height: 100vh;
  background: #eef1fa;
  padding-bottom: 100px;
  box-sizing: border-box;
}

.chase-header {
  height: 50px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.chase-header__back {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chase-header__back img {
  width: 20px;
  height: 20px;
}

.chase-header__title {
  margin-left: 12px;
  font-size: @font-size-sm;
  color: #25324c;
}

.chase-body {
  padding: 12px;
}

.chase-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-sizing: border-box;
}

.chase-card + .chase-card {
  margin-top: 12px;
}

.chase-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chase-row + .chase-row {
  margin-top: 12px;
}

.chase-row__label {
  font-size: @font-size-sm;
  color: #2a3856;
}

.stepper {
  width: 152px;
  height: 34px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #d6deee;
  display: grid;
  grid-template-columns: 30px 1fr 30px;
}

.stepper__btn {
  background: #cbd7ea;
  color: #33415f;
  font-size: @font-size-md;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.stepper__value {
  background: #ffffff;
  color: #1f2d49;
  font-size: @font-size-md;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.chase-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stop-win {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #273654;
  font-size: @font-size-xs;
}

.stop-win__icon,
.order-head__check {
  color: #0065ff;
  font-size: @font-size-xl;
}

.build-btn {
  width: 152px;
  height: 34px;
  border: 1px solid #0065ff;
  border-radius: 10px;
  color: #25324c;
  font-size: @font-size-sm;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-head__left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #25324c;
  font-size: @font-size-sm;
}

.order-head__right {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #25324c;
  font-size: @font-size-sm;
}

.order-foot {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #25324c;
  font-size: @font-size-sm;
}

.chase-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 80px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  border-top: 1px solid #e4ebf8;
}

.chase-summary {
  color: #25324c;
  font-size: @font-size-sm;
  line-height: 1.6;
}

.chase-summary .em {
  font-weight: 600;
}

.chase-summary .balance {
  color: #0065ff;
}

.confirm-btn {
  width: 116px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(90deg, #2d7ef2 0%, #119cf2 100%);
  color: #ffffff;
  font-size: @font-size-md;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>

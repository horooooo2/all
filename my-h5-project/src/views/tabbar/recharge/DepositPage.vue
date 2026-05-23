<template>
  <div class="deposit-page">
    <template v-if="loading">
      <div class="section">
        <div class="skeleton-bar skeleton-bar--pay shimmer"></div>
      </div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--channel shimmer"></div>
      </div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--channel shimmer"></div>
      </div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--amount shimmer"></div>
      </div>
      <div class="skeleton-bar skeleton-bar--tip shimmer"></div>
      <div class="skeleton-bar skeleton-bar--btn shimmer"></div>
    </template>

    <template v-else>
      <div class="section">
        <div class="section-title">支付方式</div>
        <div class="pay-grid">
          <div
              class="pay-card"
              v-for="item in payMethods"
              :key="item.id"
              :class="{ active: selectedPay === item.id }"
              @click="selectedPay = item.id"
          >
            <img v-if="item.cornerIcon" class="hot-tag" :src="item.cornerIcon" alt="" />
            <img class="pay-icon" :src="item.icon" :alt="item.name" />
            <span class="pay-name">{{ item.name }}</span>
            <img v-if="selectedPay === item.id" class="check-icon" :src="iconCheck" alt="selected" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">存款渠道</div>
        <div class="channel-row">
          <div
              class="channel-item"
              v-for="item in channels"
              :key="item.id"
              :class="{ active: selectedChannel === item.id }"
              @click="selectedChannel = item.id"
          >
            {{ item.name }}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">存款选择</div>
        <div class="channel-row">
          <div
              class="channel-item"
              v-for="item in depositTypes"
              :key="item.id"
              :class="{ active: selectedType === item.id }"
              @click="selectedType = item.id"
          >
            {{ item.name }}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">存款金额</div>
          <div class="exchange-rate">
            <span class="rate-label">当前汇率</span>
            <span class="rate-value">1USDT ≈ 6.88CNY</span>
          </div>
        </div>

        <div class="amount-input-wrapper">
          <img class="input-icon" src="@/assets/icon_usdt.svg" alt="usdt" />
          <input
              type="number"
              class="amount-input"
              placeholder="请输入金额500-5000范围内"
              v-model="amount"
          />
        </div>

        <div class="quick-amount-row">
          <div
              class="quick-amount-item"
              v-for="item in quickAmounts"
              :key="item.value"
              :class="{ active: selectedAmount === item.value }"
              @click="selectAmount(item.value)"
          >
            ¥{{ item.value }}
          </div>
        </div>

        <div class="receipt-amount">
          <div class="receipt-item">
            <span class="receipt-label">当前充值货币</span>
            <span class="receipt-value">实际到账金额</span>
          </div>
          <div class="receipt-item">
            <span class="receipt-label">{{ calculatedAmount.usdt }}USDT</span>
            <span class="receipt-value cny">{{ calculatedAmount.cny }}CNY</span>
          </div>
        </div>
      </div>

      <div class="tip-box">
        <span class="tip-text">
          输入金额后点击确认，扫码/跳转支付成功后<span class="tip-text__emphasis">自动到账</span>，若遇充值失败请及时咨询客服！
        </span>
      </div>

      <button
          class="confirm-btn"
          :class="{ disabled: !isAmountValid }"
          :disabled="!isAmountValid"
          @click="handleConfirm"
      >
        确认存款
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import iconZfb from '@/assets/icon_zfb.svg'
import iconUsdtsm from '@/assets/icon_usdtsm.svg'
import iconWyzf from '@/assets/icon_wyzf.svg'
import icon988pay from '@/assets/icon_988pay.svg'
import cornerPopular from '@/assets/corner_popular.svg'
import iconCheck from '@/assets/icon_recharge_confirm_icon.svg'

const loading = ref(true)
const selectedPay = ref(1)
const selectedChannel = ref(1)
const selectedType = ref(1)
const amount = ref('')
const selectedAmount = ref(null)

const exchangeRate = 6.88

const isAmountValid = computed(() => {
  if (!amount.value) return false
  const num = Number(amount.value)
  return !isNaN(num) && num >= 500 && num <= 5000
})

const calculatedAmount = computed(() => {
  const num = Number(amount.value) || 0
  return {
    usdt: (num / exchangeRate).toFixed(2),
    cny: num.toFixed(2)
  }
})

const payMethods = ref([
  { id: 1, name: '支付宝', icon: iconZfb },
  { id: 2, name: 'USDT', icon: iconUsdtsm },
  { id: 3, name: '网银支付', icon: iconWyzf },
  { id: 4, name: '988pay', icon: icon988pay, cornerIcon: cornerPopular }
])

const channels = ref([
  { id: 1, name: '通道一' },
  { id: 2, name: '通道二' }
])

const depositTypes = ref([
  { id: 1, name: '支付宝大额' },
  { id: 2, name: '支付宝小额' }
])

const quickAmounts = ref([
  { value: 101 },
  { value: 201 },
  { value: 301 },
  { value: 401 }
])

const selectAmount = (value) => {
  selectedAmount.value = value
  amount.value = value.toString()
}

const handleConfirm = () => {
  if (!isAmountValid.value) return
  console.log('确认存款', {
    payMethod: selectedPay.value,
    channel: selectedChannel.value,
    type: selectedType.value,
    amount: amount.value
  })
}

const fetchData = async () => {
  loading.value = false
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
@import '@/styles/pages/deposit.less';
</style>

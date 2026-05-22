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
        <div class="section-title">鏀粯鏂瑰紡</div>
        <div class="pay-grid">
          <div
              class="pay-card"
              v-for="item in payMethods"
              :key="item.id"
              :class="{ active: selectedPay === item.id }"
              @click="selectedPay = item.id"
          >
            <img v-if="item.hot" class="hot-tag" src="@/assets/corner_stablize.png" alt="hot" />
            <img class="pay-icon" src="@/assets/icon_zfb.svg" :alt="item.name" />
            <span class="pay-name">{{ item.name }}</span>
            <img v-if="selectedPay === item.id" class="check-icon" src="@/assets/icon_deposit.png" alt="selected" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">瀛樻娓犻亾</div>
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
        <div class="section-title">瀛樻閫夋嫨</div>
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
          <div class="section-title">瀛樻閲戦</div>
          <div class="exchange-rate">
            <span class="rate-label">褰撳墠姹囩巼</span>
            <span class="rate-value">1USDT 鈮?6.88CNY</span>
          </div>
        </div>

        <div class="amount-input-wrapper">
          <img class="input-icon" src="@/assets/icon_usdt.svg" alt="usdt" />
          <input
              type="number"
              class="amount-input"
              placeholder="璇疯緭鍏ラ噾棰?00-5000鑼冨洿鍐?
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
            楼{{ item.value }}
          </div>
        </div>

        <div class="receipt-amount">
          <div class="receipt-item">
            <span class="receipt-label">褰撳墠鍏呭€艰揣甯?/span>
            <span class="receipt-value">瀹為檯鍒拌处閲戦</span>
          </div>
          <div class="receipt-item">
            <span class="receipt-label">{{ calculatedAmount.usdt }}USDT</span>
            <span class="receipt-value cny">{{ calculatedAmount.cny }}CNY</span>
          </div>
        </div>
      </div>

      <div class="tip-box">
        <span class="tip-text">
          杈撳叆閲戦鍚庣偣鍑荤‘璁わ紝鎵爜/璺宠浆鏀粯鎴愬姛鍚庤嚜鍔ㄥ埌璐︼紝鑻ラ亣鍏呭€煎け璐ヨ鍙婃椂鍜ㄨ瀹㈡湇锛?        </span>
      </div>

      <button
          class="confirm-btn"
          :class="{ disabled: !isAmountValid }"
          :disabled="!isAmountValid"
          @click="handleConfirm"
      >
        纭瀛樻
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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
  { id: 1, name: '鏀粯瀹?, hot: true },
  { id: 2, name: '鏀粯瀹?, hot: false },
  { id: 3, name: '閾惰鍗?, hot: false },
  { id: 4, name: '988pay', hot: false }
])

const channels = ref([
  { id: 1, name: '閫氶亾涓€' },
  { id: 2, name: '閫氶亾浜? }
])

const depositTypes = ref([
  { id: 1, name: '鏀粯瀹濆ぇ棰? },
  { id: 2, name: '鏀粯瀹濆皬棰? }
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
  console.log('纭瀛樻', {
    payMethod: selectedPay.value,
    channel: selectedChannel.value,
    type: selectedType.value,
    amount: amount.value
  })
}

const fetchData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800))
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

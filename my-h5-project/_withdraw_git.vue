<template>
  <div class="withdraw-page">
    <template v-if="loading">
      <div class="skeleton-card skeleton-card--balance shimmer"></div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--method shimmer"></div>
      </div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--row shimmer"></div>
      </div>
      <div class="section">
        <div class="skeleton-bar skeleton-bar--accounts shimmer"></div>
      </div>
      <div class="skeleton-bar skeleton-bar--btn shimmer"></div>
    </template>

    <template v-else>
      <div class="balance-card">
        <div class="balance-header">
          <div class="balance-title">璐︽埛浣欓</div>
          <button
            class="recycle-btn"
            type="button"
            :disabled="isRecycling"
            @click="handleRecycle"
          >
            <span class="recycle-icon" :class="{ spinning: isRecycling }">
              <img src="@/assets/icon_recycling.png" alt="">
            </span>
            涓€閿洖鏀?          </button>
        </div>

        <div class="balance-amount">楼 89,685.50</div>
        <div class="divider" />

        <div class="sub-balance">
          <div class="sub-label">浣欓</div>
          <div class="sub-amount">楼 0.00&nbsp;&nbsp;楼 0.00</div>
        </div>

        <div class="balance-tip" @click="showTipPopup = true">
          <span class="tip-dot"><img src="@/assets/icon_exclamation.png" alt=""></span>
          宸插畬鎴愭彁鐜拌姹傛湁鏁堟祦姘达紝鍙嚜鐢辨彁鐜扮幇閲?        </div>
      </div>

      <div class="section">
        <div class="section-title">鍙栨鏂瑰紡</div>
        <div class="method-grid">
          <button
            v-for="m in methods"
            :key="m.key"
            class="method-card"
            :class="{ active: selectedMethod === m.key }"
            type="button"
            @click="selectedMethod = m.key"
          >
            <div class="method-icon" :class="m.key">{{ m.short }}</div>
            <div class="method-name">{{ m.name }}</div>
            <img
              v-if="selectedMethod === m.key"
              class="check-icon"
              src="@/assets/icon_deposit.png"
              alt="selected"
            />
            <div class="check-corner" />
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">鍙栨閲戦</div>
        <div class="amount-row">
          <div class="currency-icon"><img src="@/assets/icon_cny.png" alt=""></div>
          <input
            class="amount-input"
            inputmode="decimal"
            placeholder="璇疯緭鍏ュ彇娆鹃噾棰?
            v-model="amount"
          />
          <button class="all-btn" type="button" @click="amount = '89685.50'">鍏ㄩ儴</button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">鍙栨璐︽埛</div>
          <button class="manage-btn" type="button" @click="goManageAccounts">
            <span class="manage-icon"><img src="@/assets/icon_manage.png" alt=""></span>
            绠＄悊
          </button>
        </div>

        <div class="account-list">
          <button
            v-for="a in filteredAccounts"
            :key="a.id"
            class="account-card"
            :class="{ active: selectedAccountId === a.id }"
            type="button"
            @click="selectedAccountId = a.id"
          >
            <div class="account-icon"><img src="@/assets/icon_usdtsm.png" alt=""></div>
            <div class="account-info">
              <div class="account-name"><span>{{ a.title }}</span> <span>{{ a.display }}</span></div>
            </div>
            <img
              v-if="selectedAccountId === a.id"
              class="check-icon"
              src="@/assets/icon_deposit.png"
              alt="selected"
            />
            <div class="check-corner" />
          </button>

          <button class="add-account" type="button" @click="goAddAccount">
            <span class="add-icon"><img src="@/assets/icon_withdrawal_add.png" alt=""></span>
            娣诲姞鍙栨璐︽埛
          </button>
        </div>
      </div>

      <button class="confirm-btn" type="button">纭鍙栨</button>
    </template>

    <Teleport to="body">
      <Transition name="tip-popup">
        <div v-if="showTipPopup" class="tip-popup-mask" @click.self="showTipPopup = false">
          <div class="tip-popup">
            <div class="tip-popup-header">
              <h3 class="tip-popup-title">鎻愮ず</h3>
              <button type="button" class="tip-popup-close" aria-label="鍏抽棴" @click="showTipPopup = false">
                <img src="@/assets/icon_x.png" alt="鍏抽棴" />
              </button>
            </div>
            <div class="tip-popup-body">
              <p class="tip-item">1. 璇锋敞鎰?闇€瑕佹弧瓒充竴瀹氭祦姘撮噾棰濄€傛彁鐜伴噾棰濆繀椤荤鍚堟渶浣庢彁鐜伴搴?骞朵笖鍙兘鍙楀埌鎻愮幇绠￠亾鐨勫奖鍝?/p>
              <p class="tip-item">2. 閫夋嫨鎮ㄦ兂瑕佺殑鎻愮幇鏂瑰紡,璇风‘淇濇偍宸茬粡姝ｇ‘濉啓骞剁粦瀹氫簡鐩稿簲鐨勬彁鐜板笎鎴疯祫璁€?/p>
              <p class="tip-item">3. 鎻愮幇鐢宠鎻愪氦鍚?鎮ㄧ殑鎻愮幇璇锋眰灏嗚繘鍏ュ鏍搁樁娈点€備竴鑸儏鍐典笅,鎻愮幇瀹℃牳灏嗕細灏藉揩瀹屾垚銆?/p>
              <p class="tip-item">4. 璇锋敞鎰?鏍规嵁涓嶅悓鐨勬彁鐜扮閬撴彁鐜拌繃绋嬩腑鍙兘浼氭敹鍙栦竴瀹氱殑鎵嬬画璐规垨鏈夋彁鐜版椂闂村欢杩?璇锋偍鑰愬績绛夊緟銆傚鏋滄偍鏈変换浣曠枒闂垨闇€瑕佸崗鍔?璇烽殢鏃惰仈缁滄垜浠殑瀹㈡湇鍥㈤槦,鎴戜滑灏嗙璇氫负鎮ㄦ湇鍔? 鎰熻阿鎮ㄩ€夋嫨鎴戜滑鐨勫钩鍙?绁濇偍鎻愮幇椤哄埄!</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getWithdrawalAccounts, maskAccountDisplay } from '@/utils/withdrawalAccounts'

const router = useRouter()

const loading = ref(true)
const methods = [
  { key: 'usdt', name: 'USDT', short: 'T' },
  { key: 'bank', name: '閾惰鍗?, short: '閾? },
  { key: 'wallet', name: '鐢靛瓙閽卞寘', short: 'C' }
]

const selectedMethod = ref('usdt')
const amount = ref('')

const accounts = ref([])
const selectedAccountId = ref('')
const showTipPopup = ref(false)

const refreshAccounts = () => {
  accounts.value = getWithdrawalAccounts()
}

const filteredAccounts = computed(() => {
  return accounts.value
    .filter(a => a.method === selectedMethod.value)
    .map(a => {
      const d = maskAccountDisplay(a.method, a.data)
      return { id: a.id, ...d }
    })
})

watch(filteredAccounts, (list) => {
  if (!selectedAccountId.value && list.length > 0) selectedAccountId.value = list[0].id
  if (selectedAccountId.value && !list.find(x => x.id === selectedAccountId.value)) {
    selectedAccountId.value = list[0]?.id || ''
  }
}, { immediate: true })

const handleRecycle = () => {
  router.push({ name: 'walletRecycle' })
}

const goManageAccounts = () => router.push({ name: 'withdrawalAccounts' })
const goAddAccount = () => router.push({ name: 'withdrawalAccountEdit', query: { mode: 'create', method: selectedMethod.value } })

const fetchData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800))
  loading.value = false
  refreshAccounts()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
@import '@/styles/pages/withdraw.less';

</style>

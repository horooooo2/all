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
          <div class="balance-title">{{ $t('账户余额') }}</div>
          <button
            class="recycle-btn"
            type="button"
            :disabled="isRecycling"
            @click="handleRecycle"
          >
            <span class="recycle-icon" :class="{ spinning: isRecycling }">
              <img src="@/assets/icon_recycling.svg" alt="">
            </span>
            一键回收
          </button>
        </div>

        <div class="balance-amount">¥ 89,685.50</div>
        <div class="divider" />

        <div class="sub-balance">
          <div class="sub-label">{{ $t('余额') }}</div>
          <div class="sub-amount">¥ 0.00&nbsp;&nbsp;¥ 0.00</div>
        </div>

        <div class="balance-tip" @click="showTipPopup = true">
          <span class="tip-dot"><img src="@/assets/icon_exclamation.svg" alt=""></span>
          已完成提现要求有效流水，可自由提现现金
        </div>
      </div>

      <div class="section">
        <div class="section-title">{{ $t('取款方式') }}</div>
        <div class="method-grid">
          <div
            v-for="m in methods"
            :key="m.key"
            class="method-card"
            :class="{ active: selectedMethod === m.key }"
            role="button"
            tabindex="0"
            @click="selectedMethod = m.key"
            @keydown.enter.prevent="selectedMethod = m.key"
          >
            <div class="method-icon">
              <img :src="m.icon" :alt="m.name" />
            </div>
            <div class="method-name">{{ m.name }}</div>
            <img
              v-if="selectedMethod === m.key"
              class="check-icon"
              :src="iconCheck"
              alt="selected"
            />
            <div class="check-corner" />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">取款金额</div>
        <div class="amount-row">
          <div class="currency-icon"><img src="@/assets/icon_cny.svg" alt=""></div>
          <input
            class="amount-input"
            inputmode="decimal"
            placeholder="请输入取款金额"
            v-model="amount"
          />
          <button class="all-btn" type="button" @click="amount = '89685.50'">{{ $t('全部') }}</button>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <div class="section-title">取款账户</div>
          <button class="manage-btn" type="button" @click="goManageAccounts">
            <span class="manage-icon"><img src="@/assets/icon_manage.svg" alt=""></span>
            管理
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
            <div class="account-icon"><img src="@/assets/icon_usdtsm.svg" alt=""></div>
            <div class="account-info">
              <div class="account-name"><span>{{ a.title }}</span> <span>{{ a.display }}</span></div>
            </div>
            <img
              v-if="selectedAccountId === a.id"
              class="check-icon"
              :src="iconCheck"
              alt="selected"
            />
            <div class="check-corner" />
          </button>

          <button class="add-account" type="button" @click="goAddAccount">
            <span class="add-icon"><img src="@/assets/icon_withdrawal_add.svg" alt=""></span>
            添加取款账户
          </button>
        </div>
      </div>

      <button class="confirm-btn" type="button">确认取款</button>
    </template>

    <Teleport to="body">
      <Transition name="tip-popup">
        <div v-if="showTipPopup" class="tip-popup-mask" @click.self="showTipPopup = false">
          <div class="tip-popup">
            <div class="tip-popup-header">
              <h3 class="tip-popup-title">{{ $t('提示') }}</h3>
              <button type="button" class="tip-popup-close" :aria-label="$t('关闭')" @click="showTipPopup = false">
                <img src="@/assets/icon_x.svg" :alt="$t('关闭')" />
              </button>
            </div>
            <div class="tip-popup-body">
              <p class="tip-item">1. 请注意,需要满足一定流水金额。提现金额必须符合最低提现额度,并且可能受到提现管道的影响</p>
              <p class="tip-item">2. 选择您想要的提现方式,请确保您已经正确填写并绑定了相应的提现帳戶資訊。</p>
              <p class="tip-item">3. 提现申请提交后,您的提现请求将进入审核阶段。一般情况下,提现审核将会尽快完成。</p>
              <p class="tip-item">4. 请注意,根据不同的提现管道提现过程中可能会收取一定的手续费或有提现时间延迟,请您耐心等待。如果您有任何疑问或需要协助,请随时联络我们的客服团队,我们将端诚为您服务! 感谢您选择我们的平台,祝您提现顺利!</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchWithdrawalAccounts, maskAccountDisplay } from '@/utils/withdrawalAccounts'
import iconUsdtsm from '@/assets/icon_usdtsm.svg'
import iconWyzf from '@/assets/icon_wyzf.svg'
import iconDzqb from '@/assets/icon_dzqb.svg'
import iconCheck from '@/assets/icon_recharge_confirm_icon.svg'

const router = useRouter()
const loading = ref(true)
const isRecycling = ref(false)
const methods = [
  { key: 'usdt', name: 'USDT', icon: iconUsdtsm },
  { key: 'bank', name: t('银行卡'), icon: iconWyzf },
  { key: 'wallet', name: t('电子钱包'), icon: iconDzqb }
]

const selectedMethod = ref('usdt')
const amount = ref('')

const accounts = ref([])
const selectedAccountId = ref('')
const showTipPopup = ref(false)

const refreshAccounts = async () => {
  try {
    accounts.value = await fetchWithdrawalAccounts()
  } catch (error) {
    console.error(t('加载提款账户失败:'), error)
    accounts.value = []
  }
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
  loading.value = true
  try {
    await refreshAccounts()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
@import '@/styles/skeleton.less';
@import '@/styles/pages/withdraw.less';

</style>

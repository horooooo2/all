<template>
  <div class="withdrawal-account-edit-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>提款账户</h1>
      <span class="header-spacer" />
    </header>

    <main class="content">
      <div v-if="optionsLoading" class="options-loading">加载中...</div>

      <template v-else>
        <div v-if="methodOptions.length" class="section method-pay-section">
          <div class="section-title">取款方式</div>
          <div class="pay-grid" :class="payGridClass">
            <div
              v-for="m in methodOptions"
              :key="m.key"
              class="pay-card"
              :class="{ active: method === m.key }"
              role="button"
              tabindex="0"
              @click="switchMethod(m.key)"
              @keydown.enter.prevent="switchMethod(m.key)"
              @keydown.space.prevent="switchMethod(m.key)"
            >
              <img class="pay-icon" :src="m.icon" :alt="m.name">
              <span class="pay-name">{{ m.name }}</span>
              <img v-if="method === m.key" class="check-icon" :src="iconDepositCheck" alt="">
            </div>
          </div>
        </div>

        <template v-if="method === 'usdt'">
          <div v-if="protocolOptions.length" class="label">USDT协议类型</div>
          <div v-if="protocolOptions.length" class="segmented">
            <button
              v-for="p in protocolOptions"
              :key="p.protocol"
              type="button"
              class="seg-btn"
              :class="{ active: usdt.chain === p.protocol }"
              @click="usdt.chain = p.protocol"
            >
              {{ p.name }}
            </button>
          </div>

          <div class="label">USDT取款地址</div>
          <input v-model="usdt.address" class="input" placeholder="请输入钱包地址" />

          <div class="hint-box">
            <div class="hint-title">提示</div>
            <div class="hint-text">1. 请填写本人真实数据，填写错误将导致绑定不成功或将无法提现。</div>
            <div class="hint-text">2. 绑定成功后，将无法更改资讯,请确保您输入的资讯正确。</div>
            <div class="hint-text">3. 请核对好您的加密货币帐户网络，网络错误会导致您的提现损失。</div>
            <div class="hint-text">4. 如有疑问，请联系客服。</div>
          </div>
        </template>

        <template v-else-if="method === 'bank'">
          <div class="label">真实姓名</div>
          <input v-model="bank.realName" class="input" placeholder="请输入真实姓名" />

          <div class="label">开户行</div>
          <button type="button" class="select" @click="showBankSheet = true">
            <span :class="{ placeholder: !bank.bankName }">{{ bank.bankName || '请选择开户行' }}</span>
            <van-icon name="arrow-down" />
          </button>

          <div class="label">银行卡号</div>
          <input v-model="bank.cardNo" class="input" inputmode="numeric" placeholder="请输入银行卡号" />
        </template>

        <template v-else-if="method === 'wallet'">
          <div class="label">真实姓名</div>
          <input v-model="wallet.realName" class="input" placeholder="请输入真实姓名" />

          <div class="label">选择电子钱包</div>
          <button type="button" class="select" @click="showWalletSheet = true">
            <span :class="{ placeholder: !wallet.walletName }">{{ wallet.walletName || '请选择电子钱包' }}</span>
            <van-icon name="arrow-down" />
          </button>

          <div class="label">电子钱包账号</div>
          <input v-model="wallet.walletNo" class="input" placeholder="请输入电子钱包账号" />
        </template>

        <template v-if="isCreateMode">
          <div class="label">取款密码</div>
          <input
            v-model="withdrawPassword"
            class="input"
            type="password"
            inputmode="numeric"
            maxlength="6"
            autocomplete="off"
            placeholder="请输入6位取款密码"
          />
        </template>

        <button
          type="button"
          class="save-btn"
          :class="{ disabled: !canSave || optionsLoading || isSubmitting }"
          :disabled="!canSave || optionsLoading || isSubmitting"
          @click="onSave"
        >
          {{ saveButtonText }}
        </button>
      </template>
    </main>

    <van-popup v-model:show="showBankSheet" position="bottom" round class="selection-popup">
      <div class="selection-sheet">
        <div class="selection-sheet-header">
          <div class="selection-sheet-title">开户行</div>
          <div class="selection-close-btn" role="button" tabindex="0" @click="showBankSheet = false">
            <img :src="iconClose" alt="close">
          </div>
        </div>

        <button
          v-for="item in bankOptionList"
          :key="item.id || item.name"
          type="button"
          class="selection-option"
          :class="{ active: bank.bankId === item.id }"
          @click="selectBank(item)"
        >
          <span>{{ item.name }}</span>
          <span class="selection-indicator" :class="{ active: bank.bankId === item.id }" />
        </button>
      </div>
    </van-popup>

    <van-popup v-model:show="showWalletSheet" position="bottom" round class="selection-popup">
      <div class="selection-sheet">
        <div class="selection-sheet-header">
          <div class="selection-sheet-title">类型选择</div>
          <div class="selection-close-btn" role="button" tabindex="0" @click="showWalletSheet = false">
            <img :src="iconClose" alt="close">
          </div>
        </div>

        <button
          v-for="item in walletOptionList"
          :key="item.id || item.name"
          type="button"
          class="selection-option"
          :class="{ active: wallet.walletOptionId === item.id }"
          @click="selectWallet(item)"
        >
          <span>{{ item.name }}</span>
          <span class="selection-indicator" :class="{ active: wallet.walletOptionId === item.id }" />
        </button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import toast from '@/components/Toast'
import iconBack from '@/assets/icon_dack.svg'
import iconDepositCheck from '@/assets/icon_recharge_confirm_icon.svg'
import iconClose from '@/assets/icon_x.svg'
import iconPayUsdt from '@/assets/icon_usdtsm.png'
import iconPayBank from '@/assets/icon_cny.svg'
import iconPayWallet from '@/assets/icon_zfb.svg'
import { bindWalletAccount, buildBindCryptoPayload, fetchWalletAccountOptions } from '@/api/wallet'
import { useUserStore } from '@/stores/user'
import { getWithdrawalAccountById, upsertWithdrawalAccount } from '@/utils/withdrawalAccounts'

const METHOD_ICONS = {
  usdt: iconPayUsdt,
  bank: iconPayBank,
  wallet: iconPayWallet
}

const FALLBACK_METHOD_OPTIONS = [
  { key: 'usdt', type: 'usdt', name: 'USDT', icon: iconPayUsdt },
  { key: 'bank', type: 'bank', name: '银行卡', icon: iconPayBank },
  { key: 'wallet', type: 'wallet', name: '电子钱包', icon: iconPayWallet }
]

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const id = computed(() => String(route.query.id || ''))
const isCreateMode = computed(() => !id.value)
const method = ref('usdt')
const optionsLoading = ref(true)
const isSubmitting = ref(false)
const withdrawPassword = ref('')
const methodOptions = ref([...FALLBACK_METHOD_OPTIONS])
const protocolOptions = ref([])
const bankOptionList = ref([])
const walletOptionList = ref([])

const usdt = reactive({
  chain: '',
  address: ''
})

const bank = reactive({
  realName: '',
  bankId: '',
  bankName: '',
  cardNo: ''
})

const wallet = reactive({
  realName: '',
  walletOptionId: '',
  walletName: '',
  walletNo: ''
})

const showBankSheet = ref(false)
const showWalletSheet = ref(false)

const payGridClass = computed(() => {
  const count = methodOptions.value.length
  if (count <= 1) return 'pay-grid--cols1'
  if (count === 2) return 'pay-grid--cols2'
  return 'pay-grid--cols3'
})

const activeAccountType = computed(() => {
  const item = methodOptions.value.find((m) => m.key === method.value)
  return item?.type || method.value
})

const saveButtonText = computed(() => {
  if (isSubmitting.value) {
    return isCreateMode.value ? '绑定中...' : '保存中...'
  }
  return isCreateMode.value ? '绑定' : '保存'
})

const isWithdrawPasswordValid = computed(() => /^\d{6}$/.test(withdrawPassword.value))

const withWithdrawPasswordRule = (valid) => {
  if (!isCreateMode.value) return valid
  return valid && isWithdrawPasswordValid.value
}

const goBack = () => router.back()

const switchMethod = (m) => {
  method.value = m
  if (m === 'wallet' && !wallet.walletOptionId && walletOptionList.value.length) {
    selectWallet(walletOptionList.value[0])
  }
}

const selectBank = (item) => {
  bank.bankId = String(item?.id ?? '')
  bank.bankName = String(item?.name || item?.bankName || '').trim()
  showBankSheet.value = false
}

const selectWallet = (item) => {
  wallet.walletOptionId = String(item?.id ?? '')
  wallet.walletName = String(item?.name || item?.platformName || '').trim()
  showWalletSheet.value = false
}

const syncMethodSelection = () => {
  const keys = methodOptions.value.map((m) => m.key)
  if (!keys.length) return
  if (!keys.includes(method.value)) {
    method.value = keys[0]
  }
}

const syncProtocolSelection = () => {
  if (!protocolOptions.value.length) return
  const protocols = protocolOptions.value.map((p) => p.protocol)
  if (!protocols.includes(usdt.chain)) {
    usdt.chain = protocolOptions.value[0].protocol
  }
}

const syncBankSelection = () => {
  if (!bankOptionList.value.length) return
  if (bank.bankId) {
    const matched = bankOptionList.value.find((item) => item.id === bank.bankId)
    if (matched) {
      bank.bankName = matched.name
      return
    }
  }
  if (bank.bankName) {
    const matched = bankOptionList.value.find(
      (item) => item.name === bank.bankName || item.bankName === bank.bankName
    )
    if (matched) {
      selectBank(matched)
      return
    }
  }
  if (!bank.bankId) {
    selectBank(bankOptionList.value[0])
  }
}

const syncWalletSelection = () => {
  if (!walletOptionList.value.length) return
  if (wallet.walletOptionId) {
    const matched = walletOptionList.value.find((item) => item.id === wallet.walletOptionId)
    if (matched) {
      wallet.walletName = matched.name
      return
    }
  }
  if (wallet.walletName) {
    const matched = walletOptionList.value.find(
      (item) => item.name === wallet.walletName || item.platformName === wallet.walletName
    )
    if (matched) {
      selectWallet(matched)
      return
    }
  }
  if (!wallet.walletOptionId) {
    selectWallet(walletOptionList.value[0])
  }
}

const applyAccountOptions = (opts) => {
  if (opts.accountTypes.length) {
    methodOptions.value = opts.accountTypes.map((item) => ({
      key: item.method,
      type: item.type,
      name: item.name,
      icon: METHOD_ICONS[item.method] || iconPayWallet
    }))
  } else {
    methodOptions.value = [...FALLBACK_METHOD_OPTIONS]
  }

  protocolOptions.value = opts.cryptoProtocols
  bankOptionList.value = opts.bankOptions
  walletOptionList.value = opts.walletOptions

  syncMethodSelection()
  syncProtocolSelection()
  if (method.value === 'bank') syncBankSelection()
  if (method.value === 'wallet') syncWalletSelection()
}

const loadAccountOptions = async () => {
  optionsLoading.value = true
  try {
    const opts = await fetchWalletAccountOptions()
    applyAccountOptions(opts)
  } catch (err) {
    console.error('[withdrawal-account] 加载账户选项失败:', err)
    methodOptions.value = [...FALLBACK_METHOD_OPTIONS]
    toast.error('加载账户选项失败')
  } finally {
    optionsLoading.value = false
  }
}

const canSave = computed(() => {
  if (optionsLoading.value) return false
  if (!methodOptions.value.some((m) => m.key === method.value)) return false
  if (method.value === 'usdt') {
    return withWithdrawPasswordRule(Boolean(usdt.chain && usdt.address.trim()))
  }
  if (method.value === 'bank') {
    return withWithdrawPasswordRule(
      Boolean(bank.realName.trim() && bank.bankId && bank.cardNo.trim())
    )
  }
  if (method.value === 'wallet') {
    return withWithdrawPasswordRule(
      Boolean(wallet.realName.trim() && wallet.walletOptionId && wallet.walletNo.trim())
    )
  }
  return false
})

const ensureWithdrawPasswordReady = () => {
  if (!isCreateMode.value) return true

  if (!userStore.userInfo?.hasWithdrawPassword) {
    toast.warning('请先设置取款密码')
    router.push({
      name: 'changeWithdrawPassword',
      query: { redirect: route.fullPath }
    })
    return false
  }

  if (!isWithdrawPasswordValid.value) {
    toast.warning('请输入6位取款密码')
    return false
  }

  return true
}

const saveLocalAccount = () => {
  if (!ensureWithdrawPasswordReady()) return

  isSubmitting.value = true
  const accountType = activeAccountType.value
  const payload = {
    id: id.value || undefined,
    method: method.value,
    data: method.value === 'bank'
      ? {
        accountType,
        realName: bank.realName.trim(),
        bankId: bank.bankId,
        bankName: bank.bankName,
        cardNo: bank.cardNo.trim()
      }
      : {
        accountType,
        realName: wallet.realName.trim(),
        walletOptionId: wallet.walletOptionId,
        walletName: wallet.walletName,
        walletNo: wallet.walletNo.trim()
      }
  }

  upsertWithdrawalAccount(payload)
  toast.success('保存成功', 500)
  router.replace({ name: 'withdrawalAccounts' })
}

const bindUsdtAccount = async () => {
  if (!ensureWithdrawPasswordReady()) return

  isSubmitting.value = true
  toast.loading('绑定中...')
  try {
    await bindWalletAccount(buildBindCryptoPayload({
      protocol: usdt.chain,
      accountNo: usdt.address.trim(),
      withdrawPassword: withdrawPassword.value
    }))
    toast.hideLoading()
    toast.success('绑定成功', 500)
    router.replace({ name: 'withdrawalAccounts' })
  } catch {
    toast.hideLoading()
    isSubmitting.value = false
  }
}

const onSave = async () => {
  if (isSubmitting.value || !canSave.value) return

  if (method.value === 'usdt') {
    if (id.value) {
      toast.warning('暂不支持修改USDT账户')
      return
    }
    await bindUsdtAccount()
    return
  }

  saveLocalAccount()
}

const loadLocalAccount = () => {
  if (!id.value) return
  const item = getWithdrawalAccountById(id.value)
  if (!item) return
  method.value = item.method || 'usdt'
  const data = item.data || {}
  if (method.value === 'usdt') {
    usdt.chain = data.chain || ''
    usdt.address = data.address || ''
  } else if (method.value === 'bank') {
    bank.realName = data.realName || ''
    bank.bankId = data.bankId || ''
    bank.bankName = data.bankName || ''
    bank.cardNo = data.cardNo || ''
  } else {
    wallet.realName = data.realName || ''
    wallet.walletOptionId = data.walletOptionId || ''
    wallet.walletName = data.walletName || ''
    wallet.walletNo = data.walletNo || ''
  }
}

onMounted(async () => {
  const mode = String(route.query.mode || '')
  const preset = String(route.query.method || '')
  if (!id.value && mode === 'create' && (preset === 'usdt' || preset === 'bank' || preset === 'wallet')) {
    method.value = preset
  }

  loadLocalAccount()
  await loadAccountOptions()

  if (method.value === 'bank') syncBankSelection()
  if (method.value === 'wallet') syncWalletSelection()
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/withdrawal-account-edit.less';
</style>

<template>
  <div class="withdrawal-account-edit-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>提款账户</h1>
      <span class="header-spacer" />
    </header>

    <main class="content">
      <div class="section method-pay-section">
        <div class="section-title">取款方式</div>
        <div class="pay-grid pay-grid--cols3">
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
        <div class="label">USDT协议类型</div>
        <div class="segmented">
          <button type="button" class="seg-btn" :class="{ active: usdt.chain === 'TRC-20' }" @click="usdt.chain = 'TRC-20'">TRC-20</button>
          <button type="button" class="seg-btn" :class="{ active: usdt.chain === 'ERC-20' }" @click="usdt.chain = 'ERC-20'">ERC-20</button>
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

      <template v-else>
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

      <button type="button" class="save-btn" :disabled="!canSave" @click="onSave">保存</button>
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
          v-for="item in bankOptions"
          :key="item"
          type="button"
          class="selection-option"
          :class="{ active: bank.bankName === item }"
          @click="selectBank(item)"
        >
          <span>{{ item }}</span>
          <span class="selection-indicator" :class="{ active: bank.bankName === item }" />
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
          v-for="item in walletOptions"
          :key="item"
          type="button"
          class="selection-option"
          :class="{ active: wallet.walletName === item }"
          @click="selectWallet(item)"
        >
          <span>{{ item }}</span>
          <span class="selection-indicator" :class="{ active: wallet.walletName === item }" />
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
import { getWithdrawalAccountById, upsertWithdrawalAccount } from '@/utils/withdrawalAccounts'

const methodOptions = [
  { key: 'usdt', name: 'USDT', icon: iconPayUsdt },
  { key: 'bank', name: '银行卡', icon: iconPayBank },
  { key: 'wallet', name: '电子钱包', icon: iconPayWallet }
]

const router = useRouter()
const route = useRoute()

const id = computed(() => String(route.query.id || ''))
const method = ref('usdt')

const usdt = reactive({
  chain: 'TRC-20',
  address: ''
})

const bank = reactive({
  realName: '',
  bankName: '',
  cardNo: ''
})

const wallet = reactive({
  realName: '',
  walletName: '',
  walletNo: ''
})

const showBankSheet = ref(false)
const showWalletSheet = ref(false)
const bankOptions = ['中国工商银行', '中国建设银行', '中国农业银行', '中国银行', '招商银行', '交通银行']
const walletOptions = ['K豆钱包', '988pay', 'Topay', 'gopay']

const goBack = () => router.back()

const switchMethod = (m) => {
  method.value = m
  if (m === 'wallet' && !wallet.walletName) {
    wallet.walletName = walletOptions[0]
  }
}

const selectBank = (name) => {
  bank.bankName = name
  showBankSheet.value = false
}

const selectWallet = (name) => {
  wallet.walletName = name
  showWalletSheet.value = false
}

const canSave = computed(() => {
  if (method.value === 'usdt') return Boolean(usdt.address)
  if (method.value === 'bank') return Boolean(bank.realName && bank.bankName && bank.cardNo)
  return Boolean(wallet.realName && wallet.walletName && wallet.walletNo)
})

const onSave = () => {
  const payload = {
    id: id.value || undefined,
    method: method.value,
    data: method.value === 'usdt'
      ? { chain: usdt.chain, address: usdt.address.trim() }
      : method.value === 'bank'
        ? { realName: bank.realName.trim(), bankName: bank.bankName, cardNo: bank.cardNo.trim() }
        : {
          realName: wallet.realName.trim(),
          walletName: wallet.walletName.trim(),
          walletNo: wallet.walletNo.trim()
        }
  }

  upsertWithdrawalAccount(payload)
  toast.success('保存成功')
  router.replace({ name: 'withdrawalAccounts' })
}

onMounted(() => {
  const mode = String(route.query.mode || '')
  const preset = String(route.query.method || '')
  if (!id.value && mode === 'create' && (preset === 'usdt' || preset === 'bank' || preset === 'wallet')) {
    method.value = preset
  }

  if (id.value) {
    const item = getWithdrawalAccountById(id.value)
    if (!item) return
    method.value = item.method || 'usdt'
    const data = item.data || {}
    if (method.value === 'usdt') {
      usdt.chain = data.chain || 'TRC-20'
      usdt.address = data.address || ''
    } else if (method.value === 'bank') {
      bank.realName = data.realName || ''
      bank.bankName = data.bankName || ''
      bank.cardNo = data.cardNo || ''
    } else {
      wallet.realName = data.realName || ''
      wallet.walletName = data.walletName || ''
      wallet.walletNo = data.walletNo || ''
    }
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/pages/withdrawal-account-edit.less';
</style>


<template>
  <van-popup
    v-model:show="show"
    position="bottom"
    round
    teleport="body"
    class="game-deposit-popup"
    :z-index="2600"
    :safe-area-inset-bottom="true"
  >
    <div class="gdp" @click.stop>
      <header class="gdp__head">
        <h2 class="gdp__title">{{ $t('存款') }}</h2>
        <button type="button" class="gdp__collapse" :aria-label="$t('收起')" @click="close">
          <img class="gdp__collapse-icon" :src="iconClose" alt="" aria-hidden="true" />
        </button>
      </header>

      <div class="gdp__scroll">
        <section class="gdp__section">
          <h3 class="gdp__section-title">{{ $t('支付方式') }}</h3>
          <div class="gdp__pay-grid">
            <button
              v-for="item in payMethods"
              :key="item.id"
              type="button"
              class="gdp__pay-card"
              :class="{ 'is-active': selectedPay === item.id }"
              @click="selectedPay = item.id"
            >
              <img v-if="item.cornerIcon" class="gdp__pay-corner" :src="item.cornerIcon" alt="" aria-hidden="true" />
              <img class="gdp__pay-icon" :src="item.icon" :alt="item.name" />
              <span class="gdp__pay-name">{{ item.name }}</span>
              <img
                v-if="selectedPay === item.id"
                class="gdp__pay-check"
                :src="iconCheck"
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </section>

        <section v-if="showProtocol" class="gdp__section">
          <h3 class="gdp__section-title">{{ $t('网络协议') }}</h3>
          <div class="gdp__chip-row">
            <button
              v-for="item in protocols"
              :key="item.id"
              type="button"
              class="gdp__chip"
              :class="{ 'is-active': selectedProtocol === item.id }"
              @click="selectedProtocol = item.id"
            >
              {{ item.name }}
            </button>
          </div>
        </section>

        <section v-if="showAddressBlock" class="gdp__address-card">
          <div class="gdp__qr" aria-hidden="true">
            <img class="gdp__qr-img" :src="qrSrc" alt="" />
          </div>
          <div class="gdp__address-main">
            <div class="gdp__address-label">{{ $t('存款地址') }}</div>
            <p class="gdp__address-text">{{ depositAddress }}</p>
            <button type="button" class="gdp__copy-btn" @click="copyAddress">{{ $t('复制地址') }}</button>
          </div>
        </section>

        <section v-else class="gdp__section gdp__section--channel">
          <h3 class="gdp__section-title">{{ $t('存款渠道') }}</h3>
          <div class="gdp__chip-row">
            <button
              v-for="item in channels"
              :key="item.id"
              type="button"
              class="gdp__chip"
              :class="{ 'is-active': selectedChannel === item.id }"
              @click="selectedChannel = item.id"
            >
              {{ item.name }}
            </button>
          </div>
        </section>

        <section class="gdp__tip">
          <p class="gdp__tip-text">
            输入金额后点击确认，扫码/跳转支付成功后<span class="gdp__tip-em">{{ $t('自动到账') }}</span>，若遇充值失败请及时咨询客服！
          </p>
          <p v-if="showAddressBlock" class="gdp__tip-text gdp__tip-text--sub">
            大额1万U起，请<span class="gdp__tip-em">{{ $t('获取专属VIP地址') }}</span>，百万U存U取
          </p>
        </section>
      </div>

      <footer class="gdp__foot">
        <div class="gdp__support">
          <img class="gdp__support-icon" :src="iconSupport" alt="" aria-hidden="true" />
          <span class="gdp__support-text">{{ $t('联系支持') }}</span>
        </div>
        <button type="button" class="gdp__consult-btn" @click="onConsult">{{ $t('咨询') }}</button>
      </footer>
    </div>
  </van-popup>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/components/Toast'
import iconZfb from '@/assets/icon_zfb.svg'
import iconUsdt from '@/assets/icon_usdtsm.svg'
import iconBank from '@/assets/icon_wyzf.svg'
import icon988pay from '@/assets/icon_988pay.svg'
import cornerPopular from '@/assets/corner_popular.svg'
import cornerStable from '@/assets/corner_stablize.svg'
import iconCheck from '@/assets/icon_recharge_confirm_icon.svg'
import iconSupport from '@/assets/icon_cz_kf.svg'
import iconClose from '@/assets/icon_dack_down.svg'

const show = defineModel('show', { type: Boolean, default: false })

const router = useRouter()
const selectedPay = ref('usdt')
const selectedProtocol = ref('trc20')
const selectedChannel = ref(1)

const payMethods = [
  { id: 'zfb', name: t('支付宝'), icon: iconZfb, cornerIcon: cornerPopular },
  { id: 'usdt', name: 'USDT', icon: iconUsdt },
  { id: 'bank', name: t('银行卡'), icon: iconBank },
  { id: '988pay', name: '988pay', icon: icon988pay, cornerIcon: cornerStable }
]

const protocols = [{ id: 'trc20', name: 'TRC-20' }]

const channels = [
  { id: 1, name: t('通道一') },
  { id: 2, name: t('通道二') }
]

const depositAddress = 'TS19uGx6bG39P86rHy3oP5oG8fJ8G8x6J7E'

const showProtocol = computed(() => selectedPay.value === 'usdt')
const showAddressBlock = computed(() => selectedPay.value === 'usdt')

const qrSrc = computed(() => {
  const data = encodeURIComponent(depositAddress)
  return `https://api.qrserver.com/v1/create-qr-code/?size=112x112&data=${data}`
})

function close() {
  show.value = false
}

async function copyAddress() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(depositAddress)
      toast.success(t('已复制地址'))
      return
    }
    const textarea = document.createElement('textarea')
    textarea.value = depositAddress
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    if (ok) toast.success(t('已复制地址'))
    else toast.error(t('复制失败'))
  } catch {
    toast.error(t('复制失败'))
  }
}

function onConsult() {
  close()
  router.push({ name: 'serviceDetail' })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.game-deposit-popup {
  width: 375px;
  max-width: 100vw;
  background: #f1f5ff;
}

.gdp {
  display: flex;
  flex-direction: column;
  height: min(66dvh, 510px);
  background: #f1f5ff;
}

.gdp__head {
  flex: 0 0 auto;
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f5ff;
  box-sizing: border-box;
}

.gdp__title {
  margin: 0;
  font-size: @font-size-lg;
  line-height: 22px;
  font-weight: 600;
  color: #1d1d1f;
}

.gdp__collapse {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

.gdp__collapse-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.gdp__scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 12px 0;
  box-sizing: border-box;
}

.gdp__section {
  margin-bottom: 14px;
}

.gdp__section-title {
  margin: 0 0 8px;
  font-size: @font-size-md;
  line-height: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.gdp__pay-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.gdp__pay-card {
  position: relative;
  height: 64px;
  border: 1px solid #dae4f6;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 0;
  cursor: pointer;
  box-sizing: border-box;
}

.gdp__pay-card.is-active {
  border-color: #0065ff;
  background: #eef5ff;
}

.gdp__pay-corner {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 30px;
  height: 30px;
  object-fit: contain;
  pointer-events: none;
}

.gdp__pay-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.gdp__pay-name {
  font-size: @font-size-xs;
  line-height: 14px;
  color: #1d1d1f;
}

.gdp__pay-card.is-active .gdp__pay-name {
  color: #0065ff;
  font-weight: 600;
}

.gdp__pay-check {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.gdp__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gdp__chip {
  min-width: 88px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dae4f6;
  border-radius: 8px;
  background: #ffffff;
  font-size: @font-size-sm;
  color: #1d1d1f;
  cursor: pointer;
}

.gdp__chip.is-active {
  border-color: #0065ff;
  background: #eef5ff;
  color: #0065ff;
  font-weight: 600;
}

.gdp__address-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 14px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.gdp__qr {
  flex: 0 0 auto;
  width: 112px;
  height: 112px;
  border-radius: 8px;
  border: 1px solid #e7edf8;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gdp__qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.gdp__address-main {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.gdp__address-label {
  font-size: @font-size-sm;
  line-height: 18px;
  color: #6a7892;
  margin-bottom: 6px;
}

.gdp__address-text {
  margin: 0 0 10px;
  font-size: @font-size-sm;
  line-height: 18px;
  font-weight: 600;
  color: #0065ff;
  word-break: break-all;
}

.gdp__copy-btn {
  margin-top: auto;
  width: 100%;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
  font-size: @font-size-sm;
  font-weight: 600;
  cursor: pointer;
}

.gdp__tip {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.gdp__tip-text {
  margin: 0;
  font-size: @font-size-sm;
  line-height: 1.5;
  color: #6a7892;
}

.gdp__tip-text + .gdp__tip-text {
  margin-top: 6px;
}

.gdp__tip-em {
  color: #ee1818;
}

.gdp__foot {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px;
  .layout-padding-bottom(12px);
  background: #f1f5ff;
  box-sizing: border-box;
}

.gdp__support {
  flex: 1 1 auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ffffff;
  box-sizing: border-box;
}

.gdp__support-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.gdp__support-text {
  font-size: @font-size-sm;
  color: #1d1d1f;
}

.gdp__consult-btn {
  flex: 0 0 auto;
  width: 48px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
  font-size: @font-size-sm;
  font-weight: 600;
  cursor: pointer;
}
</style>

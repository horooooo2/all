<template>
  <div class="pc28-gv-room">
    <main class="game-room-body is-group-vote" role="main">
      <div class="game-room-content">
        <section class="room-tabs-bar" aria-label="内容切换">
          <van-tabs
            v-model:active="roomActiveKey"
            class="room-tabs-vant"
            line-height="3px"
            color="#0065FF"
            title-inactive-color="#8C8C8C"
            title-active-color="#0065FF"
            :animated="false"
          >
            <van-tab name="hall" title="大厅" />

            <template #nav-right>
              <div class="room-tabs-actions">
                <div
                  class="mi-btn"
                  role="button"
                  tabindex="0"
                  aria-label="咪牌"
                  @click="emit('mipai')"
                  @keydown.enter.prevent="emit('mipai')"
                  @keydown.space.prevent="emit('mipai')"
                >
                  <span class="mi-btn__text">咪牌</span>
                </div>

                <div
                  class="amount-box"
                  role="button"
                  tabindex="0"
                  aria-label="金额信息，点击充值"
                  @click="emit('deposit')"
                  @keydown.enter.prevent="emit('deposit')"
                  @keydown.space.prevent="emit('deposit')"
                >
                  <div class="amount-ticker" aria-live="polite">
                    <div class="amount-ticker__track" :class="{ 'is-second': amountTickerIndex === 1 }">
                      <div class="amount-ticker__item" aria-label="上期盈亏">
                        <span class="amount-box__label">上期盈亏</span>
                        <span class="amount-box__value" :class="profitClass">{{ profitText }}</span>
                      </div>
                      <div class="amount-ticker__item" aria-label="余额">
                        <span class="amount-box__label">余额</span>
                        <span class="amount-box__value is-balance">{{ balanceText }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="plus-btn"
                  role="button"
                  tabindex="0"
                  aria-label="加号"
                  @click="emit('plus')"
                  @keydown.enter.prevent="emit('plus')"
                  @keydown.space.prevent="emit('plus')"
                >
                  <img class="plus-btn__icon" :src="iconPlus" alt="" aria-hidden="true" />
                </div>
              </div>
            </template>
          </van-tabs>
        </section>

        <div v-show="roomActiveKey === 'hall'" class="hall-panel">
          <section class="hall-chat" aria-label="聊天" />
        </div>
      </div>
    </main>

    <footer v-show="!inputPopupOpen" class="room-bottom-bar" aria-label="底部输入栏" @click.stop>
      <button type="button" class="help-btn" aria-label="帮助" @click="onHelp">
        <img class="help-btn__icon" :src="iconYw" alt="" aria-hidden="true" />
      </button>

      <div class="input-wrap">
        <div
          class="room-input"
          role="button"
          tabindex="0"
          :class="{ 'is-placeholder': !bottomInput }"
          :aria-label="bottomInput ? `输入内容：${bottomInput}` : inputPlaceholder"
          @click="onOpenInput"
          @keydown.enter.prevent="onOpenInput"
          @keydown.space.prevent="onOpenInput"
        >
          {{ inputPlaceholder }}
        </div>
      </div>

      <div class="bottom-actions">
        <button type="button" class="action-btn action-btn--chat" @click="onOpenChat">聊天</button>
        <button type="button" class="action-btn action-btn--bet" :disabled="betDisabled" @click="onOpenBet">下注</button>
      </div>
    </footer>

    <van-popup
      v-model:show="inputPopupOpen"
      position="bottom"
      class="room-input-popup"
      :overlay="true"
      :safe-area-inset-bottom="true"
      @opened="focusPopupInput"
    >
      <div class="room-input-popup__handle" role="button" tabindex="0" aria-label="关闭" @click="closeInputPopup">
        <img class="room-input-popup__caret" :src="iconCaretDown" alt="" aria-hidden="true" />
      </div>

      <div class="room-input-popup__body">
        <textarea
          ref="popupInputRef"
          v-model="bottomInput"
          class="room-input-popup__textarea"
          :class="{ 'is-chat': inputMode === 'chat' }"
          :placeholder="popupPlaceholder"
          rows="3"
        />
        <div
          class="room-input-popup__send"
          :class="{ 'is-icon': inputMode === 'chat', 'is-disabled': sendDisabled }"
          role="button"
          tabindex="0"
          :aria-disabled="sendDisabled ? 'true' : 'false'"
          @click="!sendDisabled && onPopupSend()"
          @keydown.enter.prevent="!sendDisabled && onPopupSend()"
          @keydown.space.prevent="!sendDisabled && onPopupSend()"
        >
          <img v-if="inputMode === 'chat'" class="room-input-popup__send-icon" :src="iconSend" alt="" aria-hidden="true" />
          <template v-else>{{ sendButtonText }}</template>
        </div>
      </div>
    </van-popup>

    <Pc28BetPanel
      ref="betPanelRef"
      v-model:show="betPanelOpen"
      :title="title"
      :issue="issue"
      :countdown="countdown"
      :balance="balance"
      :top="betPanelTop"
      @submit="onBetPanelSubmit"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { toast } from '@/components/Toast'
import Pc28BetPanel from './Pc28BetPanel.vue'
import iconYw from '@/assets/icon_yw.svg'
import iconCaretDown from '@/assets/down_icon.svg'
import iconSend from '@/assets/icon_send.svg'
import iconPlus from '@/assets/icon_add.svg'

const props = defineProps({
  balance: { type: [String, Number], default: 0 },
  title: { type: String, default: '加拿大PC28' },
  issue: { type: String, default: '' },
  countdown: { type: String, default: '00:00:00' },
  lastProfit: { type: [String, Number], default: 0 },
  amountTickerIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['submit', 'chase', 'open-recent', 'mipai', 'plus', 'deposit'])

const roomActiveKey = ref('hall')

const bottomInput = ref('')
const inputPopupOpen = ref(false)
const popupInputRef = ref(null)
const inputMode = ref('bet')
const betPanelOpen = ref(false)
const betPanelRef = ref(null)
const betPanelTop = ref(0)
const lastValidBetPanelTop = ref(0)

const inputPlaceholder = computed(() => '输入文字可以快速下注')

const betDisabled = computed(() => false)

const popupPlaceholder = computed(() => {
  if (inputMode.value === 'chat') return '说点什么...'
  return `下注示例：\n· 大小单双的下注指令示例\n[大100][da100][小100][x100][单100][d100]`
})

const sendButtonText = computed(() => '发送投注')
const sendDisabled = computed(() => !bottomInput.value)

const profitText = computed(() => {
  const v = Number(props.lastProfit || 0)
  const abs = Math.abs(v).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  if (v < 0) return `-${abs}`
  return `${abs}`
})

const profitClass = computed(() => {
  const v = Number(props.lastProfit || 0)
  if (v < 0) return 'is-negative'
  return 'is-positive'
})

const balanceText = computed(() => {
  const v = Number(props.balance || 0)
  if (!Number.isFinite(v)) return '0'
  return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

function measureBetPanelTop() {
  const rect = document.querySelector('.lottery-prev')?.getBoundingClientRect?.()
  if (!rect) return
  const bottom = Number(rect.bottom)
  if (!Number.isFinite(bottom) || bottom <= 0) return
  betPanelTop.value = bottom
  lastValidBetPanelTop.value = bottom
}

function onViewportChange() {
  if (!betPanelOpen.value) return
  measureBetPanelTop()
}

onMounted(() => {
  measureBetPanelTop()
  window.addEventListener('resize', onViewportChange, { passive: true })
  window.addEventListener('scroll', onViewportChange, { passive: true, capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, { capture: true })
})

function onHelp() {
  toast('帮助（演示）')
}

function onOpenInput() {
  bottomInput.value = ''
  inputMode.value = 'bet'
  inputPopupOpen.value = true
}

function onOpenChat() {
  bottomInput.value = ''
  inputMode.value = 'chat'
  inputPopupOpen.value = true
}

function onOpenBet() {
  if (lastValidBetPanelTop.value > 0) betPanelTop.value = lastValidBetPanelTop.value
  betPanelOpen.value = true
  nextTick(() => {
    measureBetPanelTop()
    requestAnimationFrame(() => measureBetPanelTop())
  })
}

function closeInputPopup() {
  bottomInput.value = ''
  inputPopupOpen.value = false
}

async function focusPopupInput() {
  await nextTick()
  popupInputRef.value?.focus?.()
}

function onPopupSend() {
  if (inputMode.value === 'chat') onChat()
  else onBet()
  closeInputPopup()
}

function onChat() {
  const text = bottomInput.value
  if (!text) return
  toast(`聊天：${text}`)
  bottomInput.value = ''
}

function onBet() {
  const text = bottomInput.value
  if (!text) return
  toast(`下注：${text}`)
  bottomInput.value = ''
}

function onBetPanelSubmit(payload) {
  emit('submit', payload)
}

function onGroupVoteOpenRecent() {
  betPanelRef.value?.openRecentBetsPanel?.()
  emit('open-recent')
}

defineExpose({
  openBetPanel: onOpenBet,
  openRecentBetsPanel: () => betPanelRef.value?.openRecentBetsPanel?.()
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.pc28-gv-room {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.game-room-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.game-room-body.is-group-vote {
  display: flex;
  flex-direction: column;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
}

.game-room-body.is-group-vote .game-room-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-room-content {
  padding: 0;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hall-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hall-chat {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background: #f3f6fc;
}

/* 与快三 GameRoom room-tabs-bar / van-tabs__wrap 一致，仅保留「大厅」Tab */
.room-tabs-bar {
  width: 375px;
  height: 40px;
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  padding-right: 5px;
  flex: 0 0 auto;
}

.room-tabs-vant {
  height: 40px;
}

.room-tabs-vant :deep(.van-tabs__wrap) {
  overflow: hidden;
  height: 40px;
}

.room-tabs-vant :deep(.van-tabs__nav--line) {
  height: 100%;
  padding-bottom: 15px;
  box-sizing: content-box;
}

.room-tabs-vant :deep(.van-tabs__line) {
  height: 3px;
  border-radius: 3px;
}

/* 单 Tab 时占快三 3 Tab 首列宽度，避免「大厅」撑满整行；nav-right 仍贴右 */
.room-tabs-vant :deep(.van-tab) {
  flex: 1 1 0;
  max-width: 33.333%;
}

.room-tabs-actions {
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
}

.amount-box {
  width: 122px;
  height: 28px;
  border-radius: 4px;
  background: var(--s-6-d-7-e-2-f-5, #d7e2f5);
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 0 8px;
  box-sizing: border-box;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.amount-ticker {
  width: 100%;
  height: 28px;
  overflow: hidden;
  display: block;
}

.amount-ticker__track {
  display: flex;
  flex-direction: column;
  transform: translate3d(0, 0, 0);
  transition: transform 420ms ease;
  will-change: transform;
}

.amount-ticker__track.is-second {
  transform: translate3d(0, -28px, 0);
}

.amount-ticker__item {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.amount-box__label {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #6a7892;
  line-height: 1;
  white-space: nowrap;
  flex: 0 0 auto;
}

.amount-box__value {
  font-size: @font-size-sm;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  text-align: right;
}

.amount-box__value.is-balance {
  color: #0065ff;
}

.amount-box__value.is-positive {
  color: #08d836;
}

.amount-box__value.is-negative {
  color: #ff3b30;
}

.mi-btn__text {
  font-size: @font-size-sm;
  font-weight: 400;
  color: #ffffff;
  line-height: 1;
  white-space: nowrap;
}

.mi-btn {
  width: 44px;
  height: 26px;
  border-radius: 4px;
  background: var(--p-00065-ff, #0065ff);
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex: 0 0 auto;
}

.plus-btn {
  width: 26px;
  height: 26px;
  border: none;
  padding: 0;
  border-radius: 4px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.plus-btn__icon {
  width: 20px;
  height: 20px;
  display: block;
  object-fit: contain;
}

.room-bottom-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 375px;
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px calc(6px + env(safe-area-inset-bottom, 0px));
  background: #ffffff;
  border-top: 0.5px solid var(--t-2-dae-4-f-6, #dae4f6);
  z-index: 30;
}

.help-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #d7e2f5;
  background: #ffffff;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  cursor: pointer;
}

.help-btn__icon {
  width: 25px;
  height: 25px;
  display: block;
  object-fit: contain;
}

.input-wrap {
  flex: 1 1 auto;
  min-width: 0;
}

.room-input {
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e7eefb;
  background: #f7faff;
  padding: 0 10px;
  box-sizing: border-box;
  font-size: @font-size-md;
  font-weight: 400;
  color: #1d1d1f;
  outline: none;
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  user-select: none;
}

.room-input.is-placeholder {
  color: #9aa7bd;
}

.room-input-popup {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}

.room-input-popup__handle {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.room-input-popup__caret {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.room-input-popup__body {
  padding: 10px 12px 12px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  box-sizing: border-box;
  background: #ffffff;
}

.room-input-popup__textarea {
  flex: 1 1 auto;
  min-width: 0;
  height: 92px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: #eef4ff;
  resize: none;
  outline: none;
  font-size: @font-size-md;
  font-weight: 400;
  line-height: 1.35;
  color: #1d1d1f;
  box-sizing: border-box;
}

.room-input-popup__textarea.is-chat {
  height: 35px;
  padding: 0 12px;
  line-height: 35px;
}

.room-input-popup__textarea::placeholder {
  color: #6a7892;
}

.room-input-popup__send {
  width: 92px;
  height: 34px;
  border-radius: 12px;
  background: #7fb1ff;
  color: #ffffff;
  font-size: @font-size-md;
  font-weight: 400;
  padding: 0 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.room-input-popup__send.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.room-input-popup__send.is-icon {
  width: 46px;
  border-radius: 0;
  background: transparent;
  padding: 0;
}

.room-input-popup__send-icon {
  width: 35px;
  height: 35px;
  display: block;
  object-fit: contain;
}

.bottom-actions {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 48px;
  height: 34px;
  border: none;
  border-radius: 8px;
  padding: 0;
  font-size: @font-size-md;
  font-weight: 400;
  color: #ffffff;
  cursor: pointer;
}

.action-btn--chat {
  background: #08d836;
}

.action-btn--bet {
  background: #0065ff;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

<template>
  <div class="bet-panel-core">
    <div class="pc28-bet-panel__play">
      <Pc28SmpPlay ref="playRef" @update:bet-count="betCount = $event" />
    </div>

    <footer class="bet-panel__foot" aria-label="投注操作">
      <transition name="bet-stats-fade">
        <div v-if="showBetStats" class="bet-stats" role="status" aria-live="polite">
          共选{{ betCount }}注,共{{ totalStakeText }}
        </div>
      </transition>

      <div class="op-top">
        <div class="op-btn op-btn--delete" role="button" tabindex="0" aria-label="删除" @click="onClear">
          <img class="op-icon" :src="iconDel" alt="" aria-hidden="true" />
        </div>

        <div class="quick-wrap" aria-label="快捷金额">
          <img class="quick-bg" :src="quickBgImg" alt="" aria-hidden="true" />
          <div class="quick-single" role="button" tabindex="0" @click="onChipClick(activeChip)">
            {{ formatChip(activeChip) }}
          </div>
        </div>

        <div
          class="op-btn op-btn--switch"
          role="button"
          tabindex="0"
          aria-label="切换快捷金额"
          @click="quickSwitchOpen = !quickSwitchOpen"
        >
          <img class="op-icon" :src="iconSwitch" alt="" aria-hidden="true" />
        </div>

        <input v-model="amount" class="amount-input" inputmode="decimal" placeholder="输入金额" aria-label="输入金额" />
      </div>

      <div class="op-bottom">
        <div class="bottom-btn bottom-btn--ghost" role="button" tabindex="0" @click="emit('open-recent')">近期投注</div>
        <div
          class="bottom-btn bottom-btn--primary"
          role="button"
          tabindex="0"
          :aria-disabled="submitDisabled ? 'true' : 'false'"
          :class="{ 'is-disabled': submitDisabled }"
          @click="!submitDisabled && onSubmit()"
        >
          <div class="primary__title">立即投注</div>
          <div class="primary__sub">余额:{{ formatMoney(balance) }}</div>
        </div>
        <div class="bottom-btn bottom-btn--ghost" role="button" tabindex="0" @click="emit('chase')">追号</div>
      </div>

      <transition name="quick-fade">
        <div v-if="quickSwitchOpen" class="quick-pop-mask" @click.self="quickSwitchOpen = false">
          <div class="quick-pop" role="dialog" aria-modal="true" aria-label="选择快捷金额" @click.stop>
            <div class="quick-pop__row" aria-hidden="true">
              <div
                v-for="c in chipOptions"
                :key="`p-${c}`"
                class="quick-pop__chip"
                :class="{ active: Number(c) === Number(activeChip) }"
                role="button"
                tabindex="0"
                @click="selectQuickChip(c)"
              >
                <img class="quick-pop__chip-bg" :src="quickBgImg" alt="" aria-hidden="true" />
                <span class="quick-pop__chip-text">{{ formatChip(c) }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { toast } from '@/components/Toast'
import Pc28SmpPlay from '../smp/Pc28SmpPlay.vue'
import iconDel from '@/assets/icon_del.svg'
import iconSwitch from '@/assets/icon_qh_sel.svg'
import quickBgImg from '@/assets/kuaijie_money_back.png'

const props = defineProps({
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['submit', 'chase', 'open-recent'])

const playRef = ref(null)
const betCount = ref(0)
const amount = ref('')

const chipOptions = ref([1, 5, 10, 50, 100, 500])
const activeChip = ref(1)
const quickSwitchOpen = ref(false)

const totalStake = computed(() => {
  const unit = Number(String(amount.value).trim())
  if (!Number.isFinite(unit) || unit <= 0) return 0
  return betCount.value * unit
})

const totalStakeText = computed(() => {
  if (betCount.value <= 0) return '0'
  const n = totalStake.value
  if (!Number.isFinite(n) || n <= 0) return '0'
  if (Number.isInteger(n)) return String(n)
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
})

const showBetStats = computed(() => betCount.value > 0)

const submitDisabled = computed(() => {
  const unit = Number(String(amount.value).trim())
  if (!Number.isFinite(unit) || unit <= 0) return true
  if (betCount.value <= 0) return true
  return false
})

function formatMoney(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChip(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n >= 1000 ? `${n / 1000}k` : String(n)
}

function selectQuickChip(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return
  activeChip.value = n
  quickSwitchOpen.value = false
  onChipClick(n)
}

function onChipClick(v) {
  amount.value = String(v ?? '')
}

function onClear() {
  amount.value = ''
  playRef.value?.resetPicks?.()
  betCount.value = 0
  toast('已清空')
}

function onSubmit() {
  const draft = playRef.value?.getBasketDraft?.() ?? null
  const amt = Number(String(amount.value).trim())
  emit('submit', {
    amount: Number.isFinite(amt) ? amt : 0,
    betCount: betCount.value,
    draft
  })
}

function resetForPopupOpen() {
  amount.value = ''
  playRef.value?.resetPicks?.()
  betCount.value = 0
}

defineExpose({ resetForPopupOpen })
</script>

<style lang="less" scoped>
@import '../../bet-panel/bet-panel-play-shared.less';

.pc28-bet-panel__play {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

</style>


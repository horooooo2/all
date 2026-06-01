<template>
  <section class="next-result-bar" role="group" :aria-label="$t('下期开奖号码')">
    <div class="issue">{{ issue }}</div>

    <div class="nums" :aria-label="$t('开奖号码')">
      <span class="ball-wrap" :aria-label="$t('号码1')">
        <span class="ball-track" :class="{ rolling: rolling[0] }" :style="trackStyle(0)" @transitionend="onTrackEnd(0)">
          <span v-for="(v, i) in trackItems1" :key="`b1-${i}-${v}`" class="ball red">{{ v }}</span>
        </span>
      </span>
      <span class="op" aria-hidden="true">+</span>
      <span class="ball-wrap" :aria-label="$t('号码2')">
        <span class="ball-track" :class="{ rolling: rolling[1] }" :style="trackStyle(1)" @transitionend="onTrackEnd(1)">
          <span v-for="(v, i) in trackItems2" :key="`b2-${i}-${v}`" class="ball blue">{{ v }}</span>
        </span>
      </span>
      <span class="op" aria-hidden="true">+</span>
      <span class="ball-wrap" :aria-label="$t('号码3')">
        <span class="ball-track" :class="{ rolling: rolling[2] }" :style="trackStyle(2)" @transitionend="onTrackEnd(2)">
          <span v-for="(v, i) in trackItems3" :key="`b3-${i}-${v}`" class="ball red">{{ v }}</span>
        </span>
      </span>
      <span class="op" aria-hidden="true">=</span>
      <span class="ball-wrap" :aria-label="$t('和值')">
        <span class="ball-track" :class="{ rolling: rolling[3] }" :style="trackStyle(3)" @transitionend="onTrackEnd(3)">
          <span v-for="(v, i) in trackItemsSum" :key="`bs-${i}-${v}`" class="ball sum">{{ v }}</span>
        </span>
      </span>
    </div>

    <div
      class="action"
      role="button"
      tabindex="0"
      :aria-label="actionLabel"
      @click="$emit('action')"
      @keydown.enter.prevent="$emit('action')"
      @keydown.space.prevent="$emit('action')"
    >
      <img class="action__icon" :src="iconBack" alt="" aria-hidden="true" />
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import iconBack from '@/assets/icon_dack.svg'

const props = defineProps({
  issue: { type: String, default: '' },
  nums: { type: Array, default: () => [] }, // [n1,n2,n3]
  sum: { type: [String, Number], default: '' },
  actionLabel: { type: String, default: '展开' }
})

defineEmits(['action'])

const n1 = computed(() => props.nums?.[0] ?? '')
const n2 = computed(() => props.nums?.[1] ?? '')
const n3 = computed(() => props.nums?.[2] ?? '')
const sumText = computed(() => (props.sum !== '' && props.sum != null ? props.sum : ''))

const rolling = ref([false, false, false, false])
const trackIndex = ref([0, 0, 0, 0]) // track position (in rendered list)
const trackTransition = ref([false, false, false, false])
const pendingNormalize = ref([null, null, null, null]) // { targetIdx, options }
const stepPx = ref(30)

const singleOptions = Array.from({ length: 10 }, (_, i) => String(i + 1)) // 1-10
const sumOptions = Array.from({ length: 28 }, (_, i) => String(i)) // 0-27（PC28 常见和值范围）
const repeatCount = 7

function repeatOptions(options) {
  const out = []
  for (let r = 0; r < repeatCount; r++) out.push(...options)
  return out
}

const trackItems1 = repeatOptions(singleOptions)
const trackItems2 = repeatOptions(singleOptions)
const trackItems3 = repeatOptions(singleOptions)
const trackItemsSum = repeatOptions(sumOptions)

function baseOffset(optionsLen) {
  // 放在中间，留足滚动空间
  return optionsLen * 2
}

function normalizeToBaseIndex(targetIdx, options, ballIdx) {
  const len = options.length
  const base = baseOffset(len)
  const target = Math.max(0, Math.min(len - 1, Number(targetIdx ?? 0)))
  trackTransition.value[ballIdx] = false
  trackIndex.value[ballIdx] = base + target
}

function normalizeToBase(idx, options, ballIdx) {
  const len = options.length
  const base = baseOffset(len)
  const v = String(idx ?? '')
  const target = Math.max(0, options.indexOf(v))
  trackTransition.value[ballIdx] = false
  trackIndex.value[ballIdx] = base + target
}

function rollToValue(value, options, ballIdx, durationMs, loops) {
  const len = options.length
  const base = baseOffset(len)
  const v = String(value ?? '')
  const target = Math.max(0, options.indexOf(v))

  // 先确保在 base 区间
  if (trackIndex.value[ballIdx] === 0) {
    trackIndex.value[ballIdx] = base + target
  }

  rolling.value[ballIdx] = true
  trackTransition.value[ballIdx] = true
  pendingNormalize.value[ballIdx] = null

  const current = trackIndex.value[ballIdx]
  const currentMod = ((current % len) + len) % len
  const delta = (target - currentMod + len) % len
  const to = current + loops * len + delta
  trackIndex.value[ballIdx] = to

  pendingNormalize.value[ballIdx] = { targetIdx: target, options }
}

let timers = []
function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

function startRoll() {
  clearTimers()

  // 初始化到 base，避免首次“从 0 跳”
  normalizeToBase(n1.value, singleOptions, 0)
  normalizeToBase(n2.value, singleOptions, 1)
  normalizeToBase(n3.value, singleOptions, 2)
  normalizeToBase(sumText.value, sumOptions, 3)

  measureStep()

  // 下一帧再开滚动，让 transition 生效
  timers.push(
    setTimeout(() => {
      // 同时开始滚动，停止时从左到右依次停（每列相差 0.5s）
      rollToValue(n1.value, singleOptions, 0, 0, 2)
      rollToValue(n2.value, singleOptions, 1, 0, 2)
      rollToValue(n3.value, singleOptions, 2, 0, 2)
      rollToValue(sumText.value, sumOptions, 3, 0, 1)
    }, 30)
  )
}

onMounted(startRoll)
onMounted(() => {
  measureStep()
})

onBeforeUnmount(() => {
  clearTimers()
})

watch(
  () => [props.issue, props.nums?.[0], props.nums?.[1], props.nums?.[2], props.sum],
  () => startRoll()
)

async function measureStep() {
  await nextTick()
  const balls = document.querySelectorAll('.next-result-bar .ball-track .ball')
  const el1 = balls?.[0]
  const el2 = balls?.[1]
  if (!el1) return

  const r1 = el1.getBoundingClientRect()
  if (el2) {
    const r2 = el2.getBoundingClientRect()
    const delta = r2.top - r1.top
    if (Number.isFinite(delta) && delta > 0) {
      stepPx.value = delta
      return
    }
  }

  const h = r1.height
  if (Number.isFinite(h) && h > 0) stepPx.value = h
}

function trackStyle(ballIdx) {
  const step = stepPx.value || 30
  const transitionOn = trackTransition.value[ballIdx]
  const duration = 780 + ballIdx * 1000
  return {
    transform: `translate3d(0, ${-trackIndex.value[ballIdx] * step}px, 0)`,
    transition: transitionOn ? `transform ${duration}ms cubic-bezier(0.2, 0.85, 0.25, 1)` : 'none'
  }
}

function onTrackEnd(ballIdx) {
  if (!trackTransition.value[ballIdx]) return
  const p = pendingNormalize.value[ballIdx]
  if (!p) return

  // 下一帧再“无动画归位”，避免在 transitionend 同步触发导致闪跳
  requestAnimationFrame(() => {
    rolling.value[ballIdx] = false
    pendingNormalize.value[ballIdx] = null
    normalizeToBaseIndex(p.targetIdx, p.options, ballIdx)
  })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.next-result-bar {
  width: 375px;
  height: 40px;
  border-bottom: 0.5px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--s-2-ffffff, #fff);
  display: flex;
  align-items: center;
  padding: 0 @spacing-md;
  box-sizing: border-box;
  gap: 10px;
}

.issue {
  flex: 0 0 auto;
  font-size: @font-size-md;
  line-height: 1;
  color: #1d1d1f;
  font-weight: 400;
}

.nums {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.ball-wrap {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 0 0 auto;
  contain: paint;
}

.ball-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  will-change: transform;
  backface-visibility: hidden;
  transform: translate3d(0, 0, 0);
}

.ball {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: @font-size-lg;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  box-sizing: border-box;
  background: transparent;
  aspect-ratio: 1 / 1;
}

.ball.red {
  border: 1.5px solid #ff3b30;
  color: #1d1d1f;
}

.ball.blue {
  border: 1.5px solid #1f78ff;
  color: #1d1d1f;
}

.ball.sum {
  background: #1f78ff;
  color: #fff;
  border: none;
}

.op {
  font-size: @font-size-lg;
  font-weight: 700;
  color: #1d1d1f;
  line-height: 1;
}

.action {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.action__icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  transform: rotate(-90deg);
}
</style>


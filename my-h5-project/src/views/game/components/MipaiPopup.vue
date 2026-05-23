<template>
  <teleport to="body">
    <transition name="mipai-fade">
      <div v-if="show" class="mipai-mask" role="dialog" aria-modal="true" @click.self="close">
        <div class="mipai-panel" @click.stop>
          <div class="mipai-panel__head">
            <img class="mipai-qiu mipai-qiu--left" :src="miQiu1Src" alt="" aria-hidden="true" />
            <div class="mipai-head-pill">
              <div class="mipai-head-text"><span class="issue">{{ issue }}</span> 期开奖结/div>
            </div>
            <img class="mipai-qiu mipai-qiu--right" :src="miQiu2Src" alt="" aria-hidden="true" />
          </div>

          <div class="mipai-panel__body">
            <div ref="scratchWrapRef" class="mipai-scratch-wrap">
              <div
                class="mipai-result-row"
                :class="resultRowClass"
                aria-label="开奖结
              >
                <template v-if="variant === 'pl5'">
                  <div v-for="(n, idx) in safeNums" :key="idx" class="ball pl5">{{ n }}</div>
                </template>
                <template v-else-if="variant === 'lhc'">
                  <div v-for="(n, idx) in lhcMainNums" :key="'m' + idx" class="ball lhc">{{ n }}</div>
                  <div class="op op--txt">/div>
                  <div class="ball lhc lhc--special">{{ lhcSpecialNum }}</div>
                </template>
                <template v-else>
                  <div class="ball red">{{ safeNums[0] }}</div>
                  <div class="op">+</div>
                  <div class="ball blue">{{ safeNums[1] }}</div>
                  <div class="op">+</div>
                  <div class="ball red">{{ safeNums[2] }}</div>
                  <div class="op">=</div>
                  <div class="ball sum">{{ sum }}</div>
                </template>
              </div>

              <canvas v-show="!scratched" ref="canvasRef" class="mipai-scratch-canvas" aria-label="刮开涂层" />
            </div>
          </div>

          <div class="mipai-panel__foot">
            <div class="mipai-foot-pill">
              <div class="mipai-countdown">
                <div class="line">
                  截止 <span class="issue">{{ issue }}</span> 期投注： <span class="sec">{{ left1 }}</span> 
                </div>
                <div class="line">
                  截止 <span class="issue">{{ issue }}</span> 期投注： <span class="sec">{{ left2 }}</span> 
                </div>
              </div>
              <div
                class="mipai-refresh"
                role="button"
                tabindex="0"
                aria-label="刷新"
                @click="$emit('refresh')"
                @keydown.enter.prevent="$emit('refresh')"
                @keydown.space.prevent="$emit('refresh')"
              >
                刷新
              </div>
            </div>
          </div>
        </div>

        <div
          class="mipai-close"
          role="button"
          tabindex="0"
          aria-label="关闭"
          @click="close"
          @keydown.enter.prevent="close"
          @keydown.space.prevent="close"
        >
          <img class="mipai-close-img" :src="miCloseSrc" alt="" aria-hidden="true" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import miCloseSrc from '@/assets/mipai_close.svg'

const props = defineProps({
  show: { type: Boolean, default: false },
  /** pc28: 3 + sum；pl5: 5 位；lhc: 6 正码 + 1 特码 */
  variant: { type: String, default: 'pc28' }, // pc28 | pl5 | lhc
  issue: { type: [String, Number], default: '' },
  nums: { type: Array, default: () => [] },
  sum: { type: [String, Number], default: 0 },
  left1: { type: [String, Number], default: 0 },
  left2: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['update:show', 'refresh'])

const scratched = ref(false)
const canvasRef = ref(null)
const scratchWrapRef = ref(null)

const safeNums = computed(() => {
  const arr = Array.isArray(props.nums) ? props.nums : []
  if (props.variant === 'pl5') {
    const out = arr.slice(0, 5).map((x) => String(x ?? '0'))
    while (out.length < 5) out.push('0')
    return out
  }
  if (props.variant === 'lhc') {
    const out = arr.slice(0, 7).map((x) => {
      const n = Math.floor(Number(x))
      return Number.isFinite(n) && n >= 1 && n <= 49 ? String(n) : '1'
    })
    while (out.length < 7) out.push('1')
    return out
  }
  const out = arr.slice(0, 3).map((x) => String(x ?? '0'))
  while (out.length < 3) out.push('0')
  return out
})

const resultRowClass = computed(() => {
  if (props.variant === 'pl5') return 'mipai-result-row--pl5'
  if (props.variant === 'lhc') return 'mipai-result-row--lhc'
  return ''
})

const lhcMainNums = computed(() => safeNums.value.slice(0, 6))
const lhcSpecialNum = computed(() => safeNums.value[6] ?? '1')

// 注意：资源文件若尚未加入项目，这里会在运行时 404，但不会阻塞编译
const miQiu1Src = computed(() => '/src/assets/mipai_qiu1.png')
const miQiu2Src = computed(() => '/src/assets/mipai_qiu2.png')

function close() {
  emit('update:show', false)
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return
    scratched.value = false
    await nextTick()
    setupScratch()
  }
)

function setupScratch() {
  const canvas = canvasRef.value
  const wrap = scratchWrapRef.value
  if (!canvas || !wrap) return

  const rect = wrap.getBoundingClientRect()
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#cfcfcf'
  ctx.fillRect(0, 0, w, h)

  // 把提示文字画在“涂层”上，这样刮的时候会一起被刮掉
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.font = '700 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('已有结果，请刮涂, w / 2, h / 2)

  ctx.globalCompositeOperation = 'destination-out'
  const radius = 18
  let drawing = false
  let lastX = 0
  let lastY = 0

  function pointFromEvent(e) {
    const r = canvas.getBoundingClientRect()
    const p = e.touches?.[0] ?? e.changedTouches?.[0] ?? e
    const x = (p.clientX ?? 0) - r.left
    const y = (p.clientY ?? 0) - r.top
    return { x, y }
  }

  function drawLine(x1, y1, x2, y2) {
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = radius * 2
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  function scratchAt(x, y) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  function checkProgress() {
    try {
      const step = 10
      const img = ctx.getImageData(0, 0, w, h).data
      let cleared = 0
      let total = 0
      for (let yy = 0; yy < h; yy += step) {
        for (let xx = 0; xx < w; xx += step) {
          const idx = (yy * w + xx) * 4 + 3
          total += 1
          if (img[idx] === 0) cleared += 1
        }
      }
      const ratio = total ? cleared / total : 0
      if (ratio >= 0.35) scratched.value = true
    } catch {
      // ignore
    }
  }

  function onDown(e) {
    e.preventDefault?.()
    drawing = true
    const { x, y } = pointFromEvent(e)
    lastX = x
    lastY = y
    scratchAt(x, y)
  }

  function onMove(e) {
    if (!drawing) return
    e.preventDefault?.()
    const { x, y } = pointFromEvent(e)
    drawLine(lastX, lastY, x, y)
    lastX = x
    lastY = y
  }

  function onUp(e) {
    if (!drawing) return
    e.preventDefault?.()
    drawing = false
    checkProgress()
  }

  canvas.onpointerdown = onDown
  canvas.onpointermove = onMove
  canvas.onpointerup = onUp
  canvas.onpointercancel = onUp
  canvas.ontouchstart = onDown
  canvas.ontouchmove = onMove
  canvas.ontouchend = onUp
  canvas.ontouchcancel = onUp
}
</script>

<style lang="less">
/* 该弹层是 teleport body，需要全局样式 */
@import '@/styles/pages/mipai-popup.less';
</style>


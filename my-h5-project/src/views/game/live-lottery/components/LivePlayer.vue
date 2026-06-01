<template>
  <div class="live-player" ref="rootRef">
    <div class="live-player__stage">
      <video
        ref="videoRef"
        class="live-player__video"
        playsinline
        webkit-playsinline
        :muted="muted"
        :volume="muted ? 0 : 1"
        preload="metadata"
        @play="playing = true"
        @pause="playing = false"
        @waiting="buffering = true"
        @playing="buffering = false"
        @error="onVideoError"
      />

      <div v-if="buffering" class="live-player__center-hint">{{ $t('加载中…') }}</div>
      <div v-else-if="errorText" class="live-player__center-hint error">{{ errorText }}</div>

      <div v-if="danmakuOn" class="danmaku-layer" aria-hidden="true">
        <transition-group name="dm" tag="div" class="danmaku-layer__track">
          <div v-for="item in activeDanmakus" :key="item.id" class="danmaku" :style="item.style">
            {{ item.text }}
          </div>
        </transition-group>
      </div>

      <div class="controls" @click.stop>
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          :aria-label="danmakuOn ? t('关闭弹幕') : t('开启弹幕')"
          @click="toggleDanmaku"
          @keydown.enter.prevent="toggleDanmaku"
          @keydown.space.prevent="toggleDanmaku"
        >
          <img class="icon" :src="danmakuOn ? iconDanmakuOn : iconDanmakuOff" alt="" aria-hidden="true" />
        </div>
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          :aria-label="muted ? t('取消静音') : t('静音')"
          @click="toggleMute"
          @keydown.enter.prevent="toggleMute"
          @keydown.space.prevent="toggleMute"
        >
          <img class="icon" :src="muted ? iconMuteOff : iconMuteOn" alt="" aria-hidden="true" />
        </div>
        <div
          class="icon-btn"
          role="button"
          tabindex="0"
          :aria-label="isFullscreen ? t('退出全屏') : t('全屏')"
          @click="toggleFullscreen"
          @keydown.enter.prevent="toggleFullscreen"
          @keydown.space.prevent="toggleFullscreen"
        >
          <img class="icon" :src="fullscreenIcon" alt="" aria-hidden="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Hls from 'hls.js'
import { computed, defineExpose, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { t } from '@/i18n'
import iconFullscreen from '@/assets/icon_quanping.svg'
import iconFullscreenExit from '@/assets/icon_quanping_s.svg'
import iconMuteOn from '@/assets/icon_m_s.png'
import iconMuteOff from '@/assets/icon_m_n.png'
import iconDanmakuOn from '@/assets/icon_d_s.png'
import iconDanmakuOff from '@/assets/icon_d-n.png'

const props = defineProps({
  src: { type: String, default: '' }, // m3u8
  autoplay: { type: Boolean, default: true }
})

const rootRef = ref(null)
const videoRef = ref(null)
const muted = ref(false)
const danmakuOn = ref(true)
const isFullscreen = ref(false)
const playing = ref(false)
const buffering = ref(false)
const errorText = ref('')

const fullscreenIcon = computed(() => (isFullscreen.value ? iconFullscreenExit : iconFullscreen))

let hls

function toggleMute() {
  muted.value = !muted.value
}

function toggleDanmaku() {
  danmakuOn.value = !danmakuOn.value
}

async function ensurePlay() {
  const v = videoRef.value
  if (!v) return
  try {
    await v.play()
  } catch (e) {
    // 移动端可能需要用户手势触发
  }
}

function onVideoError() {
  errorText.value = t('播放失败')
}

function destroyHls() {
  if (hls) {
    try {
      hls.destroy()
    } catch {}
    hls = undefined
  }
}

function attachSource(src) {
  const v = videoRef.value
  if (!v) return

  errorText.value = ''
  buffering.value = !!src

  destroyHls()
  v.removeAttribute('src')
  v.load()

  if (!src) return

  // Safari (and some iOS WebViews) support native HLS
  const canNative = v.canPlayType('application/vnd.apple.mpegurl') || v.canPlayType('application/x-mpegURL')
  if (canNative) {
    v.src = src
    if (props.autoplay) ensurePlay()
    return
  }

  if (Hls.isSupported()) {
    hls = new Hls({
      liveDurationInfinity: true,
      enableWorker: true,
      lowLatencyMode: true
    })
    hls.attachMedia(v)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls.loadSource(src)
    })
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data?.fatal) {
        errorText.value = t('播放失败')
        buffering.value = false
        destroyHls()
      }
    })
    if (props.autoplay) ensurePlay()
    return
  }

  errorText.value = t('当前浏览器不支持该直播流')
  buffering.value = false
}

async function toggleFullscreen() {
  const el = rootRef.value
  if (!el) return

  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (e) {
    // ignore
  }
}

function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  attachSource(props.src)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  destroyHls()
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

watch(
  () => props.src,
  (s) => {
    attachSource(s)
  }
)

// 弹幕（简版：从右往左滚动）
const dmSeq = ref(0)
const activeDanmakus = ref([])

const laneCount = 4
const lanes = computed(() => Array.from({ length: laneCount }, (_, i) => i))

function pickLane() {
  return lanes.value[Math.floor(Math.random() * lanes.value.length)]
}

// 后续接 websocket 时，调用这个方法塞入弹幕即可
function pushDanmaku(text) {
  if (!text) return
  const id = `${Date.now()}-${dmSeq.value++}`
  const lane = pickLane()
  const top = 12 + lane * 26

  const item = {
    id,
    text,
    style: {
      top: `${top}px`,
      animationDuration: '6.5s'
    }
  }
  activeDanmakus.value.push(item)
  setTimeout(() => {
    activeDanmakus.value = activeDanmakus.value.filter((x) => x.id !== id)
  }, 7000)
}

defineExpose({ pushDanmaku })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.live-player {
  width: 375px;
  height: 212px;
  background: #000;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.live-player:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.live-player:fullscreen .danmaku {
  font-size: @font-size-lg;
}

.live-player__stage {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.live-player__video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  background: #000;
}

.live-player__center-hint {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: @font-size-sm;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  pointer-events: none;

  &.error {
    background: rgba(255, 59, 48, 0.65);
  }
}

.controls {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}

.icon-btn {
  border: none;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}
.danmaku-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.danmaku-layer__track {
  position: absolute;
  inset: 0;
}

.danmaku {
  position: absolute;
  right: -30%;
  max-width: 86%;
  padding: 2px 6px;
  border-radius: 999px;
  color: #fff;
  font-size: @font-size-md;
  background: rgba(0, 0, 0, 0.25);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation-name: danmaku-move;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

@keyframes danmaku-move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-100vw - 120%));
  }
}

.dm-enter-active,
.dm-leave-active {
  transition: opacity 120ms ease;
}
.dm-enter-from,
.dm-leave-to {
  opacity: 0;
}

</style>


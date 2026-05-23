<template>
  <!-- 复用原导航结构：class 仍为 game-nav（项目内已统一样式-->
  <header class="game-nav">
    <div class="game-nav__left">
      <div
        v-if="showBack"
        class="icon-btn"
        role="button"
        tabindex="0"
        aria-label="back"
        @click="$emit('back')"
        @keydown.enter.prevent="$emit('back')"
        @keydown.space.prevent="$emit('back')"
      >
        <img class="icon-img" :src="iconBack" alt="" aria-hidden="true" />
      </div>

      <div
        class="title-btn"
        :class="{ clickable: showDropdown }"
        role="button"
        :tabindex="showDropdown ? 0 : -1"
        :aria-disabled="showDropdown ? undefined : 'true'"
        :aria-expanded="showDropdown ? (dropdownOpen ? 'true' : 'false') : undefined"
        @click="onTitleClick"
        @keydown="onTitleKeydown"
      >
        <div class="title-col">
          <div ref="titleViewportRef" class="title-viewport">
            <span
              ref="titleTextRef"
              class="title"
              :class="{ marquee: titleMarquee }"
              :style="titleMarqueeStyle"
            >
              {{ title }}
            </span>
          </div>
          <div v-if="roomText" class="sub">{{ roomText }}</div>
        </div>
        <img
          v-if="showDropdown"
          class="caret"
          :class="{ open: dropdownOpen }"
          :src="iconDown"
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>

    <div v-if="showTimerIssue" class="game-nav__center">
      <div class="timer-pill" role="status" aria-live="polite">
        <span class="timer">{{ timeText }}</span>
      </div>
      <div class="issue">
        <div class="issue-no">{{ issueNo }}</div>
        <div class="issue-status">{{ statusText }}</div>
      </div>
    </div>

    <div class="game-nav__right">
      <div v-if="onlineCount != null && onlineCount !== ''" class="online" aria-label="online count">
        <img class="online__icon" :src="iconYh" alt="" aria-hidden="true" />
        <span class="online__count">{{ onlineCount }}</span>
      </div>

      <div
        v-if="showMenu"
        class="icon-btn"
        role="button"
        tabindex="0"
        aria-label="menu"
        @click="$emit('menu')"
        @keydown.enter.prevent="$emit('menu')"
        @keydown.space.prevent="$emit('menu')"
      >
        <img class="icon-img" :src="iconMenu" alt="" aria-hidden="true" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import iconBack from '@/assets/icon_dack.svg'
import iconMenu from '@/assets/menu_icon.svg'
import iconYh from '@/assets/icon_yh.svg'
import iconDown from '@/assets/down_icon.svg'

const props = defineProps({
  title: { type: String, default: '彩票' },
  roomText: { type: String, default: '' },
  timeText: { type: String, default: '00:00:00' },
  issueNo: { type: String, default: '' },
  statusText: { type: String, default: '' },
  onlineCount: { type: [String, Number], default: '' },
  showBack: { type: Boolean, default: true },
  showDropdown: { type: Boolean, default: false },
  dropdownOpen: { type: Boolean, default: false },
  showMenu: { type: Boolean, default: true },
  showTimerIssue: { type: Boolean, default: false }
})

const emit = defineEmits(['back', 'toggleGameList', 'menu'])

const titleViewportRef = ref(null)
const titleTextRef = ref(null)
const titleMarquee = ref(false)
const titleMarqueeDistance = ref(0)

const titleMarqueeStyle = computed(() => {
  if (!titleMarquee.value) return {}
  const d = Math.max(0, titleMarqueeDistance.value)
  const durationSec = Math.min(14, Math.max(4, d / 32))
  return {
    '--marquee-distance': `-${d}px`,
    animationDuration: `${durationSec}s`
  }
})

let ro

function measureTitleMarquee() {
  titleMarquee.value = false
  titleMarqueeDistance.value = 0

  const vp = titleViewportRef.value
  const tx = titleTextRef.value
  if (!vp || !tx) return

  const overflow = tx.scrollWidth - vp.clientWidth
  if (overflow > 2) {
    titleMarqueeDistance.value = Math.ceil(overflow)
    titleMarquee.value = true
  }
}

function setupTitleObservers() {
  teardownTitleObservers()
  const vp = titleViewportRef.value
  const tx = titleTextRef.value
  if (!vp || !tx) return

  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      nextTick(() => measureTitleMarquee())
    })
    ro.observe(vp)
    ro.observe(tx)
  }
  nextTick(() => measureTitleMarquee())
}

function teardownTitleObservers() {
  if (ro) {
    ro.disconnect()
    ro = undefined
  }
}

onMounted(() => {
  setupTitleObservers()
})

onBeforeUnmount(() => {
  teardownTitleObservers()
})

watch(
  () => props.title,
  async () => {
    await nextTick()
    measureTitleMarquee()
  }
)

watch(
  () => props.showDropdown,
  async () => {
    await nextTick()
    measureTitleMarquee()
  }
)

function onTitleClick() {
  if (!props.showDropdown) return
  emit('toggleGameList')
}

function onTitleKeydown(e) {
  if (!props.showDropdown) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('toggleGameList')
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

/* 保持与原 GameNavBar 一致（避免重复发散*/
.game-nav {
  height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-module);
  color: var(--text-color);
}

.game-nav__left,
.game-nav__center,
.game-nav__right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.game-nav__left {
  gap: @spacing-xs;
  flex: 1 1 0;
  min-width: 0;
  max-width: 46%;
}

.title-btn {
  border: none;
  background: transparent;
  padding: 0;
  width: 160px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: space-between;
  gap: 4px;
  color: inherit;
  min-width: 0;
  text-align: left;
  outline: none;

  &.clickable {
    cursor: pointer;
  }

  &:focus-visible {
    border-radius: 8px;
    box-shadow: 0 0 0 2px rgba(31, 120, 255, 0.35);
  }
}

.title-col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  width: 100%;
  min-width: 0;
  min-height: 0;
}

.title-viewport {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.title {
  display: inline-block;
  flex: 0 0 auto;
  font-size: @font-size-md;
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;

  &.marquee {
    padding-right: 16px;
    will-change: transform;
    animation-name: game-nav-title-marquee;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
}

.sub {
  font-size: @font-size-xs;
  line-height: 1.1;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.caret {
  flex: 0 0 auto;
  align-self: center;
  display: block;
  object-fit: contain;
  color: var(--text-color-secondary);
  transform-origin: center;
  transition: transform 0.18s ease;
}

.caret.open {
  transform: rotate(180deg);
}

.game-nav__center {
  flex: 0 1 auto;
  justify-content: center;
  gap: @spacing-sm;
  min-width: 0;
  padding: 0 6px;
}

.timer-pill {
  height: 26px;
  min-width: 78px;
  padding: 0 8px;
  border-radius: 8px;
  background: #e9f2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer {
  font-variant-numeric: tabular-nums;
  font-size: @font-size-md;
  font-weight: 700;
  color: #1f78ff;
  letter-spacing: 0.5px;
}

.issue {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.issue-no {
  font-size: @font-size-sm;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-color);
  white-space: nowrap;
}

.issue-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  height: 18px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: @font-size-xs;
  line-height: 1;
  color: #1f78ff;
  background: #e9f2ff;
  white-space: nowrap;
}

.game-nav__right {
  flex: 0 0 auto;
}

.online {
  width: 34px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-left: 6px;
  color: #1f78ff;
  font-size: @font-size-xs;
  font-weight: 600;
  line-height: 1.05;
  flex-shrink: 0;

  &__icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    display: block;
    object-fit: contain;
  }

  &__count {
    font-variant-numeric: tabular-nums;
  }
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  color: var(--text-color);
  cursor: pointer;
  flex: 0 0 auto;
}

.icon-img {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
}

@keyframes game-nav-title-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(var(--marquee-distance, 0px));
  }
}
</style>


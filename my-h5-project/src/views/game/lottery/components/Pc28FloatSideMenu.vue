<template>
  <div class="float-side-menu" :style="anchorStyle" @click.stop>
    <div class="float-side-menu__list">
      <div
        class="float-side-menu__item"
        role="button"
        tabindex="0"
        aria-label="投注记录"
        @click="emit('bet-record')"
        @keydown.enter.prevent="emit('bet-record')"
        @keydown.space.prevent="emit('bet-record')"
      >
        <img class="float-side-menu__icon" :src="iconTouzhuSide" alt="" aria-hidden="true" />
        <div class="float-side-menu__name float-side-menu__name--white">投注记录</div>
      </div>

      <div class="float-side-menu__item">
        <div class="float-side-menu__niming-switch">
          <van-switch :model-value="anonymous" size="12" @update:model-value="emit('update:anonymous', $event)" />
        </div>
        <img class="float-side-menu__icon" :src="iconNiming" alt="" aria-hidden="true" />
        <div class="float-side-menu__name float-side-menu__name--white">匿名模式</div>
      </div>

      <div
        class="float-side-menu__item"
        role="button"
        tabindex="0"
        aria-label="推荐好路"
        @click="emit('haolu')"
        @keydown.enter.prevent="emit('haolu')"
        @keydown.space.prevent="emit('haolu')"
      >
        <img class="float-side-menu__icon" :src="iconHaolu" alt="" aria-hidden="true" />
        <div class="float-side-menu__name float-side-menu__name--haolu">推荐好路</div>
      </div>

      <div
        class="float-side-menu__item"
        role="button"
        tabindex="0"
        :aria-label="groupVoteMode ? '当前群投模式，点击切换为专业模式' : '当前专业模式，点击切换为群投模式'"
        :aria-pressed="groupVoteMode ? 'true' : 'false'"
        @click="emit('toggle-group-vote')"
        @keydown.enter.prevent="emit('toggle-group-vote')"
        @keydown.space.prevent="emit('toggle-group-vote')"
      >
        <img class="float-side-menu__icon" :src="groupVoteMode ? iconZhuanye : iconQtms" alt="" aria-hidden="true" />
        <div
          class="float-side-menu__name"
          :class="groupVoteMode ? 'float-side-menu__name--zhuanye' : 'float-side-menu__name--qtms'"
        >
          {{ groupVoteMode ? '专业模式' : '群投模式' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import iconHaolu from '@/assets/silder_haolu.svg'
import iconNiming from '@/assets/silder_niming.svg'
import iconTouzhuSide from '@/assets/silder_touzhu.svg'
import iconZhuanye from '@/assets/silder_zhuanye.svg'
import iconQtms from '@/assets/icon_qtms.svg'

const props = defineProps({
  anonymous: { type: Boolean, default: false },
  groupVoteMode: { type: Boolean, default: false },
  /** 距视口底部的偏移（px），需避开投注底栏 */
  bottomOffset: { type: Number, default: 110 }
})

const emit = defineEmits(['update:anonymous', 'bet-record', 'haolu', 'toggle-group-vote'])

const anchorStyle = computed(() => ({
  bottom: `calc(${Math.max(0, Number(props.bottomOffset) || 0)}px + env(safe-area-inset-bottom, 0px))`
}))
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.float-side-menu {
  position: fixed;
  right: 14px;
  z-index: 45;
  pointer-events: auto;
}

.float-side-menu__list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.float-side-menu__item {
  width: 38px;
  height: 38px;
  position: relative;
  display: block;
  cursor: pointer;
}

.float-side-menu__icon {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
}

.float-side-menu__name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(@font-size-xs - 2px);
  line-height: 15px;
  color: #ffffff;
  box-sizing: border-box;
  white-space: nowrap;
  user-select: none;
}

.float-side-menu__name--zhuanye {
  background: #4b5aff;
}

.float-side-menu__name--qtms {
  background: #36df28;
}

.float-side-menu__name--haolu {
  background: #25b1ff;
}

.float-side-menu__name--white {
  background: #ffffff;
  color: #1d1d1f;
}

.float-side-menu__niming-switch {
  position: absolute;
  top: 6px;
  right: 6px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.float-side-menu__niming-switch :deep(.van-switch) {
  --van-switch-width: 28px;
  --van-switch-height: 18px;
  --van-switch-node-size: 14px;
  --van-switch-size: 14px;
}
</style>

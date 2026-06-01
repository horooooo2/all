<template>
  <teleport to="body">
    <transition name="right-menu-fade">
      <div v-show="show" class="right-menu-mask" @click.self="close">
        <div class="right-menu" role="menu" @click.stop>
          <div
            v-for="item in menuItems"
            :key="item.key"
            class="right-menu-item"
            role="menuitem"
            tabindex="0"
            @click="onItemClick(item)"
            @keydown.enter.prevent="onItemClick(item)"
            @keydown.space.prevent="onItemClick(item)"
          >
            <img class="right-menu-icon" :src="item.icon" alt="" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import iconTouzhu from '@/assets/touzhu_icon.svg'
import iconJieshao from '@/assets/jieshao_icon.svg'
import iconXianhong from '@/assets/xianhong_icon.svg'
import iconShezhi from '@/assets/shezhi_icon.svg'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'select'])

const menuItems = [
  { key: 'bet', label: '投注记录', icon: iconTouzhu },
  { key: 'intro', label: '彩种介绍', icon: iconJieshao },
  { key: 'limit', label: '游戏限红', icon: iconXianhong },
  { key: 'settings', label: '设置', icon: iconShezhi }
]

function close() {
  emit('update:show', false)
}

function onItemClick(item) {
  emit('update:show', false)
  emit('select', item.key)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.right-menu-fade-enter-active,
.right-menu-fade-leave-active {
  transition: opacity 140ms ease;
}

.right-menu-fade-enter-from,
.right-menu-fade-leave-to {
  opacity: 0;
}

.right-menu-mask {
  position: fixed;
  inset: 0;
  z-index: 95;
  background: rgba(0, 0, 0, 0.5);
}

.right-menu {
  position: absolute;
  right: @spacing-md;
  top: 56px;
  width: 95px;
  height: 127px;
  border-radius: 8px;
  background: var(--s-2-ffffff, #fff);
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  box-sizing: border-box;
}

.right-menu-item {
  height: 28px;
  padding: 0 10px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d1d1f;
  font-size: @font-size-sm;
  line-height: 1;
  text-align: left;
  cursor: pointer;
}

.right-menu-item + .right-menu-item {
  margin-top: 4px;
}

.right-menu-icon {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
  flex: 0 0 auto;
}
</style>

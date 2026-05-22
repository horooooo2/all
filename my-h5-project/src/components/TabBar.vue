<template>
  <div class="tab-bar" :class="{ 'tab-bar-dark': isDark }">
    <van-tabbar
        v-model="active"
        :fixed="true"
        :placeholder="true"
        :safe-area-inset-bottom="true"
        active-color="var(--primary-color)"
        inactive-color="var(--text-color-secondary)"
        @change="onTabChange"
    >
      <van-tabbar-item
          v-for="item in tabBarConfig"
          :key="item.path"
          :to="item.path"
          :replace="false"
          :badge="item.badge"
      >
      <span>{{ $t(item.name) }}</span>
      <template #icon="props">
        <img
            v-if="item.customIcon"
            :src="props.active ? item.customIcon.active : item.customIcon.inactive"
            class="custom-icon"
            :class="{ 'custom-icon-active': props.active }"
        >
        <van-icon
            v-else
            :name="props.active ? item.activeIcon : item.icon"
        />
      </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'
import { tabBarConfig } from '@/config/tabBar'

const route = useRoute()
const isDark = useDark()
const active = ref(0)

watch(
    () => route.path,
    (newPath) => {
      const index = tabBarConfig.findIndex(item => item.path === newPath)
      if (index !== -1) {
        active.value = index
      }
    },
    { immediate: true }
)

const onTabChange = (index) => {
  const item = tabBarConfig[index]
  console.log('切换到:', item.name)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.tab-bar {
  z-index: 9999;

  :deep(.van-tabbar) {
    z-index: 9999;
    background-color: var(--tabbar-bg);
    border-top: 1px solid var(--tabbar-border);
  }

  :deep(.van-tabbar-item) {
    position: relative;
    color: var(--text-color-secondary);

    &--active {
      color: var(--primary-color);
    }

    .van-badge {
      position: absolute;
      right: -10px;
      top: -2px;
      background-color: @badge-bg;
      color: @badge-color;
      border: none;
      font-size: @font-size-xs;
      min-width: 16px;
      height: 16px;
      line-height: 16px;
      padding: 0 4px;
    }
  }
}

.custom-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  margin-bottom: 2px;
}
</style>

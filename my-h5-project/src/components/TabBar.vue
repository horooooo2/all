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
      <span class="tab-bar__label">{{ $t(item.name) }}</span>
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
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
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
  console.log(t('切换到:'), item.name)
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.tab-bar {
  z-index: @z-index-tabbar-fixed;

  :deep(.van-tabbar) {
    z-index: @z-index-tabbar-fixed;
    background-color: var(--tabbar-bg);
    border-top: 1px solid var(--tabbar-border);
  }

  :deep(.van-tabbar-item) {
    position: relative;
    flex: 1;
    min-width: 0;
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

    /* 多语言文案换行时保持居中 */
    .van-tabbar-item__text {
      width: 100%;
      max-width: 100%;
      text-align: center;
      white-space: normal;
      word-break: break-word;
      line-height: 1.15;
      padding: 0 2px;
      box-sizing: border-box;
    }
  }
}

.tab-bar__label {
  display: block;
  width: 100%;
  text-align: center;
}

.custom-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  margin-bottom: 2px;
}
</style>

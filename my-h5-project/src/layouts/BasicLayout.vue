<template>
  <div class="basic-layout">
    <main
        class="main-content"
        :class="{
          'main-content--no-tabbar': !showTabBar,
          'main-content--with-download-bar': showTabBar && downloadBarVisible
        }"
    >
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component
              :is="Component"
              v-if="route.meta.keepAlive"
              :key="route.path"
          />
        </keep-alive>
        <component
            :is="Component"
            v-if="!route.meta.keepAlive"
            :key="route.path"
        />
      </router-view>
    </main>

    <AppDownloadBar
        v-if="showTabBar"
        @visible-change="onDownloadBarVisibleChange"
    />
    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import AppDownloadBar from '@/components/AppDownloadBar.vue'

const route = useRoute()
const downloadBarVisible = ref(true)

const onDownloadBarVisibleChange = (visible) => {
  downloadBarVisible.value = visible
}

const showTabBar = computed(() => {
  const hidePages = [
    '/login',
    '/register',
    '/game-hall',
    '/game-room',
    '/game-trend',
    '/game-pl5',
    '/pl5-trend',
    '/live-lottery/room',
    '/live-lottery/trend',
    '/lottery/pl5/room',
    '/lottery/pl5/trend',
    '/lottery/lhc/room',
    '/lottery/pc28/room',
    '/agent-center',
    '/agent-apply',
    '/agent-promotion',
    '/agent-commission',
    '/agent-treatment',
    '/agent-support',
    '/agent-direct-team',
    '/agent-team-performance',
    '/agent-team-lottery-records',
    '/agent-team-lottery-order-detail',
    '/lottery-bet-record',
    '/lottery-bet-order-detail',
    '/service/detail',
    '/activity/detail',
    '/help-center',
    '/help-center/questions'
  ]
  if (hidePages.includes(route.path)) return false
  if (route.meta?.hideTabBar) return false
  return !hidePages.includes(route.path)
})
</script>

<style lang="less" scoped>
.basic-layout {
  min-height: 100vh;
  background-color: var(--bg-color);

  .main-content {
    padding-bottom: calc(50px + env(safe-area-inset-bottom, 0px));
  }

  .main-content.main-content--with-download-bar {
    padding-bottom: calc(98px + env(safe-area-inset-bottom, 0px));
  }

  .main-content.main-content--no-tabbar {
    padding-bottom: 0;
  }
}
</style>

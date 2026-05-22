<template>
  <div class="basic-layout">
    <main class="main-content" :class="{ 'main-content--no-tabbar': !showTabBar }">
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

    <TabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'

const route = useRoute()

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
    '/help-center',
    '/help-center/questions'
  ]
  return !hidePages.includes(route.path)
})
</script>

<style lang="less" scoped>
.basic-layout {
  min-height: 100vh;
  background-color: var(--bg-color);

  .main-content {
    padding-bottom: 50px;
  }

  .main-content.main-content--no-tabbar {
    padding-bottom: 0;
  }
}
</style>

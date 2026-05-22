<template>
  <div class="activity-page">
    <header class="activity-header">
      <h1 class="activity-title">活动中心</h1>
    </header>

    <div class="activity-list">
      <div
        v-for="item in activityList"
        :key="item.id"
        class="activity-card"
      >
        <div class="activity-card-placeholder"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activityList = ref([
  { id: 1 },
  { id: 2 },
  { id: 3 }
])
</script>

<style lang="less" scoped>
@import '@/styles/pages/activity.less';
</style>

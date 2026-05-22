<template>
  <div class="agent-subpage agent-support-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>代理扶持</h1>
    </header>

    <div v-if="!displayList.length" class="support-empty">
      <img class="support-empty-img" :src="noDataImage" alt="">
      <p class="support-empty-text">暂无数据</p>
    </div>
    <section v-else class="support-list">
      <article v-for="item in displayList" :key="item.id" class="support-card">
        <div class="support-card-row">
          <span class="support-card-title">{{ item.title }}</span>
          <span
            class="support-card-amt"
            :class="item.amount >= 0 ? 'support-card-amt--pos' : 'support-card-amt--neg'"
          >
            {{ item.amount >= 0 ? '+' : '-' }}¥{{ fmtMoney(Math.abs(item.amount)) }}
          </span>
        </div>
        <p class="support-card-time">{{ item.time }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import noDataImage from '@/assets/no_data.svg'

const router = useRouter()
const goBack = () => router.back()

/** 接入接口后替换；默认空列表以展示稿图「暂无数据」 */
const list = ref([])

const displayList = computed(() => list.value)

const fmtMoney = (n) => {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  return v.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 0 })
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-support.less';
</style>

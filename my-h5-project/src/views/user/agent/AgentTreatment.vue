<template>
  <div class="agent-subpage agent-treatment-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>我的待遇</h1>
    </header>

    <div class="treat-card">
      <div class="treat-card-head">我的返佣</div>
      <div class="treat-table-head">
        <span>类型</span>
        <span>最低有效投注</span>
        <span>返水比例(%)</span>
        <span class="treat-head-placeholder" />
      </div>

      <template v-for="cat in categories" :key="cat.id">
        <button type="button" class="treat-cat-row" @click="toggle(cat.id)">
          <span>{{ cat.name }}</span>
          <span>{{ cat.minBet }}</span>
          <span class="treat-rate">{{ cat.rate }}</span>
          <span class="treat-arrow">{{ cat.open ? '▲' : '▼' }}</span>
        </button>
        <template v-if="cat.open && cat.children?.length">
          <div
            v-for="(row, ri) in cat.children"
            :key="`${cat.id}-${ri}`"
            class="treat-sub-row"
          >
            <span class="treat-type-sub">{{ row.level }}</span>
            <span>{{ row.minBet }}</span>
            <span class="treat-rate">{{ row.rate }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'

const router = useRouter()

const categories = ref([
  {
    id: 'dz',
    name: '电子',
    minBet: '¥1',
    rate: '0.8%',
    open: true,
    children: [
      { level: '2', minBet: '¥500000', rate: '0.8%' },
      { level: '3', minBet: '¥2000000', rate: '0.9%' },
      { level: '5', minBet: '¥2000000', rate: '0.9%' }
    ]
  },
  { id: 'qp', name: '棋牌', minBet: '¥1', rate: '0.8%', open: false, children: [] },
  { id: 'sx', name: '视讯', minBet: '¥1', rate: '0.8%', open: false, children: [] },
  { id: 'by', name: '捕鱼', minBet: '¥1', rate: '0.8%', open: false, children: [] },
  { id: 'ty', name: '体育', minBet: '¥1', rate: '0.8%', open: false, children: [] },
  { id: 'cp', name: '彩票', minBet: '¥1', rate: '0.8%', open: false, children: [] }
])

const toggle = (id) => {
  const c = categories.value.find((x) => x.id === id)
  if (c) c.open = !c.open
}

const goBack = () => router.back()
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-treatment.less';
</style>

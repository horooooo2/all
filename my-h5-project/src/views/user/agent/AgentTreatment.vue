<template>
  <div class="agent-subpage agent-treatment-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('我的待遇') }}</h1>
    </header>

    <div class="record-table-card">
      <div class="treat-section-head">{{ $t('我的返佣') }}</div>

      <div class="table-head">
        <span>{{ $t('类型') }}</span>
        <span>{{ $t('最低有效投注') }}</span>
        <span>{{ $t('返水比例(%)') }}</span>
      </div>

      <template v-for="cat in categories" :key="cat.id">
        <button type="button" class="group-row" @click="toggle(cat.id)">
          <span>{{ cat.name }}</span>
          <span>{{ cat.minBet }}</span>
          <span>{{ cat.rate }}</span>
          <img
            class="group-row__arrow"
            :class="{ 'is-up': expandedIds.includes(cat.id) }"
            :src="iconDetailsDown"
            alt=""
          >
        </button>
        <template v-if="expandedIds.includes(cat.id) && cat.children?.length">
          <div
            v-for="(row, ri) in cat.children"
            :key="`${cat.id}-${ri}`"
            class="detail-row"
          >
            <span>{{ row.level }}</span>
            <span>{{ row.minBet }}</span>
            <span>{{ row.rate }}</span>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import iconDetailsDown from '@/assets/icon_details_down.svg'

const router = useRouter()
const categories = ref([
  {
    id: 'dz',
    name: t('电子'),
    minBet: '¥1',
    rate: '0.8%',
    children: [
      { level: '2', minBet: '¥500000', rate: '0.8%' },
      { level: '3', minBet: '¥2000000', rate: '0.9%' },
      { level: '5', minBet: '¥2000000', rate: '0.9%' }
    ]
  },
  { id: 'qp', name: t('棋牌'), minBet: '¥1', rate: '0.8%', children: [] },
  { id: 'sx', name: t('视讯'), minBet: '¥1', rate: '0.8%', children: [] },
  { id: 'by', name: t('捕鱼'), minBet: '¥1', rate: '0.8%', children: [] },
  { id: 'ty', name: t('体育'), minBet: '¥1', rate: '0.8%', children: [] },
  { id: 'cp', name: t('彩票'), minBet: '¥1', rate: '0.8%', children: [] }
])

const expandedIds = ref(['dz'])

const toggle = (id) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

const goBack = () => router.back()
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/agent-treatment.less';
</style>

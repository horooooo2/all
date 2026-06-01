<template>
  <div class="agent-subpage link-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack">
      <h1>{{ $t('链接详情') }}</h1>
    </header>

    <div class="ld-head">
      <div class="ld-name">链接名称： {{ linkTitle }}</div>
      <div class="ld-url-row">
        <div class="ld-url">{{ linkUrl }}</div>
        <button type="button" class="ld-copy" @click="copyText(linkUrl)">{{ $t('复制') }}</button>
      </div>
    </div>

    <div class="ld-section">
      <div class="ld-table">
        <div class="ld-table-head">
          <span class="ld-th">{{ $t('类型') }}</span>
          <span class="ld-th">{{ $t('最低有效投注') }}</span>
          <span class="ld-th ld-th--right">{{ $t('返水比例%') }}</span>
        </div>
        <div v-for="row in gameRows" :key="row.id" class="ld-tr">
          <span class="ld-td">{{ row.type }}</span>
          <span class="ld-td">{{ row.minBet }}</span>
          <span class="ld-td ld-td--right">{{ row.rate }}</span>
        </div>
      </div>

      <div class="ld-divider" />

      <div class="ld-subtitle">
        <span>{{ $t('彩票返水') }}</span>
        <button type="button" class="ld-collapse-btn" @click="lotteryExpanded = !lotteryExpanded">
          <van-icon :name="lotteryExpanded ? 'arrow-up' : 'arrow-down'" />
        </button>
      </div>

      <div v-if="lotteryExpanded" class="ld-table ld-table--lottery">
        <div class="ld-table-head">
          <span class="ld-th">{{ $t('类型') }}</span>
          <span class="ld-th">{{ $t('最低有效投注') }}</span>
          <span class="ld-th ld-th--right">{{ $t('返水比例%') }}</span>
        </div>
        <div v-for="row in lotteryRows" :key="row.id" class="ld-tr">
          <span class="ld-td">{{ row.type }}</span>
          <span class="ld-td">{{ row.minBet }}</span>
          <span class="ld-td ld-td--right">{{ row.rate }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import toast from '@/components/Toast'

const router = useRouter()
const route = useRoute()
const goBack = () => router.back()

const linkTitle = ref(t('该链接赚取返水为0')
const linkUrl = ref('https://web.bmdeby.com/app/home')

// mock: 只用于展示结构，后续对接接口替换
const gameRows = ref([
  { id: 'el_1', type: t('电子'), minBet: '¥1', rate: '0.8%' },
  { id: 'el_2', type: t('投注1元起'), minBet: '¥1', rate: '0.8%' },
  { id: 'el_3', type: t('投注50万元起'), minBet: '¥500000', rate: '0.8%' },
  { id: 'el_4', type: t('投注200万元起'), minBet: '¥2000000', rate: '0.9%' },
  { id: 'el_5', type: t('投注500万元起'), minBet: '¥5000000', rate: '1.0%' }
])

const lotteryExpanded = ref(true)
const lotteryRows = ref([
  { id: 'l_1', type: t('个位球'), minBet: '¥0', rate: '0%' },
  { id: 'l_2', type: t('和值'), minBet: '¥0', rate: '0.4%' },
  { id: 'l_3', type: t('个十'), minBet: '¥0', rate: '0.4%' },
  { id: 'l_4', type: t('特码'), minBet: '¥0', rate: '0.4%' },
  { id: 'l_5', type: t('龙虎和 - 球二球'), minBet: '¥0', rate: '0.4%' }
])

const copyText = async (text) => {
  try {
    if (navigator?.clipboard?.writeText) await navigator.clipboard.writeText(text)
    else {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    toast.success(t('已复制'))
  } catch {
    toast.error(t('复制失败'))
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/agent-subpage-layout.less';
@import '@/styles/pages/link-detail.less';
</style>


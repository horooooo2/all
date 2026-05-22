<template>
  <div class="service-detail-page">
    <header class="record-header">
      <img :src="iconBack" alt="back" class="back-btn" @click="goBack" />
      <h1>{{ pageTitle }}</h1>
    </header>

    <div class="agent-list">
      <div
        v-for="(item, index) in agentList"
        :key="item.id"
        class="agent-card"
        :class="{ 'agent-card--disabled': item.status === 'maintenance' }"
        @touchstart.passive="onPressStart(item)"
        @touchend="onPressEnd"
        @touchcancel="onPressEnd"
        @mousedown="onPressStart(item)"
        @mouseup="onPressEnd"
        @mouseleave="onPressEnd"
      >
        <div class="item-icon">
          <img :src="item.icon || defaultAvatar" :alt="item.name" />
        </div>
        <span class="agent-name">{{ item.name }}</span>
        <div
          class="agent-btn"
          :class="{ 'agent-btn--disabled': item.status === 'maintenance' }"
          role="button"
          :tabindex="item.status === 'maintenance' ? -1 : 0"
          @click.stop="onAgentAction(item, index)"
          @keydown.enter.prevent="onAgentAction(item, index)"
        >
          {{ getBtnText(item, index) }}
        </div>
      </div>
    </div>

    <p class="detail-tip">
      温馨提示: <span class="detail-tip__highlight">长按</span>号码可以复制到剪贴板
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import iconBack from '@/assets/icon_dack.svg'
import defaultAvatar from '@/assets/touxiang2.png'
import { toast } from '@/components/Toast'

const router = useRouter()
const route = useRoute()

const AGENT_MAP = {
  online: {
    title: '在线客服',
    agents: [
      { id: 1, name: '28在线客服(01)', icon: '', contact: '88880001', status: 'active' },
      { id: 2, name: '28在线客服(02)', icon: '', contact: '88880002', status: 'active' },
      { id: 3, name: '28在线客服(03)', icon: '', contact: '88880003', status: 'active' },
      { id: 4, name: '28在线客服(04)', icon: '', contact: '88880004', status: 'maintenance' }
    ]
  },
  finance: {
    title: '财务客服',
    agents: [
      { id: 1, name: '28财务客服(01)', icon: '', contact: '88881001', status: 'active' },
      { id: 2, name: '28财务客服(02)', icon: '', contact: '88881002', status: 'active' },
      { id: 3, name: '28财务客服(03)', icon: '', contact: '88881003', status: 'maintenance' }
    ]
  },
  tg: {
    title: 'TG客服',
    agents: [
      { id: 1, name: '28TG客服(01)', icon: '', contact: '@service01', status: 'active' },
      { id: 2, name: '28TG客服(02)', icon: '', contact: '@service02', status: 'active' },
      { id: 3, name: '28TG客服(03)', icon: '', contact: '@service03', status: 'active' },
      { id: 4, name: '28TG客服(04)', icon: '', contact: '@service04', status: 'maintenance' }
    ]
  }
}

const agentList = ref([])
const pageTitle = computed(() => {
  const type = route.query.type
  return AGENT_MAP[type]?.title || '在线客服'
})

const loadAgents = () => {
  const type = route.query.type || 'online'
  const config = AGENT_MAP[type] || AGENT_MAP.online
  agentList.value = config.agents
}

watch(() => route.query.type, loadAgents, { immediate: true })

const goBack = () => router.back()

let pressTimer = null

const onPressStart = (item) => {
  onPressEnd()
  if (!item.contact) return
  pressTimer = setTimeout(() => copyContact(item.contact), 500)
}

const onPressEnd = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

async function copyContact(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const input = document.createElement('textarea')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败')
  }
}

const getBtnText = (item, index) => {
  if (item.status === 'maintenance') return '维护中'
  return index === 0 ? '复制号码' : '立即洽谈'
}

const onAgentAction = (item, index) => {
  if (item.status === 'maintenance') return
  if (index === 0) {
    if (!item.contact) {
      toast.error('暂无号码')
      return
    }
    copyContact(item.contact)
    return
  }
  toast.success('正在接入客服…')
}
</script>

<style lang="less" scoped>
@import '@/styles/pages/service-detail.less';
</style>

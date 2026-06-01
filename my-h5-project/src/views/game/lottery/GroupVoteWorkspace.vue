<template>
  <div class="group-vote-workspace">
    <div class="gv-tabs" role="tablist" :aria-label="$t('群投模式内容')">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="gv-tab"
        :class="{ 'is-active': active === t.key }"
        role="tab"
        :aria-selected="active === t.key ? 'true' : 'false'"
        @click="active = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="gv-panels">
      <div v-show="active === 'double'" class="gv-panel gv-panel--bet">
        <BetPanelCore
          :balance="balance"
          @submit="emit('submit', $event)"
          @chase="emit('chase')"
          @open-recent="emit('open-recent')"
        />
      </div>

      <div v-show="active === 'road'" class="gv-panel gv-panel--road">
        <Roadmap />
      </div>

      <div v-show="active === 'reco'" class="gv-panel gv-panel--reco">
        <RecommendHaoluPanel :balance="balance" @submit="emit('submit', $event)" @chase="emit('chase')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import BetPanelCore from './bet-panel/BetPanelCore.vue'
import Roadmap from './haolu/Roadmap.vue'
import RecommendHaoluPanel from './RecommendHaoluPanel.vue'

defineProps({
  balance: { type: [String, Number], default: 0 }
})

const emit = defineEmits(['submit', 'chase', 'open-recent'])

const tabs = [
  { key: 'double', label: t('双面盘') },
  { key: 'road', label: t('路子图') },
  { key: 'reco', label: t('推荐好路') }
]

const active = ref('double')
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.group-vote-workspace {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 375px;
  max-width: 100vw;
  margin: 0 auto;
  background: #f3f6fc;
  box-sizing: border-box;
}

.gv-tabs {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding: 8px 10px 0;
  box-sizing: border-box;
  background: #ffffff;
  border-bottom: 0.5px solid #dae4f6;
}

.gv-tab {
  height: 36px;
  margin: 0 2px 8px;
  border: none;
  border-radius: 8px;
  background: #eef4ff;
  color: #6a7892;
  font-size: @font-size-sm;
  font-weight: 600;
}

.gv-tab.is-active {
  background: linear-gradient(90deg, #1f78ff 0%, #00a1ff 100%);
  color: #ffffff;
}

.gv-panels {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gv-panel {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gv-panel--bet {
  overflow: hidden;
}

.gv-panel--road {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.gv-panel--reco {
  overflow: hidden;
}
</style>

<template>
  <div class="lhc-hub">
    <aside class="lhc-hub__tabs" :aria-label="$t('玩法分类')">
      <button
        v-for="t in sideTabs"
        :key="t.key"
        type="button"
        class="lhc-hub__tab"
        :class="{ active: activeSide === t.key }"
        @click="activeSide = t.key"
      >
        <span class="lhc-hub__tab-text">{{ t.label }}</span>
      </button>
    </aside>

    <main class="lhc-hub__content" :aria-label="$t('投注选项')">
      <LhcTeMa v-show="activeSide === 'tema'" ref="temaRef" @update:bet-count="onChildCount('tema', $event)" />
      <LhcZhengMa v-show="activeSide === 'zhengma'" ref="zhengmaRef" @update:bet-count="onChildCount('zhengma', $event)" />
      <LhcLianMa v-show="activeSide === 'lianma'" ref="lianmaRef" @update:bet-count="onChildCount('lianma', $event)" />
      <LhcZhengMaZt
        v-show="activeSide === 'zhengmada'"
        variant="a"
        ref="zhengmadaRef"
        @update:bet-count="onChildCount('zhengmada', $event)"
      />
      <LhcZhengMaZt
        v-show="activeSide === 'zhengmadb'"
        variant="b"
        ref="zhengmadbRef"
        @update:bet-count="onChildCount('zhengmadb', $event)"
      />
      <LhcZhengMaZt
        v-show="activeSide === 'zhengmadc'"
        variant="c"
        ref="zhengmadcRef"
        @update:bet-count="onChildCount('zhengmadc', $event)"
      />
      <LhcBanBo v-show="activeSide === 'banbo'" ref="banboRef" @update:bet-count="onChildCount('banbo', $event)" />
      <LhcPingTeYiXiao v-show="activeSide === 'ptyx'" ref="ptyxRef" @update:bet-count="onChildCount('ptyx', $event)" />
      <LhcTeXiao v-show="activeSide === 'texiao'" ref="texiaoRef" @update:bet-count="onChildCount('texiao', $event)" />
      <LhcLianXiao v-show="activeSide === 'lianxiao'" ref="lianxiaoRef" @update:bet-count="onChildCount('lianxiao', $event)" />
      <LhcWeiShuLian v-show="activeSide === 'weishulian'" ref="weishulianRef" @update:bet-count="onChildCount('weishulian', $event)" />
    </main>
  </div>
</template>

<script setup>
import { t } from '@/i18n'
import { useI18n } from 'vue-i18n'
import { reactive, ref, watch } from 'vue'
import LhcTeMa from './LhcTeMa.vue'
import LhcZhengMa from './LhcZhengMa.vue'
import LhcZhengMaZt from './LhcZhengMaZt.vue'
import LhcBanBo from './LhcBanBo.vue'
import LhcPingTeYiXiao from './LhcPingTeYiXiao.vue'
import LhcTeXiao from './LhcTeXiao.vue'
import LhcLianXiao from './LhcLianXiao.vue'
import LhcWeiShuLian from './LhcWeiShuLian.vue'
import LhcLianMa from './LhcLianMa.vue'

const emit = defineEmits(['update:betCount'])

const sideTabs = [
  { key: 'tema', label: t('特码') },
  { key: 'zhengma', label: t('正码') },
  { key: 'lianma', label: t('连码') },
  { key: 'zhengmada', label: t('正特码A') },
  { key: 'zhengmadb', label: t('正特码B') },
  { key: 'zhengmadc', label: t('正特码C') },
  { key: 'banbo', label: t('半波') },
  { key: 'ptyx', label: t('平特一尾数') },
  { key: 'texiao', label: t('特肖') },
  { key: 'lianxiao', label: t('连肖') },
  { key: 'weishulian', label: t('尾数连') }
]

const activeSide = ref('tema')

const temaRef = ref(null)
const zhengmaRef = ref(null)
const zhengmadaRef = ref(null)
const zhengmadbRef = ref(null)
const zhengmadcRef = ref(null)
const banboRef = ref(null)
const ptyxRef = ref(null)
const texiaoRef = ref(null)
const lianxiaoRef = ref(null)
const weishulianRef = ref(null)
const lianmaRef = ref(null)

const counts = reactive({
  tema: 0,
  zhengma: 0,
  lianma: 0,
  zhengmada: 0,
  zhengmadb: 0,
  zhengmadc: 0,
  banbo: 0,
  ptyx: 0,
  texiao: 0,
  lianxiao: 0,
  weishulian: 0
})

function onChildCount(key, n) {
  const v = Number(n) || 0
  counts[key] = v
  if (activeSide.value === key) emit('update:betCount', v)
}

watch(activeSide, (k) => {
  emit('update:betCount', Number(counts[k]) || 0)
})

const childRefs = {
  tema: temaRef,
  zhengma: zhengmaRef,
  lianma: lianmaRef,
  zhengmada: zhengmadaRef,
  zhengmadb: zhengmadbRef,
  zhengmadc: zhengmadcRef,
  banbo: banboRef,
  ptyx: ptyxRef,
  texiao: texiaoRef,
  lianxiao: lianxiaoRef,
  weishulian: weishulianRef
}

function activeChildRef() {
  return childRefs[activeSide.value]?.value ?? null
}

function resetPicks() {
  temaRef.value?.resetPicks?.()
  zhengmaRef.value?.resetPicks?.()
  lianmaRef.value?.resetPicks?.()
  zhengmadaRef.value?.resetPicks?.()
  zhengmadbRef.value?.resetPicks?.()
  zhengmadcRef.value?.resetPicks?.()
  banboRef.value?.resetPicks?.()
  ptyxRef.value?.resetPicks?.()
  texiaoRef.value?.resetPicks?.()
  lianxiaoRef.value?.resetPicks?.()
  weishulianRef.value?.resetPicks?.()
  Object.assign(counts, {
    tema: 0,
    zhengma: 0,
    lianma: 0,
    zhengmada: 0,
    zhengmadb: 0,
    zhengmadc: 0,
    banbo: 0,
    ptyx: 0,
    texiao: 0,
    lianxiao: 0,
    weishulian: 0
  })
  emit('update:betCount', 0)
}

function getBasketDraft() {
  return activeChildRef()?.getBasketDraft?.() ?? null
}

defineExpose({ resetPicks, getBasketDraft })
</script>

<style lang="less" scoped>
@import '@/styles/pages/lottery-play-hub.less';
</style>

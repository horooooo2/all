<template>
  <div class="lhc-tm" aria-label="特码选号">
    <p class="lhc-tm__hint">点选号码（1-49），可多选</p>
    <div class="lhc-tm__grid" role="group" aria-label="特码号码">
      <button
        v-for="n in 49"
        :key="n"
        type="button"
        class="lhc-tm__ball"
        :class="{ active: picked.has(n) }"
        @click="toggle(n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['update:betCount'])

const picked = ref(new Set())

function toggle(n) {
  const next = new Set(picked.value)
  if (next.has(n)) next.delete(n)
  else next.add(n)
  picked.value = next
}

const betCount = computed(() => picked.value.size)

watch(
  betCount,
  (c) => emit('update:betCount', c),
  { immediate: true }
)

function resetPicks() {
  picked.value = new Set()
  emit('update:betCount', 0)
}

defineExpose({ resetPicks })
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lhc-tm {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f3f6fc;
  padding: 10px 12px 12px;
  box-sizing: border-box;
}

.lhc-tm__hint {
  margin: 0 0 10px;
  font-size: @font-size-sm;
  color: #6a7892;
  flex-shrink: 0;
}

.lhc-tm__grid {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.lhc-tm__ball {
  aspect-ratio: 1;
  min-height: 0;
  border-radius: 50%;
  border: 1px solid #dae4f6;
  background: #ffffff;
  font-size: @font-size-sm;
  font-weight: 700;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  padding: 0;
  box-sizing: border-box;
}

.lhc-tm__ball.active {
  .lottery-num-ball-active();
}
</style>

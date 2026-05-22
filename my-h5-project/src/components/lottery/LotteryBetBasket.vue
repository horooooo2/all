<template>
  <van-popup
    :show="show"
    position="bottom"
    teleport="body"
    class="lbb-popup"
    :style="popupStyle"
    :z-index="2010"
    :safe-area-inset-bottom="true"
    :overlay="true"
    :overlay-style="{ background: 'rgba(0, 0, 0, 0.45)' }"
    @update:show="$emit('update:show', $event)"
  >
    <section class="lbb" role="dialog" aria-modal="true" aria-label="购彩 @click.stop>
      <header class="lbb__head">
        <div class="lbb__title">{{ title }}</div>
        <button type="button" class="lbb__close" aria-label="关闭" @click="close">
          <img :src="iconX" alt="" aria-hidden="true" />
        </button>
      </header>

      <div class="lbb__body">
        <template v-if="!items.length">
          <div class="lbb__empty">
            <img class="lbb__empty-img" :src="noDataImg" alt="" aria-hidden="true" />
            <p class="lbb__empty-text">购彩蓝为请前去选号</p>
          </div>
        </template>
        <ul v-else class="lbb__list" aria-label="投注条目">
          <li v-for="item in items" :key="item.id" class="lbb-row">
            <div class="lbb-row__left">{{ rowLeftLabel(item) }}</div>
            <div class="lbb-row__right">
              <input
                class="lbb-row__input"
                :value="amountDraft[item.id]"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                aria-label="金额"
                @input="onAmountInput(item.id, $event)"
              />
              <button type="button" class="lbb-row__del" aria-label="删除" @click="$emit('remove', item.id)">
                <img :src="iconDel" alt="" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>
      </div>

      <footer class="lbb__footer">
        <div class="lbb__foot-bar">
          <div class="lbb__foot-stat" aria-label="单数与余>
            <div class="lbb__foot-stat-line">
              <span class="lbb__foot-stat-txt">/span>
              <span class="lbb__foot-stat-num">{{ items.length }}</span>
              <span class="lbb__foot-stat-txt">/span>
            </div>
            <div class="lbb__foot-stat-line">
              <span class="lbb__foot-stat-txt">余额</span>
              <span class="lbb__foot-stat-num">¥{{ balanceFooterDisplay }}</span>
            </div>
          </div>

          <button type="button" class="lbb__btn lbb__btn--clear" :disabled="!items.length" @click="onClear">
            <img class="lbb__btn--clear-icon" :src="iconDel" alt="" aria-hidden="true" />
            <span class="lbb__btn--clear-text">清空</span>
          </button>

          <button type="button" class="lbb__btn lbb__btn--chase" :disabled="!items.length" @click="onChase">追号</button>

          <button
            type="button"
            class="lbb__btn lbb__btn--submit"
            :disabled="!items.length || submitDisabled"
            @click="onSubmit"
          >
            立即投注
          </button>
        </div>
      </footer>
    </section>
  </van-popup>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import iconX from '@/assets/icon_x.svg'
import iconDel from '@/assets/icon_del.png'
import noDataImg from '@/assets/no_data.svg'

/**
 * @typedef {{ left: string, right?: string }} BasketDetailRow
 * @typedef {{
 *   id: string,
 *   issue?: string,
 *   leftLabel?: string,
 *   detailRows?: BasketDetailRow[],
 *   metaRow?: string,
 *   amount?: number,
 *   totalAmount?: number,
 *   raw?: unknown
 * }} BasketItem
 */

const props = defineProps({
  show: { type: Boolean, default: false },
  /** 预留顶部区域（px）；弹层自底部起算，高度上限2/3 50vh×4/3)，且不超100vh - top */
  top: { type: [String, Number], default: 0 },
  /** 投注条目（各业务页组装后传入*/
  items: { type: Array, default: () => [] },
  title: { type: String, default: '购彩 },
  /** 底部栏展示用余额；不传则显示 0.00 */
  balance: { type: [Number, String], default: undefined },
  submitDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:show', 'submit', 'clear', 'remove', 'chase'])

const popupStyle = computed(() => {
  const t = Math.max(0, Number(props.top || 0))
  const topPx = `${t}px`
  const h = `min(calc(200vh / 3), calc(100vh - ${topPx}))`
  return {
    top: 'auto',
    bottom: '0px',
    height: h,
    maxHeight: h
  }
})

const balanceFooterDisplay = computed(() => {
  if (props.balance === undefined || props.balance === null || props.balance === '') {
    return '0.00'
  }
  const n = Number(props.balance)
  if (!Number.isFinite(n)) return '0.00'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

/** @type {Record<string, string>} */
const amountDraft = reactive({})

watch(
  () => props.items,
  (list) => {
    const next = new Set(list.map((x) => x.id))
    for (const k of Object.keys(amountDraft)) {
      if (!next.has(k)) delete amountDraft[k]
    }
    for (const it of list) {
      if (amountDraft[it.id] !== undefined) continue
      const v = it.amount ?? it.totalAmount ?? 0
      const n = Number(v)
      amountDraft[it.id] = Number.isFinite(n) && n !== 0 ? String(n) : ''
    }
  },
  { immediate: true, deep: true }
)

/**
 * @param {BasketItem} item
 */
function rowLeftLabel(item) {
  if (item.leftLabel) return item.leftLabel
  if (item.metaRow) return item.metaRow
  const first = item.detailRows?.[0]?.left
  if (first) return first
  return '
}

/**
 * @param {string} id
 * @param {Event} e
 */
function onAmountInput(id, e) {
  const t = /** @type {HTMLInputElement} */ (e.target)
  amountDraft[id] = t.value
}

function parseDraftAmount(id) {
  const raw = String(amountDraft[id] ?? '')
    .trim()
    .replace(/,/g, '')
  if (raw === '') return 0
  const num = Number(raw)
  return Number.isFinite(num) && num >= 0 ? num : 0
}

function close() {
  emit('update:show', false)
}

function onClear() {
  emit('clear')
}

function onChase() {
  emit('chase')
}

function onSubmit() {
  const merged = props.items.map((it) => {
    const amount = parseDraftAmount(it.id)
    return { ...it, amount, totalAmount: amount }
  })
  emit('submit', { items: merged })
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.lbb-popup {
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.lbb {
  width: 375px;
  max-width: 100vw;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.lbb__head {
  flex: 0 0 auto;
  height: 56px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  background: #ffffff;
}

.lbb__title {
  margin: 0;
  margin-right: auto;
  font-size: @font-size-md;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1.2;
}

.lbb__close {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.lbb__close img {
  width: @icon-x-size;
  height: @icon-x-size;
  display: block;
  object-fit: contain;
}

.lbb__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 14px 14px;
  box-sizing: border-box;
  background: #ffffff;
}

.lbb__empty {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 24px 16px;
  box-sizing: border-box;
}

.lbb__empty-img {
  width: 152px;
  height: 152px;
  object-fit: contain;
  display: block;
}

.lbb__empty-text {
  margin: 0;
  padding: 0 12px;
  text-align: center;
  font-size: @font-size-sm;
  line-height: 20px;
  color: #1d1d1f;
  font-weight: 400;
}

.lbb__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lbb-row {
  width: 351px;
  max-width: 100%;
  height: 54px;
  margin: 0 auto;
  padding: 0 10px 0 12px;
  box-sizing: border-box;
  border-radius: 8px;
  background: var(--s-7-e-5-efff, #e5efff);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.lbb-row__left {
  flex: 0 1 auto;
  max-width: 52%;
  min-width: 0;
  font-size: @font-size-sm;
  line-height: 20px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lbb-row__right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1 1 0;
  min-width: 0;
}

.lbb-row__input {
  box-sizing: border-box;
  display: block;
  flex: 0 0 93px;
  width: 93px;
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  text-align: center;
  border-radius: 6px;
  border: 1px solid var(--t-2-dae-4-f-6, #dae4f6);
  background: var(--i-1-ffffff, #ffffff);
  font-size: @font-size-sm;
  line-height: 20px;
  font-weight: 400;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
  outline: none;
}

.lbb-row__del {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.lbb-row__del img {
  width: 18px;
  height: 18px;
  display: block;
  object-fit: contain;
}

.lbb__footer {
  flex: 0 0 auto;
  padding: 10px 12px calc(12px + env(safe-area-inset-bottom, 0px));
  background: #ffffff;
  box-sizing: border-box;
}

.lbb__foot-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.lbb__foot-stat {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lbb__foot-stat-line {
  font-size: @font-size-sm;
  line-height: 20px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.lbb__foot-stat-txt {
  color: #1d1d1f;
}

.lbb__foot-stat-num {
  color: #0065ff;
}

.lbb__btn {
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  font-size: @font-size-sm;
  font-weight: 400;
  color: #1d1d1f;
}

.lbb__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.lbb__btn--clear {
  display: flex;
  flex-direction: column;
  width: 52px;
  padding: 5px 14px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  background: var(--s-6-d-7-e-2-f-5, #d7e2f5);
  flex-shrink: 0;
  line-height: 1.1;
}

.lbb__btn--clear-icon {
  width: 16px;
  height: 16px;
  display: block;
  object-fit: contain;
}

.lbb__btn--clear-text {
  font-size: @font-size-xs;
  font-weight: 400;
  color: #1d1d1f;
}

.lbb__btn--chase {
  display: flex;
  width: 52px;
  height: 44px;
  padding: 6px 0;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #4c5dff 0%, #111bf1 100%);
  color: #ffffff;
  flex-shrink: 0;
  font-size: @font-size-xs;
  line-height: 1.1;
}

.lbb__btn--submit {
  display: flex;
  width: 80px;
  height: 44px;
  padding: 6px 14px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 6px;
  background: var(---J17, linear-gradient(90deg, #fac03d 0%, #ff710d 100%));
  color: #ffffff;
  flex-shrink: 0;
  font-size: @font-size-xs;
  line-height: 1.15;
  text-align: center;
}
</style>

/** 购彩篮：从当前选号生成条目 */

import { LIANMA_PLAY_MODES } from './lhc/lhc-lianma-bet-count.js'
import { zodiacLabel } from './lhc/lhc-zodiac-data.js'
import { tailLabel } from './lhc/lhc-weishulian-config.js'
import { getZhengMaZtConfig } from './lhc/lhc-zhengma-zt-config.js'
import { TEMA_A_TEXT_OPTS, ZM_TEXT_OPTS, ZMT_TEXT_OPTS } from './lhc/lhc-text-opts.js'
import { SMP_DRAGON_TIGER_GROUPS, SMP_DRAGON_TIGER_OPTIONS } from './pl5/smp/smp-dragon-tiger.js'
import { BZP_ZX120_ROWS } from './pl5/bzp/bzp-zx120.js'

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function parseBetAmount(v) {
  const raw = String(v ?? '')
    .trim()
    .replace(/,/g, '')
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** @returns {Array<Array>} arr 中取 k 个的所有组合 */
export function combinationsOf(arr, k) {
  const a = [...arr]
  if (k <= 0) return k === 0 ? [[]] : []
  if (a.length < k) return []

  const result = []

  function dfs(start, combo) {
    if (combo.length === k) {
      result.push([...combo])
      return
    }
    for (let i = start; i <= a.length - (k - combo.length); i++) {
      combo.push(a[i])
      dfs(i + 1, combo)
      combo.pop()
    }
  }

  dfs(0, [])
  return result
}

/** @returns {number[][]} 从号码数组中取 k 个组合 */
export function combinations(arr, k) {
  const nums = [...arr].filter((x) => typeof x === 'number').sort((x, y) => x - y)
  return combinationsOf(nums, k)
}

function labelForPick(pick, textOpts = []) {
  if (typeof pick === 'number') return pad2(pick)
  const map = Object.fromEntries(textOpts.map((o) => [o.key, o.label]))
  return map[pick] ?? String(pick)
}

function sortPicks(picks) {
  const nums = picks.filter((x) => typeof x === 'number').sort((a, b) => a - b)
  const texts = picks.filter((x) => typeof x === 'string')
  return [...nums, ...texts]
}

function splitLianma(draft) {
  const raw = draft.raw ?? {}
  const mode = LIANMA_PLAY_MODES.find((m) => m.key === raw.subMode)
  if (!mode) return [{ leftLabel: draft.leftLabel, raw: draft.raw }]

  const nums = sortPicks(raw.picks ?? [])
  const combos = combinations(nums, mode.comboSize)
  const title = raw.modeTitle ?? mode.label
  const prefix = `连码 ${title}`

  return combos.map((combo) => ({
    leftLabel: `${prefix} ${combo.map(pad2).join(',')}`,
    raw: { ...raw, picks: combo }
  }))
}

function splitComboPicks(draft, playPrefix, labelFn) {
  const raw = draft.raw ?? {}
  const picks = [...(raw.picks ?? [])]
  const k = Number(raw.comboSize) || 0
  if (!k || picks.length < k) return [{ leftLabel: draft.leftLabel, raw: draft.raw }]

  const title = raw.modeTitle ?? ''
  const prefix = title ? `${playPrefix} ${title}` : playPrefix
  const combos = combinationsOf(picks, k)

  return combos.map((combo) => ({
    leftLabel: `${prefix} ${combo.map(labelFn).join(',')}`,
    raw: { ...raw, picks: combo }
  }))
}

function splitFlatPicks(draft, playName, textOpts) {
  const raw = draft.raw ?? {}
  const picks = sortPicks(raw.picks ?? [])
  const prefix = raw.modeTitle ? `${playName} ${raw.modeTitle}` : playName

  return picks.map((pick) => ({
    leftLabel: `${prefix} ${labelForPick(pick, textOpts)}`,
    raw: { ...raw, picks: [pick] }
  }))
}

function splitPl5Lht(draft) {
  const raw = draft.raw ?? {}
  const picks = raw.picks ?? {}
  const groupMap = Object.fromEntries(SMP_DRAGON_TIGER_GROUPS.map((g) => [g.key, g]))
  const optMap = Object.fromEntries(SMP_DRAGON_TIGER_OPTIONS.map((o) => [o.key, o]))

  return Object.entries(picks)
    .filter(([, v]) => v)
    .map(([rowKey, optKey]) => {
      const g = groupMap[rowKey]
      const o = optMap[optKey]
      const line = `${g?.title ?? rowKey}${o?.label ?? optKey}`
      return {
        leftLabel: `双面龙虎 ${line}`,
        raw: { play: 'smp-lht', picks: { [rowKey]: optKey } }
      }
    })
}

function splitPl5Bzp(draft) {
  const raw = draft.raw ?? {}
  const selected = raw.selected ?? {}
  const playLabel = raw.playLabel ?? '标准盘'
  const rowMap = Object.fromEntries(BZP_ZX120_ROWS.map((r) => [r.key, r.label]))
  const entries = []

  for (const [rowKey, nums] of Object.entries(selected)) {
    const list = Array.isArray(nums) ? [...nums].sort((a, b) => a - b) : []
    const rowLabel = rowMap[rowKey] ?? rowKey
    for (const n of list) {
      entries.push({
        leftLabel: `标准${playLabel} ${rowLabel}${n}`,
        raw: {
          play: 'bzp',
          playId: raw.playId,
          playLabel,
          selected: { [rowKey]: [n] }
        }
      })
    }
  }

  return entries.length ? entries : [{ leftLabel: draft.leftLabel, raw: draft.raw }]
}

/**
 * 按注数拆成多条购彩篮条目（每一注）
 * @param {{ betCount: number, leftLabel: string, raw?: Record<string, unknown>, splits?: Array<{ leftLabel: string, raw?: unknown }> }} draft
 * @returns {Array<{ leftLabel: string, raw: unknown }>}
 */
export function expandDraftSplits(draft) {
  if (!draft) return []
  if (draft.splits?.length) return draft.splits

  const count = Math.max(0, Number(draft.betCount) || 0)
  if (count <= 1) {
    return [{ leftLabel: draft.leftLabel, raw: draft.raw }]
  }

  const play = draft.raw?.play
  let entries = []

  switch (play) {
    case 'lianma':
      entries = splitLianma(draft)
      break
    case 'tema':
      entries = splitFlatPicks(draft, '特码', TEMA_A_TEXT_OPTS)
      break
    case 'zhengma':
      entries = splitFlatPicks(draft, '正码', ZM_TEXT_OPTS)
      break
    case 'zhengmada':
    case 'zhengmadb':
    case 'zhengmadc': {
      const zt = getZhengMaZtConfig(
        play === 'zhengmadb' ? 'b' : play === 'zhengmadc' ? 'c' : 'a'
      )
      entries = splitFlatPicks(draft, zt.mainLabel, ZMT_TEXT_OPTS)
      break
    }
    case 'smp-lht':
      entries = splitPl5Lht(draft)
      break
    case 'bzp':
      entries = splitPl5Bzp(draft)
      break
    case 'lianxiao':
      entries = splitComboPicks(draft, '连肖', zodiacLabel)
      break
    case 'weishulian':
      entries = splitComboPicks(draft, '尾数', tailLabel)
      break
    default:
      entries = [{ leftLabel: draft.leftLabel, raw: draft.raw }]
  }

  if (entries.length !== count) {
    return entries.length ? entries : [{ leftLabel: draft.leftLabel, raw: draft.raw }]
  }

  return entries
}

/**
 * @param {{
 *   issue?: string,
 *   leftLabel: string,
 *   unitAmount: number,
 *   betCount: number,
 *   raw?: unknown
 * }} payload
 */
export function buildBasketItem(payload) {
  const unit = Number(payload.unitAmount) || 0
  const count = Math.max(1, Number(payload.betCount) || 1)
  const total = unit * count
  const label = String(payload.leftLabel ?? '').trim()
  return {
    id: `basket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    issue: String(payload.issue ?? ''),
    leftLabel: label,
    amount: unit,
    totalAmount: total,
    raw: payload.raw ?? null
  }
}

/**
 * draft 按注数展开并生成购彩篮条目（每一注）
 */
export function buildBasketItemsFromDraft(draft, meta) {
  const splits = expandDraftSplits(draft)
  const unit = Number(meta.unitAmount) || 0
  const base = Date.now()
  return splits.map((entry, i) => {
    const item = buildBasketItem({
      issue: meta.issue,
      leftLabel: entry.leftLabel,
      unitAmount: unit,
      betCount: 1,
      raw: entry.raw
    })
    item.id = `basket-${base}-${i}-${Math.random().toString(36).slice(2, 6)}`
    return item
  })
}

export function labelsFromNumSet(set) {
  return [...set]
    .filter((x) => typeof x === 'number')
    .sort((a, b) => a - b)
    .map(pad2)
}

export function labelsFromTextKeys(set, textOpts) {
  const map = Object.fromEntries(textOpts.map((o) => [o.key, o.label]))
  return [...set]
    .filter((x) => typeof x === 'string')
    .map((k) => map[k] ?? k)
}

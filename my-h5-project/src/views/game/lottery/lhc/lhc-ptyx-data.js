import { getWaveClass } from './lhc-number-color.js'
import { LHC_ZODIACS } from './lhc-zodiac-data.js'

/** @returns {'red'|'blue'|'green'} */
export function waveKey(n) {
  const c = getWaveClass(n)
  if (c === 'is-red') return 'red'
  if (c === 'is-blue') return 'blue'
  return 'green'
}

export const PTYX_ZODIACS = LHC_ZODIACS

function numsByTail(digit) {
  const d = Number(digit)
  return Array.from({ length: 49 }, (_, i) => i + 1).filter((n) => n % 10 === d)
}

/** 0 尾数 */
export const PTYX_TAILS = Object.freeze(
  Array.from({ length: 10 }, (_, d) => ({
    key: `t${d}`,
    label: String(d),
    nums: numsByTail(d)
  }))
)

export const PTYX_MODES = Object.freeze([
  { key: 'sx-a', label: '生肖A', type: 'zodiac', odds: '2.09' },
  { key: 'ws-a', label: '尾数A', type: 'tail', odds: '2.09' },
  { key: 'sx-b', label: '生肖B', type: 'zodiac', odds: '2.05' },
  { key: 'ws-b', label: '尾数B', type: 'tail', odds: '2.05' }
])

/**
 * @param {string} modeKey
 * @returns {Array<{ key: string, label: string, odds: string, nums: number[] }>}
 */
export function ptyxOptionsForMode(modeKey) {
  const mode = PTYX_MODES.find((m) => m.key === modeKey) ?? PTYX_MODES[0]
  const base = mode.type === 'tail' ? PTYX_TAILS : PTYX_ZODIACS
  return base.map((item) => ({
    key: `${mode.key}-${item.key}`,
    label: item.label,
    odds: mode.odds,
    nums: [...item.nums]
  }))
}

export function ptyxModeLabel(modeKey) {
  return PTYX_MODES.find((m) => m.key === modeKey)?.label ?? ''
}

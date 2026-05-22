import { combinationCount } from './lhc-lianma-bet-count.js'

function numsByTail(digit) {
  const d = Number(digit)
  return Array.from({ length: 49 }, (_, i) => i + 1).filter((n) => n % 10 === d)
}

export const WEISHU_TAILS = Object.freeze(
  Array.from({ length: 10 }, (_, d) => ({
    key: `t${d}`,
    label: `${d}尾`,
    digit: d,
    nums: numsByTail(d)
  }))
)

export const WEISHULIAN_MODES = Object.freeze([
  { key: 'w2', label: '二尾连中', comboSize: 2, minPick: 2, odds: '3.45' },
  { key: 'w3', label: '三尾连中', comboSize: 3, minPick: 3, odds: '8.5' },
  { key: 'w4', label: '四尾连中', comboSize: 4, minPick: 4, odds: '22' }
])

export function weishulianBetCount(pickCount, mode) {
  const n = Number(pickCount) || 0
  if (!mode || n < mode.minPick) return 0
  return combinationCount(n, mode.comboSize)
}

export function tailLabel(key) {
  const m = String(key ?? '').match(/^t(\d)$/)
  return m ? `${m[1]}尾` : String(key ?? '')
}

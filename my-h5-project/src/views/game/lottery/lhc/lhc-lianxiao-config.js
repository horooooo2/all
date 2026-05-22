import { combinationCount } from './lhc-lianma-bet-count.js'

export const LIANXIAO_MODES = Object.freeze([
  { key: 'x2', label: '二肖连中', comboSize: 2, minPick: 2, odds: '4.5' },
  { key: 'x3', label: '三肖连中', comboSize: 3, minPick: 3, odds: '12.0' },
  { key: 'x4', label: '四肖连中', comboSize: 4, minPick: 4, odds: '36.0' },
  { key: 'x5', label: '五肖连中', comboSize: 5, minPick: 5, odds: '120' }
])

export function lianxiaoBetCount(pickCount, mode) {
  const n = Number(pickCount) || 0
  if (!mode || n < mode.minPick) return 0
  return combinationCount(n, mode.comboSize)
}

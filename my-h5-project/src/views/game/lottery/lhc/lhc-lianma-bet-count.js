/**
 * 六合彩连码注数：n 个所选号码中取 k 个为一注，注数 = C(n, k)
 * @see combinationCount
 */

/** @returns {number} C(n, k)，非法参数返回 0 */
export function combinationCount(n, k) {
  const nn = Number(n)
  const kk = Number(k)
  if (!Number.isFinite(nn) || !Number.isFinite(kk)) return 0
  if (nn < 0 || kk < 0 || nn < kk) return 0
  if (kk === 0) return 1

  let r = 1
  const m = Math.min(kk, nn - kk)
  for (let i = 0; i < m; i++) {
    r = (r * (nn - i)) / (i + 1)
  }
  return Math.round(r)
}

/**
 * 连码玩法配置
 * - comboSize: 每注包含号码个数 k，注数 = C(所选个数, k)
 * - minPick: 至少选几个号才开始计注
 */
export const LIANMA_PLAY_MODES = Object.freeze([
  {
    key: 's4qz',
    label: '四全中',
    minPick: 4,
    comboSize: 4,
    desc: '所选号码中4个为一注，4个号均在正码中即中'
  },
  {
    key: 's3z2',
    label: '三中二/三中三',
    minPick: 3,
    comboSize: 3,
    dualOdds: { low: '20', high: '120' },
    desc: '3个为一注；3个为正码全中，2个为三中二'
  },
  {
    key: 's3qz',
    label: '三全中',
    minPick: 3,
    comboSize: 3,
    desc: '3个为一注，3个号均在正码中即中'
  },
  {
    key: 'z2zt',
    label: '中二/中特',
    minPick: 2,
    comboSize: 2,
    dualOdds: { low: '20', high: '120' },
    desc: '2个为一注；均在正码为中二，一正一特为中特'
  },
  {
    key: 's2qz',
    label: '二全中',
    minPick: 2,
    comboSize: 2,
    desc: '2个为一注，2个号均在正码中即中'
  },
  {
    key: 'tc',
    label: '特串',
    minPick: 2,
    comboSize: 2,
    desc: '2个为一注，一正码一特码即中'
  }
])

/**
 * 计算指定玩法的注数
 * @param {number} pickCount 已选号码个数
 * @param {{ comboSize: number, minPick: number }} mode
 */
export function lianmaBetCount(pickCount, mode) {
  const n = Number(pickCount) || 0
  if (!mode || n < mode.minPick) return 0
  return combinationCount(n, mode.comboSize)
}

/**
 * 连码号码格下方赔率展示
 * @param {{ dualOdds?: { low: string, high: string } }} mode
 * @param {number} n 号码 1–49（非双赔率玩法时用于演示波动）
 */
export function lianmaOddsText(mode, n) {
  if (!mode) return ''
  if (mode.dualOdds) {
    const { low, high } = mode.dualOdds
    return `${low}/${high}`
  }
  const num = Number(n)
  const base = 47 + (Number.isFinite(num) ? num % 7 : 0)
  return base.toFixed(1)
}

/** 香港六合彩常见红蓝绿波号码（演示用，与正式彩球表一致时可替换为接口数据*/
const RED = new Set([1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46])
const BLUE = new Set([3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48])

export function getWaveClass(n) {
  const x = Math.floor(Number(n))
  if (!Number.isFinite(x) || x < 1 || x > 49) return 'is-green'
  if (RED.has(x)) return 'is-red'
  if (BLUE.has(x)) return 'is-blue'
  return 'is-green'
}

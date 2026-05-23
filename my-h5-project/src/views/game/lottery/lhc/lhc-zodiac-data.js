/** 十二生肖（演示，可按年度彩种配置替换） */

export const LHC_ZODIACS = Object.freeze([
  { key: 'rat', label: '鼠', nums: [7, 19, 31, 43] },
  { key: 'ox', label: '牛', nums: [6, 18, 30, 42] },
  { key: 'tiger', label: '虎', nums: [5, 17, 29, 41] },
  { key: 'rabbit', label: '兔', nums: [4, 16, 28, 40] },
  { key: 'dragon', label: '龙', nums: [3, 15, 27, 39] },
  { key: 'snake', label: '蛇', nums: [2, 14, 26, 38] },
  { key: 'horse', label: '马', nums: [1, 13, 25, 37, 49] },
  { key: 'goat', label: '羊', nums: [12, 24, 36, 48] },
  { key: 'monkey', label: '猴', nums: [11, 23, 35, 47] },
  { key: 'rooster', label: '鸡', nums: [10, 22, 34, 46] },
  { key: 'dog', label: '狗', nums: [9, 21, 33, 45] },
  { key: 'pig', label: '猪', nums: [8, 20, 32, 44] }
])

const ZODIAC_MAP = Object.fromEntries(LHC_ZODIACS.map((z) => [z.key, z]))

export function zodiacLabel(key) {
  return ZODIAC_MAP[key]?.label ?? String(key ?? '')
}

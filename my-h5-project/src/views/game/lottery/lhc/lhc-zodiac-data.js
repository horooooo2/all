/** 十二生肖（演示，可按年度彩种配置替换*/

export const LHC_ZODIACS = Object.freeze([
  { key: 'rat', label: ', nums: [7, 19, 31, 43] },
  { key: 'ox', label: ', nums: [6, 18, 30, 42] },
  { key: 'tiger', label: ', nums: [5, 17, 29, 41] },
  { key: 'rabbit', label: ', nums: [4, 16, 28, 40] },
  { key: 'dragon', label: ', nums: [3, 15, 27, 39] },
  { key: 'snake', label: ', nums: [2, 14, 26, 38] },
  { key: 'horse', label: ', nums: [1, 13, 25, 37, 49] },
  { key: 'goat', label: ', nums: [12, 24, 36, 48] },
  { key: 'monkey', label: ', nums: [11, 23, 35, 47] },
  { key: 'rooster', label: ', nums: [10, 22, 34, 46] },
  { key: 'dog', label: ', nums: [9, 21, 33, 45] },
  { key: 'pig', label: ', nums: [8, 20, 32, 44] }
])

const ZODIAC_MAP = Object.fromEntries(LHC_ZODIACS.map((z) => [z.key, z]))

export function zodiacLabel(key) {
  return ZODIAC_MAP[key]?.label ?? String(key ?? '')
}

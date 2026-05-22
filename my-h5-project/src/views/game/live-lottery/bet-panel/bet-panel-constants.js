/** 投注玩法区与 BetPanel / BetPanelCore 共用 */
export const BET_PANEL_TABS = [
  { key: 'bs', label: '大小单双' },
  { key: 'shape', label: '三位形态' },
  { key: 'point', label: '单点' },
  { key: 'sum', label: '双面和值' }
]

export const MULTI_SELECT_TAB_KEYS = new Set(['point', 'sum'])

export const DEFAULT_CHIPS = [1, 10, 100, 500, 1000]

export const BET_PANEL_STORAGE_KEY = 'betpanel.customChips.v1'

export const PLAY_GROUPS_BY_TAB = {
  bs: [
    {
      key: 'bs-basic',
      title: '大小单双',
      items: [
        { key: 'big', name: '大', odds: 1.98, tone: 'red' },
        { key: 'small', name: '小', odds: 1.98, tone: 'green' },
        { key: 'odd', name: '单', odds: 1.98, tone: 'blue' },
        { key: 'even', name: '双', odds: 1.98, tone: 'blue' }
      ]
    },
    {
      key: 'bs-combo',
      title: '大小单双组合',
      items: [
        { key: 'big-odd', name: '大单', odds: 1.98, tone: 'red' },
        { key: 'small-odd', name: '小单', odds: 1.98, tone: 'green' },
        { key: 'big-even', name: '大双', odds: 1.98, tone: 'blue' },
        { key: 'small-even', name: '小双', odds: 1.98, tone: 'blue' }
      ]
    }
  ],
  shape: [
    {
      key: 'shape-basic',
      title: '形态',
      items: [
        { key: 'baozi', name: '豹子', odds: 1.98, tone: 'red' },
        { key: 'shunzi', name: '顺子', odds: 1.98, tone: 'green' },
        { key: 'duizi', name: '对子', odds: 1.98, tone: 'blue' }
      ]
    }
  ],
  point: [
    {
      key: 'point-basic',
      title: '单点（示例）',
      items: Array.from({ length: 10 }, (_, i) => ({
        key: `p-${i}`,
        name: String(i),
        odds: 9.8,
        tone: 'blue'
      }))
    }
  ],
  sum: [
    {
      key: 'sum-basic',
      title: '和值（示例）',
      items: Array.from({ length: 8 }, (_, i) => ({
        key: `s-${i}`,
        name: String(i),
        odds: 1.98,
        tone: i % 2 ? 'green' : 'red'
      }))
    }
  ]
}

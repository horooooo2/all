/**
 * 标准盘「全部玩法」筛选树（演示数据，后续可对接接口）
 * @typedef {{ id: string, label: string }} BzpSubPlay
 * @typedef {{ id: string, label: string, subs: BzpSubPlay[] }} BzpMainPlay
 */

/** @type {BzpMainPlay[]} */
export const PLAY_FILTER_TREE = [
  {
    id: 'wx',
    label: '五星',
    subs: [
      { id: 'wx160', label: '五星组合60' },
      { id: 'zx120', label: '五星组合20' },
      { id: 'wx60', label: '五星组合60' },
      { id: 'wx30', label: '五星组合30' },
      { id: 'wx20', label: '五星组合20' },
      { id: 'wx10', label: '五星组合10' },
      { id: 'wx5', label: '五星组合5' }
    ]
  },
  { id: 'hs', label: '后四', subs: [{ id: 'hs-zx', label: '后四组选' }, { id: 'hs-zhi', label: '后四直选' }] },
  { id: 'h3', label: '后三', subs: [{ id: 'h3-zx', label: '后三组六' }, { id: 'h3-z3', label: '后三组三' }] },
  { id: 'z3', label: '中三', subs: [{ id: 'z3-zx', label: '中三组六' }, { id: 'z3-z3', label: '中三组三' }] },
  { id: 'q3', label: '前三', subs: [{ id: 'q3-zx', label: '前三组六' }, { id: 'q3-z3', label: '前三组三' }] },
  { id: 'q2', label: '前二', subs: [{ id: 'q2-zhi', label: '前二直选' }, { id: 'q2-z', label: '前二组选' }] },
  { id: 'dwd', label: '定位胆', subs: [{ id: 'dwd-wx', label: '五星定位' }] },
  { id: 'dxds', label: '大小单双', subs: [{ id: 'dx-q2', label: '前二大小单双' }] }
]

/**
 * @param {BzpMainPlay[]} tree
 * @param {string} subId
 */
export function findMainIdBySubId(tree, subId) {
  for (const m of tree) {
    if (m.subs.some((s) => s.id === subId)) return m.id
  }
  return tree[0]?.id ?? 'wx'
}

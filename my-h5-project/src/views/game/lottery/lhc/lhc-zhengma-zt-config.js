/** 正特A / B / C：六档小玩法配置 */

export const ZHENGMA_ZT_VARIANTS = Object.freeze({
  a: {
    play: 'zhengmada',
    mainLabel: '正特码A',
    modes: [
      { key: 'z1', label: '正一A },
      { key: 'z2', label: '正二A },
      { key: 'z3', label: '正三A },
      { key: 'z4', label: '正四A },
      { key: 'z5', label: '正五A },
      { key: 'z6', label: '正六A }
    ]
  },
  b: {
    play: 'zhengmadb',
    mainLabel: '正特码B',
    modes: [
      { key: 'z1', label: '正一B },
      { key: 'z2', label: '正二B },
      { key: 'z3', label: '正三B },
      { key: 'z4', label: '正四B },
      { key: 'z5', label: '正五B },
      { key: 'z6', label: '正六B }
    ]
  },
  c: {
    play: 'zhengmadc',
    mainLabel: '正特码C',
    modes: [
      { key: 'z1', label: '正一C },
      { key: 'z2', label: '正二C },
      { key: 'z3', label: '正三C },
      { key: 'z4', label: '正四C },
      { key: 'z5', label: '正五C },
      { key: 'z6', label: '正六C }
    ]
  }
})

export function getZhengMaZtConfig(variant) {
  return ZHENGMA_ZT_VARIANTS[variant] ?? ZHENGMA_ZT_VARIANTS.a
}

/** 标准· 五星组合20：演示遗漏（可接接口替换*/
export const BZP_ZX120_ROWS = [
  { key: 'triple', label: '三重 },
  { key: 'single', label: '单号' }
]

export function mockOmission(seed) {
  const out = []
  for (let i = 0; i < 10; i++) {
    const n = (seed * 17 + i * 13) % 28
    out.push(n < 10 ? n : n % 10)
  }
  return out
}

import { LOTTERY_GAME_KEY_TO_CODE } from '@/api/lottery'

const GAME_KEY_ALIASES = Object.freeze({
  'g-1': 'btc',
  'g-2': 'tw28',
  'g-3': 'jnd28',
  'g-4': 'jndx28',
  btc: 'btc',
  tw28: 'tw28',
  jnd28: 'jnd28',
  jndx28: 'jndx28',
  pl5: 'pl5',
  lhc: 'lhc',
  pc28: 'jnd28'
})

export function resolveLotteryGameRulesKey(gameId, gameName) {
  const id = String(gameId || '').trim().toLowerCase()
  if (GAME_KEY_ALIASES[id]) return GAME_KEY_ALIASES[id]

  const name = String(gameName || '').trim()
  if (name.includes('比特币')) return 'btc'
  if (name.includes('台湾')) return 'tw28'
  if (name.includes('加拿大西')) return 'jndx28'
  if (name.includes('加拿大')) return 'jnd28'
  if (name.includes('六合')) return 'lhc'
  if (name.includes('排列')) return 'pl5'

  return 'jnd28'
}

/** 路由 gameId → 接口彩种编码（btc28｜jnd28｜jndx28｜twbg28） */
export function resolveLotteryGameRulesCode(gameId, gameName) {
  const key = resolveLotteryGameRulesKey(gameId, gameName)
  return LOTTERY_GAME_KEY_TO_CODE[key] || ''
}

export function goLotteryGameRules(router, { gameId, gameName } = {}) {
  const query = {}
  const key = resolveLotteryGameRulesKey(gameId, gameName)
  if (key) query.gameId = key
  if (gameName) query.gameName = String(gameName)
  router.push({ name: 'lotteryGameRules', query })
}

/** 团队彩票注单 mock，接入接口后删除或改为接口数据 */
/** betResult: pending 未开奖 | won 已中奖 | lost 未中奖 */
export const teamLotteryRecords = [
  {
    id: 'lt001',
    issueNo: '3418401',
    memberAccount: 'mol123',
    gameName: '加拿大PC28(4.2-4.6)特',
    platform: '加拿大28',
    betContent: '大单@4.2',
    betPick: '大单',
    multiplier: '4.2',
    amount: 1,
    validBet: 1,
    bonus: 0,
    prizeMode: 'USDT',
    winLoss: 0,
    orderTime: '2026-05-23 20:22:41',
    drawTime: '2026-05-23 20:24:41',
    drawNumbers: '[1、9、0]',
    orderNo: '1775731513617976548',
    betResult: 'lost'
  },
  {
    id: 'lt002',
    issueNo: '3418400',
    memberAccount: 'player_02',
    gameName: '加拿大PC28(4.2-4.6)特',
    platform: '加拿大28',
    betContent: '大单@4.2',
    betPick: '大单',
    multiplier: '4.2',
    amount: 1,
    validBet: 1,
    bonus: 88,
    prizeMode: 'USDT',
    winLoss: 88,
    orderTime: '2026-05-23 18:18:10',
    drawTime: '2026-05-23 18:20:15',
    drawNumbers: '[3、5、8]',
    orderNo: '1775731513617976549',
    betResult: 'won'
  },
  {
    id: 'lt003',
    issueNo: '3418399',
    memberAccount: 'player_03',
    gameName: '加拿大PC28(4.2-4.6)特',
    platform: '加拿大28',
    betContent: '大单@4.2',
    betPick: '大单',
    multiplier: '4.2',
    amount: 1,
    validBet: 1,
    bonus: 0,
    prizeMode: 'USDT',
    winLoss: 0,
    orderTime: '2026-05-23 16:03:00',
    drawTime: '',
    drawNumbers: '—',
    orderNo: '1775731513617976550',
    betResult: 'pending'
  }
]

export function getTeamLotteryOrderById(id) {
  return teamLotteryRecords.find((item) => item.id === id) ?? null
}

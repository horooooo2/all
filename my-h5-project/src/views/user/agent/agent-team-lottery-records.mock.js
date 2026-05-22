/** 团队彩票注单 mock，接入接口后删除或改为接口数据 */
/** betResult: pending 未开奖 | won 已中奖 | lost 未中奖 */
export const teamLotteryRecords = [
  {
    id: 'LT20260401001',
    memberAccount: 'team_m_001',
    gameName: '分分彩',
    platform: '加拿大28',
    amount: 200,
    validBet: 200,
    winLoss: 86,
    orderTime: '2026-04-01 14:30:22',
    betResult: 'won'
  },
  {
    id: 'LT20260331108',
    memberAccount: 'team_m_002',
    gameName: '时时彩',
    platform: '加拿大28',
    amount: 50,
    validBet: 50,
    winLoss: -50,
    orderTime: '2026-03-31 09:15:00',
    betResult: 'lost'
  },
  {
    id: 'LT20260330190',
    memberAccount: 'team_m_001',
    gameName: '11选5',
    platform: '加拿大28',
    amount: 120,
    validBet: 120,
    winLoss: 0,
    orderTime: '2026-03-30 19:00:33',
    betResult: 'pending'
  }
]

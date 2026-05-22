/** 交易记录列表 + 详情共用（后续可换接口） */
export const transactionRecords = [
  {
    id: 1,
    title: '运营补分',
    time: '2026-03-10 20:08:31',
    amount: 10000,
    type: 'activity',
    typeLabel: '活动奖励',
    orderNo: 'OP202603102008310001',
    target: '主钱包',
    completedAt: '2026-03-10 20:08:31'
  },
  {
    id: 2,
    title: '游戏投注',
    time: '2026-03-11 20:08:31',
    amount: -10,
    type: 'game',
    typeLabel: '游戏投注',
    orderNo: 'GM202603112008310002',
    target: 'PC28',
    completedAt: '2026-03-11 20:08:31'
  },
  {
    id: 3,
    title: '游戏退款',
    time: '2026-03-26 15:16:19',
    amount: 10,
    type: 'game',
    typeLabel: '游戏退款',
    orderNo: '2312412351351231231',
    target: '(0)',
    completedAt: '2026-03-26 15:16:19'
  }
]

export function getTransactionRecordById(id) {
  const n = Number(id)
  return transactionRecords.find((r) => r.id === n) || null
}

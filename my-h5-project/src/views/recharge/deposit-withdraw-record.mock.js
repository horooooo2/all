/** 存取款记录列表 + 详情共用（后续可换接口） */
export const depositWithdrawRecords = [
  {
    id: 1,
    kind: 'deposit',
    categoryLabel: '存款',
    channel: 'cny',
    channelLabel: '￥',
    payMethod: '支付宝',
    time: '2026-03-13 20:08:31',
    completedAt: '—',
    orderNo: '202603130080r849636',
    amount: '200.00',
    amountSymbol: '$',
    amountValue: '200',
    amountUnit: '元',
    payCountdownSeconds: 750,
    protocolName: 'TRC20',
    walletAddress: 'TXsdf8K2mP9vL3nQ7wR4tY6uI1oP0aS2dF5gH8jK3lZ9xC6vB4nM7qW2eR5tY8uI',
    recipientName: 'K******',
    remark: '—',
    createdAt: '2026-03-13 20:09:31',
    qrCodeUrl: '',
    status: 'processing',
    statusLabel: '处理中'
  },
  {
    id: 2,
    kind: 'deposit',
    categoryLabel: '存款',
    channel: 't',
    channelLabel: 'T',
    payMethod: 'USDT',
    time: '2026-03-13 20:08:31',
    completedAt: '—',
    orderNo: '202603130080r849637',
    amount: '142284.74',
    amountSymbol: '$',
    amountValue: '142284.74',
    amountUnit: '元',
    payCountdownSeconds: 600,
    protocolName: 'TRC20',
    walletAddress: 'TXsdf8K2mP9vL3nQ7wR4tY6uI1oP0aS2dF5gH8jK3lZ9xC6vB4nM7qW2eR5tY8uI',
    recipientName: 'K******',
    remark: '—',
    createdAt: '2026-03-13 20:09:31',
    qrCodeUrl: '',
    status: 'processing',
    statusLabel: '处理中'
  },
  {
    id: 3,
    kind: 'deposit',
    categoryLabel: '存款',
    channel: 'cny',
    channelLabel: '￥',
    payMethod: '银行卡',
    time: '2026-03-13 20:08:31',
    completedAt: '2026-03-13 20:10:02',
    orderNo: '202603130080r849638',
    amount: '142284.74',
    status: 'success',
    statusLabel: '存款成功'
  },
  {
    id: 4,
    kind: 'deposit',
    categoryLabel: '存款',
    channel: 'cny',
    channelLabel: '￥',
    payMethod: '支付宝',
    time: '2026-03-13 20:08:31',
    completedAt: '—',
    orderNo: '202603130080r849639',
    amount: '142284.74',
    status: 'canceled',
    statusLabel: '取消存款'
  },
  {
    id: 5,
    kind: 'deposit',
    categoryLabel: '存款',
    channel: 'cny',
    channelLabel: '￥',
    payMethod: '支付宝',
    time: '2026-03-13 20:08:31',
    completedAt: '—',
    orderNo: '202603130080r849640',
    amount: '142284.74',
    status: 'failed',
    statusLabel: '取消失败'
  }
]

export function getDepositWithdrawRecordById(id) {
  const n = Number(id)
  return depositWithdrawRecords.find((r) => r.id === n) || null
}

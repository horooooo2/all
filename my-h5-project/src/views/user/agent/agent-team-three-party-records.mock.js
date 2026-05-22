const now = new Date()

function pad2(n) {
  return String(n).padStart(2, '0')
}

function fmtDateTime(d) {
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const hh = pad2(d.getHours())
  const mm = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
}

function daysAgo(n, hour = 12) {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  d.setHours(hour, 10, 20, 0)
  return d
}

export const PLATFORM_OPTIONS = [
  { label: '所有', value: 'all' },
  { label: 'CQ9电子', value: 'cq9' },
  { label: 'PG电子', value: 'pg' },
  { label: 'JDB电子', value: 'jdb' }
]

export const PLAYER_OPTIONS = [
  { label: '全部玩家', value: 'all' },
  { label: 'test001', value: 'test001' },
  { label: 'test002', value: 'test002' },
  { label: 'user888', value: 'user888' }
]

export const TYPE_TABS = [
  { label: '所有', value: 'all' },
  { label: '充值', value: 'deposit' },
  { label: '提现', value: 'withdraw' }
]

export const threePartyRecordsMock = [
  {
    id: 'TP-20260523-0001',
    memberAccount: 'mol123',
    platform: 'pg',
    gameName: 'PG电子-麻将胡了',
    type: 'deposit',
    typeLabel: '充值',
    betAmount: 1.8,
    winLoss: 14.4,
    time: fmtDateTime(daysAgo(0, 20))
  },
  {
    id: 'TP-20260523-0002',
    memberAccount: 'mol123',
    platform: 'pg',
    gameName: 'PG电子-麻将胡了',
    type: 'deposit',
    typeLabel: '充值',
    betAmount: 1.8,
    winLoss: 0,
    time: fmtDateTime(daysAgo(0, 18))
  },
  {
    id: 'TP-20260523-0003',
    memberAccount: 'player_02',
    platform: 'cq9',
    gameName: 'CQ9电子-跳高高',
    type: 'withdraw',
    typeLabel: '提现',
    betAmount: 2,
    winLoss: 8.6,
    time: fmtDateTime(daysAgo(0, 14))
  }
]

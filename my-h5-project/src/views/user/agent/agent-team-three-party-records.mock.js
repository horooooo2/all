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
    id: 'TP-20260401-0001',
    memberAccount: 'test001',
    platform: 'cq9',
    platformLabel: 'CQ9电子',
    type: 'deposit',
    typeLabel: '充值',
    amount: 100,
    time: fmtDateTime(daysAgo(0, 10))
  },
  {
    id: 'TP-20260401-0002',
    memberAccount: 'test002',
    platform: 'pg',
    platformLabel: 'PG电子',
    type: 'withdraw',
    typeLabel: '提现',
    amount: 50,
    time: fmtDateTime(daysAgo(0, 14))
  },
  {
    id: 'TP-20260331-0003',
    memberAccount: 'user888',
    platform: 'cq9',
    platformLabel: 'CQ9电子',
    type: 'deposit',
    typeLabel: '充值',
    amount: 20,
    time: fmtDateTime(daysAgo(1, 9))
  },
  {
    id: 'TP-20260329-0004',
    memberAccount: 'test001',
    platform: 'jdb',
    platformLabel: 'JDB电子',
    type: 'withdraw',
    typeLabel: '提现',
    amount: 10,
    time: fmtDateTime(daysAgo(3, 16))
  }
]


const STORAGE_KEY = 'withdrawal_accounts_v1'

const DEFAULT_WITHDRAWAL_ACCOUNTS = [
  {
    id: 'default-usdt',
    method: 'usdt',
    createdAt: 1,
    updatedAt: 1,
    data: { chain: 'TRC-20', address: 'TXYZabcdefghijklmnopqrstuv3689' }
  },
  {
    id: 'default-bank',
    method: 'bank',
    createdAt: 2,
    updatedAt: 2,
    data: { bankName: '\u4e2d\u56fd\u5de5\u5546\u94f6\u884c', cardNo: '6222021234567893689' }
  },
  {
    id: 'default-wallet',
    method: 'wallet',
    createdAt: 3,
    updatedAt: 3,
    data: { realName: '\u5f20\u4e09', walletName: 'K\u8c46\u94b1\u5305', walletNo: '13800138003689' }
  }
]

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch (e) {
    return fallback
  }
}

export function getWithdrawalAccounts() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const list = safeParse(raw || '[]', [])
  const arr = Array.isArray(list) ? list : []
  if (arr.length > 0) return arr
  saveWithdrawalAccounts(DEFAULT_WITHDRAWAL_ACCOUNTS)
  return DEFAULT_WITHDRAWAL_ACCOUNTS.map((item) => ({ ...item }))
}

export function saveWithdrawalAccounts(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []))
}

export function upsertWithdrawalAccount(payload) {
  const list = getWithdrawalAccounts()
  const now = Date.now()
  const item = {
    id: payload?.id || `${now}`,
    method: payload?.method || 'usdt', // usdt | bank | wallet
    createdAt: payload?.createdAt || now,
    updatedAt: now,
    data: payload?.data || {}
  }

  const idx = list.findIndex(x => x.id === item.id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...item, data: { ...(list[idx]?.data || {}), ...(item.data || {}) } }
  } else {
    list.unshift(item)
  }

  saveWithdrawalAccounts(list)
  return item
}

export function deleteWithdrawalAccount(id) {
  const list = getWithdrawalAccounts().filter(x => x.id !== id)
  saveWithdrawalAccounts(list)
  return list
}

export function getWithdrawalAccountById(id) {
  return getWithdrawalAccounts().find(x => x.id === id) || null
}

export function maskAccountDisplay(method, data = {}) {
  if (method === 'usdt') {
    const chain = (data.chain || 'TRC-20').toUpperCase()
    const address = String(data.address || '')
    const tail = address.slice(-4) || '3689'
    return {
      title: chain,
      subTitle: '虚拟币',
      display: `**** **** **** ${tail}`
    }
  }

  if (method === 'bank') {
    const bankName = String(data.bankName || '银行卡')
    const no = String(data.cardNo || '')
    const tail = no.slice(-4) || '3689'
    return {
      title: bankName,
      subTitle: '银行卡',
      display: `**** **** **** ${tail}`
    }
  }

  const walletName = String(data.walletName || '电子钱包')
  const no = String(data.walletNo || '')
  const tail = no.slice(-4) || '3689'
  return {
    title: walletName,
    subTitle: '电子钱包',
    display: `**** **** **** ${tail}`
  }
}


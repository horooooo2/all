import {
  getSessionJSON,
  setSessionJSON,
  migrateLocalToSession
} from '@/utils/sessionCache'
import { fetchWalletAccountList } from '@/api/wallet'

const STORAGE_KEY = 'withdrawal_accounts_v1'

/**
 * 拉取提款账户列表（接口）
 * @returns {Promise<import('@/api/wallet').WalletAccount[]>}
 */
export async function fetchWithdrawalAccounts() {
  return fetchWalletAccountList()
}

/** @deprecated 编辑页本地草稿；列表页请用 fetchWithdrawalAccounts */
export function getWithdrawalAccounts() {
  migrateLocalToSession(STORAGE_KEY)
  const list = getSessionJSON(STORAGE_KEY, [])
  return Array.isArray(list) ? list : []
}

export function saveWithdrawalAccounts(list) {
  setSessionJSON(STORAGE_KEY, Array.isArray(list) ? list : [])
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

import request from '@/utils/request'

/**
 * @typedef {Object} WalletAccountRaw
 * @property {number|string} id
 * @property {string} [type]
 * @property {string} [platform_name]
 * @property {string} [name]
 * @property {string} [protocol]
 * @property {string} [account_no]
 * @property {string} [bank_name]
 * @property {number|string} [status]
 * @property {string} [member_remark]
 * @property {string} [qr_code]
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */

/**
 * @typedef {Object} WalletAccount
 * @property {string} id
 * @property {'usdt'|'bank'|'wallet'} method
 * @property {string} type
 * @property {string} platformName
 * @property {string} name
 * @property {string} protocol
 * @property {string} accountNo
 * @property {string} bankName
 * @property {number|string|null} status
 * @property {string} memberRemark
 * @property {string} qrCode
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {Record<string, string>} data
 */

/**
 * @param {string} type
 * @returns {'usdt'|'bank'|'wallet'}
 */
export function normalizeWalletAccountMethod(type) {
    const t = String(type || '').toLowerCase()
    if (
        t.includes('usdt') ||
        t.includes('trc') ||
        t.includes('erc') ||
        t === 'crypto' ||
        t === 'virtual' ||
        t === 'virtual_currency'
    ) {
        return 'usdt'
    }
    if (t.includes('bank') || t.includes('card') || t === '银行卡') {
        return 'bank'
    }
    return 'wallet'
}

/**
 * @param {WalletAccountRaw} raw
 * @returns {WalletAccount}
 */
export function mapWalletAccountFromApi(raw) {
    const method = normalizeWalletAccountMethod(raw?.type)
    const accountNo = String(raw?.account_no || '').trim()
    const bankName = String(raw?.bank_name || '').trim()
    const protocol = String(raw?.protocol || '').trim()
    const platformName = String(raw?.platform_name || '').trim()
    const name = String(raw?.name || '').trim()

    /** @type {Record<string, string>} */
    let data = {}
    if (method === 'usdt') {
        data = {
            chain: protocol || 'TRC-20',
            address: accountNo
        }
    } else if (method === 'bank') {
        data = {
            bankName: bankName || name,
            cardNo: accountNo,
            realName: name
        }
    } else {
        data = {
            walletName: platformName || name || '电子钱包',
            walletNo: accountNo,
            realName: name
        }
    }

    return {
        id: String(raw?.id ?? ''),
        method,
        type: String(raw?.type || ''),
        platformName,
        name,
        protocol,
        accountNo,
        bankName,
        status: raw?.status ?? null,
        memberRemark: String(raw?.member_remark || ''),
        qrCode: String(raw?.qr_code || ''),
        createdAt: String(raw?.created_at || ''),
        updatedAt: String(raw?.updated_at || ''),
        data
    }
}

/**
 * @param {unknown} res
 * @returns {WalletAccountRaw[]}
 */
export function pickWalletAccountList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * 提款账户列表（需登录）
 * @returns {Promise<WalletAccount[]>}
 */
export async function fetchWalletAccountList() {
    const res = await request({
        url: '/wallet/account/list',
        method: 'get'
    })
    return pickWalletAccountList(res).map(mapWalletAccountFromApi)
}

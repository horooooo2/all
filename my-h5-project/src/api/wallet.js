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

/**
 * @typedef {Object} WalletAccountTypeOption
 * @property {string} type
 * @property {string} name
 * @property {boolean} enabled
 * @property {'usdt'|'bank'|'wallet'} method
 */

/**
 * @typedef {Object} WalletCryptoProtocolOption
 * @property {string} protocol
 * @property {string} name
 */

/**
 * @typedef {Object} WalletBankOption
 * @property {string} id
 * @property {string} bankName
 * @property {string} name
 * @property {string} currency
 * @property {string} country
 */

/**
 * @typedef {Object} WalletPlatformOption
 * @property {string} id
 * @property {string} platformName
 * @property {string} name
 * @property {string} currency
 * @property {string} country
 */

/**
 * @typedef {Object} WalletRechargeCurrencyOption
 * @property {string} currency
 * @property {string} currencyName
 * @property {number|string} exchangeRate
 * @property {number|string} minRechargeAmount
 * @property {number|string} maxRechargeAmount
 */

/**
 * @typedef {Object} WalletWithdrawLimit
 * @property {number|string} minWithdrawAmount
 * @property {number|string} maxWithdrawAmount
 * @property {number|string} dailyWithdrawCount
 * @property {number|string} dailyWithdrawLimit
 * @property {number|string} feeRate
 * @property {number|string} fixedFee
 * @property {number|string|null} status
 */

/**
 * @typedef {Object} WalletAccountOptions
 * @property {WalletAccountTypeOption[]} accountTypes
 * @property {WalletCryptoProtocolOption[]} cryptoProtocols
 * @property {WalletBankOption[]} bankOptions
 * @property {WalletPlatformOption[]} walletOptions
 * @property {WalletRechargeCurrencyOption[]} rechargeCurrencies
 * @property {WalletWithdrawLimit} withdrawLimit
 */

const METHOD_DEFAULT_NAMES = {
    usdt: 'USDT',
    bank: '银行卡',
    wallet: '电子钱包'
}

/**
 * @param {unknown} raw
 * @returns {WalletAccountOptions}
 */
export function mapWalletAccountOptionsFromApi(raw) {
    const accountTypes = (Array.isArray(raw?.account_types) ? raw.account_types : [])
        .map((item) => {
            const type = String(item?.type || '').trim()
            const method = normalizeWalletAccountMethod(type)
            return {
                type,
                name: String(item?.name || '').trim() || METHOD_DEFAULT_NAMES[method],
                enabled: item?.enabled !== false,
                method
            }
        })
        .filter((item) => item.enabled)

    const seenMethods = new Set()
    const dedupedAccountTypes = accountTypes.filter((item) => {
        if (seenMethods.has(item.method)) {
            return false
        }
        seenMethods.add(item.method)
        return true
    })

    const cryptoProtocols = (Array.isArray(raw?.crypto_protocols) ? raw.crypto_protocols : [])
        .map((item) => ({
            protocol: String(item?.protocol || '').trim(),
            name: String(item?.name || item?.protocol || '').trim()
        }))
        .filter((item) => item.protocol)

    const bankOptions = (Array.isArray(raw?.bank_options) ? raw.bank_options : [])
        .map((item) => ({
            id: String(item?.id ?? ''),
            bankName: String(item?.bank_name || '').trim(),
            name: String(item?.name || item?.bank_name || '').trim(),
            currency: String(item?.currency || '').trim(),
            country: String(item?.country || '').trim()
        }))
        .filter((item) => item.id || item.name || item.bankName)

    const walletOptions = (Array.isArray(raw?.wallet_options) ? raw.wallet_options : [])
        .map((item) => ({
            id: String(item?.id ?? ''),
            platformName: String(item?.platform_name || '').trim(),
            name: String(item?.name || item?.platform_name || '').trim(),
            currency: String(item?.currency || '').trim(),
            country: String(item?.country || '').trim()
        }))
        .filter((item) => item.id || item.name || item.platformName)

    const rechargeCurrencies = (Array.isArray(raw?.recharge_currencies) ? raw.recharge_currencies : [])
        .map((item) => ({
            currency: String(item?.currency || '').trim(),
            currencyName: String(item?.currency_name || '').trim(),
            exchangeRate: item?.exchange_rate ?? '',
            minRechargeAmount: item?.min_recharge_amount ?? '',
            maxRechargeAmount: item?.max_recharge_amount ?? ''
        }))
        .filter((item) => item.currency)

    const limitRaw = raw?.withdraw_limit && typeof raw.withdraw_limit === 'object'
        ? raw.withdraw_limit
        : {}

    return {
        accountTypes: dedupedAccountTypes,
        cryptoProtocols,
        bankOptions,
        walletOptions,
        rechargeCurrencies,
        withdrawLimit: {
            minWithdrawAmount: limitRaw?.min_withdraw_amount ?? '',
            maxWithdrawAmount: limitRaw?.max_withdraw_amount ?? '',
            dailyWithdrawCount: limitRaw?.daily_withdraw_count ?? '',
            dailyWithdrawLimit: limitRaw?.daily_withdraw_limit ?? '',
            feeRate: limitRaw?.fee_rate ?? '',
            fixedFee: limitRaw?.fixed_fee ?? '',
            status: limitRaw?.status ?? null
        }
    }
}

/**
 * 提款账户选项（需登录，用于新增/编辑表单项配置）
 * @returns {Promise<WalletAccountOptions>}
 */
export async function fetchWalletAccountOptions() {
    const res = await request({
        url: '/wallet/account/options',
        method: 'get'
    })
    return mapWalletAccountOptionsFromApi(res)
}

/**
 * @typedef {Object} BindWalletAccountPayload
 * @property {'crypto'|'bank'|'wallet'} type
 * @property {string} [protocol]
 * @property {string} [name]
 * @property {string} [bank_name]
 * @property {string} [platform_name]
 * @property {string} account_no
 * @property {string} withdraw_password
 * @property {string} [member_remark]
 * @property {string} [qr_code]
 */

/**
 * 绑定提款账户（需登录）
 * @param {BindWalletAccountPayload} data
 * @returns {Promise<unknown>}
 */
export function bindWalletAccount(data) {
    return request({
        url: '/wallet/account/bind',
        method: 'post',
        data
    })
}

/**
 * USDT 绑定请求体
 * @param {{ protocol: string, accountNo: string, withdrawPassword: string, memberRemark?: string, qrCode?: string }} params
 * @returns {BindWalletAccountPayload}
 */
export function buildBindCryptoPayload(params) {
    const payload = {
        type: 'crypto',
        protocol: String(params.protocol || '').trim(),
        account_no: String(params.accountNo || '').trim(),
        withdraw_password: String(params.withdrawPassword || '')
    }
    const remark = String(params.memberRemark || '').trim()
    const qrCode = String(params.qrCode || '').trim()
    if (remark) {
        payload.member_remark = remark
    }
    if (qrCode) {
        payload.qr_code = qrCode
    }
    return payload
}

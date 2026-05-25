import request from '@/utils/request'

/**
 * @typedef {'all'|'recharge'|'withdraw'|'activity'} TransactionRecordType
 */

/**
 * @typedef {Object} TransactionRecordQuery
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {TransactionRecordType} [type]
 * @property {string} [start_time]
 * @property {string} [end_time]
 */

/**
 * @typedef {Object} TransactionRecordRaw
 * @property {number|string} id
 * @property {string} [type]
 * @property {string} [type_name]
 * @property {string} [order_no]
 * @property {number|string} [amount]
 * @property {number|string} [actual_amount]
 * @property {number|string} [status]
 * @property {string} [status_name]
 * @property {string} [remark]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} TransactionRecord
 * @property {string} id
 * @property {string} title
 * @property {string} time
 * @property {number} amount
 * @property {number} actualAmount
 * @property {number} displayAmount
 * @property {string} type
 * @property {string} typeLabel
 * @property {string} orderNo
 * @property {number|string|null} status
 * @property {string} statusName
 * @property {string} remark
 * @property {string} createdAt
 * @property {string} completedAt
 */

/**
 * @param {unknown} res
 * @returns {TransactionRecordRaw[]}
 */
export function pickTransactionRecordList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {TransactionRecordRaw} raw
 * @returns {TransactionRecord}
 */
/**
 * @param {number|string|null|undefined} value
 */
export function toRecordNumber(value) {
    if (value == null || value === '') {
        return null
    }
    const n = Number(value)
    return Number.isNaN(n) ? null : n
}

/**
 * @param {TransactionRecordRaw} raw
 * @returns {TransactionRecord}
 */
export function mapTransactionRecordFromApi(raw) {
    const amount = toRecordNumber(raw?.amount)
    const actualAmount = toRecordNumber(raw?.actual_amount)
    const typeName = String(raw?.type_name || '').trim()
    const remark = String(raw?.remark || '').trim()
    const createdAt = String(raw?.created_at || '')
    const displayAmount = actualAmount != null ? actualAmount : amount ?? 0

    return {
        id: String(raw?.id ?? ''),
        title: typeName || '交易记录',
        time: createdAt,
        amount: amount ?? 0,
        actualAmount: actualAmount ?? 0,
        displayAmount,
        type: String(raw?.type || ''),
        typeLabel: typeName || '--',
        orderNo: String(raw?.order_no || ''),
        status: raw?.status ?? null,
        statusName: String(raw?.status_name || ''),
        remark,
        createdAt,
        completedAt: createdAt
    }
}

/**
 * @param {Date} date
 * @param {boolean} [endOfDay]
 */
export function formatRecordDateTime(date, endOfDay = false) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return endOfDay ? `${y}-${m}-${d} 23:59:59` : `${y}-${m}-${d} 00:00:00`
}

/**
 * 交易记录列表
 * @param {TransactionRecordQuery} params
 */
export async function fetchTransactionRecords(params = {}) {
    const res = await request({
        url: '/record/transaction',
        method: 'get',
        params: {
            page: params.page ?? 1,
            page_size: params.page_size ?? 20,
            type: params.type ?? 'all',
            start_time: params.start_time,
            end_time: params.end_time
        }
    })

    const meta = res && typeof res === 'object' ? res : {}
    return {
        list: pickTransactionRecordList(res).map(mapTransactionRecordFromApi),
        total: Number(meta.total) || 0,
        page: Number(meta.page) || params.page || 1,
        pageSize: Number(meta.page_size) || params.page_size || 20
    }
}

/**
 * @typedef {Object} RecordPlatformRaw
 * @property {string} [platform_name]
 */

/**
 * @typedef {Object} RecordPlatformOption
 * @property {string} label
 * @property {string} value
 */

/**
 * @param {unknown} res
 * @returns {RecordPlatformRaw[]}
 */
export function pickRecordPlatformList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {string[]} names
 * @returns {RecordPlatformOption[]}
 */
export function mapRecordPlatformOptions(names) {
    const opts = [{ label: '所有', value: 'all' }]
    const seen = new Set(['all'])
    for (const name of names) {
        const text = String(name || '').trim()
        if (!text || seen.has(text)) continue
        seen.add(text)
        opts.push({ label: text, value: text })
    }
    return opts
}

/**
 * 游戏平台选项（游戏记录筛选用）
 * @returns {Promise<RecordPlatformOption[]>}
 */
export async function fetchRecordPlatforms() {
    const res = await request({
        url: '/record/platform',
        method: 'get'
    })
    const names = pickRecordPlatformList(res).map((item) =>
        String(item?.platform_name || '').trim()
    )
    return mapRecordPlatformOptions(names)
}

/**
 * @typedef {Object} GameRecordQuery
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [platform_name]
 * @property {string} [start_time]
 * @property {string} [end_time]
 */

/**
 * @typedef {Object} GameRecordRaw
 * @property {number|string} id
 * @property {string} [order_no]
 * @property {string} [round_no]
 * @property {string} [platform_name]
 * @property {string} [game_name]
 * @property {string} [bet_content]
 * @property {number|string} [settle_status]
 * @property {number|string} [bet_amount]
 * @property {number|string} [valid_bet]
 * @property {number|string} [payout_amount]
 * @property {number|string} [profit_amount]
 * @property {string} [bet_time]
 * @property {string} [payout_at]
 */

/**
 * @typedef {Object} GameRecord
 * @property {string} id
 * @property {string} orderNo
 * @property {string} roundNo
 * @property {string} gameName
 * @property {string} platform
 * @property {string} platformType
 * @property {number} amount
 * @property {number} validBet
 * @property {number} winLoss
 * @property {number} payout
 * @property {string} orderTime
 * @property {string} payoutAt
 * @property {'settled'|'unsettled'|'revoked'} status
 * @property {string} statusText
 * @property {string} betText
 * @property {number} betAmount
 */

/**
 * @typedef {Object} GameRecordSummary
 * @property {number} orderCount
 * @property {number} betAmount
 * @property {number} validBet
 * @property {number} payoutAmount
 * @property {number} profitAmount
 */

/**
 * @param {unknown} status
 * @returns {'settled'|'unsettled'|'revoked'}
 */
export function normalizeGameSettleStatus(status) {
    const s = String(status ?? '').toLowerCase()
    if (
        s.includes('unsettle') ||
        s.includes('pending') ||
        s === '0' ||
        s === 'wait'
    ) {
        return 'unsettled'
    }
    if (s.includes('revoke') || s.includes('cancel') || s.includes('void')) {
        return 'revoked'
    }
    return 'settled'
}

const GAME_STATUS_TEXT = {
    settled: '已结算',
    unsettled: '未结算',
    revoked: '已撤销'
}

/**
 * @param {unknown} res
 * @returns {GameRecordRaw[]}
 */
export function pickGameRecordList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {unknown} summary
 * @returns {GameRecordSummary}
 */
export function mapGameRecordSummary(summary) {
    const s = summary && typeof summary === 'object' ? summary : {}
    return {
        orderCount: Number(s.order_count) || 0,
        betAmount: Number(s.bet_amount) || 0,
        validBet: Number(s.valid_bet) || 0,
        payoutAmount: Number(s.payout_amount) || 0,
        profitAmount: Number(s.profit_amount) || 0
    }
}

/**
 * @param {GameRecordRaw} raw
 * @returns {GameRecord}
 */
export function mapGameRecordFromApi(raw) {
    const status = normalizeGameSettleStatus(raw?.settle_status)
    const betAmount = Number(raw?.bet_amount)
    const validBet = Number(raw?.valid_bet)
    const payout = Number(raw?.payout_amount)
    const profit = Number(raw?.profit_amount)
    const platform = String(raw?.platform_name || '').trim()

    return {
        id: String(raw?.id ?? ''),
        orderNo: String(raw?.order_no || ''),
        roundNo: String(raw?.round_no || ''),
        gameName: String(raw?.game_name || '游戏'),
        platform,
        platformType: platform.toLowerCase(),
        amount: Number.isNaN(betAmount) ? 0 : betAmount,
        validBet: Number.isNaN(validBet) ? 0 : validBet,
        winLoss: Number.isNaN(profit) ? 0 : profit,
        payout: Number.isNaN(payout) ? 0 : payout,
        orderTime: String(raw?.bet_time || ''),
        payoutAt: String(raw?.payout_at || ''),
        status,
        statusText: GAME_STATUS_TEXT[status],
        betText: String(raw?.bet_content || ''),
        betAmount: Number.isNaN(betAmount) ? 0 : betAmount,
        resultText: '--'
    }
}

/**
 * 游戏记录列表
 * @param {GameRecordQuery} params
 */
export async function fetchGameRecords(params = {}) {
    const query = {
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
        start_time: params.start_time,
        end_time: params.end_time
    }
    if (params.platform_name) {
        query.platform_name = params.platform_name
    }

    const res = await request({
        url: '/record/game',
        method: 'get',
        params: query
    })

    const meta = res && typeof res === 'object' ? res : {}
    const list = pickGameRecordList(res).map(mapGameRecordFromApi)

    return {
        list,
        summary: mapGameRecordSummary(meta.summary),
        total: Number(meta.total) || 0,
        page: Number(meta.page) || params.page || 1,
        pageSize: Number(meta.page_size) || params.page_size || 20
    }
}

/**
 * @typedef {'today'|'yesterday'|'week'|'custom'} ProfitPeriod
 */

/**
 * @typedef {Object} RecordProfitQuery
 * @property {ProfitPeriod} [period]
 * @property {string} [start_time]
 * @property {string} [end_time]
 */

/**
 * @typedef {Object} RecordProfitSummary
 * @property {number} orderCount
 * @property {number} betAmount
 * @property {number} validBet
 * @property {number} payoutAmount
 * @property {number} profitAmount
 */

/**
 * @typedef {Object} RecordProfitPlatform
 * @property {string} platformName
 * @property {number} betAmount
 * @property {number} validBet
 * @property {number} payoutAmount
 * @property {number} profitAmount
 */

/**
 * @typedef {Object} RecordProfitResult
 * @property {string} period
 * @property {string} startTime
 * @property {string} endTime
 * @property {RecordProfitSummary} summary
 * @property {RecordProfitPlatform[]} platforms
 */

/**
 * @param {unknown} summary
 * @returns {RecordProfitSummary}
 */
export function mapRecordProfitSummary(summary) {
    const s = summary && typeof summary === 'object' ? summary : {}
    return {
        orderCount: Number(s.order_count) || 0,
        betAmount: Number(s.bet_amount) || 0,
        validBet: Number(s.valid_bet) || 0,
        payoutAmount: Number(s.payout_amount) || 0,
        profitAmount: Number(s.profit_amount) || 0
    }
}

/**
 * @param {unknown} raw
 * @returns {RecordProfitPlatform}
 */
export function mapRecordProfitPlatform(raw) {
    const item = raw && typeof raw === 'object' ? raw : {}
    return {
        platformName: String(item.platform_name || '未知平台'),
        betAmount: Number(item.bet_amount) || 0,
        validBet: Number(item.valid_bet) || 0,
        payoutAmount: Number(item.payout_amount) || 0,
        profitAmount: Number(item.profit_amount) || 0
    }
}

/**
 * UI 时间预设 → 接口 period / custom 时间
 * @param {string} preset
 * @returns {RecordProfitQuery}
 */
export function resolveProfitPeriodParams(preset) {
    if (preset === 'today' || preset === 'yesterday' || preset === 'week') {
        return { period: preset }
    }

    const now = new Date()
    let start = new Date(now)
    const end = new Date(now)

    if (preset === 'thisWeek') {
        const day = now.getDay() || 7
        start.setDate(now.getDate() - day + 1)
    } else if (preset === 'lastWeek') {
        const day = now.getDay() || 7
        end.setDate(now.getDate() - day)
        start.setDate(end.getDate() - 6)
    } else if (preset === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
    } else {
        return { period: 'today' }
    }

    return {
        period: 'custom',
        start_time: formatRecordDateTime(start, false),
        end_time: formatRecordDateTime(end, true)
    }
}

/**
 * 今日/周期盈亏
 * @param {RecordProfitQuery} params
 * @returns {Promise<RecordProfitResult>}
 */
export async function fetchRecordProfit(params = {}) {
    const res = await request({
        url: '/record/profit',
        method: 'get',
        params: {
            period: params.period ?? 'today',
            start_time: params.start_time,
            end_time: params.end_time
        }
    })

    const meta = res && typeof res === 'object' ? res : {}
    const platforms = Array.isArray(meta.platforms)
        ? meta.platforms.map(mapRecordProfitPlatform)
        : []

    return {
        period: String(meta.period || params.period || 'today'),
        startTime: String(meta.start_time || ''),
        endTime: String(meta.end_time || ''),
        summary: mapRecordProfitSummary(meta.summary),
        platforms
    }
}

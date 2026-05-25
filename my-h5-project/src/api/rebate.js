import request from '@/utils/request'
import { formatRecordDateTime } from '@/api/record'

/**
 * @typedef {Object} RebateRecordQuery
 * @property {number} [page]
 * @property {number} [page_size]
 * @property {string} [start_time]
 * @property {string} [end_time]
 */

/**
 * @typedef {Object} RebateRecordRaw
 * @property {number|string} id
 * @property {string} [settlement_period]
 * @property {number|string} [bet_count]
 * @property {number|string} [valid_bet_amount]
 * @property {number|string} [payout_amount]
 * @property {number|string} [realtime_ticket_rebate]
 * @property {number|string} [platform_rebate]
 * @property {number|string} [manual_adjustment]
 * @property {number|string} [rebate_total_amount]
 * @property {number|string} [status]
 * @property {string} [settlement_time]
 * @property {string} [release_time]
 */

/**
 * @typedef {Object} RebateRecordItem
 * @property {string} id
 * @property {string} settlementPeriod
 * @property {number} betCount
 * @property {number} validBetAmount
 * @property {number} payoutAmount
 * @property {number} realtimeTicketRebate
 * @property {number} platformRebate
 * @property {number} manualAdjustment
 * @property {number} rebateTotalAmount
 * @property {number|string|null} status
 * @property {string} settlementTime
 * @property {string} releaseTime
 * @property {string} dateKey
 * @property {string} timeText
 */

/**
 * @typedef {Object} RebateRecordGroup
 * @property {string} date
 * @property {number} totalValidBet
 * @property {number} totalRebate
 * @property {Array<{ id: string, time: string, validBet: number, rebate: number }>} items
 */

/**
 * @typedef {Object} RebateRecordSummary
 * @property {number} todayRebateAmount
 * @property {number} yesterdayValidBet
 * @property {number} settledValidBetRebate
 * @property {number} monthRebateAmount
 */

/**
 * @param {string} dateTime
 */
function extractDateKey(dateTime) {
    const text = String(dateTime || '').trim()
    if (!text) return ''
    const part = text.split(' ')[0]
    return part.replace(/\//g, '-')
}

/**
 * @param {string} dateTime
 */
function extractTimeText(dateTime) {
    const text = String(dateTime || '').trim()
    if (!text) return '--'
    const parts = text.split(' ')
    if (parts.length > 1) {
        return parts[1].slice(0, 8)
    }
    return text.length > 10 ? text.slice(11, 19) : text
}

/**
 * @param {unknown} res
 * @returns {RebateRecordRaw[]}
 */
export function pickRebateRecordList(res) {
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
 * @returns {RebateRecordSummary}
 */
export function mapRebateRecordSummary(summary) {
    const s = summary && typeof summary === 'object' ? summary : {}
    return {
        todayRebateAmount: Number(s.today_rebate_amount) || 0,
        yesterdayValidBet: Number(s.yesterday_valid_bet) || 0,
        settledValidBetRebate: Number(s.settled_valid_bet_rebate) || 0,
        monthRebateAmount: Number(s.month_rebate_amount) || 0
    }
}

/**
 * @param {RebateRecordRaw} raw
 * @returns {RebateRecordItem}
 */
export function mapRebateRecordFromApi(raw) {
    const settlementTime = String(raw?.settlement_time || '')
    const releaseTime = String(raw?.release_time || '')
    const period = String(raw?.settlement_period || '')
    const dateSource = settlementTime || releaseTime || period

    return {
        id: String(raw?.id ?? ''),
        settlementPeriod: period,
        betCount: Number(raw?.bet_count) || 0,
        validBetAmount: Number(raw?.valid_bet_amount) || 0,
        payoutAmount: Number(raw?.payout_amount) || 0,
        realtimeTicketRebate: Number(raw?.realtime_ticket_rebate) || 0,
        platformRebate: Number(raw?.platform_rebate) || 0,
        manualAdjustment: Number(raw?.manual_adjustment) || 0,
        rebateTotalAmount: Number(raw?.rebate_total_amount) || 0,
        status: raw?.status ?? null,
        settlementTime,
        releaseTime,
        dateKey: extractDateKey(dateSource),
        timeText: extractTimeText(settlementTime || releaseTime)
    }
}

/**
 * @param {RebateRecordItem[]} list
 * @returns {RebateRecordGroup[]}
 */
export function groupRebateRecordsByDate(list) {
    const map = new Map()

    for (const item of list) {
        const key = item.dateKey || '未知日期'
        if (!map.has(key)) {
            map.set(key, {
                date: key,
                totalValidBet: 0,
                totalRebate: 0,
                items: []
            })
        }
        const group = map.get(key)
        group.totalValidBet += item.validBetAmount
        group.totalRebate += item.rebateTotalAmount
        group.items.push({
            id: item.id,
            time: item.timeText,
            validBet: item.validBetAmount,
            rebate: item.rebateTotalAmount
        })
    }

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * @param {string} preset
 * @returns {{ start: Date, end: Date }}
 */
export function getRebateRangeByPreset(preset) {
    const anchor = new Date()
    let start = new Date(anchor)
    let end = new Date(anchor)

    if (preset === 'today') {
        return { start, end }
    }
    if (preset === 'yesterday') {
        start.setDate(anchor.getDate() - 1)
        end.setDate(anchor.getDate() - 1)
        return { start, end }
    }
    if (preset === 'week') {
        start.setDate(anchor.getDate() - 6)
        return { start, end }
    }
    if (preset === 'month') {
        start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
        return { start, end }
    }
    if (preset === 'lastMonth') {
        start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
        end = new Date(anchor.getFullYear(), anchor.getMonth(), 0)
        return { start, end }
    }

    return { start, end }
}

/**
 * @param {Date} start
 * @param {Date} end
 * @returns {RebateRecordQuery}
 */
export function buildRebateRecordQuery(start, end, page = 1, pageSize = 20) {
    return {
        page,
        page_size: pageSize,
        start_time: formatRecordDateTime(start, false),
        end_time: formatRecordDateTime(end, true)
    }
}

/**
 * 返水记录列表
 * @param {RebateRecordQuery} params
 */
export async function fetchRebateRecords(params = {}) {
    const res = await request({
        url: '/rebate/record',
        method: 'get',
        params: {
            page: params.page ?? 1,
            page_size: params.page_size ?? 20,
            start_time: params.start_time,
            end_time: params.end_time
        }
    })

    const meta = res && typeof res === 'object' ? res : {}
    const list = pickRebateRecordList(res).map(mapRebateRecordFromApi)

    return {
        list,
        groups: groupRebateRecordsByDate(list),
        summary: mapRebateRecordSummary(meta.summary),
        total: Number(meta.total) || 0,
        page: Number(meta.page) || params.page || 1,
        pageSize: Number(meta.page_size) || params.page_size || 20
    }
}

/**
 * @typedef {Object} RebateRuleItemRaw
 * @property {string} [type]
 * @property {number|string} [min_valid_bet]
 * @property {number|string} [rebate_rate]
 */

/**
 * @typedef {Object} RebateRuleCategoryRaw
 * @property {string} [category]
 * @property {RebateRuleItemRaw[]} [items]
 */

/**
 * @typedef {Object} RebateRuleItem
 * @property {string} type
 * @property {string} minValidBet
 * @property {string} rate
 */

/**
 * @typedef {Object} RebateRuleGroup
 * @property {string} type
 * @property {RebateRuleItem[]} children
 */

/**
 * @typedef {Object} RebateRuleCategory
 * @property {string} key
 * @property {string} label
 * @property {RebateRuleGroup[]} rows
 */

/**
 * @param {unknown} res
 * @returns {RebateRuleCategoryRaw[]}
 */
export function pickRebateRuleList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {number|string|null|undefined} value
 */
export function formatRebateMinValidBet(value) {
    if (value == null || value === '') {
        return '--'
    }
    const n = Number(value)
    if (Number.isNaN(n)) {
        return String(value)
    }
    if (n === 0) {
        return '¥0'
    }
    return `¥${n}`
}

/**
 * @param {number|string|null|undefined} value
 */
export function formatRebateRate(value) {
    if (value == null || value === '') {
        return '--'
    }
    const text = String(value).trim()
    if (text.includes('%')) {
        return text
    }
    const n = Number(text)
    if (Number.isNaN(n)) {
        return text
    }
    return `${n}%`
}

/**
 * @param {RebateRuleItemRaw} raw
 * @returns {RebateRuleItem}
 */
export function mapRebateRuleItemFromApi(raw) {
    return {
        type: String(raw?.type || '--'),
        minValidBet: formatRebateMinValidBet(raw?.min_valid_bet),
        rate: formatRebateRate(raw?.rebate_rate)
    }
}

/**
 * @param {RebateRuleCategoryRaw} raw
 * @param {number} [index]
 * @returns {RebateRuleCategory}
 */
export function mapRebateRuleCategoryFromApi(raw, index = 0) {
    const label = String(raw?.category || `分类${index + 1}`).trim()
    const key = label || `category-${index}`
    const items = Array.isArray(raw?.items) ? raw.items : []

    return {
        key,
        label,
        rows: [
            {
                type: label,
                children: items.map(mapRebateRuleItemFromApi)
            }
        ]
    }
}

/**
 * 返水待遇规则
 * @returns {Promise<RebateRuleCategory[]>}
 */
export async function fetchRebateRules() {
    const res = await request({
        url: '/rebate/rule',
        method: 'get'
    })
    return pickRebateRuleList(res).map(mapRebateRuleCategoryFromApi)
}

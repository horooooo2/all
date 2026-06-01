import request from '@/utils/request'

/**
 * @typedef {'btc28'|'jnd28'|'jndx28'|'twbg28'} LotteryCode
 */

/**
 * @typedef {'waiting'|'open'|'closed'} LotteryDisplayStatus
 */

/**
 * @typedef {Object} LotteryListItemRaw
 * @property {string} code
 * @property {string} [name]
 * @property {string} [issue]
 * @property {LotteryDisplayStatus} [status]
 * @property {number|string} [open_time]
 * @property {number|string} [close_time]
 * @property {number|string} [draw_time]
 * @property {number|string} [server_time]
 * @property {number|string} [sec]
 * @property {string} [last_issue]
 * @property {string} [last_result]
 * @property {number|string} [last_sum]
 * @property {number|string} [sort]
 */

/**
 * @typedef {Object} LotteryListItem
 * @property {string} code
 * @property {string} name
 * @property {string} gameKey
 * @property {string} issue
 * @property {LotteryDisplayStatus} status
 * @property {number} openTime
 * @property {number} closeTime
 * @property {number} drawTime
 * @property {number} serverTime
 * @property {number} sec
 * @property {string} lastIssue
 * @property {string} lastResult
 * @property {number|null} lastSum
 * @property {number} sort
 * @property {boolean} isWaiting
 */

/** 接口彩种编码 → 前端路由 gameId */
export const LOTTERY_CODE_TO_GAME_KEY = Object.freeze({
    btc28: 'btc',
    twbg28: 'tw28',
    jnd28: 'jnd28',
    jndx28: 'jndx28'
})

/** 前端路由 gameId → 接口彩种编码 */
export const LOTTERY_GAME_KEY_TO_CODE = Object.freeze({
    btc: 'btc28',
    tw28: 'twbg28',
    jnd28: 'jnd28',
    jndx28: 'jndx28'
})

/**
 * @typedef {Object} LotteryRoomRaw
 * @property {string} [room_code]
 * @property {number|string} [room_level]
 * @property {string} [name]
 * @property {number|string} [min_bet_amount]
 * @property {number|string} [max_bonus_amount]
 * @property {string} [odds_text]
 * @property {string} [description]
 * @property {number|string} [sort]
 * @property {number|string} [status]
 */

/**
 * @typedef {Object} LotteryRoom
 * @property {string} roomCode
 * @property {number} roomLevel
 * @property {string} name
 * @property {string} minBetAmount
 * @property {string} maxBonusAmount
 * @property {string} oddsText
 * @property {string} description
 * @property {number} sort
 * @property {number|string} status
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} LotteryRoomsBundle
 * @property {string} code
 * @property {LotteryRoom[]} list
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
function toTimestamp(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

/**
 * @param {unknown} value
 * @returns {number}
 */
function toNonNegativeInt(value) {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 0) {
        return 0
    }
    return Math.floor(n)
}

/**
 * @param {unknown} res
 * @returns {LotteryListItemRaw[]}
 */
function normalizeLotteryList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {LotteryListItemRaw} raw
 * @returns {LotteryListItem}
 */
export function mapLotteryListItem(raw) {
    const code = String(raw?.code || '').toLowerCase()
    const status = String(raw?.status || 'waiting').toLowerCase()

    return {
        code,
        name: raw?.name ?? '',
        gameKey: LOTTERY_CODE_TO_GAME_KEY[code] || code,
        issue: raw?.issue ?? '',
        status,
        openTime: toTimestamp(raw?.open_time),
        closeTime: toTimestamp(raw?.close_time),
        drawTime: toTimestamp(raw?.draw_time),
        serverTime: toTimestamp(raw?.server_time),
        sec: toNonNegativeInt(raw?.sec),
        lastIssue: raw?.last_issue ?? '',
        lastResult: raw?.last_result ?? '',
        lastSum: raw?.last_sum == null || raw?.last_sum === ''
            ? null
            : Number(raw.last_sum),
        sort: Number(raw?.sort) || 0,
        isWaiting: status === 'waiting',
        isOpen: status === 'open',
        isClosed: status === 'closed'
    }
}

/**
 * @typedef {Object} LotteryGameOption
 * @property {string} key
 * @property {string} code
 * @property {string} shortTitle
 * @property {string} label
 */

/**
 * @param {LotteryListItem} item
 * @returns {LotteryGameOption}
 */
export function mapLotteryToGameOption(item) {
    const name = item.name || ''
    const shortTitle = name.endsWith('28') ? name.slice(0, -2) : name

    return {
        key: item.gameKey,
        code: item.code,
        shortTitle: shortTitle || name,
        label: name
    }
}

/**
 * 首页彩种列表（四个 28 游戏模块）
 * @returns {Promise<LotteryListItem[]>}
 */
export function getLotteryList() {
    return request({
        url: '/lottery/list',
        method: 'get'
    }).then((res) => {
        return normalizeLotteryList(res)
            .map(mapLotteryListItem)
            .sort((a, b) => a.sort - b.sort)
    })
}

/**
 * @param {unknown} res
 * @returns {{ code: string, list: LotteryRoomRaw[] }}
 */
function normalizeLotteryRooms(res) {
    if (Array.isArray(res)) {
        return { code: '', list: res }
    }
    if (res && Array.isArray(res.list)) {
        return {
            code: String(res.code || '').toLowerCase(),
            list: res.list
        }
    }
    return { code: '', list: [] }
}

/**
 * @param {LotteryRoomRaw} raw
 * @returns {LotteryRoom}
 */
export function mapLotteryRoomItem(raw) {
    const roomLevel = Number(raw?.room_level) || 0
    const roomCode = String(raw?.room_code || roomLevel || '').toLowerCase()
    const status = raw?.status

    return {
        roomCode,
        roomLevel,
        name: raw?.name ?? '',
        minBetAmount: raw?.min_bet_amount ?? '',
        maxBonusAmount: raw?.max_bonus_amount ?? '',
        oddsText: raw?.odds_text ?? '',
        description: raw?.description ?? '',
        sort: Number(raw?.sort) || 0,
        status,
        isActive: Number(status) === 1 || String(status).toLowerCase() === 'open'
    }
}

/**
 * 彩票房间列表（房间选择页）
 * @param {string} code 彩种编码，如 btc28
 * @returns {Promise<LotteryRoomsBundle>}
 */
export function getLotteryRooms(code) {
    const lotteryCode = String(code || '').toLowerCase()
    return request({
        url: '/lottery/rooms',
        method: 'get',
        params: { code: lotteryCode }
    }).then((res) => {
        const { code: resCode, list } = normalizeLotteryRooms(res)
        return {
            code: resCode || lotteryCode,
            list: list
                .map(mapLotteryRoomItem)
                .sort((a, b) => a.sort - b.sort)
        }
    })
}

/**
 * @typedef {Object} LotteryRuleRaw
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [content]
 */

/**
 * @typedef {Object} LotteryRule
 * @property {string} code
 * @property {string} title
 * @property {string} content
 */

/**
 * @param {unknown} res
 * @returns {LotteryRuleRaw}
 */
function pickLotteryRule(res) {
    if (res && typeof res === 'object') {
        if (res.code != null || res.title != null || res.content != null) {
            return res
        }
        if (res.data && typeof res.data === 'object') {
            return res.data
        }
    }
    return {}
}

/**
 * @param {LotteryRuleRaw} raw
 * @returns {LotteryRule}
 */
export function mapLotteryRule(raw) {
    return {
        code: raw?.code ?? '',
        title: raw?.title ?? '',
        content: raw?.content ?? ''
    }
}

/**
 * 玩法规则
 * @param {string} code 彩种编码，如 btc28
 * @returns {Promise<LotteryRule>}
 */
export function getLotteryRule(code) {
    const lotteryCode = String(code || '').toLowerCase()
    return request({
        url: '/lottery/rule',
        method: 'get',
        params: { code: lotteryCode }
    }).then((res) => mapLotteryRule(pickLotteryRule(res)))
}

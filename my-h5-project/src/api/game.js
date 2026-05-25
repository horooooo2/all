import request from '@/utils/request'

/**
 * @typedef {Object} GameAwardRaw
 * @property {string} [nickname]
 * @property {string} [game_name]
 * @property {string} [game_icon_url]
 * @property {string} [game_type]
 * @property {number|string} [payout_amount]
 * @property {string} [payout_at]
 */

/**
 * @typedef {Object} GameAward
 * @property {string} nickname
 * @property {string} gameName
 * @property {string} gameIconUrl
 * @property {string} gameType
 * @property {number|string} payoutAmount
 * @property {string} payoutAt
 * @property {string} displayAmount
 */

/**
 * @typedef {Object} GameAwardBundle
 * @property {number|string} totalAmount
 * @property {string} displayTotalAmount
 * @property {GameAward[]} list
 */

/**
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPayoutAmount(amount) {
    const n = Number(amount)
    if (!Number.isFinite(n)) {
        return '¥0.00'
    }
    return `¥${n.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
}

/**
 * @param {unknown} res
 * @returns {Array<Record<string, unknown>>}
 */
function normalizeAwardList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {GameAwardRaw} raw
 * @returns {GameAward}
 */
export function mapGameAwardItem(raw) {
    const payoutAmount = raw.payout_amount ?? 0
    return {
        nickname: raw.nickname ?? '',
        gameName: raw.game_name ?? '',
        gameIconUrl: raw.game_icon_url || '',
        gameType: raw.game_type ?? '',
        payoutAmount,
        payoutAt: raw.payout_at ?? '',
        displayAmount: formatPayoutAmount(payoutAmount)
    }
}

/**
 * 近期大奖
 * @returns {Promise<GameAwardBundle>}
 */
export function getGameAwards() {
    return request({
        url: '/game/award',
        method: 'get'
    }).then((res) => {
        const totalAmount = res?.total_amount ?? 0
        const list = normalizeAwardList(res).map(mapGameAwardItem)
        return {
            totalAmount,
            displayTotalAmount: formatPayoutAmount(totalAmount),
            list
        }
    })
}

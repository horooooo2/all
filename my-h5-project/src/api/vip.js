import request from '@/utils/request'
import { getActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import {
    API_CACHE_KEYS,
    fetchWithApiLocalCache
} from '@/utils/apiLocalCache'

function getVipIndexScope() {
    try {
        if (getActivePinia()) {
            const id = useUserStore().userInfo?.id
            return id != null && id !== '' ? String(id) : ''
        }
    } catch {
        // ignore
    }
    return ''
}

/**
 * @typedef {Object} VipPrivilegeRaw
 * @property {string} [code]
 * @property {string} [name]
 * @property {string} [value]
 */

/**
 * @typedef {Object} VipRuleRaw
 * @property {number|string} [id]
 * @property {string} [level_name]
 * @property {number|string} [level_no]
 * @property {string} [currency_code]
 * @property {number|string} [upgrade_recharge_amount]
 * @property {number|string} [upgrade_valid_bet_amount]
 * @property {number|string} [retain_recharge_amount]
 * @property {number|string} [retain_valid_bet_amount]
 * @property {number|string} [upgrade_bonus]
 * @property {number|string} [daily_withdraw_amount]
 * @property {number|string} [withdraw_fee_rate]
 * @property {number|string} [daily_withdraw_count]
 */

/**
 * @typedef {Object} VipRule
 * @property {number|string} id
 * @property {string} levelName
 * @property {number} levelNo
 * @property {string} currencyCode
 * @property {number} upgradeRechargeAmount
 * @property {number} upgradeValidBetAmount
 * @property {number} retainRechargeAmount
 * @property {number} retainValidBetAmount
 * @property {number} upgradeBonus
 * @property {number} dailyWithdrawAmount
 * @property {number} withdrawFeeRate
 * @property {number} dailyWithdrawCount
 */

/**
 * @typedef {Object} VipIndexRaw
 * @property {number|string} [current_level]
 * @property {string} [current_level_name]
 * @property {number|string} [next_level]
 * @property {string} [next_level_name]
 * @property {number|string} [valid_bet_amount]
 * @property {number|string} [upgrade_valid_bet_amount]
 * @property {number|string} [progress_rate]
 * @property {string} [current_rule]
 * @property {string} [next_rule]
 * @property {VipPrivilegeRaw[]} [privileges]
 */

/**
 * @param {unknown} res
 * @returns {Array<Record<string, unknown>>}
 */
function normalizeVipList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && Array.isArray(res.list)) {
        return res.list
    }
    if (res && Array.isArray(res.rules)) {
        return res.rules
    }
    return []
}

/**
 * @param {number|string} amount
 * @returns {number}
 */
export function toVipNumber(amount) {
    const n = Number(amount)
    return Number.isFinite(n) ? n : 0
}

/**
 * @param {number|string} amount
 * @param {string} [currencyCode]
 * @param {{ prefix?: string, empty?: string }} [options]
 */
export function formatVipMoney(amount, currencyCode = 'CNY', options = {}) {
    const { prefix = '', empty = '—' } = options
    const n = toVipNumber(amount)
    if (n <= 0 && empty) {
        return empty
    }
    const text = n.toLocaleString('zh-CN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })
    const symbol = currencyCode === 'CNY' || !currencyCode ? '¥' : `${currencyCode} `
    return `${prefix}${symbol}${text}`
}

/** 表格门槛：有值时加 ≥ */
export function formatVipThreshold(amount, currencyCode = 'CNY') {
    const n = toVipNumber(amount)
    if (n <= 0) {
        return '—'
    }
    return formatVipMoney(amount, currencyCode, { prefix: '≥', empty: '' })
}

/**
 * @param {number|string} rate
 * @returns {string}
 */
export function formatVipFeeRate(rate) {
    const n = toVipNumber(rate)
    if (n <= 0) {
        return '—'
    }
    const percent = n > 0 && n <= 1 ? n * 100 : n
    return `${percent.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}%`
}

/**
 * @param {number|string} rate
 * @returns {number} 0–100
 */
export function normalizeVipProgressRate(rate) {
    const n = Number(rate)
    if (!Number.isFinite(n)) {
        return 0
    }
    if (n > 0 && n <= 1) {
        return Math.round(n * 100)
    }
    return Math.min(100, Math.max(0, Math.round(n)))
}

/**
 * @param {number|string} amount
 */
export function formatVipBetAmount(amount) {
    return toVipNumber(amount).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

/**
 * @param {VipRuleRaw} raw
 * @returns {VipRule}
 */
export function mapVipRuleItem(raw) {
    return {
        id: raw.id ?? '',
        levelName: raw.level_name ?? '',
        levelNo: toVipNumber(raw.level_no),
        currencyCode: raw.currency_code || 'CNY',
        upgradeRechargeAmount: toVipNumber(raw.upgrade_recharge_amount),
        upgradeValidBetAmount: toVipNumber(raw.upgrade_valid_bet_amount),
        retainRechargeAmount: toVipNumber(raw.retain_recharge_amount),
        retainValidBetAmount: toVipNumber(raw.retain_valid_bet_amount),
        upgradeBonus: toVipNumber(raw.upgrade_bonus),
        dailyWithdrawAmount: toVipNumber(raw.daily_withdraw_amount),
        withdrawFeeRate: toVipNumber(raw.withdraw_fee_rate),
        dailyWithdrawCount: toVipNumber(raw.daily_withdraw_count)
    }
}

/**
 * @param {VipIndexRaw} raw
 */
export function mapVipIndex(raw) {
    return {
        currentLevel: toVipNumber(raw.current_level),
        currentLevelName: raw.current_level_name ?? '',
        nextLevel: toVipNumber(raw.next_level),
        nextLevelName: raw.next_level_name ?? '',
        validBetAmount: toVipNumber(raw.valid_bet_amount),
        upgradeValidBetAmount: toVipNumber(raw.upgrade_valid_bet_amount),
        progressRate: normalizeVipProgressRate(raw.progress_rate),
        currentRule: raw.current_rule ?? '',
        nextRule: raw.next_rule ?? '',
        privileges: Array.isArray(raw.privileges)
            ? raw.privileges.map((item) => ({
                code: item.code ?? '',
                name: item.name ?? '',
                value: item.value != null ? String(item.value) : ''
            }))
            : []
    }
}

/**
 * 将接口 current_rule / next_rule（可能是 JSON 对象或字符串）转为展示文案
 * @param {unknown} ruleField
 * @param {VipRule} [fallbackRule]
 * @returns {string}
 */
export function resolveVipRuleHint(ruleField, fallbackRule) {
    if (ruleField == null || ruleField === '') {
        return buildVipUpgradeHint(fallbackRule)
    }
    if (typeof ruleField === 'object') {
        return buildVipUpgradeHint(mapVipRuleItem(ruleField))
    }
    if (typeof ruleField === 'string') {
        const text = ruleField.trim()
        if (!text) {
            return buildVipUpgradeHint(fallbackRule)
        }
        if (text.startsWith('{') || text.startsWith('[')) {
            try {
                const parsed = JSON.parse(text)
                if (parsed && typeof parsed === 'object') {
                    return buildVipUpgradeHint(mapVipRuleItem(parsed))
                }
            } catch {
                // 非 JSON，按普通文案展示
            }
        }
        return text
    }
    return buildVipUpgradeHint(fallbackRule)
}

/**
 * @param {VipRule} rule
 * @returns {string}
 */
export function buildVipUpgradeHint(rule) {
    if (!rule) {
        return ''
    }
    const parts = []
    if (rule.upgradeValidBetAmount > 0) {
        parts.push(`有效投注 ${formatVipMoney(rule.upgradeValidBetAmount, rule.currencyCode, { empty: '' })}`)
    }
    if (rule.upgradeRechargeAmount > 0) {
        parts.push(`累计充值 ${formatVipMoney(rule.upgradeRechargeAmount, rule.currencyCode, { empty: '' })}`)
    }
    const target = rule.levelName || `VIP${rule.levelNo}`
    if (!parts.length) {
        return ''
    }
    return `${parts.join('，')}，将升级成为 ${target}`
}

/**
 * VIP 规则列表
 * @returns {Promise<VipRule[]>}
 */
export function getVipRules() {
    return request({
        url: '/vip/rule',
        method: 'get'
    }).then((res) =>
        normalizeVipList(res)
            .map(mapVipRuleItem)
            .filter((item) => item.levelNo > 0)
            .sort((a, b) => a.levelNo - b.levelNo)
    )
}

/**
 * VIP 首页进度
 * @returns {Promise<ReturnType<typeof mapVipIndex>>}
 */
export function getVipIndex(options = {}) {
    const scope = options.scope ?? getVipIndexScope()
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.VIP_INDEX,
        () =>
            request({
                url: '/vip/index',
                method: 'get'
            }).then((res) => mapVipIndex(res || {})),
        { ...options, scope }
    )
}

/** @deprecated 使用 getVipRules */
export function getVipRule() {
    return getVipRules()
}

import request from '@/utils/request'
import {
    API_CACHE_KEYS,
    fetchWithApiLocalCache
} from '@/utils/apiLocalCache'

/** @typedef {'about'|'agreement'|'privacy'} LegalContentKind */

/** @type {Record<LegalContentKind, string>} */
export const LEGAL_CONTENT_CODE_BY_KIND = {
    about: 'about_us',
    agreement: 'user_agreement',
    privacy: 'privacy_policy'
}

/**
 * @typedef {'privacy_policy'|'user_agreement'|'about_us'} LegalContentCode
 */

/**
 * @typedef {Object} ContentDetailRaw
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [content]
 */

/**
 * @typedef {Object} ContentDetail
 * @property {string} code
 * @property {string} title
 * @property {string} content
 */

/**
 * @param {string} kind
 * @returns {LegalContentCode|''}
 */
export function resolveLegalContentCode(kind) {
    return LEGAL_CONTENT_CODE_BY_KIND[kind] || ''
}

/**
 * @param {unknown} res
 * @returns {ContentDetailRaw}
 */
export function pickContentDetail(res) {
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
 * @param {ContentDetailRaw} raw
 * @returns {ContentDetail}
 */
export function mapContentDetailFromApi(raw) {
    return {
        code: String(raw?.code ?? '').trim(),
        title: String(raw?.title ?? '').trim(),
        content: String(raw?.content ?? ''),
    }
}

/**
 * 内容详情（关于我们 / 用户协议 / 隐私政策）
 * @param {{ code: LegalContentCode|string }} params
 * @returns {Promise<ContentDetail>}
 */
export async function fetchContentDetail(params) {
    const res = await request({
        url: '/content/detail',
        method: 'get',
        params: {
            code: params.code
        }
    })
    return mapContentDetailFromApi(pickContentDetail(res))
}

/**
 * @typedef {Object} HelpItemRaw
 * @property {number|string} [id]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [content]
 * @property {number} [sort]
 */

/**
 * @typedef {Object} HelpItem
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} content
 * @property {number} sort
 */

/**
 * @param {unknown} res
 * @returns {HelpItemRaw[]}
 */
export function pickHelpList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {HelpItemRaw} raw
 * @returns {HelpItem}
 */
export function mapHelpItemFromApi(raw) {
    return {
        id: raw?.id ?? '',
        code: String(raw?.code ?? '').trim(),
        title: String(raw?.title ?? '').trim(),
        content: String(raw?.content ?? ''),
        sort: Number(raw?.sort) || 0
    }
}

/**
 * @typedef {Object} ServiceEntryRaw
 * @property {number|string} [id]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [image_url]
 * @property {string} [link_type]
 * @property {string} [link_value]
 * @property {number} [sort]
 */

/**
 * @typedef {Object} ServiceEntry
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} image
 * @property {string} linkType
 * @property {string} linkValue
 * @property {number} sort
 */

/**
 * @param {unknown} res
 * @returns {ServiceEntryRaw[]}
 */
export function pickServiceList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {ServiceEntryRaw} raw
 * @returns {ServiceEntry}
 */
export function mapServiceItemFromApi(raw) {
    return {
        id: raw?.id ?? '',
        code: String(raw?.code ?? '').trim(),
        title: String(raw?.title ?? '').trim(),
        image: String(raw?.image_url ?? '').trim(),
        linkType: raw?.link_type ?? '',
        linkValue: raw?.link_value ?? '',
        sort: Number(raw?.sort) || 0
    }
}

/**
 * 客服中心入口列表
 * @param {{ force?: boolean, ttlMs?: number }} [options]
 * @returns {Promise<ServiceEntry[]>}
 */
export function fetchServiceList(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.CONTENT_SERVICE,
        () =>
            request({
                url: '/content/service',
                method: 'get'
            }).then((res) =>
                pickServiceList(res)
                    .map(mapServiceItemFromApi)
                    .sort((a, b) => a.sort - b.sort)
            ),
        options
    )
}

/**
 * 帮助中心常见问题
 * @returns {Promise<HelpItem[]>}
 */
export async function fetchHelpList() {
    const res = await request({
        url: '/content/help',
        method: 'get'
    })
    return pickHelpList(res)
        .map(mapHelpItemFromApi)
        .sort((a, b) => a.sort - b.sort)
}

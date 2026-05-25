import request from '@/utils/request'
import {
    API_CACHE_KEYS,
    fetchWithApiLocalCache
} from '@/utils/apiLocalCache'

/**
 * @typedef {Object} ActivityRaw
 * @property {number|string} [id]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [image_url]
 * @property {string} [content]
 * @property {unknown} [extra]
 * @property {number} [sort]
 */

/**
 * @typedef {Object} ActivityItem
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} subtitle
 * @property {string} image
 * @property {string} content
 * @property {unknown} extra
 * @property {number} sort
 */

/**
 * @param {unknown} res
 * @returns {ActivityRaw[]}
 */
export function pickActivityList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && typeof res === 'object' && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {unknown} res
 * @returns {ActivityRaw}
 */
export function pickActivityDetail(res) {
    if (res && typeof res === 'object') {
        if (res.id != null || res.title != null || res.image_url != null) {
            return res
        }
        if (res.data && typeof res.data === 'object') {
            return res.data
        }
    }
    return {}
}

/**
 * @param {unknown} extra
 */
function normalizeActivityExtra(extra) {
    if (extra == null || extra === '') {
        return null
    }
    if (typeof extra === 'string') {
        const text = extra.trim()
        if (!text) {
            return null
        }
        try {
            return JSON.parse(text)
        } catch {
            return extra
        }
    }
    return extra
}

/**
 * @param {ActivityRaw} raw
 * @returns {ActivityItem}
 */
export function mapActivityFromApi(raw) {
    return {
        id: raw?.id ?? '',
        code: String(raw?.code ?? '').trim(),
        title: String(raw?.title ?? '').trim(),
        subtitle: String(raw?.subtitle ?? '').trim(),
        image: String(raw?.image_url ?? '').trim(),
        content: String(raw?.content ?? ''),
        extra: normalizeActivityExtra(raw?.extra),
        sort: Number(raw?.sort) || 0
    }
}

const sortBySortAsc = (a, b) => a.sort - b.sort

/**
 * 活动列表
 * @param {{ force?: boolean, ttlMs?: number }} [options]
 * @returns {Promise<ActivityItem[]>}
 */
export function fetchActivityList(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.ACTIVITY_LIST,
        () =>
            request({
                url: '/activity/list',
                method: 'get'
            }).then((res) =>
                pickActivityList(res)
                    .map(mapActivityFromApi)
                    .sort(sortBySortAsc)
            ),
        options
    )
}

/**
 * 活动详情
 * @param {{ id?: number|string }} [params]
 * @returns {Promise<ActivityItem>}
 */
export async function fetchActivityDetail(params = {}) {
    const res = await request({
        url: '/activity/detail',
        method: 'get',
        params: {
            id: params.id
        }
    })
    return mapActivityFromApi(pickActivityDetail(res))
}

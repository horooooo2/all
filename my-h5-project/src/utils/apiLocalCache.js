/**
 * 低频变更接口的 localStorage 持久缓存。
 * 仅对白名单 key 生效：首次请求后写入；未过期时刷新不重复请求；过期后自动重新拉取。
 */

const CACHE_PREFIX = 'h5_api_cache_v1:'

/** 默认缓存有效期：1 小时 */
export const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000

/** @type {Set<string>} */
const registeredKeys = new Set([
    'GET:/site/brand',
    'GET:/site/app',
    'GET:/site/banner',
    'GET:/site/notice',
    'GET:/site/link',
    'GET:/vip/index',
    'GET:/content/service',
    'GET:/activity/list'
])

/** @type {Map<string, Promise<unknown>>} */
const inflight = new Map()

/**
 * 预置缓存 key（method + path）
 */
export const API_CACHE_KEYS = {
    SITE_BRAND: 'GET:/site/brand',
    SITE_APP: 'GET:/site/app',
    SITE_BANNER: 'GET:/site/banner',
    SITE_NOTICE: 'GET:/site/notice',
    SITE_LINK: 'GET:/site/link',
    VIP_INDEX: 'GET:/vip/index',
    CONTENT_SERVICE: 'GET:/content/service',
    ACTIVITY_LIST: 'GET:/activity/list'
}

/**
 * @param {string} key
 * @param {string} [scope] 用户维度等，如 userId
 */
function resolveCacheKey(key, scope) {
    const s = scope != null && scope !== '' ? String(scope) : ''
    return s ? `${key}#${s}` : key
}

function isRegisteredCacheKey(key) {
    if (registeredKeys.has(key)) {
        return true
    }
    for (const base of registeredKeys) {
        if (key.startsWith(`${base}#`)) {
            return true
        }
    }
    return false
}

/**
 * @param {number} cachedAt
 * @param {number} ttlMs
 */
function isCacheExpired(cachedAt, ttlMs) {
    if (!cachedAt || !Number.isFinite(cachedAt)) {
        return true
    }
    return Date.now() - cachedAt > ttlMs
}

/**
 * 将接口加入 localStorage 缓存白名单
 * @param {string} key 建议 `GET:/path` 或 `POST:/path`
 */
export function registerApiLocalCache(key) {
    registeredKeys.add(key)
}

/**
 * @param {string} key
 */
function storageKey(key) {
    return `${CACHE_PREFIX}${key}`
}

/**
 * 读取缓存（无缓存、已过期或解析失败返回 null）
 * @param {string} key
 * @param {string} [scope]
 * @param {number} [ttlMs]
 * @returns {unknown|null}
 */
export function getApiLocalCache(key, scope, ttlMs = DEFAULT_CACHE_TTL_MS) {
    const cacheKey = resolveCacheKey(key, scope)
    if (!isRegisteredCacheKey(cacheKey)) {
        return null
    }
    try {
        const raw = localStorage.getItem(storageKey(cacheKey))
        if (!raw) {
            return null
        }
        const parsed = JSON.parse(raw)
        if (isCacheExpired(parsed?.cachedAt, ttlMs)) {
            localStorage.removeItem(storageKey(cacheKey))
            return null
        }
        return parsed?.data ?? null
    } catch {
        return null
    }
}

/**
 * @param {string} key
 * @param {unknown} data
 * @param {string} [scope]
 */
export function setApiLocalCache(key, data, scope) {
    const cacheKey = resolveCacheKey(key, scope)
    if (!isRegisteredCacheKey(cacheKey)) {
        return
    }
    try {
        localStorage.setItem(
            storageKey(cacheKey),
            JSON.stringify({
                data,
                cachedAt: Date.now()
            })
        )
    } catch {
        // ignore quota / private mode
    }
}

/**
 * @param {string} key
 * @param {string} [scope]
 */
export function removeApiLocalCache(key, scope) {
    const cacheKey = resolveCacheKey(key, scope)
    try {
        localStorage.removeItem(storageKey(cacheKey))
    } catch {
        // ignore
    }
}

/** 清空所有已注册接口的 localStorage 缓存（含带 scope 的条目） */
export function clearAllApiLocalCache() {
    try {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
            const fullKey = localStorage.key(i)
            if (!fullKey || !fullKey.startsWith(CACHE_PREFIX)) {
                continue
            }
            const cacheKey = fullKey.slice(CACHE_PREFIX.length)
            if (isRegisteredCacheKey(cacheKey)) {
                keysToRemove.push(fullKey)
            }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch {
        // ignore
    }
}

/**
 * @param {string} key 须在白名单内
 * @param {() => Promise<T>} fetcher 实际请求函数
 * @param {{ force?: boolean, scope?: string, ttlMs?: number }} [options]
 * @returns {Promise<T>}
 * @template T
 */
export async function fetchWithApiLocalCache(key, fetcher, options = {}) {
    const {
        force = false,
        scope = '',
        ttlMs = DEFAULT_CACHE_TTL_MS
    } = options
    const cacheKey = resolveCacheKey(key, scope)

    if (!isRegisteredCacheKey(cacheKey)) {
        return fetcher()
    }

    if (!force) {
        const cached = getApiLocalCache(key, scope, ttlMs)
        if (cached != null) {
            return cached
        }
    }

    if (inflight.has(cacheKey)) {
        return inflight.get(cacheKey)
    }

    const promise = Promise.resolve()
        .then(() => fetcher())
        .then((data) => {
            setApiLocalCache(key, data, scope)
            return data
        })
        .finally(() => {
            inflight.delete(cacheKey)
        })

    inflight.set(cacheKey, promise)
    return promise
}

/**
 * 根据 method、url 生成缓存 key
 * @param {string} method
 * @param {string} url
 */
export function buildApiCacheKey(method, url) {
    const path = String(url || '').split('?')[0]
    return `${String(method || 'get').toUpperCase()}:${path}`
}

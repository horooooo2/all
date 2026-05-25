import request from '@/utils/request'
import {
    API_CACHE_KEYS,
    fetchWithApiLocalCache
} from '@/utils/apiLocalCache'

/**
 * @typedef {Object} SiteBrandRaw
 * @property {string} name
 * @property {string} logo_url
 * @property {string} [slogan]
 */

/**
 * @typedef {Object} SiteBrand
 * @property {string} name
 * @property {string} logoUrl
 * @property {string} slogan
 */

/**
 * @typedef {Object} SiteBannerRaw
 * @property {number|string} id
 * @property {string} [type]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} image_url
 * @property {string} [content]
 * @property {string} [link_type]
 * @property {string} [link_value]
 * @property {object|string} [extra]
 * @property {number} [sort]
 * @property {string} [start_at]
 * @property {string} [end_at]
 */

/**
 * @typedef {Object} SiteBanner
 * @property {number|string} id
 * @property {string} [type]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} image
 * @property {string} [content]
 * @property {string} linkType
 * @property {string} linkValue
 * @property {object|string|null} extra
 * @property {number} sort
 * @property {string} [startAt]
 * @property {string} [endAt]
 */

/**
 * @param {SiteBannerRaw} raw
 * @returns {SiteBanner}
 */
export function mapBannerItem(raw) {
    return {
        id: raw.id,
        type: raw.type ?? '',
        code: raw.code ?? '',
        title: raw.title ?? '',
        subtitle: raw.subtitle ?? '',
        image: raw.image_url || '',
        content: raw.content ?? '',
        linkType: raw.link_type ?? '',
        linkValue: raw.link_value ?? '',
        extra: raw.extra ?? null,
        sort: Number(raw.sort) || 0,
        startAt: raw.start_at,
        endAt: raw.end_at
    }
}

/**
 * @typedef {Object} SiteNoticeRaw
 * @property {number|string} id
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [subtitle]
 * @property {string} [content]
 * @property {number} [sort]
 * @property {string} [start_at]
 * @property {string} [end_at]
 */

/**
 * @typedef {Object} SiteNotice
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} subtitle
 * @property {string} content
 * @property {number} sort
 * @property {string} [startAt]
 * @property {string} [endAt]
 */

/**
 * @param {unknown} res
 * @returns {Array<unknown>}
 */
function normalizeSiteList(res) {
    if (Array.isArray(res)) {
        return res
    }
    if (res && Array.isArray(res.list)) {
        return res.list
    }
    return []
}

/**
 * @param {SiteNoticeRaw} raw
 * @returns {SiteNotice}
 */
export function mapNoticeItem(raw) {
    return {
        id: raw.id,
        code: raw.code ?? '',
        title: raw.title ?? '',
        subtitle: raw.subtitle ?? '',
        content: raw.content ?? '',
        sort: Number(raw.sort) || 0,
        startAt: raw.start_at,
        endAt: raw.end_at
    }
}

/** 公告跑马灯展示文案 */
export function getNoticeDisplayText(notice) {
    if (notice.title && notice.subtitle) {
        return `${notice.title} - ${notice.subtitle}`
    }
    return notice.title || notice.subtitle || notice.content || ''
}

/**
 * @param {SiteBrandRaw} raw
 * @returns {SiteBrand}
 */
export function mapSiteBrand(raw) {
    return {
        name: raw.name ?? '',
        logoUrl: raw.logo_url || '',
        slogan: raw.slogan ?? ''
    }
}

/**
 * 品牌信息
 * @returns {Promise<SiteBrand>}
 */
export function getSiteBrand(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.SITE_BRAND,
        () =>
            request({
                url: '/site/brand',
                method: 'get'
            }).then((res) => mapSiteBrand(res || {})),
        options
    )
}

/**
 * 首页轮播图
 * @returns {Promise<SiteBanner[]>}
 */
export function getSiteBanners(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.SITE_BANNER,
        () =>
            request({
                url: '/site/banner',
                method: 'get'
            }).then((res) =>
                normalizeSiteList(res)
                    .map(mapBannerItem)
                    .sort((a, b) => a.sort - b.sort)
            ),
        options
    )
}

/**
 * 首页公告
 * @returns {Promise<SiteNotice[]>}
 */
export function getSiteNotices(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.SITE_NOTICE,
        () =>
            request({
                url: '/site/notice',
                method: 'get'
            }).then((res) =>
                normalizeSiteList(res)
                    .map(mapNoticeItem)
                    .sort((a, b) => a.sort - b.sort)
            ),
        options
    )
}

/**
 * @typedef {Object} SiteCommunityRaw
 * @property {number|string} id
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} image_url
 * @property {string} [link_type]
 * @property {string} [link_value]
 * @property {number} [sort]
 */

/**
 * @typedef {Object} SiteCommunity
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} image
 * @property {string} linkType
 * @property {string} linkValue
 * @property {number} sort
 */

/**
 * @typedef {Object} SiteProviderRaw
 * @property {number|string} id
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} image_url
 * @property {number} [sort]
 */

/**
 * @typedef {Object} SiteProvider
 * @property {number|string} id
 * @property {string} code
 * @property {string} title
 * @property {string} image
 * @property {number} sort
 */

/**
 * @typedef {Object} SiteServiceLinkRaw
 * @property {number|string} id
 * @property {string} [type]
 * @property {string} [code]
 * @property {string} [title]
 * @property {string} [image_url]
 * @property {string} [link_type]
 * @property {string} [link_value]
 * @property {number} [sort]
 */

/**
 * @typedef {Object} SiteServiceLink
 * @property {number|string} id
 * @property {string} type
 * @property {string} code
 * @property {string} title
 * @property {string} image
 * @property {string} linkType
 * @property {string} linkValue
 * @property {number} sort
 */

/**
 * @typedef {Object} SiteLinkBundle
 * @property {SiteCommunity[]} communities
 * @property {SiteProvider[]} providers
 * @property {SiteServiceLink[]} serviceLinks
 */

/**
 * @param {unknown} res
 * @param {string} key
 * @returns {Array<Record<string, unknown>>}
 */
function normalizeSiteLinkGroup(res, key) {
    if (!res || typeof res !== 'object') {
        return []
    }
    const list = res[key]
    return Array.isArray(list) ? list : []
}

/**
 * @param {SiteCommunityRaw} raw
 * @returns {SiteCommunity}
 */
export function mapCommunityItem(raw) {
    return {
        id: raw.id,
        code: raw.code ?? '',
        title: raw.title ?? '',
        image: raw.image_url || '',
        linkType: raw.link_type ?? '',
        linkValue: raw.link_value ?? '',
        sort: Number(raw.sort) || 0
    }
}

/**
 * @param {SiteProviderRaw} raw
 * @returns {SiteProvider}
 */
export function mapProviderItem(raw) {
    return {
        id: raw.id,
        code: raw.code ?? '',
        title: raw.title ?? '',
        image: raw.image_url || '',
        sort: Number(raw.sort) || 0
    }
}

/**
 * @param {SiteServiceLinkRaw} raw
 * @returns {SiteServiceLink}
 */
export function mapServiceLinkItem(raw) {
    return {
        id: raw.id,
        type: raw.type ?? '',
        code: raw.code ?? '',
        title: raw.title ?? '',
        image: raw.image_url || '',
        linkType: raw.link_type ?? '',
        linkValue: raw.link_value ?? '',
        sort: Number(raw.sort) || 0
    }
}

const sortBySort = (a, b) => a.sort - b.sort

/**
 * 社区 / 合作供应商 / 服务中心链接
 * @returns {Promise<SiteLinkBundle>}
 */
export function getSiteLinks(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.SITE_LINK,
        () =>
            request({
                url: '/site/link',
                method: 'get'
            }).then((res) => ({
                communities: normalizeSiteLinkGroup(res, 'communities')
                    .map(mapCommunityItem)
                    .sort(sortBySort),
                providers: normalizeSiteLinkGroup(res, 'providers')
                    .map(mapProviderItem)
                    .sort(sortBySort),
                serviceLinks: normalizeSiteLinkGroup(res, 'service_links')
                    .map(mapServiceLinkItem)
                    .sort(sortBySort)
            })),
        options
    )
}

/**
 * @typedef {Object} SiteAppRaw
 * @property {string} [logo_name]
 * @property {string} [logo_url]
 * @property {string} [banner_name]
 * @property {string} [banner_url]
 * @property {string} [link_type]
 * @property {string} [link_value]
 * @property {number|string|boolean} [status]
 */

/**
 * @typedef {Object} SiteApp
 * @property {string} logoName
 * @property {string} logoUrl
 * @property {string} bannerName
 * @property {string} bannerUrl
 * @property {string} linkType
 * @property {string} linkValue
 * @property {number|string|boolean|null} status
 */

/**
 * @param {SiteAppRaw} raw
 * @returns {SiteApp}
 */
export function mapSiteApp(raw) {
    return {
        logoName: raw.logo_name ?? '',
        logoUrl: raw.logo_url || '',
        bannerName: raw.banner_name ?? '',
        bannerUrl: raw.banner_url || '',
        linkType: raw.link_type ?? '',
        linkValue: raw.link_value ?? '',
        status: raw.status ?? null
    }
}

/** 接口 status 为启用时可展示下载条 */
export function isSiteAppEnabled(status) {
    if (status === undefined || status === null || status === '') {
        return true
    }
    if (status === true || status === 1 || status === '1') {
        return true
    }
    if (typeof status === 'string') {
        const key = status.toLowerCase()
        return key === 'enabled' || key === 'active' || key === 'on'
    }
    return false
}

/**
 * APP 下载配置
 * @returns {Promise<SiteApp>}
 */
export function getSiteApp(options) {
    return fetchWithApiLocalCache(
        API_CACHE_KEYS.SITE_APP,
        () =>
            request({
                url: '/site/app',
                method: 'get'
            }).then((res) => mapSiteApp(res || {})),
        options
    )
}

/**
 * 站点配置跳转（轮播 / 社区 / 服务链接等共用）
 * @param {import('vue-router').Router} router
 * @param {{ linkType?: string, linkValue?: string }} item
 * @returns {boolean} 是否已处理跳转
 */
export function navigateSiteLink(router, item) {
    const linkType = String(item?.linkType || '').toLowerCase()
    const linkValue = String(item?.linkValue || '').trim()
    if (!linkValue) {
        return false
    }

    if (
        linkType === 'url' ||
        linkType === 'external' ||
        linkType === 'h5' ||
        /^https?:\/\//i.test(linkValue)
    ) {
        window.location.href = linkValue
        return true
    }

    if (linkValue.startsWith('/')) {
        router.push(linkValue)
        return true
    }

    return false
}

/** 服务链接 code → 路由 name 兜底 */
const SERVICE_ROUTE_BY_CODE = {
    privacy_policy: 'privacyPolicy',
    privacy: 'privacyPolicy',
    user_agreement: 'userAgreement',
    user: 'userAgreement',
    help_center: 'helpCenter',
    help: 'helpCenter',
    about_us: 'aboutUs',
    about: 'aboutUs'
}

/**
 * @param {import('vue-router').Router} router
 * @param {{ linkType?: string, linkValue?: string, code?: string }} item
 */
export function navigateServiceLink(router, item) {
    if (navigateSiteLink(router, item)) {
        return true
    }
    const code = String(item?.code || '').toLowerCase()
    const routeName = SERVICE_ROUTE_BY_CODE[code]
    if (routeName) {
        router.push({ name: routeName })
        return true
    }
    return false
}

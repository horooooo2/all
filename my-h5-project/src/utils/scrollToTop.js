function isScrollable(el) {
    const { overflowY } = getComputedStyle(el)
    return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
}

/** 将应用主滚动容器、window 及页面内可滚动区域复位到顶部 */
export function scrollToTop() {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const appEl = document.getElementById('app')
    if (!appEl) return

    appEl.scrollTop = 0
    appEl.querySelectorAll('*').forEach((el) => {
        if (el.scrollTop > 0 && isScrollable(el)) {
            el.scrollTop = 0
        }
    })
}

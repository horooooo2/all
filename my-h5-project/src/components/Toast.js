import { h, render } from 'vue'
import TopToast from './TopToast.vue'

const container = document.createElement('div')
document.body.appendChild(container)

let timer = null
let vnode = null
let currentPayload = null
const EXIT_DURATION = 260

const mountToast = (show) => {
    if (!currentPayload) return
    vnode = h(TopToast, {
        show,
        type: currentPayload.type,
        message: currentPayload.message
    })
    render(vnode, container)
}

const clearToast = () => {
    render(null, container)
    vnode = null
    currentPayload = null
}

const hideWithAnimation = () => {
    if (!currentPayload) return
    if (timer) clearTimeout(timer)
    mountToast(false)
    timer = setTimeout(() => {
        clearToast()
    }, EXIT_DURATION)
}

const showToast = (type, message, duration = 3000) => {
    if (timer) clearTimeout(timer)
    currentPayload = { type, message }
    mountToast(true)

    if (type !== 'loading') {
        timer = setTimeout(() => {
            hideWithAnimation()
        }, duration)
    }
}

const hideToast = () => {
    hideWithAnimation()
}

/** 仅关闭 loading，避免误关掉刚展示的 error/success 提示 */
const hideLoading = () => {
    if (currentPayload?.type === 'loading') {
        hideWithAnimation()
    }
}

export const toast = {
    success: (msg, duration) => showToast('success', msg, duration),
    error: (msg, duration) => showToast('error', msg, duration),
    warning: (msg, duration) => showToast('warning', msg, duration),
    loading: (msg) => showToast('loading', msg),
    hide: hideToast,
    hideLoading
}

export default toast

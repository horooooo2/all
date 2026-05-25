import {
    getSessionJSON,
    setSessionJSON,
    removeSessionItem,
    migrateLocalToSession
} from '@/utils/sessionCache'

const STORAGE_KEY = 'login_remember_v1'

function readRememberData() {
    migrateLocalToSession(STORAGE_KEY)
    const data = getSessionJSON(STORAGE_KEY, {}) || {}
    return {
        remember: !!data.remember,
        username: typeof data.username === 'string' ? data.username : '',
        password: typeof data.password === 'string' ? data.password : ''
    }
}

/** @returns {{ remember: boolean, username: string, password: string }} */
export function getLoginRemember() {
    return readRememberData()
}

/**
 * @param {{ remember: boolean, username: string, password: string }} payload
 */
export function saveLoginRemember(payload) {
    setSessionJSON(STORAGE_KEY, {
        remember: !!payload.remember,
        username: payload.username || '',
        password: payload.password || ''
    })
}

/** 仅用户主动取消「记住密码」时调用；退出/改密等不调用 */
export function clearLoginRemember() {
    removeSessionItem(STORAGE_KEY)
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

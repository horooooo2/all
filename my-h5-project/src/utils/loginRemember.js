const STORAGE_KEY = 'login_remember_v1'

function getLocalJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        if (raw == null) {
            return fallback
        }
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

function setLocalJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // ignore quota / private mode
    }
}

function removeLocal(key) {
    try {
        localStorage.removeItem(key)
    } catch {
        // ignore
    }
}

/** 旧版 sessionStorage 数据迁移到 localStorage（一次性） */
function migrateSessionToLocal(key) {
    try {
        if (localStorage.getItem(key) != null) {
            return
        }
        const legacy = sessionStorage.getItem(key)
        if (legacy != null) {
            localStorage.setItem(key, legacy)
            sessionStorage.removeItem(key)
        }
    } catch {
        // ignore
    }
}

function readRememberData() {
    migrateSessionToLocal(STORAGE_KEY)
    const data = getLocalJSON(STORAGE_KEY, {}) || {}
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
    setLocalJSON(STORAGE_KEY, {
        remember: !!payload.remember,
        username: payload.username || '',
        password: payload.password || ''
    })
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

/** 仅用户主动取消「记住密码」时调用；退出/改密等不调用 */
export function clearLoginRemember() {
    removeLocal(STORAGE_KEY)
    try {
        sessionStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

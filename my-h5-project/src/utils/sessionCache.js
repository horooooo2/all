/**
 * 会话级缓存：关闭标签页后自动清空。
 * 登录态（Pinia persist）、语言偏好等需跨会话持久化的数据仍用 localStorage。
 * 「记住密码」见 loginRemember.js（localStorage，跨标签页保留）。
 */

function getStorage() {
    if (typeof sessionStorage === 'undefined') {
        return null
    }
    return sessionStorage
}

export function getSessionItem(key) {
    try {
        return getStorage()?.getItem(key) ?? null
    } catch {
        return null
    }
}

export function setSessionItem(key, value) {
    try {
        getStorage()?.setItem(key, value)
    } catch {
        // ignore quota / private mode
    }
}

export function removeSessionItem(key) {
    try {
        getStorage()?.removeItem(key)
    } catch {
        // ignore
    }
}

export function getSessionJSON(key, fallback = null) {
    const raw = getSessionItem(key)
    if (raw == null) {
        return fallback
    }
    try {
        return JSON.parse(raw)
    } catch {
        return fallback
    }
}

export function setSessionJSON(key, value) {
    setSessionItem(key, JSON.stringify(value))
}

/** 旧版 localStorage 数据迁移到 sessionStorage（同标签页仅执行一次） */
export function migrateLocalToSession(key) {
    try {
        if (getSessionItem(key) != null) {
            return
        }
        const legacy = localStorage.getItem(key)
        if (legacy != null) {
            setSessionItem(key, legacy)
            localStorage.removeItem(key)
        }
    } catch {
        // ignore
    }
}

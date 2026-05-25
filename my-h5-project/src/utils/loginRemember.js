const STORAGE_KEY = 'login_remember_v1'

function safeParse(json, fallback) {
    try {
        return JSON.parse(json)
    } catch (e) {
        return fallback
    }
}

/** @returns {{ remember: boolean, username: string, password: string }} */
export function getLoginRemember() {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = safeParse(raw || '{}', {})
    return {
        remember: !!data.remember,
        username: typeof data.username === 'string' ? data.username : '',
        password: typeof data.password === 'string' ? data.password : ''
    }
}

/**
 * @param {{ remember: boolean, username: string, password: string }} payload
 */
export function saveLoginRemember(payload) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            remember: !!payload.remember,
            username: payload.username || '',
            password: payload.password || ''
        })
    )
}

export function clearLoginRemember() {
    localStorage.removeItem(STORAGE_KEY)
}

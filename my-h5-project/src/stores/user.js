import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getProfile,
    logoutAccount,
    mapAuthToUserSession,
    mapProfileToUserInfo
} from '@/api/auth'

export const useUserStore = defineStore('user', () => {
    const token = ref('')
    const tokenType = ref('')
    const expiresIn = ref(0)
    const expireAt = ref(0)
    const userInfo = ref(null)
    const isLogin = computed(() => !!token.value)

    const applyAuthSession = (authResult) => {
        const session = mapAuthToUserSession(authResult)
        token.value = session.token
        tokenType.value = session.tokenType
        expiresIn.value = session.expiresIn
        expireAt.value = session.expireAt
        userInfo.value = session.userInfo
        return session
    }

    const setProfile = (profile) => {
        userInfo.value = mapProfileToUserInfo(profile)
    }

    /** 拉取并更新用户资料 */
    const fetchProfile = async () => {
        const profile = await getProfile()
        setProfile(profile)
        return userInfo.value
    }

    /**
     * 登录/注册成功后：写入 token，再请求 profile 落库
     * @param {import('@/api/auth').AuthResult} authResult
     */
    const establishSession = async (authResult) => {
        applyAuthSession(authResult)
        try {
            await fetchProfile()
        } catch (e) {
            clearSession()
            throw e
        }
    }

    /** @deprecated 请使用 establishSession */
    const login = async (userData) => {
        if (userData?.token && userData?.userInfo) {
            token.value = userData.token
            tokenType.value = userData.tokenType ?? ''
            expiresIn.value = userData.expiresIn ?? 0
            expireAt.value = userData.expireAt ?? 0
            userInfo.value = userData.userInfo
            return
        }
        await establishSession(userData)
    }

    const clearSession = () => {
        token.value = ''
        tokenType.value = ''
        expiresIn.value = 0
        expireAt.value = 0
        userInfo.value = null
    }

    /**
     * 退出登录：先调接口，再清空本地（接口失败仍清空本地）
     * @param {{ remote?: boolean }} [options]
     */
    const logout = async (options = {}) => {
        const { remote = true } = options
        if (remote && token.value) {
            try {
                await logoutAccount()
            } catch (_) {
                // 忽略远端失败，保证用户可退出
            }
        }
        clearSession()
    }

    return {
        token,
        tokenType,
        expiresIn,
        expireAt,
        userInfo,
        isLogin,
        applyAuthSession,
        setProfile,
        fetchProfile,
        establishSession,
        login,
        clearSession,
        logout
    }
}, {
    persist: true
})

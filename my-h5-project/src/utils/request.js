import axios from "axios"
import router from "@/router"
import { getActivePinia } from "pinia"
import { useUserStore } from "@/stores/user"
import toast from "@/components/Toast"
import { API_BASE_URL, API_ACCEPT_LANGUAGE } from "@/config/env"

const SUCCESS_CODES = [0, 200]
/** 业务 code：登录态失效，需重新登录 */
const AUTH_EXPIRED_BUSINESS_CODE = 40101

const PAGE_404_NAMES = new Set(["error404", "notFound404"])

function isOn404Page() {
    return PAGE_404_NAMES.has(router.currentRoute.value.name)
}

function isOn500Page() {
    return router.currentRoute.value.name === "serverError500"
}

/** HTTP 状态码：进入 404 / 500 全屏页（不重复跳转） */
function goErrorPageFromHttpStatus(status) {
    if (status === 404) {
        if (!isOn404Page()) {
            router.replace({ name: "error404" })
        }
        return true
    }
    if (status === 500) {
        if (!isOn500Page()) {
            router.replace({ name: "serverError500" })
        }
        return true
    }
    return false
}

/** 业务 code（与 HTTP 一致时）：进入对应异常页 */
function goErrorPageFromBusinessCode(code) {
    const n = Number(code)
    if (Number.isNaN(n)) {
        return false
    }
    if (n === 404) {
        if (!isOn404Page()) {
            router.replace({ name: "error404" })
        }
        return true
    }
    if (n === 500) {
        if (!isOn500Page()) {
            router.replace({ name: "serverError500" })
        }
        return true
    }
    return false
}

const getToken = () => {
    try {
        if (getActivePinia()) {
            const store = useUserStore()
            return store.token || ""
        }
    } catch (e) {
        // ignore and fall back to localStorage
    }

    try {
        const raw = localStorage.getItem("user")
        if (raw) {
            const parsed = JSON.parse(raw)
            // pinia-plugin-persistedstate 默认结构 { token, userInfo, ... }
            return parsed?.token || parsed?.state?.token || ""
        }
    } catch (e) {
        // ignore parse errors
    }

    return ""
}

const forceLogout = () => {
    try {
        if (getActivePinia()) {
            const store = useUserStore()
            store.clearSession()
        } else {
            localStorage.removeItem("user")
            localStorage.removeItem("token")
        }
    } catch (e) {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
    }
}

function isAuthExpiredBusinessCode(code) {
    return Number(code) === AUTH_EXPIRED_BUSINESS_CODE
}

/** 登录态失效：清会话并跳转登录页 */
function handleAuthExpired(message = "登录已过期，请重新登录") {
    forceLogout()
    if (router.currentRoute.value.name !== "login") {
        router.replace({
            path: "/login",
            query: { redirect: router.currentRoute.value.fullPath }
        })
    }
    toast.warning(message)
}

const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        "Accept-Language": API_ACCEPT_LANGUAGE
    }
})

request.interceptors.request.use(
    (config) => {
        const token = getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

request.interceptors.response.use(
    (response) => {
        const res = response.data
        // 认证 / 用户资料等直出结构（无业务 code 包裹）
        if (res && res.code === undefined) {
            if (res.token || (res.id != null && res.username != null)) {
                return res
            }
            // 如 logout 返回空对象 {}
            if (Object.keys(res).length === 0) {
                return res
            }
            // 如轮播图 { list: [...] }、VIP 规则等直出数组
            if (Array.isArray(res)) {
                return res
            }
            if (Array.isArray(res.list)) {
                return res
            }
            if (Array.isArray(res.rules) || Array.isArray(res.items)) {
                return res
            }
            // 如品牌信息 { name, logo_url, slogan }
            if (res.logo_url != null || (res.name != null && !res.list && !res.token)) {
                return res
            }
            // 如站点链接 { communities, providers, service_links }
            if (
                Array.isArray(res.communities) ||
                Array.isArray(res.providers) ||
                Array.isArray(res.service_links)
            ) {
                return res
            }
            // 如 VIP 首页 { current_level, privileges, ... }
            if (
                res.current_level != null ||
                res.current_level_name != null ||
                Array.isArray(res.privileges)
            ) {
                return res
            }
        }
        if (res && SUCCESS_CODES.includes(res.code)) {
            // 优先返回业务 data，否则返回原始数据结构
            return res.data !== undefined ? res.data : res
        }

        // 业务 code 40101：登录态失效
        if (res && isAuthExpiredBusinessCode(res.code)) {
            const msg = res?.message || res?.msg || "登录已过期，请重新登录"
            handleAuthExpired(msg)
            return Promise.reject(new Error(msg))
        }

        // 业务层返回 404 / 500：跳转全屏异常页（不再 Toast）
        if (res && goErrorPageFromBusinessCode(res.code)) {
            const msg = res?.message || res?.msg || "请求失败"
            return Promise.reject(new Error(msg))
        }

        const msg = res?.message || res?.msg || "请求失败"
        toast.error(msg)
        return Promise.reject(new Error(msg))
    },
    (error) => {
        let message = "网络异常"

        if (error.code === "ECONNABORTED") {
            message = "请求超时，请稍后重试"
        } else if (!error.response) {
            message = "无法连接服务器，请检查网络"
        } else {
            const { status, data } = error.response

            // HTTP 401 或 body 内业务 code 40101：跳转登录
            if (status === 401 || isAuthExpiredBusinessCode(data?.code)) {
                message = data?.message || data?.msg || "登录已过期，请重新登录"
                handleAuthExpired(message)
                return Promise.reject(error)
            }

            // HTTP 404 / 500：全屏异常页，不 Toast
            if (goErrorPageFromHttpStatus(status)) {
                return Promise.reject(error)
            }

            switch (status) {
                case 400:
                    message = data?.message || "请求参数错误"
                    break
                case 403:
                    message = "没有访问权限"
                    break
                case 429:
                    message = "请求过于频繁，请稍后再试"
                    break
                default:
                    message = data?.message || "请求失败"
                    break
            }
        }

        toast.error(message)
        return Promise.reject(error)
    }
)

export default request

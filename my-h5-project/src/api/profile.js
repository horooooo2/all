import request from '@/utils/request'
import { mapProfileToUserInfo } from '@/api/auth'

/**
 * @typedef {Object} ProfileUpdateParams
 * @property {string} [nickname]
 * @property {string} [avatar_url]
 * @property {number|string} [gender]
 * @property {string} [birthday]
 * @property {string} [real_name]
 * @property {string} [contact]
 */

/**
 * 个人资料详情（需登录）
 * @returns {Promise<import('@/api/auth').UserProfile>}
 */
export function getProfileDetail() {
    return request({
        url: '/profile/detail',
        method: 'get'
    })
}

/**
 * @param {ProfileUpdateParams} data
 * @returns {Record<string, unknown>}
 */
export function buildProfileUpdatePayload(data = {}) {
    const payload = {}

    if (data.nickname != null && String(data.nickname).trim() !== '') {
        payload.nickname = String(data.nickname).trim()
    }
    if (data.avatar_url != null && String(data.avatar_url).trim() !== '') {
        payload.avatar_url = String(data.avatar_url).trim()
    }
    if (data.gender != null && data.gender !== '' && !Number.isNaN(Number(data.gender))) {
        payload.gender = Number(data.gender)
    }
    if (data.birthday != null && String(data.birthday).trim() !== '') {
        payload.birthday = String(data.birthday).trim()
    }
    if (data.real_name != null && String(data.real_name).trim() !== '') {
        payload.real_name = String(data.real_name).trim()
    }
    if (data.contact != null && String(data.contact).trim() !== '') {
        payload.contact = String(data.contact).trim()
    }

    return payload
}

/**
 * 修改个人资料（字段均为可选，只提交有值的项）
 * @param {ProfileUpdateParams} data
 */
export function updateProfile(data) {
    const payload = buildProfileUpdatePayload(data)
    if (!Object.keys(payload).length) {
        return Promise.reject(new Error('无有效更新字段'))
    }
    return request({
        url: '/profile/update',
        method: 'post',
        data: payload
    })
}

/**
 * 若更新接口已返回完整资料则直接映射，否则再请求 detail
 * @param {unknown} res
 */
export function mapProfileFromUpdateResponse(res) {
    if (!res || typeof res !== 'object') {
        return null
    }
    const raw = /** @type {Record<string, unknown>} */ (res)
    const profile =
        raw.id != null || raw.username != null
            ? raw
            : raw.data && typeof raw.data === 'object'
              ? raw.data
              : null
    if (!profile || typeof profile !== 'object') {
        return null
    }
    const p = /** @type {Record<string, unknown>} */ (profile)
    if (p.id == null && p.username == null) {
        return null
    }
    return mapProfileToUserInfo(p)
}

/**
 * 更新后拉取最新详情并映射为 userInfo 结构
 * @param {ProfileUpdateParams} data
 */
export async function updateProfileAndFetch(data) {
    const res = await updateProfile(data)
    const mapped = mapProfileFromUpdateResponse(res)
    if (mapped) {
        return mapped
    }
    const detail = await getProfileDetail()
    return mapProfileToUserInfo(detail || {})
}

/**
 * @typedef {Object} PasswordChangeParams
 * @property {string} old_password
 * @property {string} new_password
 * @property {string} confirm_password
 */

/**
 * @param {{ oldPassword?: string, newPassword: string, confirmPassword: string, requireOld?: boolean }} input
 * @returns {PasswordChangeParams}
 */
export function buildPasswordChangePayload(input) {
    const { oldPassword = '', newPassword, confirmPassword, requireOld = true } = input
    const old_password = String(oldPassword).trim()
    const new_password = String(newPassword).trim()
    const confirm_password = String(confirmPassword).trim()

    if (requireOld && !old_password) {
        throw new Error('请输入旧密码')
    }
    if (!new_password) {
        throw new Error('请输入新密码')
    }
    if (!confirm_password) {
        throw new Error('请确认新密码')
    }
    if (new_password !== confirm_password) {
        throw new Error('两次输入的新密码不一致')
    }

    return {
        old_password,
        new_password,
        confirm_password
    }
}

/** 修改登录密码 */
export function changeLoginPassword(data) {
    return request({
        url: '/profile/password/login',
        method: 'post',
        data
    })
}

/** 修改取款密码 */
export function changeWithdrawPassword(data) {
    return request({
        url: '/profile/password/withdraw',
        method: 'post',
        data
    })
}

/**
 * @param {unknown} res
 * @returns {string}
 */
export function pickAvatarUrlFromUpload(res) {
    if (!res || typeof res !== 'object') {
        return ''
    }
    const r = /** @type {Record<string, unknown>} */ (res)
    const nested = r.data && typeof r.data === 'object' ? r.data : null
    const url =
        r.avatar_url ||
        r.url ||
        r.image_url ||
        (nested && (nested.avatar_url || nested.url || nested.image_url))
    return url ? String(url) : ''
}

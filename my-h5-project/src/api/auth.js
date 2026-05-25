import request from '@/utils/request'
import { APP_DEVICE } from '@/config/env'

/**
 * @typedef {Object} AuthIdentity
 * @property {number|string} id
 * @property {string} username
 * @property {string} nickname
 * @property {number} vip_level
 */

/**
 * @typedef {Object} AuthResult
 * @property {string} token
 * @property {string} token_type
 * @property {number} expires_in
 * @property {number} expire_at
 * @property {AuthIdentity} identity
 */

/**
 * @typedef {Object} RegisterParams
 * @property {string} username
 * @property {string} password
 * @property {string} confirm_password
 * @property {string} [invite_code]
 * @property {string} [device]
 * @property {string} contact
 */

/**
 * @typedef {Object} LoginParams
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} UserProfile
 * @property {number|string} id
 * @property {string} username
 * @property {string} nickname
 * @property {string} avatar_url
 * @property {number} vip_level
 * @property {number|string} balance
 * @property {number|string} frozen_balance
 * @property {number|string} diamond_balance
 * @property {number} gender
 * @property {string} birthday
 * @property {string} real_name
 * @property {string} contact
 * @property {number|string} status
 * @property {string} last_login_at
 * @property {number} token_expire_at
 */

/**
 * 用户登录
 * @param {LoginParams} params
 * @returns {Promise<AuthResult>}
 */
export function login(params) {
    return request({
        url: '/auth/login',
        method: 'post',
        data: {
            username: params.username,
            password: params.password
        }
    })
}

/**
 * 用户注册
 * @param {RegisterParams} params
 * @returns {Promise<AuthResult>}
 */
export function register(params) {
    return request({
        url: '/auth/register',
        method: 'post',
        data: {
            username: params.username,
            password: params.password,
            confirm_password: params.confirm_password,
            invite_code: params.invite_code ?? '',
            device: params.device ?? APP_DEVICE,
            contact: params.contact
        }
    })
}

/**
 * 退出登录（需已登录）
 */
export function logoutAccount() {
    return request({
        url: '/auth/logout',
        method: 'post',
        data: {}
    })
}

/**
 * 获取当前用户资料（需已登录）
 * @returns {Promise<UserProfile>}
 */
export function getProfile() {
    return request({
        url: '/auth/profile',
        method: 'get'
    })
}

/**
 * 将 profile 接口返回值映射为 userStore.userInfo
 * @param {UserProfile} profile
 */
export function mapProfileToUserInfo(profile) {
    const balance = Number(profile.balance)
    const frozenBalance = Number(profile.frozen_balance)
    const diamondBalance = Number(profile.diamond_balance)

    return {
        id: profile.id,
        username: profile.username,
        nickname: profile.nickname,
        name: profile.nickname || profile.username,
        avatar: profile.avatar_url || '',
        vipLevel: profile.vip_level,
        balance: Number.isNaN(balance) ? profile.balance : balance,
        frozenBalance: Number.isNaN(frozenBalance) ? profile.frozen_balance : frozenBalance,
        diamondBalance: Number.isNaN(diamondBalance) ? profile.diamond_balance : diamondBalance,
        gender: profile.gender,
        birthday: profile.birthday,
        realName: profile.real_name,
        contact: profile.contact,
        status: profile.status,
        lastLoginAt: profile.last_login_at,
        tokenExpireAt: profile.token_expire_at
    }
}

/**
 * 将登录/注册接口返回值映射为 userStore 会话字段
 * @param {AuthResult} result
 */
export function mapAuthToUserSession(result) {
    const identity = result.identity || {}
    return {
        token: result.token,
        tokenType: result.token_type,
        expiresIn: result.expires_in,
        expireAt: result.expire_at,
        userInfo: {
            id: identity.id,
            username: identity.username,
            nickname: identity.nickname,
            vipLevel: identity.vip_level,
            name: identity.nickname || identity.username
        }
    }
}

/** @deprecated 使用 mapAuthToUserSession */
export const mapRegisterToUserSession = mapAuthToUserSession

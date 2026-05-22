import request from '@/utils/request'

/** 用户协议（与后台 content 模块查询接口一致，可按实际后端路径调整） */
export function getUserAgreement() {
    return request({
        url: '/content/userAgreementGet',
        method: 'get'
    })
}

/** 关于我们 */
export function getAboutUs() {
    return request({
        url: '/content/aboutUsGet',
        method: 'get'
    })
}

/** 隐私政策 */
export function getPrivacyPolicy() {
    return request({
        url: '/content/privacyPolicyGet',
        method: 'get'
    })
}

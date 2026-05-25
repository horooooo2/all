import { getProfile } from '@/api/auth'

/** 获取当前用户资料（与 /auth/profile 一致） */
export function getUserInfo() {
    return getProfile()
}

export function updateUserProfile(data) {
    return request({
        url: '/user/profile',
        method: 'put',
        data
    })
}

export function uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)

    return request({
        url: '/user/avatar',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

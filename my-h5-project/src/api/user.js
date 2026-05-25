import request from '@/utils/request'
import { getProfileDetail } from '@/api/profile'

/** 获取当前用户资料详情 */
export function getUserInfo() {
    return getProfileDetail()
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

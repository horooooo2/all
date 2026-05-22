import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data
    })
}

export function getUserInfo() {
    return request({
        url: '/user/info',
        method: 'get'
    })
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

/**
 * 环境与外部服务地址统一配置
 * 业务代码只从此文件读取域名/地址，勿在页面或组件里写死 URL
 */

/** HTTP 接口根地址 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** WebSocket 根地址（未接入时留空） */
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || ''

/** OSS / CDN 资源根地址 */
export const OSS_BASE_URL = import.meta.env.VITE_OSS_BASE_URL || ''

/** H5 分享/推广页根地址 */
export const H5_SHARE_BASE_URL = import.meta.env.VITE_H5_SHARE_BASE_URL || ''

/** 请求头 Accept-Language */
export const API_ACCEPT_LANGUAGE = import.meta.env.VITE_API_ACCEPT_LANGUAGE || 'zh_CN'

/** 客户端设备标识（注册、登录等接口的 device 字段） */
export const APP_DEVICE = import.meta.env.VITE_APP_DEVICE || 'h5'

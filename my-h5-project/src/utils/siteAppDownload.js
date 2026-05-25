import { getSiteApp, isSiteAppEnabled } from '@/api/site'

/**
 * 打开 APP 下载链接（与 AppDownloadBar「立即下载」一致）
 * @returns {Promise<boolean>} 是否已跳转
 */
export async function openSiteAppDownload() {
    try {
        const data = await getSiteApp()
        if (!isSiteAppEnabled(data.status)) {
            return false
        }
        const url = String(data.linkValue || '').trim()
        if (!url) {
            return false
        }
        window.open(url, '_blank', 'noopener,noreferrer')
        return true
    } catch {
        return false
    }
}

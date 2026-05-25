/**
 * 复制文本到剪贴板（兼容无 Clipboard API 的环境）
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text) {
    const value = String(text ?? '').trim()
    if (!value) {
        return false
    }

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(value)
            return true
        }
    } catch {
        // fallback below
    }

    try {
        const input = document.createElement('textarea')
        input.value = value
        input.setAttribute('readonly', '')
        input.style.position = 'fixed'
        input.style.left = '-9999px'
        input.style.top = '0'
        document.body.appendChild(input)
        input.select()
        input.setSelectionRange(0, value.length)
        const ok = document.execCommand('copy')
        document.body.removeChild(input)
        return ok
    } catch {
        return false
    }
}

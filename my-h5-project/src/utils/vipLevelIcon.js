import iconVipFallback from '@/assets/icon_vip_00.svg'

const vipLevelIconModules = import.meta.glob('@/assets/icon_vip_*.svg', {
    eager: true,
    import: 'default'
})

/**
 * 根据 VIP 等级返回对应图标（icon_vip_00.svg ~ icon_vip_10.svg）
 * @param {number|string|null|undefined} level
 */
export function getVipLevelIcon(level) {
    const n = Number(level)
    const safeLevel = Number.isNaN(n) ? 0 : Math.max(0, Math.min(10, Math.floor(n)))
    const pad = String(safeLevel).padStart(2, '0')
    const suffix = `/icon_vip_${pad}.svg`
    const key = Object.keys(vipLevelIconModules).find((path) =>
        path.replace(/\\/g, '/').endsWith(suffix)
    )
    return key ? vipLevelIconModules[key] : iconVipFallback
}

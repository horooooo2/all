import { getSessionJSON, setSessionJSON } from '@/utils/sessionCache'

const DETAIL_KEY = 'activity_detail_v1'

/** @param {import('@/api/activity').ActivityItem} item */
export function setActivityCache(item) {
    setSessionJSON(DETAIL_KEY, item)
}

/** @param {string|number} id */
export function getActivityCache(id) {
    const item = getSessionJSON(DETAIL_KEY, null)
    if (!item || String(item.id) !== String(id)) {
        return null
    }
    return item
}

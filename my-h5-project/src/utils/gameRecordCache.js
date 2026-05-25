import { getSessionJSON, setSessionJSON } from '@/utils/sessionCache'

const DETAIL_KEY = 'game_record_detail_v1'

/** @param {import('@/api/record').GameRecord} item */
export function setGameRecordCache(item) {
    setSessionJSON(DETAIL_KEY, item)
}

/** @param {string|number} id */
export function getGameRecordCache(id) {
    const item = getSessionJSON(DETAIL_KEY, null)
    if (!item || String(item.id) !== String(id)) {
        return null
    }
    return item
}

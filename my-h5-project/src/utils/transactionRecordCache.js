import { getSessionJSON, setSessionJSON } from '@/utils/sessionCache'

const DETAIL_KEY = 'transaction_record_detail_v1'

/** @param {import('@/api/record').TransactionRecord} item */
export function setTransactionRecordCache(item) {
    setSessionJSON(DETAIL_KEY, item)
}

/** @param {string|number} id */
export function getTransactionRecordCache(id) {
    const item = getSessionJSON(DETAIL_KEY, null)
    if (!item || String(item.id) !== String(id)) {
        return null
    }
    return item
}

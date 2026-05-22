/** 号码多选；中文项在同一玩法内单选（可取消） */

export function isLhcPickActive(set, item) {
  const id = item.type === 'num' ? item.value : item.key
  return set?.has(id) ?? false
}

export function toggleLhcPick(set, item, textKeys = []) {
  const next = new Set(set)
  const id = item.type === 'num' ? item.value : item.key

  if (item.type === 'num') {
    if (next.has(id)) next.delete(id)
    else next.add(id)
  } else if (next.has(id)) {
    next.delete(id)
  } else {
    textKeys.forEach((k) => next.delete(k))
    next.add(id)
  }

  return next
}

export function initModePickSets(modeKeys) {
  return Object.fromEntries(modeKeys.map((k) => [k, new Set()]))
}

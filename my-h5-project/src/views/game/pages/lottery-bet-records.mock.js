const pad2 = (n) => String(n).padStart(2, '0')

const ORDER_NOS = {
  n1: '17754697880066131',
  n2: '17754697880066130',
  n3: '17754697880066132',
  n4: '17754697880066133',
  c1: '17754697880066140'
}

function attachDetail(row, overrides = {}) {
  const prefix = row.betPrefix.replace(/#$/, '')
  const betTitle = overrides.betTitle ?? `特码整合-${prefix}#${row.betPick}`
  const betContent = overrides.betContent ?? `${row.betPick}@${row.betStake}`
  return {
    ...row,
    multiplier: overrides.multiplier ?? '1',
    odds: overrides.odds ?? '2.8',
    drawNumbers: overrides.drawNumbers ?? '1、4、3',
    drawTime: overrides.drawTime ?? row.time,
    orderTime: row.time,
    account: overrides.account ?? '2200159',
    orderNo: overrides.orderNo ?? ORDER_NOS[row.id] ?? '17754697880066130',
    betTitle,
    betContent
  }
}

export function buildDemoRows() {
  const d = new Date()
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())
  const dayStr = `${y}-${m}-${day}`
  const issueBase = `${y}${m}${day}`
  const t = (hh, mm, ss) => `${dayStr} ${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`

  const normal = [
    attachDetail({
      id: 'n1',
      issue: `${issueBase}001`,
      statusKey: 'pending',
      statusText: '未开奖',
      betPrefix: '大小单双#',
      betPick: '大',
      betStake: '1',
      bonus: '0',
      rebate: '0.004',
      time: t(0, 24, 31)
    }, { drawNumbers: '—、—、—', odds: '2.8' }),
    attachDetail({
      id: 'n2',
      issue: `${issueBase}002`,
      statusKey: 'loss',
      statusText: '未中奖',
      betPrefix: '大小单双#',
      betPick: '小',
      betStake: '1',
      bonus: '1',
      rebate: '0.004',
      time: t(0, 25, 10)
    }, { drawNumbers: '1、4、3' }),
    attachDetail({
      id: 'n3',
      issue: `${issueBase}003`,
      statusKey: 'win',
      statusText: '已中奖',
      betPrefix: '大小单双#',
      betPick: '大',
      betStake: '1',
      bonus: '9.8',
      rebate: '0.004',
      time: t(0, 26, 2)
    }, { drawNumbers: '2、1、0' }),
    attachDetail({
      id: 'n4',
      issue: `${issueBase}004`,
      statusKey: 'canceled',
      statusText: '已撤单',
      betPrefix: '大小单双#',
      betPick: '单',
      betStake: '1',
      bonus: '0',
      rebate: '0',
      time: t(0, 27, 0)
    }, { drawNumbers: '—、—、—' })
  ]

  const chase = [
    attachDetail({
      id: 'c1',
      issue: `${issueBase}005`,
      statusKey: 'pending',
      statusText: '未开奖',
      betPrefix: '追号#',
      betPick: '大',
      betStake: '2',
      bonus: '0',
      rebate: '0',
      time: t(1, 0, 0)
    }, { betTitle: '特码整合-追号#', betContent: '大@2', drawNumbers: '—、—、—' })
  ]

  return { normal, chase }
}

let _bundle
export function getDemoBetRecordsBundle() {
  if (_bundle) return _bundle
  const { normal, chase } = buildDemoRows()
  const byId = new Map()
  ;[...normal, ...chase].forEach((r) => byId.set(r.id, r))
  _bundle = { normal, chase, byId }
  return _bundle
}

export function getDemoBetOrderById(id) {
  if (!id) return null
  return getDemoBetRecordsBundle().byId.get(String(id)) ?? null
}

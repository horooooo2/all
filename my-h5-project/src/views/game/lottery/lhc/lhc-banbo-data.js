import { getWaveClass } from './lhc-number-color.js'

const ALL_NUMS = Object.freeze(Array.from({ length: 49 }, (_, i) => i + 1))

function waveKey(n) {
  const c = getWaveClass(n)
  if (c === 'is-red') return 'red'
  if (c === 'is-blue') return 'blue'
  return 'green'
}

function isOdd(n) {
  return n % 2 === 1
}

/** 半波大小14 小，259 */
function isBig(n) {
  return n >= 25
}

function isSmall(n) {
  return n <= 24
}

/**
 * @param {'red'|'blue'|'green'} wave
 * @param {'odd'|'even'|'big'|'small'} kind
 */
function numsFor(wave, kind) {
  return ALL_NUMS.filter((n) => {
    if (waveKey(n) !== wave) return false
    if (kind === 'odd') return isOdd(n)
    if (kind === 'even') return !isOdd(n)
    if (kind === 'big') return isBig(n)
    return isSmall(n)
  })
}

/** 半波玩法行（顺序与设计稿一致） */
export const BANBO_OPTIONS = Object.freeze([
  { key: 'r-odd', label: '红单', wave: 'red', kind: 'odd', odds: '5.61', nums: numsFor('red', 'odd') },
  { key: 'r-even', label: '红双', wave: 'red', kind: 'even', odds: '5.61', nums: numsFor('red', 'even') },
  { key: 'r-big', label: '红大', wave: 'red', kind: 'big', odds: '5.61', nums: numsFor('red', 'big') },
  { key: 'r-small', label: '红小', wave: 'red', kind: 'small', odds: '5.61', nums: numsFor('red', 'small') },
  { key: 'g-odd', label: '绿单', wave: 'green', kind: 'odd', odds: '5.61', nums: numsFor('green', 'odd') },
  { key: 'g-even', label: '绿双', wave: 'green', kind: 'even', odds: '5.61', nums: numsFor('green', 'even') },
  { key: 'g-big', label: '绿大', wave: 'green', kind: 'big', odds: '5.61', nums: numsFor('green', 'big') },
  { key: 'g-small', label: '绿小', wave: 'green', kind: 'small', odds: '5.61', nums: numsFor('green', 'small') },
  { key: 'b-odd', label: '蓝单', wave: 'blue', kind: 'odd', odds: '5.61', nums: numsFor('blue', 'odd') },
  { key: 'b-even', label: '蓝双', wave: 'blue', kind: 'even', odds: '5.61', nums: numsFor('blue', 'even') },
  { key: 'b-big', label: '蓝大', wave: 'blue', kind: 'big', odds: '5.61', nums: numsFor('blue', 'big') },
  { key: 'b-small', label: '蓝小', wave: 'blue', kind: 'small', odds: '5.61', nums: numsFor('blue', 'small') }
])

import fs from 'fs'
import path from 'path'

const root = path.join(process.cwd(), 'src')
const exts = new Set(['.vue', '.js', '.less'])
const bad = []

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const st = fs.statSync(full)
    if (st.isDirectory()) walk(full)
    else if (exts.has(path.extname(name))) {
      const text = fs.readFileSync(full, 'utf8')
      if (text.includes('\uFFFD')) bad.push(path.relative(root, full))
    }
  }
}

walk(root)
console.log('FFFD files:', bad.length)
bad.forEach((f) => console.log(f))

const deposit = fs.readFileSync('src/views/tabbar/recharge/DepositPage.vue', 'utf8')
const withdraw = fs.readFileSync('src/views/tabbar/recharge/WithdrawPage.vue', 'utf8')
const ph = (s) => s.match(/placeholder="([^"]+)"/)?.[1]
console.log('deposit placeholder:', ph(deposit))
console.log('withdraw placeholder:', ph(withdraw))

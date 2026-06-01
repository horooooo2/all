const xlsx = require('node-xlsx')
const fs = require('fs')
const path = require('path')

const excelPath = path.join(__dirname, '../语言包.xlsx')
console.log('📖 读取Excel文件:', excelPath)

/** Excel 单元格可能是 number / boolean / Date，统一转成可 trim 的字符串 */
function cellText(val) {
  if (val == null || val === '') return ''
  if (val instanceof Date) return val.toISOString()
  return String(val).trim()
}

function esc(str) {
  return cellText(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')
}

const sheets = xlsx.parse(excelPath)

let zhData = ''
let zhtData = ''
let enData = ''

sheets.forEach((sheet) => {
  const rows = sheet.data || []
  for (let rowId = 0; rowId < rows.length; rowId++) {
    if (rowId === 0) continue // 跳过表头

    const row = rows[rowId] || []
    const key = cellText(row[0])
    if (!key) continue

    // row[0]=key  row[1]=zh  row[2]=zht(可选)  row[3]=en(可选)
    const zh = cellText(row[1]) || key
    const zht = cellText(row[2]) || zh
    const en = cellText(row[3]) || zh

    zhData += `\n  "${esc(key)}": "${esc(zh)}",`
    zhtData += `\n  "${esc(key)}": "${esc(zht)}",`
    enData += `\n  "${esc(key)}": "${esc(en)}",`
  }
})

const localesDir = path.join(__dirname, '../src/locales')
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true })
}

const writeFile = (filename, data) => {
  if (!data) {
    console.log(`⚠️ ${filename} 数据为空`)
    return
  }
  const content = `export default {${data.slice(0, -1)}\n}\n`
  fs.writeFileSync(path.join(localesDir, filename), content)
  console.log(`✅ ${filename} 生成完成`)
}

writeFile('zh.js', zhData)
writeFile('zht.js', zhtData)
writeFile('en.js', enData)

console.log('🎉 三语言包生成完毕！')

const xlsx = require("node-xlsx");
const fs = require("fs");
const path = require("path");

const excelPath = path.join(__dirname, '../语言包.xlsx');
console.log('📖 读取Excel文件:', excelPath);

const sheets = xlsx.parse(excelPath);

let zhData = "", zhtData = "", enData = "";

// 处理数据
sheets.forEach(function(sheet) {
    for (let rowId in sheet["data"]) {
        if (rowId != 0) { // 跳过表头行
            const row = sheet["data"][rowId];
            const key = row[0]?.trim();  // 第0列: key

            if (key) {
                // ✅ 根据你的表头调整索引
                // row[0] = key
                // row[1] = zh (简体)
                // row[2] = zht (繁体)
                // row[3] = en (英文)

                zhData += `\n  "${key}": "${row[1] ? row[1].trim() : key}",`;    // 第1列: zh
                zhtData += `\n  "${key}": "${row[2] ? row[2].trim() : key}",`;   // 第2列: zht
                enData += `\n  "${key}": "${row[3] ? row[3].trim() : key}",`;    // 第3列: en
            }
        }
    }
});

// 检查key重复
function hasDuplicateKey(str, data) {
    const reg = new RegExp(`"${str}":`, "g");
    if (data.search(reg) === -1) return true;
    console.log("⚠️ key重复:", str);
    return false;
}

// 确保目录存在
const localesDir = path.join(__dirname, '../src/locales');
if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
}

// 写入文件
const writeFile = (filename, data) => {
    if (!data) {
        console.log(`⚠️ ${filename} 数据为空`);
        return;
    }
    const content = `export default {${data.slice(0, -1)}\n}\n`;
    fs.writeFileSync(path.join(localesDir, filename), content);
    console.log(`✅ ${filename} 生成完成`);
};

writeFile('zh.js', zhData);
writeFile('zht.js', zhtData);
writeFile('en.js', enData);

console.log('🎉 三语言包生成完毕！');

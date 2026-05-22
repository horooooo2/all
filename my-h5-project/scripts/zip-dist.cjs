/**
 * 将 dist 目录打成单个 zip，规避面板「单次最多上传 100 个文件」限制。
 * 用法：npm run build:zip
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const distDir = path.join(root, 'dist')
const outFile = path.join(root, 'dist-deploy.zip')

if (!fs.existsSync(distDir)) {
    console.error('[zip-dist] 未找到 dist 目录，请先执行 npm run build')
    process.exit(1)
}

if (fs.existsSync(outFile)) {
    fs.unlinkSync(outFile)
}

if (process.platform === 'win32') {
    const distGlob = path.join(distDir, '*').replace(/'/g, "''")
    const dest = outFile.replace(/'/g, "''")
    execSync(
        `powershell -NoProfile -Command "Compress-Archive -Path '${distGlob}' -DestinationPath '${dest}' -Force"`,
        { stdio: 'inherit', cwd: root }
    )
} else {
    execSync(`zip -r "${outFile}" .`, { stdio: 'inherit', cwd: distDir })
}

const sizeMb = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2)
console.log(`[zip-dist] 已生成 ${outFile} (${sizeMb} MB)`)
console.log('[zip-dist] 上传到面板后解压到网站根目录（解压后根目录应有 index.html）')

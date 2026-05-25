import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assetsDir = path.join(root, 'src', 'assets')

function walk(dir) {
    const out = []
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name)
        if (ent.isDirectory()) out.push(...walk(p))
        else out.push(p)
    }
    return out
}

const exts = new Set(['.vue', '.js', '.ts', '.less', '.css', '.html', '.json', '.mdc'])
const sourceFiles = []

function walkSrc(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name)
        if (ent.isDirectory()) {
            if (['node_modules', 'dist'].includes(ent.name)) continue
            walkSrc(p)
        } else if (exts.has(path.extname(ent.name))) {
            sourceFiles.push(p)
        }
    }
}

walkSrc(path.join(root, 'src'))
for (const f of ['index.html', 'vite.config.js']) {
    const p = path.join(root, f)
    if (fs.existsSync(p)) sourceFiles.push(p)
}

const sources = sourceFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
const assets = walk(assetsDir)
const unused = []
const used = []

for (const file of assets) {
    const rel = path.relative(root, file).replace(/\\/g, '/')
    const name = path.basename(file)
    const base = path.basename(file, path.extname(file))
    const sub = path.relative(assetsDir, file).replace(/\\/g, '/')
    const patterns = [
        name,
        base,
        sub,
        `assets/${sub}`,
        `@/assets/${sub}`,
        rel,
        `src/assets/${sub}`
    ]
    const hit = patterns.some((p) => sources.includes(p))
    if (hit) used.push(rel)
    else unused.push(rel)
}

// import.meta.glob 动态引用（如 vip_0[1-9].png）
const globHits = [...sources.matchAll(/import\.meta\.glob\(\s*['"](@\/assets\/[^'"]+)['"]/g)].map(
    (m) => m[1]
)

function globPatternToRegExp(globPattern) {
    const rel = globPattern.replace(/^@\/assets\//, '').replace(/^\//, '')
    let re = ''
    for (let i = 0; i < rel.length; i++) {
        const ch = rel[i]
        if (ch === '*') {
            re += '.*'
            continue
        }
        if (ch === '[') {
            const end = rel.indexOf(']', i)
            if (end !== -1) {
                re += rel.slice(i, end + 1)
                i = end
                continue
            }
        }
        re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
    return new RegExp(`^${re}$`)
}

const globRegexes = globHits.map((pattern) => globPatternToRegExp(pattern))

for (const file of [...unused]) {
    const rel = path.relative(root, file).replace(/\\/g, '/')
    const sub = path.relative(assetsDir, file).replace(/\\/g, '/')
    const matched = globRegexes.some((re) => re.test(sub))
    if (matched) {
        unused.splice(unused.indexOf(rel), 1)
        used.push(rel)
    }
}

console.log(JSON.stringify({ total: assets.length, used: used.length, unused: unused.length, unusedFiles: unused.sort() }, null, 2))

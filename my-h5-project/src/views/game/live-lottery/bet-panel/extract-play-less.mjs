import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vuePath = path.join(__dirname, 'BetPanel.vue');
const s = fs.readFileSync(vuePath, 'utf8');
const a = s.indexOf('.bet-panel {');
const b = s.indexOf('.recent-popup {');
if (a < 0 || b < 0) throw new Error('style markers not found');
const header = "@import '@/styles/variables.less';\n\n";
const outPath = path.join(__dirname, 'bet-panel-play-shared.less');
fs.writeFileSync(outPath, header + s.slice(a, b));
console.log('wrote', outPath, 'bytes', header.length + (b - a));

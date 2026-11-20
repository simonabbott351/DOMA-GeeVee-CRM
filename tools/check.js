// Syntax-checks every script and refuses en or em dashes anywhere in css/ and js/. Usage: node tools/check.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let bad = 0;
for (const dir of ['js', 'css']) for (const f of fs.readdirSync(path.join(ROOT, dir))) {
  const p = path.join(ROOT, dir, f); const s = fs.readFileSync(p, 'utf8');
  if (/[\u2013\u2014]/.test(s)) { console.error(f + ': contains an en or em dash'); bad++; }
  if (f.endsWith('.js')) { try { execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' }); } catch (e) { console.error(String(e.stderr || e)); bad++; } }
}
console.log(bad ? bad + ' problem(s)' : 'all scripts parse, no dashes');
process.exit(bad ? 1 : 0);

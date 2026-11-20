// Builds the single-file demo (dist/DOMA_GeeVee_CRM.html) from index.html, css/, data/ and js/.
// Usage: node tools/bundle.js [outFile]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const OUT = process.argv[2] || path.join(ROOT, 'dist', 'DOMA_GeeVee_CRM.html');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const strip = s => s.replace(/^'use strict';\n/, '');
const css = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => read(m[1])).join('\n');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const data = {};
for (const s of scripts.filter(s => s.startsWith('data/'))) { const t = read(s); const m = t.match(/window\.(DOMA_[A-Z]+)=([\s\S]*);\s*$/); data[m[1]] = m[2]; }
const js = scripts.filter(s => s.startsWith('js/') && s !== 'js/start.js').map(s => '/* --- ' + s + ' --- */\n' + strip(read(s))).join('\n');
const problems = [];
if (/[\u2013\u2014]/.test(js + css)) problems.push('an en or em dash in the code');
if (/<\/(script|body)/i.test(js)) problems.push('</script or </body inside the scripts; escape it as <\\/');
if (problems.length) { console.error('PROBLEMS:\n - ' + problems.join('\n - ')); process.exit(1); }
// the concatenated closure must parse as one script
{ const { execFileSync } = require('child_process'); const tmp = path.join(require('os').tmpdir(), `_doma_bundle_check_${process.pid}.js`); fs.writeFileSync(tmp, "(()=>{'use strict';\n" + js + '\nrender();\n})();\n'); try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); } catch (err) { console.error(String(err.stderr || err)); process.exit(1); } finally { try { fs.unlinkSync(tmp); } catch (e) {} } }
let out = html.replace(/\n?  <link rel="stylesheet" href="[^"]+">/g, '').replace(/\n?  <script src="[^"]+"><\/script>/g, '');
// function replacers: a plain string replacement would expand $& and $' patterns inside the code
out = out.replace('</head>', () => '<style>' + css + '</style></head>');
const extra = Object.keys(data).filter(k => k !== 'DOMA_SEED' && k !== 'DOMA_LEGACY').map(k => '<script>window.' + k + '=' + data[k] + ';</script>').join('');
out = out.replace('</body>', () => '<script type="application/json" id="seed">' + data.DOMA_SEED + '</script><script type="application/json" id="legacy">' + data.DOMA_LEGACY + '</script>' + extra + '<script>(()=>{\'use strict\';\n' + js + '\nrender();\n})();\n</script></body>');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out);
console.log('bundled', OUT, (out.length / 1e6).toFixed(2) + ' MB');

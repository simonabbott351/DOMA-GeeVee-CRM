// Every data-action a button can carry vs every handler that exists. Unmatched = a button that does nothing.
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const s = html.lastIndexOf("<script>(()=>{'use strict';"); const e = html.lastIndexOf('</script>');
const js = html.slice(s, e);
const used = new Set();
for (const m of js.matchAll(/data-action=\\?"([A-Za-z0-9_]+)\\?"/g)) used.add(m[1]);
for (const m of js.matchAll(/data-action="\$\{h\((?:kind|name|action)\)\}"/g)) void m;
for (const m of js.matchAll(/(?:action|cwBtn|cwGoBtn|gvCButton)\(\s*(?:`[^`]*`|'[^']*'|"[^"]*"|[A-Za-z0-9_.+()'"\s]+?)\s*,\s*'([A-Za-z0-9_]+)'/g)) used.add(m[1]);
const handlers = new Set();
for (const m of js.matchAll(/cwOn\('([A-Za-z0-9_]+)'/g)) handlers.add(m[1]);
for (const m of js.matchAll(/case '([A-Za-z0-9_]+)':/g)) handlers.add(m[1]);
for (const m of js.matchAll(/name===?'([A-Za-z0-9_]+)'/g)) handlers.add(m[1]);
for (const m of js.matchAll(/if\(name==='([A-Za-z0-9_]+)'/g)) handlers.add(m[1]);
const special = new Set(['route', 'close', 'legacy', 'cwGo', 'cwTab', 'cwSetF', 'cwDmGo']);
const missing = [...used].filter(a => !handlers.has(a) && !special.has(a)).sort();
console.log(JSON.stringify({ used: used.size, handlers: handlers.size, missing }, null, 1));

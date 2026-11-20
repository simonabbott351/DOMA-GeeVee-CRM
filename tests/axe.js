// Usage: node axe.js <html file> [--only substring] [--json out.json] [--modals] [--detail ruleId]
// Runs axe-core (WCAG 2.2 AA tags) on every CW_INDEX route plus More tools at desktop width.
// --modals: also opens the first cw dialog on each page and runs axe with it open.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const detail = args.includes('--detail') ? args[args.indexOf('--detail') + 1] : null;
const modals = args.includes('--modals');
const AXE = require.resolve('axe-core/axe.min.js');
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--window-size=1500,1000'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  page.on('dialog', d => d.dismiss());
  const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.addScriptTag({ path: AXE });
  const index = JSON.parse(((fs.readFileSync(file, 'utf8').match(/const CW_INDEX=(\[.*?\]);/) || fs.readFileSync(path.join(path.dirname(path.resolve(file)), 'js', 'cw-index.js'), 'utf8').match(/const CW_INDEX=(\[.*?\]);/)))[1]);
  let list = [...new Set(['/more', '/crm', ...index.map(e => e.route)])];
  if (only) { const parts = only.split(','); list = list.filter(r => parts.some(p => r.startsWith(p))); }
  const run = () => page.evaluate(async () => {
    const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }, resultTypes: ['violations'] });
    return res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target.join(' '), html: n.html.slice(0, 160), summary: (n.failureSummary || '').slice(0, 220), data: (n.any && n.any[0] && n.any[0].data) ? { fg: n.any[0].data.fgColor, bg: n.any[0].data.bgColor, ratio: n.any[0].data.contrastRatio, size: n.any[0].data.fontSize, need: n.any[0].data.expectedContrastRatio } : null })) }));
  });
  const contrast = {};
  const addContrast = (r, vs) => { for (const v of vs) if (v.id === 'color-contrast') for (const n of v.nodes) { if (!n.data) continue; const cls = (n.html.match(/class="([^"]*)"/) || [])[1] || n.html.slice(0, 30); const k = n.data.fg + ' on ' + n.data.bg + ' ' + cls.split(' ').slice(0, 2).join('.'); contrast[k] = contrast[k] || { n: 0, ratio: n.data.ratio, size: n.data.size, pages: new Set(), sample: n.html.slice(0, 100) }; contrast[k].n++; contrast[k].pages.add(r); } };
  const byRule = {}; const perPage = []; let dupIds = 0; const dupSamples = [];
  const dupCheck = async r => { const d = await page.evaluate(() => { const seen = {}, dups = []; for (const el of document.querySelectorAll('[id]')) { if (seen[el.id]) dups.push(el.id); seen[el.id] = 1; } return dups; }); dupIds += d.length; if (d.length && dupSamples.length < 8) dupSamples.push(r + ': ' + d.slice(0, 4).join(', ')); };
  const add = (r, vs, ctx) => { for (const v of vs) { const k = v.id; byRule[k] = byRule[k] || { impact: v.impact, help: v.help, pages: 0, nodes: 0, samples: [] }; byRule[k].pages++; byRule[k].nodes += v.nodes.length; if (byRule[k].samples.length < 6) byRule[k].samples.push({ r: r + ctx, ...v.nodes[0] }); } perPage.push({ r: r + ctx, violations: vs }); addContrast(r, vs); };
  for (const r of list) {
    if (r === '/more') await page.evaluate(() => { location.hash = ''; document.querySelector('[data-action="route"][data-id="more"]')?.click(); });
    else await page.evaluate(rt => { location.hash = rt; }, r);
    await new Promise(res => setTimeout(res, 120));
    add(r, await run(), ''); await dupCheck(r);
    if (modals) {
      const opened = await page.evaluate(() => {
        const skip = /^(cwGo|route|legacy|close|resetDemo|confirmReset|gvVoice|call|cwPageT|cwTab|cwSetF|cwSort|cwSelClear|cwAskPage|cwAskPrompt|gvOpenTool|moreTab)$/;
        for (const b of document.querySelectorAll('.cw-main [data-action]')) {
          const a = b.dataset.action; if (skip.test(a) || /Del|Delete|Void|Trash|Reset|Disc|Logout|SignOut/i.test(a)) continue;
          b.click();
          if (document.querySelector('#overlay .dialog')) return a;
        }
        return null;
      });
      if (opened) { await new Promise(res => setTimeout(res, 80)); add(r, await run(), ' [modal ' + opened + ']'); await dupCheck(r + ' [modal]'); await page.evaluate(() => { document.querySelector('#overlay [data-action="close"]')?.click(); }); }
    }
  }
  const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const rows = Object.entries(byRule).sort((a, b) => (order[a[1].impact] - order[b[1].impact]) || (b[1].nodes - a[1].nodes));
  console.log(`pages ${perPage.length}; rules ${rows.length}; serious/critical nodes ${rows.filter(([, v]) => order[v.impact] < 2).reduce((n, [, v]) => n + v.nodes, 0)}; duplicate ids ${dupIds}${dupSamples.length ? ' (' + dupSamples.join(' | ') + ')' : ''}`);
  for (const [id, v] of rows) console.log(`${v.impact.padEnd(8)} ${id.padEnd(28)} pages ${String(v.pages).padStart(3)} nodes ${String(v.nodes).padStart(5)}  ${v.help}`);
  if (detail) { for (const p of perPage) for (const v of p.violations) if (v.id === detail) for (const n of v.nodes.slice(0, 4)) console.log(`  ${p.r}  ${n.target}  ${n.html}`); }
  else for (const [id, v] of rows) for (const s of v.samples.slice(0, 3)) console.log(`   ${id}: ${s.r} ${s.target.slice(0, 80)}  ${s.html.slice(0, 120)}`);
  if (args.includes('--contrast')) { console.log('--- contrast pairs (fg on bg class: nodes, pages, ratio, size) ---'); for (const [k, v] of Object.entries(contrast).sort((a, b) => b[1].n - a[1].n).slice(0, 80)) console.log(`${String(v.n).padStart(5)} ${String(v.pages.size).padStart(4)}p ${v.ratio} ${v.size}  ${k}  ${v.sample.slice(0, 70)}`); }
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ byRule, perPage }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

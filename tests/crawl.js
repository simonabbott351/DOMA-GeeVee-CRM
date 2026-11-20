// Usage: node crawl.js <html file> [--shots dir] [--only substring] [--click]
// Opens the prototype once, then visits every CW_INDEX route + group pages by hash.
// Reports console errors, page errors, missing pages and in-page error notes.
// --click: on each page, clicks every safe [data-action] button once (re-rendering between), reporting errors.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const click = args.includes('--click');
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--window-size=1500,1000'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  let errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('dialog', d => d.dismiss());
  const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1500));
  const routes = await page.evaluate(() => {
    const r = new Set(['/crm']);
    // eslint-disable-next-line no-undef
    return null;
  });
  const index = JSON.parse(((fs.readFileSync(file, 'utf8').match(/const CW_INDEX=(\[.*?\]);/) || fs.readFileSync(path.join(path.dirname(path.resolve(file)), 'js', 'cw-index.js'), 'utf8').match(/const CW_INDEX=(\[.*?\]);/)))[1]);
  let list = [...new Set(['/crm', ...index.map(e => e.route)])];
  if (only) { const parts = only.split(','); list = list.filter(r => parts.some(p => r.startsWith(p))); }
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const results = [];
  for (const r of list) {
    errs = [];
    await page.evaluate(rt => { location.hash = rt; }, r);
    await new Promise(res => setTimeout(res, 120));
    const info = await page.evaluate(() => {
      const t = document.querySelector('.cw-page');
      const txt = t ? t.innerText : document.body.innerText.slice(0, 200);
      return { has: !!t, notFound: /Page not found|not in this prototype yet/.test(document.body.innerText), err: /hit an error/.test(txt), title: document.querySelector('.cw-page h1')?.innerText || document.querySelector('.cw-crumbs b')?.innerText || '' , buttons: document.querySelectorAll('.cw-page [data-action]').length };
    });
    if (click && info.has && !info.notFound) {
      const n = await page.evaluate(() => document.querySelectorAll('.cw-main [data-action]').length);
      for (let i = 0; i < Math.min(n, 60); i++) {
        const act = await page.evaluate((i, rt) => {
          const skip = /^(cwGo|route|legacy|close|resetDemo|confirmReset|gvVoice|call|cwPageT)$/;
          const b = [...document.querySelectorAll('.cw-main [data-action]')][i];
          if (!b) return null;
          const a = b.dataset.action;
          if (skip.test(a) || /Del|Delete|Void|Trash|Reset|Disc|Logout|SignOut/i.test(a)) return 'skip:' + a;
          b.click();
          return a;
        }, i, r);
        await new Promise(res => setTimeout(res, 30));
        // close any modal opened and return to the route
        await page.evaluate(rt => { if (window.__x) return; const c = document.querySelector('#overlay [data-action="close"]'); if (c) c.click(); if (location.hash !== '#' + rt) location.hash = rt; }, r);
        await new Promise(res => setTimeout(res, 30));
      }
    }
    if (shots) await page.screenshot({ path: path.join(shots, r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + '.png'), fullPage: false });
    results.push({ r, ...info, errs: [...errs] });
  }
  const bad = results.filter(x => !x.has || x.notFound || x.err || x.errs.length);
  console.log(`pages ${results.length}, ok ${results.length - bad.length}, problems ${bad.length}`);
  for (const b of bad) console.log(`- ${b.r} has=${b.has} notFound=${b.notFound} err=${b.err} ${b.errs.slice(0, 3).join(' | ').slice(0, 400)}`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

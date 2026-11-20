// Usage: node mobile.js <html file> [--shots dir] [--only substring] [--json out.json]
// Visits every CW_INDEX route plus the More tools page at 390x844 and reports horizontal overflow
// (documentElement.scrollWidth > innerWidth + 2) with the widest offending elements, plus a modal check.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2);
const file = args[0];
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const SHOT_ROUTES = ['/more', '/crm', '/contacts', '/contacts/C-1001', '/properties', '/properties/1', '/seller-leads', '/leads', '/communications', '/esign', '/analytics', '/settings', '/calendar', '/inspections'];
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--window-size=390,844'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  let errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('dialog', d => d.dismiss());
  const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1500));
  const index = JSON.parse(((fs.readFileSync(file, 'utf8').match(/const CW_INDEX=(\[.*?\]);/) || fs.readFileSync(path.join(path.dirname(path.resolve(file)), 'js', 'cw-index.js'), 'utf8').match(/const CW_INDEX=(\[.*?\]);/)))[1]);
  let list = [...new Set(['/more', '/crm', ...index.map(e => e.route)])];
  if (only) { const parts = only.split(','); list = list.filter(r => parts.some(p => r.startsWith(p))); }
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const measure = () => page.evaluate(() => {
    const iw = window.innerWidth, sw = document.documentElement.scrollWidth;
    const wide = [];
    // elements that stick out past the viewport and are not inside a horizontally scrollable box (those are clipped or overflowing)
    const scrollParent = el => { let p = el.parentElement; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return p; p = p.parentElement; } return null; };
    for (const el of document.querySelectorAll('#content *, #modal-layer *')) {
      const r = el.getBoundingClientRect();
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue; // shapes inside an svg never widen the page
      if (r.right > iw + 2 && r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !scrollParent(el)) {
        if (wide.some(w => w.el.contains(el))) continue;
        const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
        wide.push({ el, tag: el.tagName.toLowerCase() + cls, right: Math.round(r.right), width: Math.round(r.width) });
      }
    }
    const top = wide.slice(0, 12).map(({ tag, right, width }) => ({ tag, right, width }));
    const ai = document.querySelector('.cw-ai details');
    // bottom coverage: scroll to the end and see whether the last block of content clears the fixed bars
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    const fixedTop = Math.min(...[...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().width > window.innerWidth / 2 && e.getBoundingClientRect().top > window.innerHeight / 2 && !e.closest('#overlay') && e.id !== 'toast' && !e.classList.contains('cw-sm-card') && e.id !== 'cw-vo-cap').map(e => e.getBoundingClientRect().top), window.innerHeight);
    const last = document.querySelector('.cw-page') || document.querySelector('#content');
    const clipped = el => { let p = el.parentElement; const b = el.getBoundingClientRect().bottom; while (p && p !== document.body) { if (p.tagName === 'DETAILS' && !p.open) return true; const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') && p.getBoundingClientRect().bottom < b) return true; p = p.parentElement; } return false; };
    const kids = last ? [...last.querySelectorAll('*')].filter(e => e.getBoundingClientRect().height > 0 && !clipped(e)) : [];
    const lastBottom = kids.length ? Math.max(...kids.map(e => e.getBoundingClientRect().bottom)) : 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
    return { iw, sw, over: sw > iw + 2 || top.length > 0, wide: top, aiOpen: ai ? ai.open : null, fixedTop: Math.round(fixedTop), fixedCls: [...document.querySelectorAll('body *')].filter(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().width > window.innerWidth / 2 && e.getBoundingClientRect().top > window.innerHeight / 2 && !e.closest('#overlay') && e.id !== 'toast' && !e.classList.contains('cw-sm-card') && e.id !== 'cw-vo-cap').map(e => e.tagName + '#' + e.id + '.' + (typeof e.className === 'string' ? e.className.slice(0, 40) : '') + '@' + Math.round(e.getBoundingClientRect().top) + 'x' + Math.round(e.getBoundingClientRect().height)).join(' | '), lastBottom: Math.round(lastBottom), covered: lastBottom > fixedTop + 1 };
  });
  const results = [];
  for (const r of list) {
    errs = [];
    if (r === '/more') await page.evaluate(() => { location.hash = ''; document.querySelector('[data-action="route"][data-id="more"]')?.click(); });
    else await page.evaluate(rt => { location.hash = rt; }, r);
    await new Promise(res => setTimeout(res, 150));
    const info = await measure();
    // open the first cw modal on the page, if any, and measure it
    let modal = null;
    const opened = await page.evaluate(() => {
      const skip = /^(cwGo|route|legacy|close|resetDemo|confirmReset|gvVoice|call|cwPageT|cwTab|cwSetF|cwSort|cwSelClear|cwAskPage|cwAskPrompt|gvOpenTool|moreTab)$/;
      for (const b of document.querySelectorAll('.cw-main [data-action]')) {
        const a = b.dataset.action; if (skip.test(a) || /Del|Delete|Void|Trash|Reset|Disc|Logout|SignOut/i.test(a)) continue;
        b.click();
        if (document.querySelector('#overlay .dialog')) return a;
      }
      return null;
    });
    if (opened) {
      await new Promise(res => setTimeout(res, 80));
      modal = await page.evaluate(() => {
        const d = document.querySelector('#overlay .dialog'); if (!d) return null;
        const r = d.getBoundingClientRect(); const f = d.querySelector('.dialog-foot'); const fr = f ? f.getBoundingClientRect() : null;
        const sw = document.documentElement.scrollWidth;
        return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), footBottom: fr ? Math.round(fr.bottom) : null, over: sw > window.innerWidth + 2, inner: window.innerHeight, action: null };
      });
      if (modal) modal.action = opened;
      if (shots && SHOT_ROUTES.includes(r)) await page.screenshot({ path: path.join(shots, r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + '_modal.png'), fullPage: false });
      await page.evaluate(() => { document.querySelector('#overlay [data-action="close"]')?.click(); });
      await new Promise(res => setTimeout(res, 50));
    }
    if (shots && SHOT_ROUTES.includes(r)) await page.screenshot({ path: path.join(shots, r.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + '.png'), fullPage: false });
    results.push({ r, ...info, modal, errs: [...errs] });
  }
  const over = results.filter(x => x.over);
  const modalBad = results.filter(x => x.modal && (x.modal.over || x.modal.w > 390 || (x.modal.footBottom && x.modal.footBottom > x.modal.inner + 1)));
  const covered = results.filter(x => x.covered);
  console.log(`pages ${results.length}, overflow ${over.length}, covered by dock ${covered.length}, aiOpen ${results.filter(x => x.aiOpen === true).length}, modals checked ${results.filter(x => x.modal).length}, modal problems ${modalBad.length}, errors ${results.filter(x => x.errs.length).length}`);
  for (const b of over) console.log(`- ${b.r} sw=${b.sw} ${b.wide.slice(0, 5).map(w => w.tag + '(' + w.right + ')').join(' ')}`);
  for (const b of covered) console.log(`- covered ${b.r} last=${b.lastBottom} fixedTop=${b.fixedTop} ${b.fixedCls}`);
  for (const b of modalBad) console.log(`- modal ${b.r} ${JSON.stringify(b.modal)}`);
  for (const b of results.filter(x => x.errs.length)) console.log(`- err ${b.r} ${b.errs.slice(0, 2).join(' | ').slice(0, 300)}`);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(results, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });



// From a fresh reset, jump straight to each demo step with "Take me there" and check the first thing to click lights up.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.evaluateOnNewDocument(() => { window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  const click = async s => page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s);
  const info = () => page.evaluate(() => {
    const p = document.querySelector('.cw-dm-panel'); const spot = document.getElementById('cw-wk-spot');
    const r = spot && spot.style.display !== 'none' ? spot.getBoundingClientRect() : null;
    const q = s => p && p.querySelector(s);
    return { step: (p?.querySelector('.gv-eyebrow')?.innerText || '').replace(/\D+/g, ' ').trim(), now: q('.cw-wk-list li.now span')?.innerText || '', already: !!q('.cw-wk-done.already'), miss: !!q('.cw-wk-miss.on'), spot: !!r, tip: spot?.querySelector('.cw-wk-tip')?.innerText.replace(/\s+/g, ' ') || '', btn: !!(q('[data-action="cwWkFill"]') || q('[data-action="cwWkType"]') || q('[data-action="cwWkGo"]') || q('[data-action="cwWkNext"].btn')), hash: location.hash, toast: document.getElementById('toast')?.innerText || '' };
  });
  const out = [];
  for (let i = 0; i < 22; i++) {
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
    await page.evaluate(() => { location.hash = '/demo'; }); await wait(300);
    await click('[data-action="cwDmReset"]'); await wait(250); await click('[data-action="cwDmResetYes"]'); await wait(1200);
    await click(`[data-action="cwDmGo"][data-id="${i}"]`); await wait(2600);
    const s = await info();
    const ok = s.spot || s.btn || s.already;
    out.push({ i: i + 1, ok, hash: s.hash, now: s.now.slice(0, 60), tip: s.tip.slice(0, 50), miss: s.miss, already: s.already, toast: s.toast.slice(0, 60) });
    if (dir && !ok) await page.screenshot({ path: dir + '/jump-' + (i + 1) + '.png' });
  }
  console.log(JSON.stringify({ fails: out.filter(x => !x.ok).length, out, errs }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });



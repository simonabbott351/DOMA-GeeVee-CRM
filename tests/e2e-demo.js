// Demo kit: reset, every step's "Take me there", the floating guide, batch bar after reset, brief page, leftover wording.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 1000 });
  const errs = []; page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => { window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1500);
  const out = {};
  const click = async s => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s); await wait(300); return ok; };
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(400);
  out.steps = await page.evaluate(() => document.querySelectorAll('.cw-dm-step').length);
  await click('[data-action="cwDmReset"]'); await click('[data-action="cwDmResetYes"]'); await wait(1500);
  out.afterReset = await page.evaluate(() => ({ hash: location.hash, panel: !!document.querySelector('.cw-dm-panel'), step: document.querySelector('.cw-dm-panel .gv-eyebrow')?.innerText }));
  await page.screenshot({ path: dir + '/d0-demo.png' });
  // Today after reset: batch bar, money plan, leads
  await click('[data-action="cwDmGo"][data-id="0"]');
  out.today = await page.evaluate(() => ({ batch: [...document.querySelectorAll('.cw-gr-batch-row b')].map(b => b.innerText), money: document.querySelector('.cw-gr-aside')?.innerText.replace(/\s+/g, ' ').slice(0, 120), leftovers: /Phase 2|NO LIVE SENDS|V1 records/.test(document.body.innerText), topBtn: !!document.querySelector('.cw-dm-top') }));
  await page.screenshot({ path: dir + '/d1-today.png' });
  await page.evaluate(() => { location.hash = '/seller-leads'; }); await wait(400);
  out.leads = await page.evaluate(() => [...document.querySelectorAll('.cw-main .card .list-row .tag')].map(t => t.innerText).slice(0, 6));
  await page.evaluate(() => { location.hash = '/forecast'; }); await wait(400);
  out.earned = await page.evaluate(() => [...document.querySelectorAll('.cw-stats .stat')].map(s => s.querySelector('.label').innerText + '=' + s.querySelector('.value').innerText));
  // walk every step with Take me there
  const n = out.steps; out.walk = [];
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => { location.hash = '/demo'; }); await wait(250);
    await click(`[data-action="cwDmGo"][data-id="${i}"]`); await wait(350);
    const r = await page.evaluate(() => ({ hash: location.hash, title: document.querySelector('.cw-page h1, .gv-day-welcome h2')?.innerText?.slice(0, 40), panel: document.querySelector('.cw-dm-panel b')?.innerText }));
    out.walk.push((i + 1) + ': ' + r.hash + ' | ' + r.title + ' | ' + r.panel);
    if (i === 1 || i === 7 || i === 10) await page.screenshot({ path: dir + `/d-step${i + 1}.png` });
  }
  // collapse/expand, next
  await click('[data-action="cwDmCollapse"]'); out.pill = await page.evaluate(() => document.querySelector('.cw-dm-pill')?.innerText);
  await click('.cw-dm-pill'); await click('[data-action="cwDmNext"][data-id="1"]'); out.next = await page.evaluate(() => document.querySelector('.cw-dm-panel .gv-eyebrow')?.innerText);
  // new lead price wording
  await page.evaluate(() => { location.hash = '/properties/D-2001'; }); await wait(400);
  out.newLead = await page.evaluate(() => ({ price: document.querySelector('.cw-main h1')?.nextElementSibling?.innerText.split('\n')[0], priceNoise: [...document.querySelectorAll('.cw-ai-item b')].some(b => /price check/i.test(b.innerText)) }));
  // brief
  await page.evaluate(() => { location.hash = '/ceo-brief'; }); await wait(400);
  out.brief = await page.evaluate(() => [...document.querySelectorAll('.cw-dm-brief h2')].map(h => h.innerText));
  await page.screenshot({ path: dir + '/d-brief.png' });
  // run the real journey on the reset data to be sure the demo path works after a reset
  await page.evaluate(() => { location.hash = '/seller-leads'; }); await wait(300);
  await page.evaluate(() => document.querySelector('[data-action="call"][data-id="C-1006"]')?.click()); await wait(250);
  await click('[data-action="startCall"]'); await click('[data-action="cwJnExample"]'); await click('[data-action="finishCall"]'); await click('[data-action="saveCall"]');
  out.callCard = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, n: document.querySelectorAll('.cw-jn-done strong').length }));
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

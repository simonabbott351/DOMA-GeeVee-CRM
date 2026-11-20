// Watch mode end to end: start screen, "Watch the story", click through the cards, report chapters reached and any stall.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !/favicon/.test(m.text())) errs.push(m.type() + ': ' + m.text().slice(0, 200)); });
  const startCh = Number(process.env.START_CH || 0);
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  await page.evaluate(() => { location.hash = '/start'; }); await wait(600);
  if (dir) await page.screenshot({ path: dir + '/story-start.png' });
  if (startCh) { await page.evaluate(i => document.querySelector(`[data-action="cwStJump"][data-id="${i}"]`)?.click(), startCh); await wait(1500); await page.evaluate(() => document.querySelector('[data-action="cwStWatch"]')?.click()); await wait(1500); }
  else { await page.evaluate(() => document.querySelector('[data-action="cwStStart"][data-id="watch"]')?.click()); await wait(1500); }
  const info = () => page.evaluate(() => { const ov = document.querySelector('.cw-st-overlay'); const p = document.querySelector('.cw-dm-panel'); return { card: ov ? (ov.querySelector('.cw-st-k')?.innerText || '') + ' | ' + (ov.querySelector('h1')?.innerText || '') : '', now: p?.querySelector('.cw-wk-list li.now span')?.innerText || '', strip: p?.querySelector('.cw-st-strip-top .gv-eyebrow')?.innerText || '', hash: location.hash, watching: !!p?.querySelector('.cw-st-live') }; });
  const log = []; let last = '', same = 0, shots = 0; const stalls = [];
  for (let n = 0; n < 1500; n++) {
    const s = await info();
    const key = s.card + '|' + s.strip + '|' + s.now;
    if (key !== last) { last = key; same = 0; log.push((s.card || (s.strip + ' > ' + s.now)).slice(0, 110)); }
    else same++;
    if (s.card) {
      if (dir && shots < 4) { await page.screenshot({ path: dir + '/story-card-' + (shots++) + '.png' }); }
      if (/THAT IS THE STORY/.test(s.card)) break;
      await wait(1200);
      await page.evaluate(() => { const b = document.querySelector('.cw-st-overlay .cw-st-acts .btn.primary'); if (b) b.click(); }); await wait(800); continue;
    }
    if (same > 100) { const dbg = await page.evaluate(() => { const spot = document.getElementById('cw-wk-spot'); return { spot: spot && spot.style.display !== 'none', modal: document.querySelector('#modal-layer .dialog h2')?.innerText || '', watching: !!document.querySelector('.cw-st-live'), strip: [...document.querySelectorAll('.cw-jn-strip [data-action]')].map(b => b.innerText.trim()).slice(0, 8), toast: document.getElementById('toast')?.innerText || '' }; }); stalls.push({ at: s.strip + ' > ' + s.now, hash: s.hash, ...dbg }); if (dir) await page.screenshot({ path: dir + '/stall-' + stalls.length + '.png' }); await page.evaluate(() => document.querySelector('.cw-dm-panel .cw-wk-acts [data-action="cwWkNext"]')?.click()); same = 0; if (stalls.length >= 2) break; }
    await wait(500);
  }
  const fin = await info();
  console.log(JSON.stringify({ finished: /THAT IS THE STORY/.test(fin.card), stalls, errs, transitions: log.length, log }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });



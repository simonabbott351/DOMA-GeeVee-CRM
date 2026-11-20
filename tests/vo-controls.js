// Pause, resume, speed and stop while the story is watching itself.
const puppeteer = require('puppeteer-core');
const path = require('path');
const wait = ms => new Promise(r => setTimeout(r, ms));
const [file, dir] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.open = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const state = () => page.evaluate(() => ({ bar: !!document.getElementById('cw-vo-bar'), paused: document.body.classList.contains('cw-story-paused'), card: document.querySelector('.cw-st-overlay .cw-st-k')?.innerText || '', now: document.querySelector('.cw-dm-panel .cw-wk-list li.now span')?.innerText || '', cap: (document.getElementById('cw-vo-cap')?.innerText || '').slice(0, 40), story: document.body.classList.contains('cw-story'), speedOn: document.querySelector('.cw-vo-sp .on')?.innerText || '' }));
  await page.evaluate(() => { location.hash = '/start'; }); await wait(500);
  await page.evaluate(() => document.querySelector('[data-action="cwStStart"][data-id="watch"]')?.click()); await wait(1500);
  const out = { start: await state() };
  // skip the title card and let it play into step 1
  await page.evaluate(() => document.querySelector('[data-action="cwStSkip"]')?.click()); await wait(3000);
  out.playing = await state();
  await page.keyboard.press('Space'); await wait(600);
  const p1 = await state(); await wait(12000); const p2 = await state();
  out.paused = { p1, p2, heldStill: p1.now === p2.now && p1.card === p2.card };
  if (dir) await page.screenshot({ path: dir + '/vo-paused.png' });
  await page.evaluate(() => document.querySelector('[data-action="cwStPause"]')?.click()); await wait(800);
  out.resumed = await state();
  await page.evaluate(() => document.querySelector('[data-action="cwStSpeed"][data-id="0.7"]')?.click()); await wait(500);
  out.slower = await state();
  await page.evaluate(() => document.querySelector('[data-action="cwStEnd"]')?.click()); await wait(1000);
  out.stopped = await state();
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });


// Phone-width screenshots of every main page, top of page and one scroll down.
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const wait = ms => new Promise(r => setTimeout(r, ms));
const [file, dir] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const click = async (s, ms = 400) => { await page.evaluate(s => document.querySelector(s)?.click(), s); await wait(ms); };
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(300);
  await click('[data-action="cwDmReset"]'); await click('[data-action="cwDmResetYes"]', 1500); await click('[data-action="cwDmOff"]');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await wait(500);
  const oh = await page.evaluate(() => JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')).cw.openHomes[0]?.id);
  const routes = [['today', null], ['messages', 'messages'], ['seller-leads', '/seller-leads'], ['properties', '/properties'], ['property', '/properties/D-2006'], ['property-enq', '/properties/D-2006?tab=enquiries'], ['contacts', '/contacts'], ['contact', '/contacts/C-1001'], ['inspections', '/inspections'], ['open-home', '/open-home/' + oh], ['calendar', '/calendar'], ['tasks', '/tasks'], ['office', '/office'], ['audit', '/audit'], ['trust', '/trust'], ['rentals', '/rentals'], ['forecast', '/forecast'], ['neighbours', '/neighbours'], ['auction', '/auction/D-2009'], ['drive', '/drive'], ['start', '/start'], ['demo', '/demo'], ['crm', '/crm']];
  const info = {};
  for (const [name, route] of routes) {
    if (!route) await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]')?.click());
    else if (route === 'messages') await page.evaluate(() => document.querySelector('[data-action="route"][data-id="messages"]')?.click());
    else await page.evaluate(r => { location.hash = r; }, route);
    await wait(700);
    await page.evaluate(() => window.scrollTo(0, 0)); await wait(100);
    info[name] = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, welcome: !!document.querySelector('.gv-day-welcome p'), size: !!document.querySelector('.cw-tr-size'), wide: [...document.querySelectorAll('body *')].filter(e => { const r = e.getBoundingClientRect(); return r.right > 392 && r.width > 40 && getComputedStyle(e).position !== 'fixed' && e.offsetParent; }).slice(0, 4).map(e => e.tagName + '.' + String(e.className).slice(0, 40)) }));
    await page.screenshot({ path: `${dir}/${name}-1.png` });
    await page.evaluate(() => window.scrollBy(0, 700)); await wait(250);
    await page.screenshot({ path: `${dir}/${name}-2.png` });
  }
  // a preview dialog and the role dialog
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]')?.click()); await wait(600);
  await click('[data-action="openApprovals"]', 500); await page.screenshot({ path: `${dir}/modal-approvals.png` });
  await click('#modal-layer .cw-pv-btn', 600); await page.screenshot({ path: `${dir}/modal-preview.png` });
  await click('#modal-layer [data-action="close"]'); await click('#modal-layer [data-action="close"]');
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

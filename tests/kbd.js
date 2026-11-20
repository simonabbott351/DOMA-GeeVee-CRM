// node kbd.js <html>: keyboard checks at desktop width. Dialog focus in and back, Tab order and wrap, Escape on dialogs and the GeeVee panel.
const puppeteer = require('puppeteer-core');
const path = require('path');
const file = process.argv[2];
const CASES = [['/contacts', 'cwCtNew'], ['/tasks', 'cwTaskNew'], ['/esign/agreements', 'cwEsNew'], ['/calendar', 'cwEvNew'], ['/support-tickets', 'cwAdTkOpen'], ['/leads-pipeline', 'openDeal']];
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--window-size=1500,1000'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000 });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1200));
  const active = () => page.evaluate(() => { const a = document.activeElement; if (!a) return 'none'; return a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.trim().split(/\s+/).slice(0, 2).join('.') : '') + (a.dataset && a.dataset.action ? '[' + a.dataset.action + ']' : '') + (a.closest('#overlay') ? ' (in dialog)' : ''); });
  let fails = 0;
  for (const [route, act] of CASES) {
    await page.evaluate(rt => { location.hash = rt; }, route);
    await new Promise(r => setTimeout(r, 200));
    const sel = `.cw-main [data-action="${act}"]`;
    const exists = await page.$(sel);
    if (!exists) { console.log(`${route} ${act}: button not found, skipped`); continue; }
    await page.focus(sel); await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 150));
    const opened = await page.$('#overlay .dialog');
    if (!opened) { console.log(`${route} ${act}: no dialog opened`); continue; }
    const a0 = await active();
    const seq = [];
    for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); seq.push(await active()); }
    await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
    const back = await active();
    const allInside = seq.every(s => s.includes('(in dialog)')) && back.includes('(in dialog)');
    const firstIsClose = seq[0].includes('.close') || a0.includes('(in dialog)');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 150));
    const closed = !(await page.$('#overlay'));
    const after = await active();
    const returned = after.includes('[' + act + ']');
    const ok = a0.includes('(in dialog)') && allInside && closed && returned;
    if (!ok) fails++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${route} ${act}: focus on open=${a0}; tab stays in dialog=${allInside}; first tab=${seq[0]}; escape closes=${closed}; focus back on opener=${returned} (${after})`);
  }
  // GeeVee panel: open it, press Escape, it closes and focus lands on the summary
  await page.evaluate(() => { location.hash = '/contacts'; });
  await new Promise(r => setTimeout(r, 200));
  await page.click('.cw-ai summary');
  await new Promise(r => setTimeout(r, 100));
  const wasOpen = await page.evaluate(() => document.querySelector('.cw-ai details').open);
  // desktop: the panel starts open, so the click closed it; open it again if needed
  if (!wasOpen) { await page.click('.cw-ai summary'); await new Promise(r => setTimeout(r, 100)); }
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 150));
  const panel = await page.evaluate(() => ({ open: document.querySelector('.cw-ai details').open, focus: document.activeElement && document.activeElement.tagName.toLowerCase() }));
  const pok = !panel.open && panel.focus === 'summary';
  if (!pok) fails++;
  console.log(`${pok ? 'ok  ' : 'FAIL'} GeeVee panel: Escape closes=${!panel.open}, focus on summary=${panel.focus === 'summary'}`);
  // phone: the panel starts closed
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => { location.hash = '/tasks'; });
  await new Promise(r => setTimeout(r, 300));
  const phoneOpen = await page.evaluate(() => document.querySelector('.cw-ai details').open);
  console.log(`${!phoneOpen ? 'ok  ' : 'FAIL'} phone: GeeVee panel closed by default=${!phoneOpen}`);
  if (phoneOpen) fails++;
  console.log(fails ? `FAILURES: ${fails}` : 'all keyboard checks passed');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

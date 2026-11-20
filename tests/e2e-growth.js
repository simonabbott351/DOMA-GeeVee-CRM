// Growth layer: database journey, forecast, batch approvals, delegation, vendor report.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 1000 });
  const errs = []; page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1500);
  const out = {};
  const click = async s => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s); await wait(250); return ok; };
  const ask = async q => { await page.evaluate(() => { const i = document.getElementById('gv-dock-text'); if (i) i.value = ''; }); await page.type('#gv-dock-text', q); await page.keyboard.press('Enter'); await wait(400); const t = await page.evaluate(() => [...document.querySelectorAll('.gv-chat-bubble.assistant p')].pop()?.innerText); await page.evaluate(() => document.querySelector('[data-action="gvCloseChat"]')?.click()); await wait(200); return t; };
  // Today aside
  out.aside = await page.evaluate(() => [...document.querySelectorAll('.cw-gr-aside > b')].map(b => b.innerText));
  out.flaggedTasks = await page.evaluate(() => [...document.querySelectorAll('#geevee-worklist h3, #geevee-worklist strong')].map(x => x.innerText).filter(t => /selling signal/i.test(t)).length);
  await page.screenshot({ path: dir + '/g1-today.png' });
  // Database journey
  await page.evaluate(() => { location.hash = '/database-journey'; }); await wait(400);
  out.dbStats = await page.evaluate(() => [...document.querySelectorAll('.cw-stats .stat')].map(s => s.querySelector('.label').innerText + '=' + s.querySelector('.value').innerText));
  out.dbFirst = await page.evaluate(() => document.querySelector('.cw-main .card .list-row strong')?.innerText + ' | ' + [...document.querySelectorAll('.cw-main .card .list-row:first-of-type .cw-gr-why li')].map(l => l.innerText).join('; '));
  await page.screenshot({ path: dir + '/g2-db.png' });
  const leadBtn = await click('.cw-main .card .list-row [data-action="cwGrLead"]');
  out.lead = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await click('[data-action="close"]');
  await page.evaluate(() => { location.hash = '/database-journey'; }); await wait(300);
  await click('[data-action="cwTab"][data-id="gr|due"]');
  await click('[data-action="cwGrDraftAll"]');
  out.draftAll = await page.evaluate(() => document.getElementById('toast')?.innerText);
  // Forecast
  await page.evaluate(() => { location.hash = '/forecast'; }); await wait(400);
  await click('[data-action="cwGciTarget"]'); await page.evaluate(() => { document.getElementById('gci-target').value = '500000'; }); await click('[data-action="cwGciSave"]');
  await page.evaluate(() => { location.hash = '/forecast'; }); await wait(400);
  out.forecast = await page.evaluate(() => ({ stats: [...document.querySelectorAll('.cw-stats .stat')].map(s => s.querySelector('.label').innerText + '=' + s.querySelector('.value').innerText), plan: document.querySelector('.cw-main .card:nth-of-type(3) p')?.innerText.slice(0, 160) }));
  await page.screenshot({ path: dir + '/g3-forecast.png' });
  out.askGci = await ask('how am I tracking');
  // Batch approvals: draft-all created many SMS touches -> a batch should show on Today
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(400);
  out.batch = await page.evaluate(() => [...document.querySelectorAll('.cw-gr-batch-row b')].map(b => b.innerText));
  await page.screenshot({ path: dir + '/g4-batch.png' });
  out.askApprove = await ask('approve all');
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(300);
  out.batchAfter = await page.evaluate(() => [...document.querySelectorAll('.cw-gr-batch-row b')].map(b => b.innerText));
  // Delegation
  out.delegate = await ask('ask Priya to call the open home buyers for 9 Rose Avenue, remind me Friday');
  await page.evaluate(() => { location.hash = '/tasks'; }); await wait(400);
  out.delegatedTask = await page.evaluate(() => [...document.querySelectorAll('.cw-main td')].map(x => x.innerText).find(t => /Delegated to Priya/i.test(t))?.slice(0, 120));
  // Vendor report
  await page.evaluate(() => { location.hash = '/properties/D-2006'; }); await wait(400);
  out.reportBtn = await click('[data-action="cwGrVendorPreview"]');
  out.report = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, text: document.querySelector('.cw-gr-pre')?.innerText.slice(0, 200), priceTalk: !!document.querySelector('#overlay .alert.warn') }));
  await page.screenshot({ path: dir + '/g5-report.png' });
  await click('[data-action="cwGrVendorDraft"]');
  out.reportToast = await page.evaluate(() => document.getElementById('toast')?.innerText);
  out.askReport = await ask('vendor report for 84 Albert Street');
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

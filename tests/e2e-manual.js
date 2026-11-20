// Manual path: + New lead -> log call -> book appraisal -> record appraisal -> record signed on paper -> book photos -> add photos -> go live.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 1000 });
  const errs = []; page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => { window.open = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const out = {};
  const click = async s => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s); await wait(200); return ok; };
  const card = async () => page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  const fill = async (sel, val) => { await page.evaluate((s, v) => { const el = document.querySelector(s); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }, sel, val); };
  // 1. + New lead
  out.newBtn = await click('[data-action="cwMnNew"]');
  await click('[data-action="cwMnPick"][data-id="mnLead"]');
  await fill('#mnLead-name', 'Priya Nair'); await fill('#mnLead-mobile', '0412 345 678'); await fill('#mnLead-address', '12 Gilbert Road, Preston');
  await click('[data-action="cwMnLeadSave"]');
  out.lead = await card();
  const dealId = await page.evaluate(() => [...document.querySelectorAll('[data-action="cwJnOpen"]')].map(b => b.dataset.id).find(r => /^\/properties\/D-/.test(r))?.split('/')[2]);
  out.dealId = dealId;
  await click('[data-action="close"]');
  await page.evaluate(id => { location.hash = '/properties/' + id; }, dealId); await wait(300);
  out.strip = await page.evaluate(() => [...document.querySelectorAll('button.cw-jn-step')].map(b => b.innerText.trim()));
  await page.screenshot({ path: dir + '/m1-strip.png' });
  // 2. Log call
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Lead called"]`);
  await click('[data-action="cwMnCallSave"]'); out.call = await card(); await click('[data-action="close"]');
  // 3. Book appraisal
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Appraisal booked"]`);
  await page.screenshot({ path: dir + '/m2-book.png' });
  await click('[data-action="cwMnApprSave"]'); out.book = await card(); await click('[data-action="close"]');
  // 4. Record appraisal
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Appraised"]`);
  await fill('#mnRecap-low', '1100000'); await fill('#mnRecap-high', '1200000');
  await page.screenshot({ path: dir + '/m3-recap.png' });
  await click('[data-action="cwMnRecapSave"]'); out.recap = await card(); await click('[data-action="close"]');
  // 5. Signed on paper
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Signed"]`);
  await click('[data-action="cwMnSignedSave"]'); await wait(300); out.signed = await card(); await click('[data-action="close"]');
  // 6. Book photos (manual) then add photos
  await page.evaluate(id => { location.hash = '/properties/' + id; }, dealId); await wait(300);
  out.strip2 = await page.evaluate(() => [...document.querySelectorAll('button.cw-jn-step.done')].map(b => b.innerText.trim()));
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Photos"]`);
  await click('[data-action="cwMnPhotosSave"]'); out.photos = await card(); await click('[data-action="close"]');
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Photos delivered"]`);
  await click(`[data-action="cwMnDeliverSave"][data-id="${dealId}|demo"]`); await wait(300); out.delivered = await card(); await click('[data-action="close"]');
  // 7. Go live via the step
  await click(`[data-action="cwMnStep"][data-id="${dealId}|Live"]`);
  out.gates = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-gates .tag')].map(t => t.innerText));
  await click('[data-action="cwJnIdVerify"]'); await click('[data-action="cwJnIdSave"]'); await click('[data-action="cwJnUseDesc"]');
  out.gates2 = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-gates .tag')].map(t => t.innerText));
  await click('[data-action="cwJnGoLiveRequest"]');
  await page.evaluate(() => document.querySelector('[data-action="openApprovals"]').click()); await wait(200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action="openApproval"]')].find(x => /Publish/i.test(x.closest('.list-row, article, div')?.innerText || '')); b && b.click(); }); await wait(200);
  await click('[data-action="approveAction"]'); await wait(400); out.live = await card();
  await page.screenshot({ path: dir + '/m4-live.png' });
  // 8. + New offer on it
  await click('[data-action="close"]'); await click('[data-action="close"]');
  await click('[data-action="cwMnNew"]'); await click('[data-action="cwMnPick"][data-id="mnNewOffer"]');
  await page.evaluate(id => { document.querySelector('#mnOffer-dealId').value = id; }, dealId);
  await fill('#mnOffer-amount', '1150000');
  await click('[data-action="cwMnOfferSave"]'); await wait(300);
  out.offer = await page.evaluate(() => ({ overlay: document.querySelector('#overlay h2')?.innerText, toast: document.getElementById('toast')?.innerText }));
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

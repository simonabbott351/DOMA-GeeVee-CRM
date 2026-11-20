// End-to-end: call -> appraisal booked -> recap -> authority approval -> vendor signs -> listing, photographer, campaign -> supplier confirms.
const puppeteer = require('puppeteer-core');
const dir = process.argv[2];
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 1000 });
  const errs = []; page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('dialog', d => d.dismiss());
  await page.evaluateOnNewDocument(() => { window.open = () => null; });
  await page.goto('http://127.0.0.1:5500/DOMA_GeeVee_Desktop_CRM_V2_1%20(1).html', { waitUntil: 'load', timeout: 120000 });
  await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const out = {};
  const click = async (sel) => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, sel); await wait(150); return ok; };
  // 1. Call Helen Vu (C-1006) from the contacts page
  await page.evaluate(() => { location.hash = '/seller-leads'; }); await wait(300);
  out.callBtns = await page.evaluate(() => [...document.querySelectorAll('[data-action="call"]')].map(b => b.dataset.id).slice(0, 8));
  await page.evaluate(() => document.querySelector('[data-action="call"][data-id="C-1006"]')?.click()); await wait(250);
  out.callOpen = await page.evaluate(() => ({ start: !!document.querySelector('[data-action="startCall"]'), overlay: document.querySelector('#overlay h2')?.innerText, toast: document.getElementById('toast')?.innerText }));
  await click('[data-action="startCall"]');
  out.listening = await page.evaluate(() => !!document.querySelector('#jn-transcript'));
  await click('[data-action="cwJnExample"]');
  out.transcript = await page.evaluate(() => document.querySelector('#jn-transcript')?.value.length);
  await click('[data-action="finishCall"]');
  out.review = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-item b')].map(b => b.innerText));
  await page.screenshot({ path: dir + '/j1-review.png' });
  await click('[data-action="saveCall"]');
  out.card1 = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await page.screenshot({ path: dir + '/j2-did.png' });
  await click('[data-action="close"]');
  // 2. Calendar has the appraisal
  await page.evaluate(() => { location.hash = '/calendar'; }); await wait(300);
  out.calendar = await page.evaluate(() => [...document.querySelectorAll('.cw-cal-e')].map(b => b.innerText).filter(t => /appraisal/i.test(t)));
  // 3. Recap via the GeeVee tool
  await page.evaluate(() => { location.hash = '/properties/D-2016'; }); await wait(300);
  out.strip1 = await page.evaluate(() => document.querySelector('.cw-jn-strip b')?.innerText);
  await click('[data-action="cwJnRecapFor"]'); await wait(200);
  await click('[data-action="cwJnExampleRecap"]');
  out.recapText = await page.evaluate(() => document.getElementById('gv-recap-text')?.value.slice(0, 80));
  await click('[data-action="gvSaveRecap"]');
  out.card2 = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await page.screenshot({ path: dir + '/j3-recap.png' });
  await click('[data-action="close"]');
  // 4. Approve the authority on Today (A3: approve, confirm)
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(300);
  out.todayHasAuthority = await page.evaluate(() => /sales authority/i.test(document.querySelector('#geevee-worklist')?.innerText || ''));
  out.todayTitles = await page.evaluate(() => [...document.querySelectorAll('#geevee-worklist h3, #geevee-worklist strong')].map(x => x.innerText).filter(t => t.length > 8).slice(0, 10));
  out.actions = await page.evaluate(() => { const b = document.querySelector('[data-action="openApprovals"]'); b.click(); const t = [...document.querySelectorAll('#overlay .list-row strong, #overlay article b')].map(x => x.innerText).slice(0, 8); document.querySelector('#overlay [data-action="close"]')?.click(); return t; });
  await page.evaluate(() => document.querySelector('[data-action="openApprovals"]').click()); await wait(200);
  const aid = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action="openApproval"]')].find(x => /authority/i.test(x.closest('.list-row, article, div')?.innerText || '')); if (b) { b.click(); return b.dataset.id; } return null; }); await wait(200);
  await click('[data-action="approveAction"]'); await wait(200);
  out.approved = await page.evaluate(() => [...document.querySelectorAll('.list-row strong, article b')].some(x => /sales authority/i.test(x.innerText)));
  await click('[data-action="close"]');
  await page.evaluate(() => { location.hash = '/esign/agreements'; }); await wait(300);
  out.agreement = await page.evaluate(() => [...document.querySelectorAll('.cw-main .table tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 100)).filter(t => /Smith Street/.test(t)));
  // 5. Vendor signs
  const agrId = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action="cwGo"]')].map(x => x.dataset.id).find(id => /esign\/document\/AGR/.test(id)); return b ? b.split('/').pop() : null; });
  out.agrId = agrId;
  await page.evaluate(id => { location.hash = '/esign/sign/' + id; }, agrId); await wait(300);
  await page.evaluate(() => document.querySelector('[data-action="cwTab"][data-id="pusig|Type"]')?.click()); await wait(200);
  await page.type('#cw-sign-typed', 'Helen Vu'); await page.evaluate(() => { document.getElementById('cw-sign-agree').checked = true; });
  await click('[data-action="cwPuSign"]'); await wait(300);
  out.signed = await page.evaluate(() => document.body.innerText.includes('Waiting for the other signers') || document.body.innerText.includes('document is complete') || document.querySelector('.tag')?.innerText);
  // second signer (co-owner Mark)
  if (await page.evaluate(() => !!document.querySelector('[data-action="cwPuSign"]'))) {
    await page.evaluate(() => document.querySelector('[data-action="cwTab"][data-id="pusig|Type"]')?.click()); await wait(150);
    await page.type('#cw-sign-typed', 'Mark Vu'); await page.evaluate(() => { document.getElementById('cw-sign-agree').checked = true; });
    await click('[data-action="cwPuSign"]'); await wait(400);
  }
  out.card3 = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await page.screenshot({ path: dir + '/j4-listed.png' });
  await click('[data-action="close"]');
  await page.evaluate(() => { location.hash = '/properties/D-2016'; }); await wait(300);
  out.strip2 = await page.evaluate(() => ({ next: document.querySelector('.cw-jn-strip b')?.innerText, done: [...document.querySelectorAll('.cw-jn-step.done')].map(x => x.innerText), stage: document.querySelector('.cw-main .tag')?.innerText }));
  await page.screenshot({ path: dir + '/j5-property.png' });
  // 6. Supplier confirms
  const tok = await page.evaluate(() => [...document.querySelectorAll('[data-action="cwGo"]')].map(x => x.dataset.id).find(id => id.startsWith('/supplier/')));
  await page.evaluate(t => { location.hash = t; }, tok); await wait(300);
  await page.screenshot({ path: dir + '/j6-supplier.png' });
  await click('[data-action="cwJnSupOk"]');
  out.supplier = await page.evaluate(() => document.querySelector('.alert.ok')?.innerText);
  await page.evaluate(() => { location.hash = '/calendar'; }); await wait(300);
  out.calendar2 = await page.evaluate(() => [...document.querySelectorAll('.cw-cal-e')].map(b => b.innerText).filter(t => /photo/i.test(t)));
  // 6b. Photographer delivers, then go live
  await page.evaluate(t => { location.hash = t; }, tok); await wait(300);
  await click('[data-action="cwJnDeliverDemo"]'); await wait(300);
  out.delivered = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await click('[data-action="close"]');
  await page.evaluate(() => { location.hash = '/properties/D-2016'; }); await wait(300);
  await click('[data-action="cwJnGoLiveOpen"]'); await wait(200);
  out.gates1 = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-gates .list-row')].map(r => r.querySelector('strong').innerText.slice(0, 40) + ' = ' + r.querySelector('.tag')?.innerText));
  await page.screenshot({ path: dir + '/j8-gates.png' });
  await click('[data-action="cwJnIdVerify"]'); await wait(200);
  await click('[data-action="cwJnIdSave"]'); await wait(200);
  await click('[data-action="cwJnUseDesc"]'); await wait(200);
  out.gates2 = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-gates .list-row')].map(r => r.querySelector('.tag')?.innerText));
  await click('[data-action="cwJnGoLiveRequest"]'); await wait(200);
  await page.evaluate(() => document.querySelector('[data-action="openApprovals"]').click()); await wait(200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-action="openApproval"]')].find(x => /Publish/i.test(x.closest('.list-row, article, div')?.innerText || '')); b && b.click(); }); await wait(200);
  await click('[data-action="approveAction"]'); await wait(400);
  out.liveCard = await page.evaluate(() => ({ title: document.querySelector('#overlay h2')?.innerText, items: [...document.querySelectorAll('.cw-jn-done strong')].map(x => x.innerText) }));
  await page.screenshot({ path: dir + '/j9-live.png' });
  await click('[data-action="close"]'); await click('[data-action="close"]');
  await page.evaluate(() => { location.hash = '/properties/D-2016'; }); await wait(300);
  out.strip3 = await page.evaluate(() => ({ next: document.querySelector('.cw-jn-strip b')?.innerText, done: document.querySelectorAll('.cw-jn-step.done').length, stage: document.querySelector('.cw-main .tag')?.innerText }));
  await page.evaluate(() => { location.hash = '/property-view-listing'; }); await wait(300);
  out.publicHas = await page.evaluate(() => /44 Smith Street/.test(document.querySelector('.cw-main')?.innerText || ''));
  await page.evaluate(() => { location.hash = '/inspections'; }); await wait(300);
  out.openHome = await page.evaluate(() => /44 Smith Street/.test(document.querySelector('.cw-main')?.innerText || ''));
  // 7. Ask GeeVee booking
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(200);
  await page.type('#gv-dock-text', "book Daniel's appraisal Friday 10am"); await page.keyboard.press('Enter'); await wait(300);
  out.ask = await page.evaluate(() => [...document.querySelectorAll('.gv-chat-bubble.assistant p')].pop()?.innerText);
  out.journeys = await page.evaluate(() => [...document.querySelectorAll('.cw-jn-mini b')].map(x => x.innerText));
  await page.evaluate(() => document.querySelector('[data-action="gvCloseChat"]')?.click()); await wait(200);
  await page.screenshot({ path: dir + '/j7-today.png' });
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

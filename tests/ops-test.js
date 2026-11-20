// Ops and rentals layers: audit trail, offer form, best and final, invoices, trust, roles, search, routes, camera, alerts, rent roll.
const puppeteer = require('puppeteer-core');
const path = require('path');
const wait = ms => new Promise(r => setTimeout(r, ms));
const [file, dir] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.__opened = []; window.open = () => { window.__opened.push(1); return { document: { write() {}, close() {} }, focus() {}, print() {} }; }; window.print = () => null; window.__downloads = []; const oc = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__downloads.push(this.download); return; } return oc.call(this); }; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const click = async (s, ms = 400) => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s); await wait(ms); return ok; };
  const go = async (r, ms = 500) => { await page.evaluate(r => { location.hash = r; }, r); await wait(ms); };
  const text = async s => page.evaluate(s => document.querySelector(s)?.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) || '', s);
  const state = async () => page.evaluate(() => JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')));
  const out = {};
  await go('/demo', 300); await click('[data-action="cwDmReset"]'); await click('[data-action="cwDmResetYes"]', 1500); await click('[data-action="cwDmOff"]');
  // dashboard probe
  await go('/'); out.dash = await page.evaluate(() => ({ cwPage: !!document.querySelector('.cw-page'), h1: document.querySelector('h1')?.innerText, route: location.hash }));
  // today: welcome line, no bands
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  out.today = await page.evaluate(() => ({ welcome: document.querySelector('.gv-day-welcome p')?.innerText.replace(/\s+/g, ' ').slice(0, 200), sizeBand: !!document.querySelector('.cw-tr-size'), smOffer: !!document.querySelector('.cw-sm-offer'), links: document.querySelectorAll('.gv-day-welcome .cw-op-link').length, alerts: !!document.querySelector('.cw-op-alerts'), office: !!document.querySelector('.cw-op-office') }));
  if (dir) await page.screenshot({ path: dir + '/ops-today.png' });
  // audit trail page
  await go('/audit'); out.audit = { title: await text('.cw-page h1'), rows: await page.evaluate(() => document.querySelectorAll('.cw-page tbody tr').length), pills: await page.evaluate(() => document.querySelectorAll('.cw-pills .cw-pill').length) };
  await click('[data-action="cwOpAuditCsv"]'); out.audit.download = await page.evaluate(() => window.__downloads.slice());
  if (dir) await page.screenshot({ path: dir + '/ops-audit.png' });
  // trust page: invoices appear for live listings; issue one
  await go('/trust'); out.trust = { title: await text('.cw-page h1'), invoices: await page.evaluate(() => document.querySelectorAll('[data-action="cwOpInvoice"]').length), deposits: await page.evaluate(() => document.querySelectorAll('[data-action="cwOpDeposit"]').length) };
  await click('[data-action="cwOpInvoice"]', 600); out.trust.afterIssue = await text('.cw-page tbody tr:first-child');
  await click('[data-action="cwOpLedgerCsv"]'); out.trust.download = await page.evaluate(() => window.__downloads.slice(-1));
  if (dir) await page.screenshot({ path: dir + '/ops-trust.png' });
  // offers: jump to the offer step so a live offer exists; then offer form + best and final
  await go('/demo', 300); await click('[data-action="cwDmGo"][data-id="9"]', 2500); await click('[data-action="cwDmOff"]');
  const st1 = await state(); const live = (st1.offers || []).filter(o => o.dealId === 'D-2006' && o.j3); out.offers = { live: live.length, deal: live[0]?.dealId, present: st1.actions.filter(a => a.j3 === 'present').map(a => a.status + ' ' + (a.previewBody || '').slice(0, 40)) };
  if (live[0]) {
    await go('/properties/' + live[0].dealId + '?tab=enquiries', 700);
    out.offers.bfBtn = !!(await page.$('[data-action="cwOpBestFinal"]'));
    await click('[data-action="cwSetF"][data-id="pr:enqsub|Offers"]', 500);
    out.offers.formBtn = !!(await page.$('[data-action="cwOpOfferForm"]'));
    await click('[data-action="cwOpOfferForm"]', 700);
    const st2 = await state(); const agr = st2.cw.esign.agreements.find(g => g.kind === 'Offer'); out.offers.agreement = agr && agr.status + ' ' + agr.title; out.offers.action = st2.actions.find(a => a.op === 'offerform')?.title;
    // preview the offer form document
    await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
    const pvId = st2.actions.find(a => a.op === 'offerform')?.id;
    out.offers.todayPreview = await page.evaluate(id => !!document.querySelector(`.cw-pv-btn[data-id="${id}"]`), pvId);
    await click('[data-action="openApprovals"]', 500);
    await page.evaluate(id => { const b = document.querySelector(`#modal-layer .cw-pv-btn[data-id="${id}"]`); b && b.click(); }, pvId); await wait(600);
    out.offers.preview = { head: await text('.cw-pv-doc-h b'), rows: await page.evaluate(() => document.querySelectorAll('.cw-pv-t tr').length), download: !!(await page.$('#modal-layer [data-action="cwPvDownload"]')) };
    await click('#modal-layer [data-action="cwPvDownload"]', 500); out.offers.preview.opened = await page.evaluate(() => window.__opened.length);
    if (dir) await page.screenshot({ path: dir + '/ops-offer-form.png' });
    await click('#modal-layer [data-action="cwPvApprove"]', 700); await click('#modal-layer [data-action="cwPvApproveYes"]', 500);
    await click('#modal-layer [data-action="close"]'); await click('#modal-layer [data-action="close"]');
    const st3 = await state(); out.offers.sent = st3.cw.esign.agreements.find(g => g.kind === 'Offer')?.status;
    // best and final needs 2 live offers: record another via the offer modal if the strip offers one
    await go('/properties/' + live[0].dealId, 700);
    if (await page.$('[data-action="cwOpBestFinal"]')) { await click('[data-action="cwOpBestFinal"]', 500); await click('#modal-layer [data-action="cwOpBestFinalGo"]', 700); const st4 = await state(); out.offers.bf = { texts: st4.actions.filter(a => a.op === 'bestfinal').length, task: st4.tasks.some(t => /Best and final deadline/.test(t.title)) }; }
    else out.offers.bf = 'one live offer only; button hidden as designed';
    // present-offer preview shows the vendor email
  }
  // sell it, then receipt the deposit and the settlement
  await go('/demo', 300); await click('[data-action="cwDmGo"][data-id="10"]', 2500); await click('[data-action="cwDmOff"]');
  await go('/trust', 700); out.money = { depositBtns: await page.evaluate(() => document.querySelectorAll('[data-action="cwOpDeposit"]').length) };
  await click('[data-action="cwOpDeposit"]', 600); await click('[data-action="cwOpSettleFees"]', 600);
  out.money.ledger = await page.evaluate(() => [...document.querySelectorAll('.cw-page tbody tr')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 70)).filter(t => /Deposit|Commission|Marketing|Referral/.test(t)).slice(0, 4));
  if (dir) await page.screenshot({ path: dir + '/ops-ledger.png' });
  // office: agent link and audit button
  await go('/office', 700); await click('[data-action="cwTab"][data-id="of|agents"]', 500); out.office = { agentLinks: await page.evaluate(() => document.querySelectorAll('[data-id^="/analytics/agent/"]').length), auditBtn: !!(await page.$('[data-action="cwGo"][data-id="/audit"]')), rentRoll: await text('.cw-card:last-child h2') };
  if (dir) await page.screenshot({ path: dir + '/ops-office.png' });
  // roles
  await click('.cw-op-role', 400); out.roles = { modal: await text('#modal-layer h2') };
  await click('#modal-layer [data-action="cwOpRole"][data-id="Assistant"]', 600);
  await go('/office', 500); out.roles.officeBlocked = await text('.cw-page .alert');
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  out.roles.askBtns = await page.evaluate(() => document.querySelectorAll('[data-action="cwOpAskAgent"]').length);
  out.roles.officeNav = !!(await page.$('.nav-button[data-id="/office"]'));
  await click('.cw-op-role', 400); await click('#modal-layer [data-action="cwOpRole"][data-id="Principal"]', 600);
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  out.roles.principalBox = await text('.cw-op-office');
  if (dir) await page.screenshot({ path: dir + '/ops-roles.png' });
  await click('.cw-op-role', 400); await click('#modal-layer [data-action="cwOpRole"][data-id="Agent"]', 600);
  // search inside notes and messages
  await page.evaluate(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })); }); await wait(400);
  await page.evaluate(() => { const i = document.querySelector('#modal-layer input,#overlay input,.command-search input'); if (i) { i.value = 'settlement'; i.dispatchEvent(new Event('input', { bubbles: true })); } }); await wait(500);
  out.search = { deep: await page.evaluate(() => [...document.querySelectorAll('h3')].some(x => /Inside notes/.test(x.innerText))), rows: await page.evaluate(() => document.querySelectorAll('[data-action="cwOpSearchGo"]').length) };
  await page.keyboard.press('Escape'); await wait(300);
  // calendar route card and drive leave-by
  await go('/calendar', 700); out.route = { card: await text('.cw-op-route'), maps: await page.evaluate(() => document.querySelector('a[href^="https://www.google.com/maps/dir"]')?.href.slice(0, 60) || '') };
  if (dir) await page.screenshot({ path: dir + '/ops-route.png' });
  await go('/drive', 700); out.route.drive = await text('.cw-dr-leave');
  // camera inputs
  const ohId = (await state()).cw.openHomes[0]?.id; await go('/open-home/' + ohId, 700);
  out.camera = { sheet: await page.evaluate(() => !!document.querySelector('input[data-cwcam="sheet"][capture]')), grid: await page.evaluate(() => getComputedStyle(document.querySelector('.cw-op-tools')).display) };
  if (dir) await page.screenshot({ path: dir + '/ops-openhome.png' });
  // rentals
  await go('/rentals', 700); out.rentals = { title: await text('.cw-page h1'), rows: await page.evaluate(() => document.querySelectorAll('.cw-pm-row').length), arrearsBtns: await page.evaluate(() => document.querySelectorAll('[data-action="cwPmArrears"]').length), tasks: (await state()).tasks.filter(t => t.pm).length };
  if (dir) await page.screenshot({ path: dir + '/ops-rentals.png' });
  await click('[data-action="cwPmArrears"]', 600); await click('[data-action="cwPmRenew"]', 600); await click('[data-action="cwPmInspect"]', 600);
  const set = async (id, v) => page.evaluate((id, v) => { const i = document.getElementById(id); if (i) { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); } return !!i; }, id, v);
  await click('[data-action="cwPmJob"]', 500); out.rentals.jobField = await set('pmJob-title', 'Oven not heating'); await click('#modal-layer [data-action="cwPmJobSave"]', 700);
  await click('[data-action="cwPmApply"]', 500); out.rentals.appField = await set('pmApply-name', 'Priya Nair'); await set('pmApply-mobile', '0400 111 222'); await click('#modal-layer [data-action="cwPmApplySave"]', 900);
  const st5 = await state(); out.rentals.after = { actions: st5.actions.filter(a => a.pm).map(a => a.pm + ':' + a.tier + ':' + a.status).sort(), lease: st5.cw.esign.agreements.find(g => g.kind === 'Lease')?.title, events: st5.cw.events.filter(e => e.pm).length, modalNow: await text('#modal-layer h2') };
  await click('#modal-layer [data-action="close"]');
  // lease preview document
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  await click('[data-action="openApprovals"]', 500);
  const leaseId = st5.actions.find(a => a.pm === 'lease')?.id; await page.evaluate(id => { const b = document.querySelector(`#modal-layer .cw-pv-btn[data-id="${id}"]`); b && b.click(); }, leaseId); await wait(600);
  out.rentals.leasePreview = await text('.cw-pv-doc-h b'); if (dir) await page.screenshot({ path: dir + '/ops-lease.png' }); await click('#modal-layer [data-action="close"]'); await click('#modal-layer [data-action="close"]');
  // assistant: protected approvals become Ask Caleb
  await click('.cw-op-role', 400); await click('#modal-layer [data-action="cwOpRole"][data-id="Assistant"]', 600);
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  out.roles.todayDiag = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')); return [...document.querySelectorAll('[data-action="quickApprove"],[data-action="cwOpAskAgent"]')].map(b => b.dataset.action + ':' + (s.actions.find(a => a.id === b.dataset.id)?.tier || '?')).slice(0, 12); });
  await click('[data-action="openApprovals"]', 500);
  await page.evaluate(id => document.querySelector(`#modal-layer [data-action="openApproval"][data-id="${id}"]`)?.click(), leaseId); await wait(500);
  out.roles.askBtns = await page.evaluate(() => document.querySelectorAll('[data-action="cwOpAskAgent"]').length);
  await click('[data-action="cwOpAskAgent"]', 600); out.roles.asked = (await state()).tasks.filter(t => /^Approve: /.test(t.title)).length;
  if (dir) await page.screenshot({ path: dir + '/ops-assistant.png' });
  await click('#modal-layer [data-action="close"]');
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

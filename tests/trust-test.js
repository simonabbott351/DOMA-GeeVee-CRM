// Preview (text, edit, approve, document), Show me, button titles, tier words, less text, undo last.
const puppeteer = require('puppeteer-core');
const path = require('path');
const wait = ms => new Promise(r => setTimeout(r, ms));
const [file, dir] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('pageerror', e => errs.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const click = async s => { const ok = await page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s); await wait(400); return ok; };
  const out = {};
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(300);
  await click('[data-action="cwDmReset"]'); await click('[data-action="cwDmResetYes"]'); await wait(1500);
  await click('[data-action="cwDmOff"]');
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(600);
  out.today = await page.evaluate(() => ({ previewBtns: document.querySelectorAll('.gv-day-items .cw-pv-btn, .cw-gr-batch .cw-pv-btn').length, daySize: document.querySelector('.cw-tr-size')?.innerText.replace(/\s+/g, ' ').slice(0, 80), offer: !!document.querySelector('.cw-sm-offer'), tierWords: [...document.querySelectorAll('.tag')].map(t => t.innerText).filter(t => /Waits for your tap|Done for you|Second look/.test(t)).length, titled: [...document.querySelectorAll('[data-action="quickApprove"][title],[data-action="gvPresentVendor"][title]')].length }));
  if (dir) await page.screenshot({ path: dir + '/trust-today.png' });
  // preview a batch text (the first inspection confirmation)
  await click('.cw-gr-batch [data-action="cwPvBatch"]'); await wait(500);
  out.pv = await page.evaluate(() => ({ title: document.querySelector('#modal-layer .dialog h2')?.innerText, phone: !!document.querySelector('.cw-pv-phone'), bubble: document.querySelector('.cw-pv-bubble')?.innerText.slice(0, 60), stop: document.querySelector('.cw-pv-meta')?.innerText.slice(0, 80), id: document.querySelector('#modal-layer [data-action="cwPvEdit"]')?.dataset.id }));
  if (dir) await page.screenshot({ path: dir + '/trust-preview-sms.png' });
  await click('#modal-layer [data-action="cwPvEdit"]'); await wait(400);
  await page.evaluate(() => { const t = document.getElementById('pv-body'); if (t) t.value = 'Hi there, confirming Saturday 11am at 9 Rose Avenue. Caleb, Collings. Reply STOP to opt out.'; });
  await click('#modal-layer [data-action="cwPvSave"]'); await wait(500);
  out.edited = await page.evaluate(() => document.querySelector('.cw-pv-bubble')?.innerText.slice(0, 40));
  await click('#modal-layer [data-action="cwPvApprove"]'); await wait(700);
  out.approved = await page.evaluate(id => { try { const s = JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')); const a = s.actions.find(x => x.id === id); return a && a.status + ' | ' + a.body.slice(0, 30); } catch (e) { return 'n/a'; } }, out.pv.id);
  // a document preview: jump the guide to the authority step (prep creates the authority action), then the bell
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(300);
  await click('[data-action="cwDmGo"][data-id="4"]'); await wait(2500);
  await click('[data-action="cwDmOff"]');
  await click('[data-action="openApprovals"]'); await wait(500);
  const authId = await page.evaluate(() => { const b = [...document.querySelectorAll('#modal-layer .cw-pv-btn')].find(x => x.closest('.card')?.innerText.includes('sales authority')); return b?.dataset.id || ''; });
  await page.evaluate(id => document.querySelector(`#modal-layer .cw-pv-btn[data-id="${id}"]`)?.click(), authId); await wait(600);
  out.doc = await page.evaluate(() => ({ title: document.querySelector('#modal-layer .dialog h2')?.innerText, pages: document.querySelectorAll('.cw-pv-page').length, head: document.querySelector('.cw-pv-doc-h b')?.innerText, pre: document.querySelectorAll('.cw-pv-pre').length, editFields: !!document.querySelector('#modal-layer [data-action="cwJnOpen"]'), approveLabel: document.querySelector('#modal-layer [data-action="cwPvApprove"]')?.innerText }));
  if (dir) await page.screenshot({ path: dir + '/trust-preview-doc.png' });
  await click('#modal-layer [data-action="close"]');
  // show me on seller leads
  await page.evaluate(() => { location.hash = '/seller-leads'; }); await wait(600);
  out.sm = { offer: !!(await page.$('.cw-sm-offer')), btn: !!(await page.$('.cw-sm-btn')) };
  await click('.cw-sm-btn'); await wait(500);
  out.sm.card1 = await page.evaluate(() => document.querySelector('.cw-sm-card')?.innerText.replace(/\s+/g, ' ').slice(0, 90));
  out.sm.spot = await page.evaluate(() => { const s = document.querySelector('.cw-sm-spot'); return !!(s && s.style.display !== 'none'); });
  if (dir) await page.screenshot({ path: dir + '/trust-showme.png' });
  for (let i = 0; i < 4; i++) { await click('.cw-sm-card [data-action="cwSmNext"]'); await wait(300); }
  out.sm.gone = await page.evaluate(() => getComputedStyle(document.querySelector('.cw-sm-card')).display === 'none');
  await page.evaluate(() => { location.hash = '/contacts'; }); await wait(300); await page.evaluate(() => { location.hash = '/seller-leads'; }); await wait(500);
  out.sm.offerAgain = !!(await page.$('.cw-sm-offer'));
  // less text and undo last
  await page.evaluate(() => document.querySelector('[data-action="route"][data-id="today"]').click()); await wait(500);
  await click('[data-action="cwTrCompact"]'); await wait(400);
  out.compact = await page.evaluate(() => !!document.querySelector('.shell.cw-tr-compact'));
  await click('[data-action="cwEdClose"]'); await wait(600);
  out.undo = await page.evaluate(() => !!document.querySelector('.cw-tr-undo'));
  await click('#modal-layer [data-action="close"]');
  out.errs = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

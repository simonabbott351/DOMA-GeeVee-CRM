// Drives the whole 16-step demo using only what the spotlight points at and the panel's buttons.
// Reports any sub-step where nothing was ringed for more than ~4s (then skips it) and any page errors.
const puppeteer = require('puppeteer-core');
const path = require('path');
const [file, dir] = process.argv.slice(2);
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const page = await browser.newPage(); await page.setViewport({ width: 1500, height: 950 });
  const errs = []; page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.evaluateOnNewDocument(() => { window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.resolve(file).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1500);
  const click = async s => page.evaluate(s => { const b = document.querySelector(s); if (b) { b.click(); return true; } return false; }, s);
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(400);
  await click('[data-action="cwDmReset"]'); await wait(300); await click('[data-action="cwDmResetYes"]'); await wait(1500);
  await click('[data-action="cwDmStart"]'); await wait(800);
  const info = () => page.evaluate(() => {
    const p = document.querySelector('.cw-dm-panel'); const spot = document.getElementById('cw-wk-spot');
    const r = spot && spot.style.display !== 'none' ? spot.getBoundingClientRect() : null;
    const q = s => p && p.querySelector(s);
    return { step: (p?.querySelector('.gv-eyebrow')?.innerText || '').replace(/\D+/g, ' ').trim(), now: q('.cw-wk-list li.now span')?.innerText || '', done: !!q('.cw-wk-done'), miss: !!q('.cw-wk-miss.on'),
      fill: !!q('[data-action="cwWkFill"]'), type: !!q('[data-action="cwWkType"]'), go: !!q('[data-action="cwWkGo"]'), got: !!q('[data-action="cwWkNext"].btn'),
      spot: r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } : null, tip: spot?.querySelector('.cw-wk-tip')?.innerText || '', hash: location.hash, modal: !!document.querySelector('#modal-layer .dialog'),
      under: r ? (el => el ? el.tagName + '.' + (typeof el.className === 'string' ? el.className : '') + ' [' + (el.closest('[data-action]')?.dataset.action || '') + ']' : null)(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)) : null,
      modalTitle: document.querySelector('#modal-layer .dialog h2, #modal-layer .dialog h1')?.innerText || '', spotZ: spot?.style.zIndex,
      strip: [...document.querySelectorAll('.cw-jn-strip [data-action]')].map(b => (b.innerText || '').trim()).slice(0, 10),
      agr: (() => { try { const st = JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')); return (st.cw.esign.agreements || []).map(a => (a.title || a.kind || a.id) + ':' + a.status + ':' + (a.jn || a.j3 || '')).slice(-4); } catch (e) { return 'n/a'; } })(),
      modalBtns: [...document.querySelectorAll('#modal-layer [data-action]')].map(b => b.dataset.action + ':' + (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 24) + ' @' + (b.closest('.list-row,tr,.card,article')?.innerText || '').replace(/\s+/g, ' ').slice(0, 50)).slice(0, 12) };
  });
  const stopAt = Number(process.env.STOP_AT || 0);
  const log = [], stuck = []; let last = '', same = 0, shots = 0;
  for (let n = 0; n < 500; n++) {
    const s = await info();
    const key = s.step + '|' + s.now + '|' + s.done;
    if (key === last) same++; else { same = 0; last = key; log.push(s.step + ' ' + (s.done ? 'DONE' : s.now)); }
    if (same > 8) { stuck.push({ step: s.step, sub: s.now, hash: s.hash, modal: s.modal, miss: s.miss, under: s.under, modalBtns: s.modalBtns, strip: s.strip, agr: s.agr, modalTitle: s.modalTitle, spotZ: s.spotZ }); if (dir) await page.screenshot({ path: dir + '/stuck-' + stuck.length + '.png' }); await click('.cw-dm-panel .cw-wk-acts [data-action="cwWkNext"]'); same = 0; await wait(400); continue; }
    if (stopAt && Number(s.step.split(' ')[0]) > stopAt) break;
    if (s.done) {
      if (/^22 /.test(s.step)) break;
      await click('.cw-dm-panel [data-action="cwDmNext"][data-id="1"]'); await wait(700); continue;
    }
    if (s.fill) { await click('.cw-dm-panel [data-action="cwWkFill"]'); await wait(400); continue; }
    if (s.type) { await click('.cw-dm-panel [data-action="cwWkType"]'); await wait(700); continue; }
    if (s.go) { await click('.cw-dm-panel [data-action="cwWkGo"]'); await wait(700); continue; }
    if (s.got) { await click('.cw-dm-panel [data-action="cwWkNext"].btn'); await wait(400); continue; }
    if (s.spot) {
      if (dir && shots < 6 && n % 7 === 3) { await page.screenshot({ path: dir + '/walk-' + (shots++) + '.png' }); }
      await page.mouse.click(s.spot.x, s.spot.y); await wait(650); continue;
    }
    await wait(350);
  }
  const final = await info();
  final.state = await page.evaluate(() => { try { const st = JSON.parse(localStorage.getItem('doma-v2-phase2-integrated-v2')); const d = st.deals.find(x => x.id === 'D-2006'); return { j3acts: st.actions.filter(a => a.j3).map(a => a.j3 + ':' + a.status + ':' + a.title.slice(0, 50)), offers: (st.offers || []).filter(o => o.dealId === 'D-2006').map(o => o.buyerId + ':' + o.status + ':' + (o.presentedAt ? 'presented' : 'np') + ':' + o.amount), j3: d && d.cw && d.cw.j3, stage: d && d.stage, contracts: (st.cw.esign.agreements || []).filter(a => a.dealId === 'D-2006').map(a => a.title + ':' + a.status + ':' + (a.j3 || '')) }; } catch (e) { return String(e); } });
  console.log(JSON.stringify({ steps: log.length, final: final.step, finalDone: final.done, state: final.state, stuck, errs, trail: log }, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });



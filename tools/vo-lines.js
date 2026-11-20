// Writes data/vo-lines.json: every narration line the story can speak, keyed exactly as cwVoSay keys them.
// Usage: node tools/vo-lines.js   (needs puppeteer-core and Chrome, like the tests)
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} });
  await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1500));
  const lines = await page.evaluate(() => {
    const out = {};
    CW_VO.ch.forEach((t, i) => { out['ch:' + i] = (i === 0 ? CW_VO.open + ' ' : '') + t; });
    for (const [k, t] of Object.entries(CW_VO.step)) out['st:' + k] = t;
    for (const [k, t] of Object.entries(CW_VO.sub)) out['sub:' + k] = t;
    CW_STORY.forEach((c, i) => { out['out:' + i] = 'What just happened. ' + c.out.join('. ') + '. ' + (CW_VO.out[i] || c.saved); });
    out.end = CW_VO.end;
    return out;
  });
  fs.writeFileSync(path.join(ROOT, 'data', 'vo-lines.json'), JSON.stringify(lines, null, 1));
  const words = Object.values(lines).reduce((a, t) => a + t.split(/\s+/).length, 0);
  console.log(Object.keys(lines).length + ' lines, ' + words + ' words');
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });

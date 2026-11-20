// Records every narration line (full story and film cut) with Microsoft's neural Australian voices through edge-tts,
// measures each file with ffprobe and writes data/vo-audio.js. Lines that already have a file are skipped.
// Usage: node tools/vo-audio.js [--voice natasha|william] [--default natasha]
// Needs: Python with edge-tts (pip install edge-tts), ffprobe, puppeteer-core + Chrome (to read the lines from the app).
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const only = args.includes('--voice') ? args[args.indexOf('--voice') + 1] : '';
const def = args.includes('--default') ? args[args.indexOf('--default') + 1] : '';
const VOICES = { natasha: 'en-AU-NatashaNeural', william: 'en-AU-WilliamNeural' };
const PY = process.env.PYTHON || path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe');
const FFPROBE = process.env.FFPROBE || (fs.readdirSync(path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages')).filter(d => d.startsWith('Gyan.FFmpeg')).map(d => { const base = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages', d); const sub = fs.readdirSync(base).find(x => x.startsWith('ffmpeg')); return path.join(base, sub, 'bin', 'ffprobe.exe'); })[0] || 'ffprobe');
const hash = t => { let x = 5381; const s = String(t).replace(/\s+/g, ' ').trim(); for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(36); };
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio'] });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} });
  await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 });
  await new Promise(r => setTimeout(r, 1500));
  const texts = await page.evaluate(() => {
    const out = new Set();
    const full = (vo, story) => { vo.ch.forEach((t, i) => out.add((i === 0 ? vo.open + ' ' : '') + t)); Object.values(vo.step).forEach(t => out.add(t)); Object.values(vo.sub || {}).forEach(t => out.add(t)); story.forEach((c, i) => out.add('What just happened. ' + c.out.join('. ') + '. ' + (vo.out[i] || c.saved))); out.add(vo.end); };
    full(CW_VO, CW_STORY);
    // the film and training cuts: one outcome line per chapter, read as "What just happened. <line>."
    for (const cut of [CW_FILM, CW_TRAIN]) { cut.ch.forEach((t, i) => out.add((i === 0 ? cut.open + ' ' : '') + t)); Object.values(cut.step).forEach(t => out.add(t)); Object.values(cut.sub || {}).forEach(t => out.add(t)); Object.values(cut.after || {}).forEach(t => out.add(t)); cut.out.forEach(t => out.add('What just happened. ' + t.replace(/\.$/, '') + '. ')); out.add(cut.end); }
    return [...out];
  });
  await browser.close();
  const manifest = fs.existsSync(path.join(ROOT, 'data', 'vo-audio.js')) ? (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'vo-audio.js'), 'utf8').replace(/^[\s\S]*?window\.DOMA_VO=/, '').replace(/;\s*$/, '')); } catch (e) { return null; } })() : null;
  const out = { voice: def || (manifest && manifest.voice) || 'natasha', voices: (manifest && manifest.voices) || {} };
  for (const [name, id] of Object.entries(VOICES)) {
    if (only && only !== name) continue;
    const dir = path.join(ROOT, 'audio', name); fs.mkdirSync(dir, { recursive: true });
    const lines = (out.voices[name] && out.voices[name].lines) || {};
    let made = 0;
    for (const t of texts) {
      const h = hash(t); const file = h + '.mp3'; const p = path.join(dir, file);
      if (!fs.existsSync(p) || fs.statSync(p).size < 1000) {
        let ok = false; for (let attempt = 1; attempt <= 4 && !ok; attempt++) { try { execFileSync(PY, ['-m', 'edge_tts', '--voice', id, '--rate=-4%', '--text', t, '--write-media', p], { stdio: 'pipe' }); ok = fs.existsSync(p) && fs.statSync(p).size >= 1000; } catch (e) { ok = false; } if (!ok) { try { fs.unlinkSync(p); } catch (e) {} execFileSync(process.execPath, ['-e', 'setTimeout(()=>{}, 1500)']); } }
        if (!ok) throw new Error('could not record: ' + t.slice(0, 60)); made++;
      }
      if (!lines[h] || !lines[h].ms) {
        const sec = parseFloat(String(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', p])).trim());
        lines[h] = { file, ms: Math.round(sec * 1000), words: t.split(/\s+/).length };
      }
    }
    out.voices[name] = { id, base: 'audio/' + name + '/', lines };
    const total = Object.values(lines).reduce((a, l) => a + l.ms, 0);
    console.log(name + ': ' + Object.keys(lines).length + ' lines, ' + made + ' recorded now, ' + Math.round(total / 1000) + ' s of speech');
  }
  fs.writeFileSync(path.join(ROOT, 'data', 'vo-audio.js'), '/* Recorded narration index. Generated by tools/vo-audio.js; do not edit by hand. */\nwindow.DOMA_VO=' + JSON.stringify(out) + ';\n');
  console.log('default voice: ' + out.voice);
})().catch(e => { console.error(String(e.stderr || e)); process.exit(1); });

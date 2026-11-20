// Records the story as a film: a screen capture of watch mode with the recorded narration mixed in.
// Usage: node tools/film.js [--full] [--out dist/film.mp4] [--width 1600 --height 900]
// Needs: puppeteer-core + Chrome, ffmpeg, and data/vo-audio.js with the voice recorded (node tools/vo-audio.js).
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const arg = (k, d) => args.includes(k) ? args[args.indexOf(k) + 1] : d;
const FULL = args.includes('--full');
const OUT = path.resolve(ROOT, arg('--out', FULL ? 'dist/film-full.mp4' : 'dist/film.mp4'));
const W = Number(arg('--width', 1600)), H = Number(arg('--height', 900));
const wait = ms => new Promise(r => setTimeout(r, ms));
const FF = (() => { if (process.env.FFMPEG) return process.env.FFMPEG; try { const base = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Packages'); const d = fs.readdirSync(base).find(x => x.startsWith('Gyan.FFmpeg')); const sub = fs.readdirSync(path.join(base, d)).find(x => x.startsWith('ffmpeg')); return path.join(base, d, sub, 'bin', 'ffmpeg.exe'); } catch (e) { return 'ffmpeg'; } })();
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'vo-audio.js'), 'utf8').replace(/^[\s\S]*?window\.DOMA_VO=/, '').replace(/;\s*$/, ''));
const voice = manifest.voices[manifest.voice];
if (!voice) { console.error('No recorded voice in data/vo-audio.js. Run node tools/vo-audio.js first.'); process.exit(1); }
(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const webm = OUT.replace(/\.mp4$/, '.webm');
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--mute-audio', '--hide-scrollbars', `--window-size=${W},${H}`, '--force-device-scale-factor=1'] });
  const page = await browser.newPage(); await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  const errs = []; const lines = []; let t0 = null, epoch0 = null;
  page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { const t = m.text(); if (t.startsWith('VO|')) { const [, hash, now, ms] = t.split('|'); lines.push({ hash, at: Number(now), ms: Number(ms) }); } else if (t.startsWith('T0|')) { const [, a, b] = t.split('|'); t0 = Number(a); epoch0 = Number(b); } });
  // frames straight from Chrome with their timestamps, so the picture keeps real time (puppeteer's own screencast runs about 20% slow)
  const frameDir = path.join(require('os').tmpdir(), 'doma-film-' + process.pid); fs.mkdirSync(frameDir, { recursive: true });
  const frames = []; const cdp = await page.createCDPSession();
  cdp.on('Page.screencastFrame', async ev => { try { const n = frames.length; const f = path.join(frameDir, String(n).padStart(6, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(ev.data, 'base64')); frames.push({ f, ts: ev.metadata.timestamp }); } catch (e) {} try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) {} });
  await page.evaluateOnNewDocument(() => { try { Object.defineProperty(window, 'speechSynthesis', { value: { speak() {}, cancel() {}, pause() {}, resume() {}, getVoices() { return []; }, paused: false } }); } catch (e) {} window.open = () => null; window.print = () => null; });
  await page.goto('file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/'), { waitUntil: 'load', timeout: 120000 }); await wait(1200);
  await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load' }); await wait(1200);
  const click = async (s, ms = 400) => { await page.evaluate(s => document.querySelector(s)?.click(), s); await wait(ms); };
  await page.evaluate(() => { location.hash = '/demo'; }); await wait(300);
  await click('[data-action="cwDmReset"]'); await click('[data-action="cwDmResetYes"]', 1500); await click('[data-action="cwDmOff"]');
  await page.evaluate(() => { location.hash = '/start'; }); await wait(800);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  await wait(600);
  await page.evaluate(() => console.log('T0|' + performance.now() + '|' + Date.now()));
  await page.evaluate(mode => doAction('cwStFilm', mode), FULL ? 'record-full' : 'record');
  const started = Date.now(); let last = ''; let same = 0;
  while (Date.now() - started < 15 * 60e3) {
    await wait(500);
    const s = await page.evaluate(() => { const st = cwStS(); return { on: st.on, phase: st.phase, busy: cwVo.busy, key: cwVo.key, ch: st.ch, idx: st.idx }; });
    if (!s.on) break;
    if (s.phase === 'end' && !s.busy) { await wait(2500); break; }
    const sig = JSON.stringify(s); if (sig === last) { same++; if (same > 160) { console.error('stalled at ' + sig); break; } } else { same = 0; last = sig; }
  }
  await wait(1000); try { await cdp.send('Page.stopScreencast'); } catch (e) {} await wait(500);
  await browser.close();
  if (t0 === null || frames.length < 2) { console.error('no T0 marker or no frames'); process.exit(1); }
  // the picture: every captured frame shown until the next one, at its real time
  const first = frames[0].ts;
  const list = frames.map((fr, i) => `file '${fr.f.replace(/\\/g, '/')}'\nduration ${Math.max(0.01, (i + 1 < frames.length ? frames[i + 1].ts : fr.ts + 1) - fr.ts).toFixed(4)}`).join('\n') + `\nfile '${frames[frames.length - 1].f.replace(/\\/g, '/')}'\n`;
  const listFile = path.join(frameDir, 'list.txt'); fs.writeFileSync(listFile, list);
  execFileSync(FF, ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-vf', 'fps=30,scale=' + W + ':' + H + ':force_original_aspect_ratio=decrease,pad=' + W + ':' + H + ':(ow-iw)/2:(oh-ih)/2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-an', webm.replace(/\.webm$/, '-video.mp4')], { stdio: 'pipe' });
  const video = webm.replace(/\.webm$/, '-video.mp4');
  // the narration track: every line delayed to the moment it was spoken (same wall clock as the frames), mixed into one file
  const cues = lines.map(l => ({ file: path.join(ROOT, voice.base, voice.lines[l.hash]?.file || ''), at: Math.max(0, Math.round((epoch0 + (l.at - t0)) - first * 1000)) })).filter(c => c.file && fs.existsSync(c.file));
  const inputs = cues.flatMap(c => ['-i', c.file]);
  const filter = cues.map((c, i) => `[${i}:a]aresample=48000,adelay=${c.at}|${c.at}[a${i}]`).join(';') + ';' + cues.map((c, i) => `[a${i}]`).join('') + `amix=inputs=${cues.length}:dropout_transition=0:normalize=0[mix]`;
  const track = OUT.replace(/\.mp4$/, '.m4a');
  execFileSync(FF, ['-y', ...inputs, '-filter_complex', filter, '-map', '[mix]', '-c:a', 'aac', '-b:a', '160k', track], { stdio: 'pipe' });
  execFileSync(FF, ['-y', '-i', video, '-i', track, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', OUT], { stdio: 'pipe' });
  try { fs.unlinkSync(video); fs.unlinkSync(track); fs.rmSync(frameDir, { recursive: true, force: true }); } catch (e) {}
  const secs = Math.round((lines.length ? Math.max(...lines.map(l => l.at - t0 + l.ms)) : 0) / 1000);
  console.log(JSON.stringify({ out: OUT, size: (fs.statSync(OUT).size / 1e6).toFixed(1) + ' MB', frames: frames.length, lines: lines.length, cues: cues.length, narrationEndsAt: secs, errs }, null, 1));
})().catch(e => { console.error(String(e.stderr || e)); process.exit(1); });

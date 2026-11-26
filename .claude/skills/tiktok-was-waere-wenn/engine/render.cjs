#!/usr/bin/env node
/* Stufe 3: Frames rendern.
   node render.cjs <projekt>                      -> <projekt>/build/video_noaudio.mp4
   node render.cjs <projekt> --stills 1.2,5,9.8   -> <projekt>/build/stills/*.png (Kontrollbilder)
   Optionen: --fps 30  --workers 3  --from 0 --to 999 */
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ENGINE = __dirname;
const proj = path.resolve(process.argv[2]);
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), WORKERS = +arg('workers', 3);
const build = path.join(proj, 'build');
const tl = JSON.parse(fs.readFileSync(path.join(build, 'timeline.json'), 'utf8'));
// Stil-Einstellungen aus script.json (theme, captions, series, nr, tagline) an den Player geben
try {
  const sc = JSON.parse(fs.readFileSync(path.join(proj, 'script.json'), 'utf8'));
  tl.cfg = { theme: sc.theme || 'navy', captions: sc.captions ?? (sc.theme !== 'mono'), series: sc.series, nr: sc.nr, tagline: sc.tagline };
} catch (e) { tl.cfg = { theme: 'navy', captions: true }; }

function composeHtml() {
  let html = fs.readFileSync(path.join(ENGINE, 'player.html'), 'utf8');
  const scenes = fs.readFileSync(path.join(proj, 'scenes.js'), 'utf8');
  html = html.replace(/__FONTS__/g, 'file://' + path.join(ENGINE, 'fonts'))
    .replace('__LIB__', () => fs.readFileSync(path.join(ENGINE, 'lib.js'), 'utf8'))
    .replace('__SCENES__', () => scenes)
    .replace('__TIMELINE__', () => JSON.stringify(tl));
  const out = path.join(build, '_player.html');
  fs.writeFileSync(out, html);
  return 'file://' + out;
}

async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('Seitenfehler:', e.message));
  await page.goto(url);
  await page.evaluate(() => window.READY);
  return page;
}

async function renderRange(browser, url, f0, f1, outFile, id) {
  const page = await openPage(browser, url);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (id === 0 && (f - f0) % 150 === 0) console.log(`  Worker 0: ${Math.round((f - f0) / (f1 - f0) * 100)} %`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
}

(async () => {
  const url = composeHtml();
  const browser = await chromium.launch();
  const stills = arg('stills', null);
  if (stills) {
    const dir = path.join(build, 'stills'); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, url);
    for (const s of stills.split(',')) {
      await page.evaluate(t => window.seek(t), +s);
      await page.screenshot({ path: path.join(dir, `t_${(+s).toFixed(2)}.png`) });
    }
    await browser.close(); console.log('Stills ->', dir); return;
  }
  const from = Math.floor(+arg('from', 0) * FPS), to = Math.ceil(Math.min(+arg('to', 1e9), tl.duration) * FPS);
  const n = to - from, per = Math.ceil(n / WORKERS), parts = [];
  console.log(`Rendere ${n} Frames (${(n / FPS).toFixed(1)} s) mit ${WORKERS} Workern …`);
  const jobs = [];
  for (let w = 0; w < WORKERS; w++) {
    const a = from + w * per, b = Math.min(to, a + per); if (a >= b) break;
    const f = path.join(build, `part_${w}.mp4`); parts.push(f);
    jobs.push(renderRange(browser, url, a, b, f, w));
  }
  await Promise.all(jobs);
  await browser.close();
  const list = path.join(build, 'parts.txt');
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(build, 'video_noaudio.mp4')]);
  parts.forEach(p => fs.unlinkSync(p));
  console.log('Video ->', path.join(build, 'video_noaudio.mp4'));
})();

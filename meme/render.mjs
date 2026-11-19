// Render meme/meme.html to meme/meme.png (square 1080x1080) with headless Chrome
// over CDP. No network: the page is a local file, all art is inline SVG/CSS.
// Usage: node meme/render.mjs
import { spawn, execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const POLICY = '/home/hatch/workspace/makefun/devtools/webgl-policy.txt';
const SHA = execSync(`sha256sum "${POLICY}" | cut -d' ' -f1`, { encoding: 'utf8' }).trim();
const CHROME = '/opt/meta-chromium/chrome';
const PAGE = `file://${join(ROOT, 'meme', 'meme.html')}`;
const OUT = join(ROOT, 'meme', 'meme.png');

const PORT = 9600 + (process.pid % 50);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  '--allow-file-access-from-files',
  `--user-data-dir=/tmp/cdp-meme-${process.pid}`, '--window-size=1080,1080',
  `--remote-debugging-port=${PORT}`,
  `--hatch-webgl-allowed-domains-file=${POLICY}`,
  `--hatch-webgl-allowed-domains-sha256=${SHA}`,
  PAGE,
], { stdio: 'ignore' });

let target;
for (let i = 0; i < 40; i++) {
  await sleep(500);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === 'page');
    if (target?.webSocketDebuggerUrl) break;
  } catch { /* not up yet */ }
}
if (!target?.webSocketDebuggerUrl) { chrome.kill(); throw new Error('no CDP target'); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
const errs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  } else if (m.method === 'Runtime.exceptionThrown') {
    errs.push(m.params.exceptionDetails.text);
  } else if (m.method === 'Network.requestWillBeSent'
    && !m.params.request.url.startsWith('file://')
    && !m.params.request.url.startsWith('data:')
    && !m.params.request.url.startsWith('blob:')) {
    errs.push('EXTERNAL REQUEST: ' + m.params.request.url);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params }));
  setTimeout(() => {
    if (pending.has(mid)) { pending.delete(mid); rej(new Error(`timeout ${method}`)); }
  }, 60000);
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1080, height: 1080, deviceScaleFactor: 1, mobile: false,
});
await sleep(1500);
const shot = await send('Page.captureScreenshot', { format: 'png' });
const buf = Buffer.from(shot.data, 'base64');
writeFileSync(OUT, buf);
console.log('wrote', OUT, 'bytes', buf.length);
console.log('errors:', errs.length ? errs : 'none');
ws.close();
chrome.kill();
process.exit(0);

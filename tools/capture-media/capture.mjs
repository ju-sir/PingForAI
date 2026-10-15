// Capture the current showcase as docs/media/showcase.png and og.png.
// Run npm run media after building the site; no external service is used.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { app, BrowserWindow } from 'electron';

const site = resolve('site-dist');
const out = resolve('docs/media');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
app.disableHardwareAcceleration();
app.on('window-all-closed', () => {});
app.whenReady().then(async () => {
  let server;
  try {
    server = createServer((req, res) => {
      let path;
      try { path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname); }
      catch { res.writeHead(400).end(); return; }
      const file = resolve(site, `.${path.endsWith('/') ? `${path}index.html` : path}`);
      if (!file.startsWith(site + sep) || !existsSync(file)) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
    });
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
    const win = new BrowserWindow({ width: 1280, height: 1200, show: false, useContentSize: true, webPreferences: { offscreen: true, sandbox: true, contextIsolation: true } });
    await win.loadURL(`http://127.0.0.1:${server.address().port}/`);
    await win.webContents.executeJavaScript('document.fonts.ready');
    const image = await win.webContents.capturePage();
    mkdirSync(out, { recursive: true });
    writeFileSync(resolve(out, 'showcase.png'), image.toPNG());
    writeFileSync(resolve(out, 'og.png'), image.resize({ width: 1200 }).toPNG());
    win.destroy();
    server.close();
    console.log('Captured showcase.png and og.png');
    app.exit(0);
  } catch (error) { server?.close(); console.error(error); app.exit(1); }
});

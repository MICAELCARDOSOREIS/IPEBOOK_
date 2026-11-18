import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join } from "node:path";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
};

function resolveStaticFile(distDir, pathname) {
  const cleanPath = decodeURIComponent(pathname.split("?")[0]).replace(/^\/+/, "");
  const candidates = [];

  if (cleanPath === "") {
    candidates.push(join(distDir, "index.html"));
  } else {
    candidates.push(join(distDir, cleanPath));
    if (!extname(cleanPath)) {
      candidates.push(join(distDir, `${cleanPath}.html`));
      candidates.push(join(distDir, cleanPath, "index.html"));
    }
  }

  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return { filePath: candidate, status: 200 };
    }
  }

  const fallback = join(distDir, "index.html");
  if (existsSync(fallback)) {
    return { filePath: fallback, status: 200 };
  }
  return { filePath: null, status: 404 };
}

export async function startStaticServer(distDir) {
  const server = createServer((req, res) => {
    const reqUrl = req.url ?? "/";
    const { filePath, status } = resolveStaticFile(distDir, reqUrl);
    if (!filePath) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] ?? "application/octet-stream";
    res.writeHead(status, { "Content-Type": mime, "Cache-Control": "no-store" });
    res.end(readFileSync(filePath));
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class CdpPage {
  constructor(ws, chromeProc, userDataDir) {
    this.ws = ws;
    this.chromeProc = chromeProc;
    this.userDataDir = userDataDir;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.exceptions = [];
    this.consoleErrors = [];

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id !== undefined) {
        const entry = this.pending.get(msg.id);
        if (!entry) return;
        this.pending.delete(msg.id);
        if (msg.error) {
          entry.reject(new Error(`CDP ${entry.method}: ${msg.error.message}`));
        } else {
          entry.resolve(msg.result);
        }
        return;
      }

      if (msg.method === "Runtime.exceptionThrown") {
        const desc =
          msg.params?.exceptionDetails?.exception?.description ??
          msg.params?.exceptionDetails?.text ??
          "Exceção JS não tratada";
        this.exceptions.push(desc);
      } else if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
        const text = (msg.params.args ?? []).map((a) => a.value ?? a.description ?? "").join(" ");
        this.consoleErrors.push(text);
      }

      const handlers = this.listeners.get(msg.method);
      if (handlers) {
        for (const handler of [...handlers]) {
          handler(msg.params);
        }
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  once(eventMethod, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(eventMethod, handler);
        reject(new Error(`Timeout aguardando evento CDP ${eventMethod}`));
      }, timeoutMs);
      const handler = (params) => {
        clearTimeout(timer);
        this.off(eventMethod, handler);
        resolve(params);
      };
      this.on(eventMethod, handler);
    });
  }

  on(eventMethod, handler) {
    if (!this.listeners.has(eventMethod)) {
      this.listeners.set(eventMethod, new Set());
    }
    this.listeners.get(eventMethod).add(handler);
  }

  off(eventMethod, handler) {
    this.listeners.get(eventMethod)?.delete(handler);
  }

  clearErrors() {
    this.exceptions = [];
    this.consoleErrors = [];
  }

  async setViewport(width, height, isMobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: isMobile ? 2 : 1,
      mobile: isMobile,
    });
  }

  async goto(url) {
    const loadPromise = this.once("Page.loadEventFired", 20000);
    await this.send("Page.navigate", { url });
    await loadPromise;
    await sleep(350);
  }

  async eval(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        res.exceptionDetails.exception?.description ?? res.exceptionDetails.text ?? "Erro ao avaliar JS",
      );
    }
    return res.result?.value;
  }

  async waitFor(expression, { timeoutMs = 15000, intervalMs = 150, message = "" } = {}) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const value = await this.eval(expression);
      if (value) return value;
      await sleep(intervalMs);
    }
    const bodyPreview = await this.eval("(document.body?.innerText || '').slice(0, 400)");
    throw new Error(
      `Timeout (${timeoutMs}ms)${message ? `: ${message}` : ""}. Texto visível: ${JSON.stringify(bodyPreview)}`,
    );
  }

  async waitForText(text, opts = {}) {
    const escaped = JSON.stringify(text);
    return this.waitFor(`Boolean(document.body && document.body.innerText.includes(${escaped}))`, {
      ...opts,
      message: opts.message ?? `aguardando texto ${escaped}`,
    });
  }

  async clickPoint(x, y) {
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    await sleep(200);
  }

  async clickBySelector(selector, { timeoutMs = 10000 } = {}) {
    const escaped = JSON.stringify(selector);
    const point = await this.waitFor(
      `(() => {
        const els = Array.from(document.querySelectorAll(${escaped}));
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            el.scrollIntoView({ block: 'center', inline: 'center' });
            const r2 = el.getBoundingClientRect();
            return { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
          }
        }
        return null;
      })()`,
      { timeoutMs, message: `elemento visível ${escaped}` },
    );
    await this.clickPoint(point.x, point.y);
  }

  async clickByText(text, { exact = false, timeoutMs = 10000, preferTag = "" } = {}) {
    const escaped = JSON.stringify(text);
    const tagFilter = JSON.stringify(preferTag);
    const point = await this.waitFor(
      `(() => {
        const target = ${escaped};
        const prefer = ${tagFilter};
        const selector = prefer || 'button, a, [role="button"], [role="tab"], [role="link"], [tabindex="0"], div, span';
        const candidates = Array.from(document.querySelectorAll(selector));
        let best = null;
        for (const el of candidates) {
          const txt = (el.innerText || el.getAttribute('aria-label') || '').trim();
          const match = ${exact ? "txt === target" : "txt === target || txt.includes(target)"};
          if (!match) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (!best || (txt === target && (best.innerText || '').trim() !== target) || r.width * r.height < best.area) {
            best = { el, area: r.width * r.height, innerText: el.innerText };
          }
        }
        if (!best) return null;
        best.el.scrollIntoView({ block: 'center', inline: 'center' });
        const r2 = best.el.getBoundingClientRect();
        return { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };
      })()`,
      { timeoutMs, message: `botão/texto ${escaped}` },
    );
    await this.clickPoint(point.x, point.y);
  }

  async setOnline(online) {
    const isOnline = Boolean(online);
    await this.send("Network.emulateNetworkConditions", {
      offline: !isOnline,
      latency: 0,
      downloadThroughput: isOnline ? -1 : 0,
      uploadThroughput: isOnline ? -1 : 0,
    });
    await this.eval(
      `window.__e2eOnline = ${isOnline}; window.dispatchEvent(new Event(${JSON.stringify(isOnline ? "online" : "offline")})); navigator.connection?.dispatchEvent(new Event("change"));`,
    );
  }

  async fillInput(selector, value, { timeoutMs = 10000 } = {}) {
    const sel = JSON.stringify(selector);
    const hasExisting = await this.waitFor(
      `(() => {
        const els = Array.from(document.querySelectorAll(${sel}));
        const el = els.find((item) => {
          const r = item.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        });
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        el.focus();
        el.select();
        return { len: (el.value || '').length };
      })()`,
      { timeoutMs, message: `campo ${sel}` },
    );
    if (hasExisting.len > 0) {
      await this.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
      await this.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
    }
    if (value.length > 0) {
      await this.send("Input.insertText", { text: value });
    }
    await sleep(150);
    const atual = await this.eval(
      `Array.from(document.querySelectorAll(${sel})).find((item) => { const r = item.getBoundingClientRect(); return r.width > 0 && r.height > 0; })?.value ?? ""`,
    );
    if (atual !== value) {
      throw new Error(`Valor inesperado em ${selector}: esperado ${JSON.stringify(value)}, obtido ${JSON.stringify(atual)}`);
    }
  }

  async screenshot(filePath) {
    mkdirSync(dirname(filePath), { recursive: true });
    const { data } = await this.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(filePath, Buffer.from(data, "base64"));
  }

  async resetAppState(baseUrl) {
    const origin = await this.eval("window.location.origin").catch(() => "");
    if (!origin || origin === "null") {
      await this.goto(baseUrl);
    }
    await this.eval("localStorage.clear(); sessionStorage.clear();");
    await this.goto(baseUrl);
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      // ignora erro ao fechar websocket já encerrado
    }
    if (this.chromeProc && !this.chromeProc.killed) {
      this.chromeProc.kill("SIGTERM");
      await Promise.race([
        new Promise((resolve) => this.chromeProc.once("exit", resolve)),
        sleep(2000),
      ]);
      if (this.chromeProc.exitCode === null) {
        this.chromeProc.kill("SIGKILL");
      }
    }
    if (this.userDataDir && existsSync(this.userDataDir)) {
      rmSync(this.userDataDir, { recursive: true, force: true });
    }
  }
}

export async function launchChromeCdp() {
  const userDataDir = mkdtempSync(join(tmpdir(), "ipebook-e2e-"));
  const xdgConfig = join(userDataDir, "xdg-config");
  const xdgCache = join(userDataDir, "xdg-cache");
  mkdirSync(xdgConfig, { recursive: true });
  mkdirSync(xdgCache, { recursive: true });
  const defaultChromeWin = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const chromeBin =
    process.env.CHROME_BIN ||
    (process.platform === "win32" && existsSync(defaultChromeWin)
      ? defaultChromeWin
      : "google-chrome");
  const proc = spawn(
    chromeBin,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        XDG_CONFIG_HOME: xdgConfig,
        XDG_CACHE_HOME: xdgCache,
      },
    },
  );

  const debugBaseUrl = await new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => {
      reject(new Error(`Timeout iniciando ${chromeBin}. Stderr: ${stderr}`));
    }, 15000);

    proc.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`${chromeBin} encerrou prematuramente com código ${code}. Stderr: ${stderr}`));
    });
    proc.stderr.on("data", (chunk) => {
      stderr += String(chunk);
      const match = /DevTools listening on ws:\/\/([^/\s]+)\//.exec(stderr);
      if (match) {
        clearTimeout(timer);
        resolve(`http://${match[1]}`);
      }
    });
  });

  const targetsRes = await fetch(`${debugBaseUrl}/json/list`);
  const targets = await targetsRes.json();
  const pageTarget = targets.find((t) => t.type === "page") ?? targets[0];
  if (!pageTarget?.webSocketDebuggerUrl) {
    proc.kill("SIGKILL");
    throw new Error("Nenhum alvo de página CDP encontrado.");
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", (err) => reject(new Error(`Erro WebSocket CDP: ${err.message ?? err}`)), {
      once: true,
    });
  });

  const page = new CdpPage(ws, proc, userDataDir);
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("DOM.enable");
  await page.send("Network.enable");
  await page.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__e2eOnline = true;
      Object.defineProperty(Navigator.prototype, "onLine", {
        get() { return window.__e2eOnline !== false; },
        configurable: true,
      });
    `,
  });
  return page;
}

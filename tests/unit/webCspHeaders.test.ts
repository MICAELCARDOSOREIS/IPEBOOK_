import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

describe("Endurecimento Web/CSP e registro externo do Service Worker (Spec 143 / M8)", () => {
  const root = process.cwd();
  const headers = readFileSync(join(root, "public/_headers"), "utf-8");
  const html = readFileSync(join(root, "src/app/+html.tsx"), "utf-8");
  const swRegisterPath = join(root, "public/sw-register.js");

  it("extrai o registro do Service Worker para public/sw-register.js sem script inline em +html.tsx", () => {
    expect(existsSync(swRegisterPath)).toBe(true);
    const swRegister = readFileSync(swRegisterPath, "utf-8");
    expect(swRegister).toContain("navigator.serviceWorker.register");
    expect(swRegister).toContain('"/sw.js"');

    expect(html).toContain('<script src="/sw-register.js" defer />');
    expect(html).not.toMatch(/<script\b[^>]*dangerouslySetInnerHTML/);
  });

  it("aplica CSP estrita em public/_headers sem unsafe-inline em script-src e sem wildcard *.supabase.co", () => {
    const cspLine = headers
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("Content-Security-Policy:"));
    expect(cspLine).toBeDefined();

    const scriptSrc = cspLine?.match(/script-src\s+([^;]+)/)?.[1] ?? "";
    expect(scriptSrc).toContain("'self'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");

    expect(cspLine).toContain("base-uri 'self'");
    expect(cspLine).toContain("form-action 'self'");
    expect(cspLine).toContain("object-src 'none'");
    expect(cspLine).toContain("https://xiuuiggpccpgrwkzeloc.supabase.co");
    expect(cspLine).toContain("wss://xiuuiggpccpgrwkzeloc.supabase.co");
    expect(cspLine).not.toContain("*.supabase.co");
  });
});

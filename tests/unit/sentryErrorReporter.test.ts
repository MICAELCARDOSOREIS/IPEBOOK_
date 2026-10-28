import { describe, expect, it, vi } from "vitest";


import { MemoryErrorReporter } from "@/infra/services/memoryErrorReporter";
import { reportingSink } from "@/infra/services/safeLogger";
import { SentryErrorReporter } from "@/infra/services/sentryErrorReporter";

function fakeSentry() {
  return { init: vi.fn(), captureException: vi.fn() };
}

describe("SentryErrorReporter (Spec 104)", () => {
  it("inicia uma vez, sem dados pessoais e sem rastreamento de desempenho", () => {
    const sentry = fakeSentry();
    const reporter = new SentryErrorReporter({ dsn: "https://k@o.ingest.sentry.io/1", environment: "production", release: "0.1.0" }, sentry as never);
    reporter.init();
    reporter.init();
    expect(sentry.init).toHaveBeenCalledTimes(1);
    const options = sentry.init.mock.calls[0][0];
    expect(options).toMatchObject({ dsn: "https://k@o.ingest.sentry.io/1", environment: "production", release: "0.1.0", sendDefaultPii: false, tracesSampleRate: 0 });
    const event = options.beforeSend({ user: { id: "u1", email: "a@b.com", ip_address: "1.2.3.4" }, extra: { token: "segredo", tela: "chat" } });
    expect(event.user).toEqual({ id: "u1" });
    expect(event.extra.token).not.toBe("segredo");
    expect(event.extra.tela).toBe("chat");
    expect(options.beforeSend({ message: "sem extras" })).toEqual({ message: "sem extras" });
  });

  it("só envia depois de iniciar e filtra o contexto", () => {
    const sentry = fakeSentry();
    const reporter = new SentryErrorReporter({ dsn: "x", environment: "test" }, sentry as never);
    const error = new Error("falhou");
    reporter.captureException(error);
    expect(sentry.captureException).not.toHaveBeenCalled();
    reporter.init();
    reporter.captureException(error, { password: "123", rota: "/livro" });
    reporter.captureException(error);
    expect(sentry.captureException).toHaveBeenNthCalledWith(1, error, { extra: expect.objectContaining({ rota: "/livro" }) });
    expect(sentry.captureException.mock.calls[0][1].extra.password).not.toBe("123");
    expect(sentry.captureException).toHaveBeenNthCalledWith(2, error, undefined);
  });
});

describe("reportingSink (Spec 104)", () => {
  it("logs de erro seguem para o acompanhamento; avisos e informações não", () => {
    const reporter = new MemoryErrorReporter();
    reporter.init();
    const sink = reportingSink(reporter);
    const spies = [vi.spyOn(console, "error").mockImplementation(() => {}), vi.spyOn(console, "warn").mockImplementation(() => {}), vi.spyOn(console, "log").mockImplementation(() => {})];
    sink({ timestamp: "t", level: "error", message: "Push falhou", error: "rede", context: { rota: "/x" } });
    sink({ timestamp: "t", level: "error", message: "Sem detalhe" });
    sink({ timestamp: "t", level: "warn", message: "aviso" });
    sink({ timestamp: "t", level: "info", message: "info" });
    expect(reporter.captured.map((c) => (c.error as Error).message)).toEqual(["Push falhou: rede", "Sem detalhe"]);
    expect(reporter.captured[0].context).toEqual({ rota: "/x" });
    for (const spy of spies) spy.mockRestore();
  });
});



import { MemoryErrorReporter } from "@/infra/services/memoryErrorReporter";
import { reportingSink } from "@/infra/services/safeLogger";

describe("MemoryErrorReporter (Spec 145)", () => {
  it("inicia sem efeito colateral externo e guarda erros e contextos em memória", () => {
    const reporter = new MemoryErrorReporter();
    reporter.init();
    const error = new Error("falha local");
    reporter.captureException(error, { rota: "/livro" });
    reporter.captureException(error);
    expect(reporter.captured).toEqual([
      { error, context: { rota: "/livro" } },
      { error, context: undefined },
    ]);
  });
});

describe("reportingSink (Spec 145)", () => {
  it("logs de erro seguem para o acompanhamento local; avisos e informações não", () => {
    const reporter = new MemoryErrorReporter();
    reporter.init();
    const sink = reportingSink(reporter);
    const spies = [jest.spyOn(console, "error").mockImplementation(() => {}), jest.spyOn(console, "warn").mockImplementation(() => {}), jest.spyOn(console, "log").mockImplementation(() => {})];
    sink({ timestamp: "t", level: "error", message: "Push falhou", error: "rede", context: { rota: "/x" } });
    sink({ timestamp: "t", level: "error", message: "Sem detalhe" });
    sink({ timestamp: "t", level: "warn", message: "aviso" });
    sink({ timestamp: "t", level: "info", message: "info" });
    expect(reporter.captured.map((c) => (c.error as Error).message)).toEqual(["Push falhou: rede", "Sem detalhe"]);
    expect(reporter.captured[0].context).toEqual({ rota: "/x" });
    for (const spy of spies) spy.mockRestore();
  });
});

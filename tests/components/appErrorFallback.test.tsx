import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { MemoryErrorReporter } from "@/infra/services/memoryErrorReporter";
import { AppErrorFallback } from "@/view/components/AppErrorFallback";

describe("AppErrorFallback (Spec 104)", () => {
  it("avisa sem detalhes técnicos, envia o erro e permite tentar de novo", async () => {
    const reporter = new MemoryErrorReporter();
    const retry = vi.fn();
    const error = new Error("TypeError interno");
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<AppErrorFallback error={error} retry={retry} reporter={reporter} />);
    });
    expect(screen.getByText("Algo deu errado nesta tela")).toBeDefined();
    expect(screen.queryByText(/TypeError/)).toBeNull();
    expect(reporter.captured).toEqual([{ error, context: { origem: "tela" } }]);
    await act(async () => { fireEvent.press(screen.getByText("Tentar novamente")); });
    expect(retry).toHaveBeenCalled();
  });
});

describe("startErrorReporting (Spec 104)", () => {
  it("inicia o acompanhamento recebido", async () => {
    const { startErrorReporting } = await import("@/viewmodel/errorReporting");
    const reporter = { init: vi.fn(), captureException: vi.fn() };
    startErrorReporting(reporter);
    startErrorReporting();
    expect(reporter.init).toHaveBeenCalledTimes(1);
  });
});

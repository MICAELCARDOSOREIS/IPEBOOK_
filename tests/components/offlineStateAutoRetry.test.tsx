import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { MemoryNetworkStatusDataSource } from "@/infra/datasources/memoryNetworkStatusDataSource";
import { OfflineState } from "@/view/components/OfflineState";

describe("OfflineState — Auto-recuperação e design acolhedor (Spec 131 / ADR 0102)", () => {
  it("renderiza o card centralizado e permite tentar novamente manualmente", async () => {
    const onRetry = vi.fn();
    const networkDataSource = new MemoryNetworkStatusDataSource(false);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<OfflineState onRetry={onRetry} networkDataSource={networkDataSource} />);
    });

    expect(screen.getByTestId("offline-state-card")).toBeDefined();
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();

    const retryBtn = screen.getByLabelText("Tentar novamente");
    fireEvent.press(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("dispara onRetry automaticamente quando a rede volta a ficar online", async () => {
    const onRetry = vi.fn();
    const networkDataSource = new MemoryNetworkStatusDataSource(false);

    await act(async () => {
      await render(<OfflineState onRetry={onRetry} networkDataSource={networkDataSource} />);
    });

    expect(onRetry).not.toHaveBeenCalled();

    // Simula reconexão da rede (dispositivo voltou a ter sinal)
    await act(async () => {
      networkDataSource.setOnline(true);
    });

    // O OfflineState deve ter disparado o onRetry automaticamente
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

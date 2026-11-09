import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { MemoryNetworkStatusDataSource } from "@/infra/datasources/memoryNetworkStatusDataSource";
import { ConnectionStatusBanner } from "@/view/components/ConnectionStatusBanner";

describe("ConnectionStatusBanner (Spec 130 / ADR 0101)", () => {
  it("não renderiza quando o dispositivo está online", async () => {
    const dataSource = new MemoryNetworkStatusDataSource(true);
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<ConnectionStatusBanner dataSource={dataSource} />);
    });

    expect(screen.queryByTestId("connection-status-banner")).toBeNull();
  });

  it("renderiza o banner com mensagem acessível quando o dispositivo fica offline", async () => {
    const dataSource = new MemoryNetworkStatusDataSource(false);
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<ConnectionStatusBanner dataSource={dataSource} />);
    });

    const banner = screen.getByTestId("connection-status-banner");
    expect(banner).toBeDefined();
    expect(screen.getByText("Sem conexão com a internet")).toBeDefined();

    // Quando volta a ficar online, o banner some
    await act(async () => {
      dataSource.setOnline(true);
    });

    expect(screen.queryByTestId("connection-status-banner")).toBeNull();
  });
});

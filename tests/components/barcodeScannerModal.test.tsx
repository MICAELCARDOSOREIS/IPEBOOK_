import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BarcodeScannerModal } from "@/view/components/BarcodeScannerModal";

const mockRequestPermission = vi.fn().mockResolvedValue({ granted: true, status: "granted" });
let mockPermission: { granted: boolean; canAskAgain: boolean; status: string } | null = {
  granted: true,
  canAskAgain: true,
  status: "granted",
};

vi.mock("expo-camera", () => ({
  useCameraPermissions: () => [mockPermission, mockRequestPermission],
  CameraView: (props: any) => {
    return React.createElement("CameraView", { testID: "mock-camera-view", ...props });
  },
}));

describe("BarcodeScannerModal (Spec 059 / ADR 0042)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermission = { granted: true, canAskAgain: true, status: "granted" };
  });

  it("não renderiza conteúdo quando visible=false", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={false} onClose={vi.fn()} onScan={vi.fn()} />,
      );
    });
    expect(screen.queryByText("Escanear ISBN")).toBeNull();
  });

  it("exibe mensagem de carregamento quando a permissão ainda é null", async () => {
    mockPermission = null;
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={true} onClose={vi.fn()} onScan={vi.fn()} />,
      );
    });
    expect(screen.getByText("Iniciando câmera...")).toBeDefined();
  });

  it("exibe solicitação de permissão quando permissão de câmera for negada", async () => {
    mockPermission = { granted: false, canAskAgain: true, status: "denied" };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={true} onClose={vi.fn()} onScan={vi.fn()} />,
      );
    });

    expect(screen.getByText("Permissão de Câmera Necessária")).toBeDefined();
    expect(screen.getByLabelText("Solicitar permissão de câmera")).toBeDefined();
    expect(screen.getByLabelText("Fechar e digitar ISBN manualmente")).toBeDefined();
  });

  it("chama requestPermission ao tocar em 'Permitir Câmera'", async () => {
    mockPermission = { granted: false, canAskAgain: true, status: "denied" };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={true} onClose={vi.fn()} onScan={vi.fn()} />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Solicitar permissão de câmera"));
    });
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it("chama onClose ao tocar em 'Digitar ISBN Manualmente' ou no botão fechar", async () => {
    mockPermission = { granted: false, canAskAgain: true, status: "denied" };
    const onClose = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={true} onClose={onClose} onScan={vi.fn()} />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Fechar e digitar ISBN manualmente"));
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Fechar leitor de código de barras"));
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renderiza a câmera e dispara onScan e onClose quando um código é detectado", async () => {
    const onScan = vi.fn();
    const onClose = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BarcodeScannerModal visible={true} onClose={onClose} onScan={onScan} />,
      );
    });

    const cameraView = screen.getByTestId("mock-camera-view");
    expect(cameraView).toBeDefined();

    await act(async () => {
      cameraView.props.onBarcodeScanned({ data: "9788535914849" });
    });

    expect(onScan).toHaveBeenCalledWith("9788535914849");
    expect(onClose).toHaveBeenCalledTimes(1);

    // Tentativa subsequente não deve disparar novamente
    await act(async () => {
      cameraView.props.onBarcodeScanned?.({ data: "9788535914849" });
    });
    expect(onScan).toHaveBeenCalledTimes(1);
  });
});

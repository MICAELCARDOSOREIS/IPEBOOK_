import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeliveryActions, DeliveryState } from "@/viewmodel/useDeliveryViewModel";
import { buildDeliveryPayload } from "@/model/entities/delivery";
import DeliveryScreen, { Delivery } from "@/view/requests/delivery";

// A câmera guarda o leitor de QR para o teste simular uma leitura.
const camera = vi.hoisted(() => ({
  onScan: undefined as undefined | ((result: { data: string }) => void),
  granted: true,
  askAgain: undefined as undefined | (() => void),
}));
vi.mock("expo-camera", () => ({
  CameraView: (props: { onBarcodeScanned?: (result: { data: string }) => void }) => {
    camera.onScan = props.onBarcodeScanned;
    return null;
  },
  useCameraPermissions: () => [
    { granted: camera.granted },
    () => {
      camera.askAgain?.();
      return Promise.resolve({ granted: true });
    },
  ],
}));
vi.mock("@/viewmodel/useDeliveryViewModel", () => ({ useDeliveryViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useDeliveryViewModel } from "@/viewmodel/useDeliveryViewModel";

const REQUEST = "3301dadb-0181-4b91-8266-2bd2f363f5f5";
const base: DeliveryState = {
  loading: false,
  loadError: null,
  role: "giver",
  completed: null,
  code: null,
  generating: false,
  confirming: false,
  error: null,
};
let actions: DeliveryActions;

function mockState(overrides: Partial<DeliveryState>) {
  vi.mocked(useDeliveryViewModel).mockReturnValue([{ ...base, ...overrides }, actions]);
}

async function open() {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Delivery requestId={REQUEST} sessionUserId="u1" onBack={vi.fn()} />);
  });
  return screen;
}

describe("Entrega do livro (Spec 095, CA6/CA7)", () => {
  beforeEach(() => {
    camera.granted = true;
    actions = { generate: vi.fn().mockResolvedValue(undefined), confirm: vi.fn().mockResolvedValue(true), reload: vi.fn() };
  });

  it("anunciante: mostra o QR, o código agrupado e permite gerar outro", async () => {
    mockState({ code: { code: "K7M2QXWA", expiresAt: new Date(Date.now() + 10 * 60_000).toISOString() } });
    const screen = await open();
    expect(screen.getByRole("header", { name: "Mostre este QR para quem recebe o livro" })).toBeDefined();
    expect(screen.getByLabelText(/QR code da entrega/)).toBeDefined();
    expect(screen.getByText("K7M2 QXWA")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Gerar novo código" })); });
    expect(actions.generate).toHaveBeenCalledTimes(1);
  });

  it("anunciante: avisa quando o código expirou", async () => {
    mockState({ code: { code: "K7M2QXWA", expiresAt: new Date(Date.now() - 1000).toISOString() } });
    const screen = await open();
    expect(screen.getByText("Código expirado. Gere outro.")).toBeDefined();
  });

  it("leitor: só habilita Confirmar com os 8 caracteres e confirma o código digitado", async () => {
    mockState({ role: "receiver" });
    const screen = await open();
    const field = screen.getByLabelText("Código da entrega");
    await act(async () => { fireEvent.changeText(field, "k7m2-qx"); });
    expect(screen.getByRole("button", { name: "Confirmar entrega" }).props.accessibilityState?.disabled).toBe(true);
    await act(async () => { fireEvent.changeText(field, "k7m2-qxwa"); });
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Confirmar entrega" })); });
    expect(actions.confirm).toHaveBeenCalledWith("K7M2QXWA");
  });

  it("leitor: o QR da negociação confirma pelo código; QR de outra negociação é recusado", async () => {
    mockState({ role: "receiver" });
    const screen = await open();

    await act(async () => { camera.onScan?.({ data: buildDeliveryPayload("99999999-0181-4b91-8266-2bd2f363f5f5", "K7M2QXWA") }); });
    expect(screen.getByText("Este QR é de outra negociação.")).toBeDefined();
    expect(actions.confirm).not.toHaveBeenCalled();

    await act(async () => { camera.onScan?.({ data: "https://exemplo.com" }); });
    expect(screen.getByText("Este QR não é de uma entrega do IpêBook.")).toBeDefined();

    await act(async () => { camera.onScan?.({ data: buildDeliveryPayload(REQUEST, "K7M2QXWA") }); });
    expect(actions.confirm).toHaveBeenCalledWith("K7M2QXWA");
  });

  it("leitor sem permissão da câmera: pede a permissão e segue pelo código digitado", async () => {
    camera.granted = false;
    const asked = vi.fn();
    camera.askAgain = asked;
    mockState({ role: "receiver" });
    const screen = await open();
    expect(screen.queryByLabelText("Código da entrega")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Permitir câmera" })); });
    expect(asked).toHaveBeenCalledTimes(1);
  });

  it("leitor: envia o código pelo teclado e mostra o carregando ao confirmar", async () => {
    mockState({ role: "receiver", confirming: true });
    const screen = await open();
    const field = screen.getByLabelText("Código da entrega");
    await act(async () => { fireEvent.changeText(field, "K7M2QXWA"); });
    await act(async () => { fireEvent(field, "submitEditing"); });
    expect(actions.confirm).toHaveBeenCalledWith("K7M2QXWA");
  });

  it("anunciante: sem código ainda, oferece gerar e bloqueia durante a geração", async () => {
    mockState({ code: null, generating: true });
    const screen = await open();
    expect(screen.getByRole("button", { name: "Gerar código" })).toBeDefined();
  });

  it("mostra o motivo da recusa do código", async () => {
    mockState({ role: "receiver", error: "Código incorreto." });
    const screen = await open();
    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Código incorreto.")).toBeDefined();
  });

  it("entrega concluída: confirma para as duas pessoas e volta à negociação", async () => {
    mockState({ completed: { requestId: REQUEST, completedBy: "u2", completedAt: "2026-10-29T10:00:00.000Z" } });
    const screen = await open();
    expect(screen.getByText("Entrega concluída!")).toBeDefined();
    expect(screen.getByRole("button", { name: "Voltar à negociação" })).toBeDefined();
  });

  it("carregando e erro de carga", async () => {
    mockState({ loading: true });
    expect((await open()).getByLabelText("Carregando a entrega")).toBeDefined();
    mockState({ loadError: "Não foi possível carregar a entrega. Tente novamente." });
    expect((await open()).getByText("Não foi possível carregar a entrega. Tente novamente.")).toBeDefined();
  });

  it("leitor: ignora novas leituras enquanto confirma", async () => {
    mockState({ role: "receiver", confirming: true });
    await open();
    await act(async () => { camera.onScan?.({ data: buildDeliveryPayload(REQUEST, "K7M2QXWA") }); });
    expect(actions.confirm).not.toHaveBeenCalled();
  });

  it("leitor: leitura sem texto é recusada como QR de outro tipo", async () => {
    mockState({ role: "receiver" });
    const screen = await open();
    await act(async () => { camera.onScan?.({} as { data: string }); });
    expect(screen.getByText("Este QR não é de uma entrega do IpêBook.")).toBeDefined();
  });
});

describe("rota da entrega: exige sessão", () => {
  const authActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() };

  it("sem sessão, pede o login e não desenha a tela", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([{ user: null, loading: false, error: null }, authActions]);
    const onRequireSignIn = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<DeliveryScreen requestId={REQUEST} onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
    expect(screen.toJSON()).toBeNull();
  });

  it("enquanto confere a sessão, não faz nada", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([{ user: null, loading: true, error: null }, authActions]);
    const onRequireSignIn = vi.fn();
    await act(async () => { await render(<DeliveryScreen requestId={REQUEST} onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).not.toHaveBeenCalled();
  });

  it("com sessão, mostra a entrega", async () => {
    vi.mocked(useAuthViewModel).mockReturnValue([{ user: { id: "u1", name: "Ana", email: "a@b.c" } as never, loading: false, error: null }, authActions]);
    vi.mocked(useDeliveryViewModel).mockReturnValue([{ ...base, role: "receiver" }, { generate: vi.fn(), confirm: vi.fn(), reload: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<DeliveryScreen requestId={REQUEST} />); });
    expect(screen.getByRole("header", { name: "Confirme que recebeu o livro" })).toBeDefined();
  });
});

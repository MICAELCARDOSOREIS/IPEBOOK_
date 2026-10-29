import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { MemoryBetaTesterDataSource } from "@/infra/datasources/memoryBetaTesterDataSource";
import { BetaSignupUseCases } from "@/usecase/betaSignupUseCases";
import { BetaInviteScreen } from "@/view/beta/betaInviteScreen";
import { useBetaSignupViewModel } from "@/viewmodel/useBetaSignupViewModel";

function Harness({ dataSource, onOpenStore }: { dataSource: MemoryBetaTesterDataSource; onOpenStore: () => void }) {
  const [state, actions] = useBetaSignupViewModel(new BetaSignupUseCases(dataSource));
  return <BetaInviteScreen state={state} actions={actions} onOpenStore={onOpenStore} />;
}

async function renderScreen() {
  const dataSource = new MemoryBetaTesterDataSource();
  const onOpenStore = vi.fn();
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<Harness dataSource={dataSource} onOpenStore={onOpenStore} />);
  });
  return { screen, dataSource, onOpenStore };
}

describe("BetaInviteScreen (Spec 108)", () => {
  it("abre a Play Store pelo botão", async () => {
    const { screen, onOpenStore } = await renderScreen();
    await act(async () => { fireEvent.press(screen.getByText("Ver o IpêBook na Play Store")); });
    expect(onOpenStore).toHaveBeenCalled();
  });

  it("mostra o erro quando o e-mail é inválido e não grava", async () => {
    const { screen, dataSource } = await renderScreen();
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Gmail"), "sem-arroba"); });
    await act(async () => { fireEvent.press(screen.getByText("Quero receber avisos")); });
    expect(screen.getByText("Informe um e-mail válido.")).toBeDefined();
    expect(dataSource.list()).toHaveLength(0);
  });

  it("grava o Gmail, confirma e permite inscrever outro", async () => {
    const { screen, dataSource } = await renderScreen();
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Seu nome (opcional)"), "Ana"); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Gmail"), "Ana@Gmail.com"); });
    await act(async () => { fireEvent.press(screen.getByText("Quero receber avisos")); });
    expect(dataSource.list()).toEqual([{ email: "ana@gmail.com", name: "Ana" }]);
    expect(screen.getByText("Inscrição recebida!")).toBeDefined();
    expect(screen.getByText(/ana@gmail\.com/)).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Inscrever outro e-mail")); });
    expect(screen.getByText("Quero receber avisos")).toBeDefined();
  });
});

describe("Passos de instalação do beta (Spec 108)", () => {
  it("abre grupo, convite e loja; sem grupo, mostra que abre em breve", async () => {
    const onOpenUrl = vi.fn();
    const state = { loading: false, error: null, success: false };
    const actions = { submit: vi.fn(), reset: vi.fn() };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen state={state} actions={actions} onOpenUrl={onOpenUrl} groupUrl="https://groups.google.com/g/ipebook-testadores" />,
      );
    });
    await act(async () => { fireEvent.press(screen.getByText("Entrar no grupo")); });
    await act(async () => { fireEvent.press(screen.getByText("Aceitar convite")); });
    await act(async () => { fireEvent.press(screen.getByText("Instalar na Play Store")); });
    expect(onOpenUrl.mock.calls.map((c) => c[0])).toEqual([
      "https://groups.google.com/g/ipebook-testadores",
      "https://play.google.com/apps/testing/com.ipebook.app",
      "https://play.google.com/store/apps/details?id=com.ipebook.app",
    ]);
    expect(screen.getByText(/alguns minutos/)).toBeDefined();

    await act(async () => {
      screen.rerender(<BetaInviteScreen state={state} actions={actions} onOpenUrl={onOpenUrl} groupUrl={null} />);
    });
    expect(screen.getByText("Entrar no grupo: abre em breve")).toBeDefined();
    expect(screen.queryByText("Entrar no grupo")).toBeNull();
  });
});

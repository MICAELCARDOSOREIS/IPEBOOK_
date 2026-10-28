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
    await act(async () => { fireEvent.press(screen.getByText("Quero testar")); });
    expect(screen.getByText("Informe um e-mail válido.")).toBeDefined();
    expect(dataSource.list()).toHaveLength(0);
  });

  it("grava o Gmail, confirma e permite inscrever outro", async () => {
    const { screen, dataSource } = await renderScreen();
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Seu nome (opcional)"), "Ana"); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Gmail"), "Ana@Gmail.com"); });
    await act(async () => { fireEvent.press(screen.getByText("Quero testar")); });
    expect(dataSource.list()).toEqual([{ email: "ana@gmail.com", name: "Ana" }]);
    expect(screen.getByText("Inscrição recebida!")).toBeDefined();
    expect(screen.getByText(/ana@gmail\.com/)).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Inscrever outro e-mail")); });
    expect(screen.getByText("Quero testar")).toBeDefined();
  });
});

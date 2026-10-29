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

describe("Destaques da comunidade e ações de loja do beta (Spec 108)", () => {
  it("exibe os cartões de destaque na esquerda, avisa para aguardar a lista beta e abre a Play Store após inscrição", async () => {
    const onOpenUrl = vi.fn();
    const state = { loading: false, error: null, success: true };
    const actions = { submit: vi.fn(), reset: vi.fn() };
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen state={state} actions={actions} onOpenUrl={onOpenUrl} />,
      );
    });
    expect(screen.getByText("Troca, venda e doação")).toBeDefined();
    expect(screen.getByText("Encontros em Piripiri")).toBeDefined();
    expect(screen.getByText("Leitores fundadores")).toBeDefined();
    expect(screen.getByText(/Aguarde até você ser adicionado na lista de testadores beta/)).toBeDefined();
    expect(screen.queryByText("Entrar no grupo de testadores")).toBeNull();

    await act(async () => { fireEvent.press(screen.getByText("Abrir na Play Store")); });
    expect(onOpenUrl).toHaveBeenCalledWith("https://play.google.com/store/apps/details?id=com.ipebook.app");
  });
});

describe("Conexão com Google no convite do beta (Spec 108)", () => {
  it("oferece botão 'Continuar com Google' e chama signInWithGoogle", async () => {
    const signInWithGoogle = vi.fn().mockResolvedValue(true);
    const authActions = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle,
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
    };
    const authState = { user: null, loading: false, error: null };
    const state = { loading: false, error: null, success: false };
    const actions = { submit: vi.fn(), reset: vi.fn() };

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen
          state={state}
          actions={actions}
          authState={authState}
          authActions={authActions}
        />,
      );
    });

    expect(screen.getByText("Continuar com Google")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Continuar com Google"));
    });
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("quando autenticado com Google, registra o testador, avisa para aguardar a lista beta e aponta direto para a Play Store", async () => {
    const authActions = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
    };
    const authState = {
      user: { id: "u-1", email: "testador@gmail.com", name: "Micael Testador" },
      loading: false,
      error: null,
    };
    const state = { loading: false, error: null, success: false };
    const actions = { submit: vi.fn(), reset: vi.fn() };
    const onOpenUrl = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen
          state={state}
          actions={actions}
          authState={authState}
          authActions={authActions}
          onOpenUrl={onOpenUrl}
        />,
      );
    });

    expect(actions.submit).toHaveBeenCalledWith("testador@gmail.com", "Micael Testador");
    expect(screen.getByText("Conta conectada!")).toBeDefined();
    expect(screen.getByText("Aguardando inclusão na lista beta")).toBeDefined();
    expect(screen.getByText(/Aguarde até você ser adicionado na lista de testadores beta/)).toBeDefined();
    expect(screen.getByText("testador@gmail.com")).toBeDefined();
    expect(screen.getByText("Abrir na Play Store")).toBeDefined();
    expect(screen.queryByText("Entrar no grupo de testadores")).toBeNull();
    expect(screen.queryByText("Ver o IpêBook na Play Store")).toBeNull();

    await act(async () => {
      fireEvent.press(screen.getByText("Abrir na Play Store"));
    });
    expect(onOpenUrl).toHaveBeenCalledWith("https://play.google.com/store/apps/details?id=com.ipebook.app");
  });

  it("permite sair da conta Google pelo botão de troca de conta", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authActions = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut,
      requestPasswordReset: vi.fn(),
    };
    const authState = {
      user: { id: "u-1", email: "testador@gmail.com", name: "Micael" },
      loading: false,
      error: null,
    };
    const state = { loading: false, error: null, success: false };
    const actions = { submit: vi.fn(), reset: vi.fn() };

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen
          state={state}
          actions={actions}
          authState={authState}
          authActions={authActions}
        />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Usar outra conta Google"));
    });
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe("Navegação para a Home a partir do Beta (Spec 108)", () => {
  it("chama onNavigateHome ao clicar no botão 'Início' ou no logotipo", async () => {
    const onNavigateHome = vi.fn();
    const state = { loading: false, error: null, success: false };
    const actions = { submit: vi.fn(), reset: vi.fn() };

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <BetaInviteScreen
          state={state}
          actions={actions}
          onNavigateHome={onNavigateHome}
        />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByText("Início"));
    });
    expect(onNavigateHome).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ir para a página inicial do IpêBook"));
    });
    expect(onNavigateHome).toHaveBeenCalledTimes(2);
  });
});

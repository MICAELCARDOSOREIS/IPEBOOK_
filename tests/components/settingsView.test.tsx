import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import { Settings } from "@/view/profile/settings";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

vi.mock("@/viewmodel/useSettingsViewModel", () => ({ useSettingsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/usePublicProfileViewModel", () => ({
  usePublicProfileViewModel: () => [{ profile: { userId: "ana", name: "Ana Paula", joinedAt: "2026-01-10T00:00:00.000Z" }, loading: false, error: null }, { reload: vi.fn() }],
}));

const mockedUseSettingsViewModel = vi.mocked(useSettingsViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);

function mockSettings(clearBooksCache = vi.fn().mockResolvedValue(undefined)) {
  mockedUseSettingsViewModel.mockReturnValue([
    { clearingCache: false, cacheCleared: false, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
    { clearBooksCache, clearSearchHistory: vi.fn().mockResolvedValue(undefined) },
  ]);
  return { clearBooksCache };
}

/** Configurações mostra gestão de conta apenas com sessão (ADR 0060). */
function mockSession(signedIn: boolean) {
  mockedUseAuthViewModel.mockReturnValue([
    {
      user: signedIn ? { id: "ana", email: "ana@exemplo.com" } : null,
      loading: false,
      error: null,
    },
    {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
    },
  ]);
}

describe("Configurações — tela dedicada (Spec 073, ADR 0036)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  async function renderSettings(props: Partial<React.ComponentProps<typeof Settings>> = {}) {
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <Settings onBack={onBack} {...props} />
        </ThemeProvider>,
      );
    });
    return { screen, onBack };
  }

  it("renderiza o título 'Configurações' na TopAppBar e aciona onBack ao tocar no botão voltar", async () => {
    mockSession(true);
    mockSettings();
    const { screen, onBack } = await renderSettings();

    // Título na barra superior
    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).toContain("Configurações");

    // Botão voltar aciona onBack
    const backButton = screen.getByLabelText("Voltar");
    expect(backButton).toBeDefined();

    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderiza a seção 'Aparência' com as opções de tema em radiogroup acessível", async () => {
    mockSession(true);
    mockSettings();
    const { screen } = await renderSettings();

    // Cabeçalho e descrição da seção
    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).toContain("Aparência");
    expect(screen.getByText("Escolha como o aplicativo aparece para você.")).toBeDefined();

    // Radiogroup acessível
    const group = screen.getByTestId("theme-toggle-radiogroup");
    expect(group).toBeDefined();
    expect(group.props.accessibilityRole).toBe("radiogroup");

    // Opções Sistema, Claro e Escuro com role radio
    const sistemaOption = screen.getByLabelText("Tema Sistema");
    const claroOption = screen.getByLabelText("Tema Claro");
    const escuroOption = screen.getByLabelText("Tema Escuro");

    expect(sistemaOption).toBeDefined();
    expect(claroOption).toBeDefined();
    expect(escuroOption).toBeDefined();

    expect(sistemaOption.props.accessibilityRole).toBe("radio");
    expect(claroOption.props.accessibilityRole).toBe("radio");
    expect(escuroOption.props.accessibilityRole).toBe("radio");

    // Sistema selecionado por padrão
    expect(sistemaOption.props.accessibilityState.checked).toBe(true);
    expect(claroOption.props.accessibilityState.checked).toBe(false);
    expect(escuroOption.props.accessibilityState.checked).toBe(false);
  });

  it("alterna a opção de tema ao selecionar Claro ou Escuro", async () => {
    mockSession(true);
    mockSettings();
    const { screen } = await renderSettings();

    const escuroOption = screen.getByLabelText("Tema Escuro");
    await act(async () => {
      fireEvent.press(escuroOption);
    });

    expect(escuroOption.props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText("Tema Sistema").props.accessibilityState.checked).toBe(false);
  });

  it("oferece a limpeza dos dados salvos no dispositivo e aciona o use case", async () => {
    mockSession(true);
    const { clearBooksCache } = mockSettings();
    const { screen } = await renderSettings();

    expect(screen.getAllByRole("header").map((h) => h.props.children)).toContain("Dados neste dispositivo");

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Limpar dados salvos no dispositivo"));
    });

    expect(clearBooksCache).toHaveBeenCalledTimes(1);
  });

  it("confirma em texto a limpeza concluída para quem usa leitor de tela", async () => {
    mockSession(true);
    mockedUseSettingsViewModel.mockReturnValue([
      { clearingCache: false, cacheCleared: true, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
      { clearBooksCache: vi.fn(), clearSearchHistory: vi.fn() },
    ]);
    const { screen } = await renderSettings();

    expect(screen.getByText("Dados salvos limpos deste dispositivo.")).toBeDefined();
  });

  it("exibe erro amigável sem detalhes técnicos quando a limpeza falha", async () => {
    mockSession(true);
    mockedUseSettingsViewModel.mockReturnValue([
      {
        clearingCache: false,
        cacheCleared: false,
        cacheError: "Não foi possível limpar os dados salvos. Tente novamente.",
        clearingHistory: false,
        historyCleared: false,
        historyError: null,
      },
      { clearBooksCache: vi.fn(), clearSearchHistory: vi.fn() },
    ]);
    const { screen } = await renderSettings();

    expect(screen.getByText("Não foi possível limpar os dados salvos. Tente novamente.")).toBeDefined();
    expect(screen.queryByText("Dados salvos limpos deste dispositivo.")).toBeNull();
  });

  it("mostra a versão do aplicativo e só exibe atalhos com navegação", async () => {
    mockSession(false);
    mockSettings();
    const onNavigateToHelp = vi.fn();
    const { screen } = await renderSettings({ onNavigateToHelp });

    expect(screen.getAllByRole("header").map((h) => h.props.children)).toContain("Sobre o IpêBook");
    expect(screen.getByText("Versão")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ajuda e suporte"));
    });
    expect(onNavigateToHelp).toHaveBeenCalledTimes(1);

    // Sem onNavigateToTerms, o atalho não é renderizado; sem sessão, a gestão de conta também não
    expect(screen.queryByLabelText("Termos e privacidade")).toBeNull();
    expect(screen.queryByLabelText("Privacidade e dados")).toBeNull();
    expect(screen.queryByLabelText("Pessoas bloqueadas")).toBeNull();
  });

  it("recebe Privacidade e dados e Pessoas bloqueadas quando há conta (ADR 0060)", async () => {
    mockSession(true);
    mockSettings();
    const onNavigateToPrivacy = vi.fn();
    const onNavigateToBlockedUsers = vi.fn();
    const { screen } = await renderSettings({ onNavigateToPrivacy, onNavigateToBlockedUsers });

    expect(screen.getAllByRole("header").map((h) => h.props.children)).toContain("Conta e dados");
    expect(screen.getByText("Baixe seus dados ou exclua sua conta")).toBeDefined();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Privacidade e dados"));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Pessoas bloqueadas"));
    });

    expect(onNavigateToPrivacy).toHaveBeenCalledTimes(1);
    expect(onNavigateToBlockedUsers).toHaveBeenCalledTimes(1);
  });

  it("mostra o cartão da conta, o bairro padrão e sair da conta com confirmação (Spec 091)", async () => {
    mockSession(true);
    mockSettings();
    const onNavigateToEditProfile = vi.fn();
    const onSignedOut = vi.fn();
    const { screen } = await renderSettings({ onNavigateToEditProfile, onSignedOut });

    expect(screen.getByText("Ana Paula")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Editar perfil")); });
    expect(onNavigateToEditProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Bairro padrão")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByText("Sair da conta")); });
    expect(screen.getByText("Sair da conta?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Sair")); });
    expect(mockedUseAuthViewModel.mock.results[0].value[1].signOut).toHaveBeenCalled();
    await act(async () => {});
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it("não mostra conta nem sair sem sessão, mas mantém bairro padrão e histórico (Spec 091)", async () => {
    mockSession(false);
    mockSettings();
    const { screen } = await renderSettings();
    expect(screen.queryByLabelText("Editar perfil")).toBeNull();
    expect(screen.queryByText("Sair da conta")).toBeNull();
    expect(screen.getByLabelText("Bairro padrão")).toBeDefined();
    expect(screen.getByLabelText("Limpar histórico de buscas deste aparelho")).toBeDefined();
  });

  it("limpa o histórico de buscas ao tocar no botão (Spec 091)", async () => {
    mockSession(true);
    const clearSearchHistory = vi.fn().mockResolvedValue(undefined);
    mockedUseSettingsViewModel.mockReturnValue([
      { clearingCache: false, cacheCleared: false, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
      { clearBooksCache: vi.fn(), clearSearchHistory },
    ]);
    const { screen } = await renderSettings();
    await act(async () => { fireEvent.press(screen.getByLabelText("Limpar histórico de buscas deste aparelho")); });
    expect(clearSearchHistory).toHaveBeenCalledWith("ana");
  });

  it("abre o e-mail do suporte com assunto e versão (Spec 091)", async () => {
    mockSession(false);
    mockSettings();
    const open = vi.spyOn(Linking, "openURL").mockResolvedValue(true as never);
    const { screen } = await renderSettings();
    expect(screen.getByText("ipebook738@gmail.com")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Falar com a equipe")); });
    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0][0]);
    expect(url.startsWith("mailto:ipebook738@gmail.com?subject=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Versão do aplicativo:");
  });
});

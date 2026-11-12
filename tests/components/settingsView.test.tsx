import type React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import { Settings } from "@/view/profile/settings";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";
import {
  NOTIFICATION_PREFERENCE_CATEGORIES,
  useNotificationPreferencesViewModel,
} from "@/viewmodel/useNotificationPreferencesViewModel";

vi.mock("@/viewmodel/useSettingsViewModel", () => ({ useSettingsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/usePublicProfileViewModel", () => ({
  usePublicProfileViewModel: () => [{ profile: { userId: "ana", name: "Ana Paula", joinedAt: "2026-01-10T00:00:00.000Z" }, loading: false, error: null }, { reload: vi.fn() }],
}));
// Preferências de notificação (Spec 099) vêm do container; na tela testamos só a apresentação.
vi.mock("@/viewmodel/useNotificationPreferencesViewModel", () => ({
  useNotificationPreferencesViewModel: vi.fn(),
  NOTIFICATION_PREFERENCE_CATEGORIES: {
    proposals: { label: "Propostas e mensagens", description: "Alguém tem interesse num livro seu ou responde a um pedido", types: ["request_received", "request_accepted"] },
    meetings: { label: "Lembretes de encontro", description: "Convites e avisos sobre a entrega combinada", types: ["meeting_update"] },
    searchAlerts: { label: "Novidades dos alertas de busca", description: "Livros novos que batem com os seus alertas", types: ["search_alert_match"] },
    system: { label: "Avisos do sistema", description: "Segurança, novidades e comunicados do IpêBook", types: ["system", "safety_tip"] },
  },
}));

const mockedUseSettingsViewModel = vi.mocked(useSettingsViewModel);
const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
const mockedNotifPrefs = vi.mocked(useNotificationPreferencesViewModel);

function mockSettings(clearBooksCache = vi.fn().mockResolvedValue(undefined)) {
  mockedUseSettingsViewModel.mockReturnValue([
    { clearingCache: false, cacheCleared: false, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
    { clearBooksCache, clearSearchHistory: vi.fn().mockResolvedValue(undefined) },
  ]);
  return { clearBooksCache };
}

/** Selo padrão das preferências de notificação: tudo ligado, sem erro (Spec 099). */
function mockNotifPrefs(overrides: Partial<ReturnType<typeof useNotificationPreferencesViewModel>[0]> = {}) {
  const setEnabled = vi.fn().mockResolvedValue(undefined);
  mockedNotifPrefs.mockReturnValue([
    {
      enabled: { proposals: true, meetings: true, searchAlerts: true, system: true },
      saving: false,
      error: null,
      ...overrides,
    },
    { setEnabled },
  ]);
  return { setEnabled };
}

/** Configurações mostra gestão de conta apenas com sessão (ADR 0060). */
function mockSession(signedIn: boolean, signOut = vi.fn().mockResolvedValue(true)) {
  mockedUseAuthViewModel.mockReturnValue([
    {
      user: signedIn ? { id: "ana", email: "ana@exemplo.com" } : null,
      loading: false,
      error: null,
    },
    {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut,
      requestPasswordReset: vi.fn(),
    },
  ]);
  return { signOut };
}

describe("Configurações — tela dedicada (Spec 073, ADR 0036)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Toda tela com sessão mostra as chaves de notificação; o valor padrão deixa tudo ligado.
  beforeEach(() => {
    mockNotifPrefs();
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

  async function expandSettingsSection(screen: Awaited<ReturnType<typeof render>>, label: string) {
    await act(async () => {
      fireEvent.press(screen.getByLabelText(label));
    });
  }

  it("renderiza o título 'Configurações' na TopAppBar e aciona onBack ao tocar no botão voltar", async () => {
    mockSession(true);
    mockSettings();
    const { screen, onBack } = await renderSettings();

    // Título na barra superior
    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).toContain("Configurações");
    for (const label of ["Preferências", "Notificações", "Armazenamento e histórico", "Sobre o IpêBook"]) {
      expect(screen.getByLabelText(label).props.accessibilityState.expanded).toBe(false);
    }

    // Botão voltar aciona onBack
    const backButton = screen.getByLabelText("Voltar");
    expect(backButton).toBeDefined();

    await act(async () => {
      fireEvent.press(backButton);
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("não mostra a seção de Aparência e opções de tema escuro", async () => {
    mockSession(true);
    mockSettings();
    const { screen } = await renderSettings();

    const headers = screen.getAllByRole("header");
    const titles = headers.map((h) => h.props.children);
    expect(titles).not.toContain("Aparência");
    expect(screen.queryByLabelText("Aparência")).toBeNull();
    expect(screen.queryByTestId("theme-toggle-radiogroup")).toBeNull();
  });

  it("explica e confirma a remoção da cópia do catálogo", async () => {
    mockSession(true);
    const { clearBooksCache } = mockSettings();
    const { screen } = await renderSettings();

    expect(screen.getAllByRole("header").map((h) => h.props.children)).toContain("Armazenamento e histórico");
    expect(screen.queryByLabelText("Remover cópia do catálogo deste aparelho")).toBeNull();

    expect(screen.getByLabelText("Armazenamento e histórico").props.accessibilityState.expanded).toBe(false);
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Armazenamento e histórico"));
    });
    expect(screen.getByLabelText("Armazenamento e histórico").props.accessibilityState.expanded).toBe(true);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Remover cópia do catálogo deste aparelho"));
    });

    expect(screen.getByText(/remove a cópia do catálogo salva neste aparelho/i)).toBeDefined();
    expect(clearBooksCache).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Cancelar"));
    });
    expect(clearBooksCache).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Remover cópia do catálogo deste aparelho"));
    });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Remover cópia"));
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

    await expandSettingsSection(screen, "Armazenamento e histórico");
    expect(screen.getByText("Cópia do catálogo removida deste aparelho.")).toBeDefined();
  });

  it("exibe erro amigável sem detalhes técnicos quando a limpeza falha", async () => {
    mockSession(true);
    mockedUseSettingsViewModel.mockReturnValue([
      {
        clearingCache: false,
        cacheCleared: false,
        cacheError: "Não foi possível remover a cópia do catálogo. Tente novamente.",
        clearingHistory: false,
        historyCleared: false,
        historyError: null,
      },
      { clearBooksCache: vi.fn(), clearSearchHistory: vi.fn() },
    ]);
    const { screen } = await renderSettings();

    await expandSettingsSection(screen, "Armazenamento e histórico");
    expect(screen.getByText("Não foi possível remover a cópia do catálogo. Tente novamente.")).toBeDefined();
    expect(screen.queryByText("Cópia do catálogo removida deste aparelho.")).toBeNull();
  });

  it("mostra a versão do aplicativo e só exibe atalhos com navegação", async () => {
    mockSession(false);
    mockSettings();
    const onNavigateToHelp = vi.fn();
    const { screen } = await renderSettings({ onNavigateToHelp });

    await expandSettingsSection(screen, "Sobre o IpêBook");
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

    await expandSettingsSection(screen, "Conta e dados");
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

    expect(screen.getByText("Conta conectada")).toBeDefined();
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("ana@exemplo.com")).toBeDefined();
    expect(screen.getByLabelText("Editar perfil de Ana Paula").props.accessibilityHint).toContain("ana@exemplo.com");
    await act(async () => { fireEvent.press(screen.getByLabelText("Editar perfil de Ana Paula")); });
    expect(onNavigateToEditProfile).toHaveBeenCalledTimes(1);
    await expandSettingsSection(screen, "Preferências");
    expect(screen.getByLabelText("Bairro padrão")).toBeDefined();

    await act(async () => { fireEvent.press(screen.getByText("Sair da conta")); });
    expect(screen.getByText("Sair da conta?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByText("Sair")); });
    expect(mockedUseAuthViewModel.mock.results[0].value[1].signOut).toHaveBeenCalled();
    await act(async () => {});
    expect(onSignedOut).toHaveBeenCalledTimes(1);
  });

  it("mantém o diálogo de saída aberto e avisa quando o logout falha", async () => {
    mockSession(true, vi.fn().mockResolvedValue(false));
    mockSettings();
    const onSignedOut = vi.fn();
    const { screen } = await renderSettings({ onSignedOut });

    await act(async () => { fireEvent.press(screen.getByText("Sair da conta")); });
    await act(async () => { fireEvent.press(screen.getByText("Sair")); });

    expect(onSignedOut).not.toHaveBeenCalled();
    expect(screen.getByText("Sair da conta?")).toBeDefined();
    expect(screen.getByText("Não foi possível sair da conta. Tente novamente.")).toBeDefined();
  });

  it("não mostra conta nem sair sem sessão, mas mantém bairro padrão e histórico (Spec 091)", async () => {
    mockSession(false);
    mockSettings();
    const { screen } = await renderSettings();
    expect(screen.queryByLabelText("Editar perfil")).toBeNull();
    expect(screen.queryByText("Sair da conta")).toBeNull();
    await expandSettingsSection(screen, "Preferências");
    expect(screen.getByLabelText("Bairro padrão")).toBeDefined();
    await expandSettingsSection(screen, "Armazenamento e histórico");
    expect(screen.getByLabelText("Apagar histórico de buscas deste aparelho")).toBeDefined();
  });

  it("pede confirmação antes de apagar o histórico de buscas (Spec 091)", async () => {
    mockSession(true);
    const clearSearchHistory = vi.fn().mockResolvedValue(undefined);
    mockedUseSettingsViewModel.mockReturnValue([
      { clearingCache: false, cacheCleared: false, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
      { clearBooksCache: vi.fn(), clearSearchHistory },
    ]);
    const { screen } = await renderSettings();
    await expandSettingsSection(screen, "Armazenamento e histórico");
    await act(async () => { fireEvent.press(screen.getByLabelText("Apagar histórico de buscas deste aparelho")); });
    expect(screen.getByText("Esta ação apaga as buscas recentes guardadas neste aparelho. As demais informações do IpêBook continuam iguais.")).toBeDefined();
    expect(clearSearchHistory).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByLabelText("Cancelar")); });
    expect(clearSearchHistory).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByLabelText("Apagar histórico de buscas deste aparelho")); });
    await act(async () => { fireEvent.press(screen.getByLabelText("Apagar histórico")); });
    expect(clearSearchHistory).toHaveBeenCalledWith("ana");
  });

  it("abre o e-mail do suporte com assunto e versão (Spec 091)", async () => {
    mockSession(false);
    mockSettings();
    const open = vi.spyOn(Linking, "openURL").mockResolvedValue(true as never);
    const { screen } = await renderSettings();
    await expandSettingsSection(screen, "Sobre o IpêBook");
    expect(screen.getByText("ipebook738@gmail.com")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Falar com a equipe")); });
    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0][0]);
    expect(url.startsWith("mailto:ipebook738@gmail.com?subject=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Versão do aplicativo:");
  });

  it("oferece 'Conhecer o IpêBook' que leva à página de apresentação (Spec 092)", async () => {
    mockSession(false);
    mockSettings();
    const onNavigateToAbout = vi.fn();
    const { screen } = await renderSettings({ onNavigateToAbout });
    await expandSettingsSection(screen, "Sobre o IpêBook");
    await act(async () => { fireEvent.press(screen.getByLabelText("Conhecer o IpêBook")); });
    expect(onNavigateToAbout).toHaveBeenCalledTimes(1);
  });

  it("oferece o Instagram do IpêBook com o ícone e abre o perfil (Spec 092)", async () => {
    mockSession(false);
    mockSettings();
    const open = vi.spyOn(Linking, "openURL").mockResolvedValue(true as never);
    const { screen } = await renderSettings();
    await expandSettingsSection(screen, "Sobre o IpêBook");
    expect(screen.getByText("@ipebook")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByLabelText("Siga o IpêBook no Instagram")); });
    expect(open).toHaveBeenCalledWith("https://instagram.com/ipebook");
  });

  it("mostra as quatro chaves de notificação com sessão e desliga uma categoria (Spec 099)", async () => {
    mockSession(true);
    mockSettings();
    const { setEnabled } = mockNotifPrefs();
    const { screen } = await renderSettings();

    expect(screen.getAllByRole("header").map((h) => h.props.children)).toContain("Notificações");
    await expandSettingsSection(screen, "Notificações");
    for (const category of Object.values(NOTIFICATION_PREFERENCE_CATEGORIES)) {
      expect(screen.getByLabelText(`${category.label}: ativada`)).toBeDefined();
    }

    // Desligar "Avisos do sistema" grava os tipos correspondentes como desativados.
    await act(async () => {
      fireEvent(screen.getByLabelText("Avisos do sistema: ativada"), "valueChange", false);
    });
    expect(setEnabled).toHaveBeenCalledWith("system", false);
  });

  it("não mostra a seção de notificações sem sessão (Spec 099)", async () => {
    mockSession(false);
    mockSettings();
    const { screen } = await renderSettings();
    expect(screen.queryByText("Notificações")).toBeNull();
  });

  it("mostra a mensagem de erro ao falhar ao salvar uma categoria (Spec 099)", async () => {
    mockSession(true);
    mockSettings();
    mockNotifPrefs({ error: "Não foi possível salvar suas preferências de notificação." });
    const { screen } = await renderSettings();
    await expandSettingsSection(screen, "Notificações");
    expect(screen.getByText("Não foi possível salvar suas preferências de notificação.")).toBeDefined();
  });

  it("navega pelos links de gestão da conta quando sessão ativa", async () => {
    mockSession(true);
    mockSettings();
    const onNavigateToSecurity = vi.fn();
    const onNavigateToNotifications = vi.fn();
    const onNavigateToPrivacy = vi.fn();
    const onNavigateToBlockedUsers = vi.fn();

    const { screen } = await renderSettings({
      onNavigateToSecurity,
      onNavigateToNotifications,
      onNavigateToPrivacy,
      onNavigateToBlockedUsers,
    });

    await expandSettingsSection(screen, "Conta e dados");

    await act(async () => { fireEvent.press(screen.getByLabelText("Segurança e verificação")); });
    expect(onNavigateToSecurity).toHaveBeenCalledTimes(1);

    await act(async () => { fireEvent.press(screen.getByLabelText("Central de notificações")); });
    expect(onNavigateToNotifications).toHaveBeenCalledTimes(1);

    await act(async () => { fireEvent.press(screen.getByLabelText("Privacidade e dados")); });
    expect(onNavigateToPrivacy).toHaveBeenCalledTimes(1);

    await act(async () => { fireEvent.press(screen.getByLabelText("Pessoas bloqueadas")); });
    expect(onNavigateToBlockedUsers).toHaveBeenCalledTimes(1);
  });

  it("navega para ajuda e termos na seção Sobre o IpêBook", async () => {
    mockSession(false);
    mockSettings();
    const onNavigateToHelp = vi.fn();
    const onNavigateToTerms = vi.fn();

    const { screen } = await renderSettings({
      onNavigateToHelp,
      onNavigateToTerms,
    });

    await expandSettingsSection(screen, "Sobre o IpêBook");

    await act(async () => { fireEvent.press(screen.getByLabelText("Ajuda e suporte")); });
    expect(onNavigateToHelp).toHaveBeenCalledTimes(1);

    await act(async () => { fireEvent.press(screen.getByLabelText("Termos e privacidade")); });
    expect(onNavigateToTerms).toHaveBeenCalledTimes(1);
  });

  it("exibe erros de limpeza de cache e histórico quando presentes no estado", async () => {
    mockSession(false);
    mockedUseSettingsViewModel.mockReturnValue([
      {
        clearingCache: false,
        cacheCleared: false,
        cacheError: "Erro ao limpar o catálogo offline",
        clearingHistory: false,
        historyCleared: false,
        historyError: "Erro ao limpar o histórico de buscas",
      },
      { clearBooksCache: vi.fn(), clearSearchHistory: vi.fn() },
    ]);

    const { screen } = await renderSettings();
    await expandSettingsSection(screen, "Armazenamento e histórico");

    expect(screen.getByText("Erro ao limpar o catálogo offline")).toBeDefined();
    expect(screen.getByText("Erro ao limpar o histórico de buscas")).toBeDefined();
  });
});


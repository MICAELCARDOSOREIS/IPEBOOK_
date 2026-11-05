import React from "react";
import { render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockPushOnce,
  mockReplaceOnce,
  mockBackOnce,
  mockCanGoBack,
  mockParamsState,
  mockPathnameState,
  renderedProps,
  createScreenStub,
} = vi.hoisted(() => {
  const propsMap: Record<string, Record<string, unknown>> = {};
  return {
    mockPushOnce: vi.fn(),
    mockReplaceOnce: vi.fn(),
    mockBackOnce: vi.fn(),
    mockCanGoBack: vi.fn(() => true),
    mockParamsState: { current: {} as Record<string, string | undefined> },
    mockPathnameState: { current: "/" },
    renderedProps: propsMap,
    createScreenStub: (name: string) => {
      const Stub = (props: Record<string, unknown>) => {
        propsMap[name] = props;
        return React.createElement(name, props, props.children as React.ReactNode);
      };
      return Stub;
    },
  };
});

vi.mock("expo-router", () => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    canGoBack: () => mockCanGoBack(),
  },
  Stack: createScreenStub("StackStub"),
  usePathname: () => mockPathnameState.current,
  useLocalSearchParams: () => mockParamsState.current,
  useFocusEffect: (cb: () => void) => {
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

vi.mock("expo-screen-orientation", () => ({
  OrientationLock: { PORTRAIT_UP: 1 },
  lockAsync: vi.fn(() => Promise.resolve()),
}));

vi.mock("expo-status-bar", () => ({
  StatusBar: createScreenStub("StatusBarStub"),
}));

vi.mock("@/view/useIpebookFonts", () => ({
  useIpebookFonts: () => [true],
}));

vi.mock("@/view/components/ConnectedNavigationBar", () => ({
  ConnectedNavigationBar: createScreenStub("ConnectedNavigationBarStub"),
}));

vi.mock("@/view/components/ConnectedWebHeader", () => ({
  ConnectedWebHeader: createScreenStub("ConnectedWebHeaderStub"),
}));

vi.mock("@/view/onboarding/initialRouteGate", () => ({
  InitialRouteGate: createScreenStub("InitialRouteGateStub"),
}));

vi.mock("@/view/components/KeyboardAwareRoot", () => ({
  KeyboardAwareRoot: createScreenStub("KeyboardAwareRootStub"),
}));

vi.mock("@/view/components/BrandSplashScreen", () => ({
  BrandSplashScreen: createScreenStub("BrandSplashScreenStub"),
}));

vi.mock("@/view/components/PushRegistration", () => ({
  PushRegistration: createScreenStub("PushRegistrationStub"),
}));

vi.mock("@/view/components/PwaRegister", () => ({
  PwaRegister: createScreenStub("PwaRegisterStub"),
}));

vi.mock("@/view/components/AppErrorFallback", () => ({
  AppErrorFallback: createScreenStub("AppErrorFallbackStub"),
  startErrorReporting: vi.fn(),
}));

vi.mock("expo-router/html", () => ({
  ScrollViewStyleReset: () => null,
  useServerDocumentContext: () => ({
    htmlAttributes: { "data-theme": "light" },
    bodyAttributes: {},
    headNodes: null,
    bodyNodes: null,
  }),
}));

vi.mock("expo-linking", () => ({
  useURL: () => "https://ipebook.app/auth/callback#access_token=abc",
}));

vi.mock("@/view/pushOnce", () => ({
  pushOnce: (...args: unknown[]) => mockPushOnce(...args),
  replaceOnce: (...args: unknown[]) => mockReplaceOnce(...args),
  backOnce: (...args: unknown[]) => mockBackOnce(...args),
}));

vi.mock("@/view/components/RequireAuth", () => ({
  RequireAuth: createScreenStub("RequireAuthStub"),
}));

vi.mock("@/view/home", () => ({ default: createScreenStub("HomeStub") }));
vi.mock("@/view/help/helpAndFaq", () => ({ default: createScreenStub("HelpAndFaqStub") }));
vi.mock("@/view/search/searchAlertsScreen", () => ({ default: createScreenStub("SearchAlertsScreenStub") }));
vi.mock("@/view/search/manageAlertScreen", () => ({ default: createScreenStub("ManageAlertScreenStub") }));
vi.mock("@/view/search/editAlertScreen", () => ({ default: createScreenStub("EditAlertScreenStub") }));
vi.mock("@/view/listings/createListingScreen", () => ({ default: createScreenStub("CreateListingScreenStub") }));
vi.mock("@/view/auth/authCallback", () => ({ default: createScreenStub("AuthCallbackStub") }));
vi.mock("@/view/onboarding/welcomeRoute", () => ({ default: createScreenStub("WelcomeRouteStub") }));
vi.mock("@/view/beta/betaInviteScreen", () => ({ default: createScreenStub("BetaInviteRouteStub") }));
vi.mock("@/view/conversations/chat", () => ({ default: createScreenStub("ChatScreenStub") }));
vi.mock("@/view/auth/signUp", () => ({ default: createScreenStub("SignUpStub") }));
vi.mock("@/view/listings/reportListingScreen", () => ({ default: createScreenStub("ReportListingScreenStub") }));
vi.mock("@/view/listings/reportUser", () => ({ default: createScreenStub("ReportUserStub") }));
vi.mock("@/view/listings/editListingScreen", () => ({ default: createScreenStub("EditListingScreenStub") }));
vi.mock("@/view/auth/signIn", () => ({ default: createScreenStub("SignInStub") }));
vi.mock("@/view/auth/forgotPassword", () => ({ default: createScreenStub("ForgotPasswordStub") }));
vi.mock("@/view/auth/deleteAccountScreen", () => ({ default: createScreenStub("DeleteAccountScreenStub") }));
vi.mock("@/view/favorites/favoritesScreen", () => ({ default: createScreenStub("FavoritesScreenStub") }));
vi.mock("@/view/listings/manageListingScreen", () => ({ default: createScreenStub("ManageListingScreenStub") }));
vi.mock("@/view/listings/bookDetail", () => ({ default: createScreenStub("BookDetailStub") }));
vi.mock("@/view/listings/myListings", () => ({ default: createScreenStub("MyListingsScreenStub") }));
vi.mock("@/view/conversations/conversations", () => ({ default: createScreenStub("ConversationsScreenStub") }));
vi.mock("@/view/moderation/moderation", () => ({ default: createScreenStub("ModerationScreenStub") }));
vi.mock("@/view/requests/requestDetail", () => ({ default: createScreenStub("RequestDetailScreenStub") }));
vi.mock("@/view/requests/scheduleMeeting", () => ({ default: createScreenStub("ScheduleMeetingScreenStub") }));
vi.mock("@/view/requests/delivery", () => ({ default: createScreenStub("DeliveryScreenStub") }));
vi.mock("@/view/components/NotFound", () => ({ NotFound: createScreenStub("NotFoundStub") }));
vi.mock("@/view/notifications/notificationsScreen", () => ({ default: createScreenStub("NotificationsScreenStub") }));
vi.mock("@/view/requests/receivedRequests", () => ({ default: createScreenStub("ReceivedRequestsScreenStub") }));
vi.mock("@/view/profile/profileHub", () => ({ default: createScreenStub("ProfileHubStub") }));
vi.mock("@/view/listings/publicProfile", () => ({ PublicProfile: createScreenStub("PublicProfileStub") }));
vi.mock("@/view/profile/receivedRatings", () => ({ default: createScreenStub("ReceivedRatingsScreenStub") }));
vi.mock("@/view/profile/blockedUsers", () => ({ BlockedUsers: createScreenStub("BlockedUsersStub") }));
vi.mock("@/view/profile/settings", () => ({ Settings: createScreenStub("SettingsStub") }));
vi.mock("@/view/profile/inviteFriends", () => ({ InviteFriends: createScreenStub("InviteFriendsStub") }));
vi.mock("@/view/profile/profile", () => ({ default: createScreenStub("ProfileStub") }));
vi.mock("@/view/profile/meetingHistory", () => ({ default: createScreenStub("MeetingHistoryStub") }));
vi.mock("@/view/profile/security", () => ({ Security: createScreenStub("SecurityStub") }));
vi.mock("@/view/search/search", () => ({
  default: createScreenStub("SearchStub"),
  parseInitialModality: (m?: string) => (m === "doacao" ? "donation" : m === "troca" ? "trade" : m === "venda" ? "sale" : "all"),
}));
vi.mock("@/view/listings/drafts", () => ({ default: createScreenStub("DraftsScreenStub") }));
vi.mock("@/view/auth/resetPassword", () => ({ default: createScreenStub("ResetPasswordStub") }));
vi.mock("@/view/legal/termsAndPrivacy", () => ({ default: createScreenStub("TermsAndPrivacyStub") }));

import RootHtml from "@/app/+html";
import NaoEncontrado from "@/app/+not-found";
import RootLayout, { ErrorBoundary } from "@/app/_layout";
import AjudaRoute from "@/app/ajuda";
import SearchAlertsRoute from "@/app/alertas";
import ManageAlertRoute from "@/app/alertas/[id]";
import EditAlertRoute from "@/app/alertas/[id]/editar";
import AnunciarRoute from "@/app/anunciar";
import AuthCallbackRoute from "@/app/auth/callback";
import BemVindo from "@/app/bem-vindo";
import Beta from "@/app/beta";
import ConversaRoute from "@/app/conversa/[id]";
import CriarConta from "@/app/criar-conta";
import DenunciarPessoa from "@/app/denunciar-pessoa/[userId]";
import DenunciarLivro from "@/app/denunciar/[id]";
import EditarAnuncioRoute from "@/app/editar-anuncio/[id]";
import Entrar from "@/app/entrar";
import EsqueciSenha from "@/app/esqueci-senha";
import ExcluirContaRoute from "@/app/excluir-conta";
import FavoritesRoute from "@/app/favoritos";
import GerenciarAnuncioRoute from "@/app/gerenciar-anuncio/[id]";
import Index from "@/app/index";
import LivroDetalhe from "@/app/livro/[id]";
import MeusAnunciosRoute from "@/app/meus-anuncios";
import MeusPedidosRoute from "@/app/meus-pedidos";
import ModeracaoRoute from "@/app/moderacao";
import NegociacaoDetalheRoute from "@/app/negociacao/[id]";
import CombinarEncontroRoute from "@/app/negociacao/[id]/encontro";
import EntregaRoute from "@/app/negociacao/[id]/entrega";
import NotificationsRoute from "@/app/notificacoes";
import PedidosRecebidosRoute from "@/app/pedidos-recebidos";
import Perfil from "@/app/perfil";
import PerfilPublico from "@/app/perfil/[userId]";
import AvaliacoesRoute from "@/app/perfil/avaliacoes";
import BloqueadosRoute from "@/app/perfil/bloqueados";
import ConfiguracoesRoute from "@/app/perfil/configuracoes";
import ConvidarRoute from "@/app/perfil/convidar";
import EditarPerfilRoute from "@/app/perfil/editar";
import EncontrosRoute from "@/app/perfil/encontros";
import SegurancaRoute from "@/app/perfil/seguranca";
import Pesquisa from "@/app/pesquisa";
import RascunhosRoute from "@/app/rascunhos";
import RedefinirSenhaRoute from "@/app/redefinir-senha";
import Sobre from "@/app/sobre";
import TermosRoute from "@/app/termos";

type AnyRecord = Record<string, (...args: unknown[]) => unknown>;

function getStub(name: string): AnyRecord & Record<string, unknown> {
  const props = renderedProps[name];
  if (!props) throw new Error(`Stub ${name} não foi renderizado.`);
  return props as AnyRecord & Record<string, unknown>;
}

function invokeAllCallbacks(stubName: string) {
  const props = getStub(stubName);
  for (const [key, val] of Object.entries(props)) {
    if (typeof val === "function" && key.startsWith("on")) {
      val("arg-1", "arg-2");
    }
  }
}

async function renderRoute(ui: React.ReactElement) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await React.act(async () => {
    screen = await render(ui);
  });
  return screen;
}

describe("Rotas em src/app/** — contratos de parâmetros, guards e navegação", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParamsState.current = {};
    mockCanGoBack.mockReturnValue(true);
    for (const key of Object.keys(renderedProps)) {
      delete renderedProps[key];
    }
  });

  it("Index (/) protege com RequireAuth e repassa callbacks de navegação para Home", async () => {
    await renderRoute(<Index />);
    getStub("RequireAuthStub").onRequireSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");

    const home = getStub("HomeStub");
    expect(Number(home.focusKey)).toBeGreaterThanOrEqual(1);
    home.onNavigateToSignIn();
    expect(mockPushOnce).toHaveBeenCalledWith("/entrar");
    home.onNavigateToBookDetail("book-1");
    expect(mockPushOnce).toHaveBeenCalledWith("/livro/book-1");
    home.onNavigateToNotifications();
    expect(mockPushOnce).toHaveBeenCalledWith("/notificacoes");
    home.onNavigateToHelp();
    expect(mockPushOnce).toHaveBeenCalledWith("/ajuda");
    home.onNavigateToTerms();
    expect(mockPushOnce).toHaveBeenCalledWith("/termos");
    home.onNavigateToSearch({ modality: "donation", neighborhood: "Centro" });
    expect(mockPushOnce).toHaveBeenCalledWith({
      pathname: "/pesquisa",
      params: { modalidade: "donation", bairro: "Centro" },
    });
    home.onNavigateToSearch();
    expect(mockPushOnce).toHaveBeenCalledWith("/pesquisa");
  });

  it("Pesquisa (/pesquisa) converte modalidade/categoria/bairro e protege com RequireAuth", async () => {
    mockParamsState.current = { modalidade: "doacao", categoria: " Romance ", bairro: "Paciência" };
    await renderRoute(<Pesquisa />);
    getStub("RequireAuthStub").onRequireSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/entrar");

    const search = getStub("SearchStub");
    expect(search.initialModality).toBe("donation");
    expect(search.initialCategory).toBe("Romance");
    expect(search.currentNeighborhood).toBe("Paciência");
    search.onNavigateToBookDetail("b-9");
    expect(mockPushOnce).toHaveBeenCalledWith("/livro/b-9");
    search.onNavigateToFavorites();
    expect(mockPushOnce).toHaveBeenCalledWith("/favoritos");

    mockParamsState.current = {};
    await renderRoute(<Pesquisa />);
    expect(getStub("SearchStub").initialCategory).toBeUndefined();
    expect(getStub("SearchStub").currentNeighborhood).toBeUndefined();
  });

  it("LivroDetalhe (/livro/[id]) repassa bookId e todos os destinos de navegação", async () => {
    mockParamsState.current = { id: "livro-42" };
    await renderRoute(<LivroDetalhe />);
    const detail = getStub("BookDetailStub");
    expect(detail.bookId).toBe("livro-42");
    detail.onBack();
    expect(mockBackOnce).toHaveBeenCalled();
    detail.onNavigateToUserProfile("user-7");
    expect(mockPushOnce).toHaveBeenCalledWith("/perfil/user-7");
    detail.onNavigateToReport("livro-42");
    expect(mockPushOnce).toHaveBeenCalledWith("/denunciar/livro-42");
    detail.onNavigateToSignIn();
    expect(mockPushOnce).toHaveBeenCalledWith("/entrar");
    detail.onNavigateToManageListing("livro-42");
    expect(mockPushOnce).toHaveBeenCalledWith("/gerenciar-anuncio/livro-42");
    detail.onNavigateToMyRequests();
    expect(mockPushOnce).toHaveBeenCalledWith("/meus-pedidos");
    detail.onNavigateToNegotiation("req-10");
    expect(mockPushOnce).toHaveBeenCalledWith("/negociacao/req-10");
    detail.onNavigateToCategorySearch("Ficção");
    expect(mockPushOnce).toHaveBeenCalledWith({ pathname: "/pesquisa", params: { categoria: "Ficção" } });
  });

  it("Rotas de acesso (Entrar, CriarConta, EsqueciSenha, RedefinirSenha, AuthCallback) tratam retornos e fallback de histórico", async () => {
    mockParamsState.current = { retorno: "favoritos" };
    await renderRoute(<Entrar />);
    const signIn = getStub("SignInStub");
    signIn.onAuthenticated();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/favoritos");
    signIn.onNavigateToSignUp();
    expect(mockPushOnce).toHaveBeenCalledWith("/criar-conta");
    signIn.onNavigateToForgotPassword();
    expect(mockPushOnce).toHaveBeenCalledWith("/esqueci-senha");
    signIn.onBack();
    mockCanGoBack.mockReturnValue(false);
    signIn.onBack();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");

    mockParamsState.current = { retorno: "excluir-conta" };
    await renderRoute(<Entrar />);
    getStub("SignInStub").onAuthenticated();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/excluir-conta");

    mockParamsState.current = { retorno: "alertas", termo: "machado" };
    await renderRoute(<Entrar />);
    getStub("SignInStub").onAuthenticated();
    expect(mockReplaceOnce).toHaveBeenCalledWith({ pathname: "/alertas", params: { termo: "machado" } });

    mockParamsState.current = {};
    await renderRoute(<Entrar />);
    getStub("SignInStub").onAuthenticated();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<CriarConta />);
    const signUp = getStub("SignUpStub");
    signUp.onAuthenticated();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/");
    signUp.onNavigateToSignIn();
    expect(mockPushOnce).toHaveBeenCalledWith("/entrar");
    signUp.onNavigateToTerms();
    expect(mockPushOnce).toHaveBeenCalledWith("/termos");
    signUp.onBack();
    mockCanGoBack.mockReturnValue(false);
    signUp.onBack();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");

    await renderRoute(<EsqueciSenha />);
    getStub("ForgotPasswordStub").onNavigateToSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/entrar");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<RedefinirSenhaRoute />);
    const reset = getStub("ResetPasswordStub");
    expect(String(reset.link)).toContain("access_token=abc");
    reset.onNavigateToSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/entrar");
    reset.onNavigateToForgotPassword();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/esqueci-senha");
    reset.onBack();
    mockCanGoBack.mockReturnValue(false);
    reset.onBack();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<AuthCallbackRoute />);
    const cb = getStub("AuthCallbackStub");
    cb.onSuccess();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/");
    cb.onBackToSignIn();
    mockCanGoBack.mockReturnValue(false);
    cb.onBackToSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/entrar");
  });

  it("Rotas de negociação, encontro, entrega, conversa e pedidos repassam IDs e ações", async () => {
    mockParamsState.current = { id: "req-99" };

    await renderRoute(<NegociacaoDetalheRoute />);
    const reqDetail = getStub("RequestDetailScreenStub");
    expect(reqDetail.requestId).toBe("req-99");
    invokeAllCallbacks("RequestDetailScreenStub");
    expect(mockPushOnce).toHaveBeenCalledWith("/negociacao/req-99/encontro");
    expect(mockPushOnce).toHaveBeenCalledWith("/negociacao/req-99/entrega");

    await renderRoute(<CombinarEncontroRoute />);
    expect(getStub("ScheduleMeetingScreenStub").requestId).toBe("req-99");
    invokeAllCallbacks("ScheduleMeetingScreenStub");

    await renderRoute(<EntregaRoute />);
    expect(getStub("DeliveryScreenStub").requestId).toBe("req-99");
    invokeAllCallbacks("DeliveryScreenStub");

    mockParamsState.current = {};
    await renderRoute(<CombinarEncontroRoute />);
    expect(getStub("ScheduleMeetingScreenStub").requestId).toBe("");
    await renderRoute(<EntregaRoute />);
    expect(getStub("DeliveryScreenStub").requestId).toBe("");

    mockParamsState.current = { id: "req-99" };
    await renderRoute(<ConversaRoute />);
    expect(getStub("ChatScreenStub").requestId).toBe("req-99");
    invokeAllCallbacks("ChatScreenStub");

    await renderRoute(<MeusPedidosRoute />);
    invokeAllCallbacks("ConversationsScreenStub");

    await renderRoute(<PedidosRecebidosRoute />);
    invokeAllCallbacks("ReceivedRequestsScreenStub");
  });

  it("Rotas de anúncios, rascunhos, favoritos, alertas e denúncias conectam parâmetros e RequireAuth", async () => {
    mockParamsState.current = { rascunho: "draft-1", id: "item-5", userId: "u-8", nome: "Maria", termo: "poesia" };

    await renderRoute(<AnunciarRoute />);
    expect(getStub("CreateListingScreenStub").initialDraftId).toBe("draft-1");
    invokeAllCallbacks("CreateListingScreenStub");

    await renderRoute(<EditarAnuncioRoute />);
    expect(getStub("EditListingScreenStub").bookId).toBe("item-5");
    invokeAllCallbacks("EditListingScreenStub");

    await renderRoute(<GerenciarAnuncioRoute />);
    expect(getStub("ManageListingScreenStub").bookId).toBe("item-5");
    invokeAllCallbacks("ManageListingScreenStub");

    await renderRoute(<MeusAnunciosRoute />);
    invokeAllCallbacks("MyListingsScreenStub");

    await renderRoute(<RascunhosRoute />);
    invokeAllCallbacks("DraftsScreenStub");

    await renderRoute(<FavoritesRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("FavoritesScreenStub");

    await renderRoute(<SearchAlertsRoute />);
    expect(getStub("SearchAlertsScreenStub").initialQuery).toBe("poesia");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("SearchAlertsScreenStub");

    await renderRoute(<ManageAlertRoute />);
    expect(getStub("ManageAlertScreenStub").alertId).toBe("item-5");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("ManageAlertScreenStub");

    await renderRoute(<EditAlertRoute />);
    expect(getStub("EditAlertScreenStub").alertId).toBe("item-5");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("EditAlertScreenStub");

    mockParamsState.current = {};
    await renderRoute(<AnunciarRoute />);
    expect(getStub("CreateListingScreenStub").initialDraftId).toBeUndefined();
    await renderRoute(<SearchAlertsRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("SearchAlertsScreenStub");
    await renderRoute(<ManageAlertRoute />);
    expect(getStub("ManageAlertScreenStub").alertId).toBe("");
    await renderRoute(<EditAlertRoute />);
    expect(getStub("EditAlertScreenStub").alertId).toBe("");

    mockParamsState.current = { id: "item-5", userId: "u-8", nome: "Maria" };
    await renderRoute(<DenunciarLivro />);
    expect(getStub("ReportListingScreenStub").listingId).toBe("item-5");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("ReportListingScreenStub");

    await renderRoute(<DenunciarPessoa />);
    const denPStub = getStub("ReportUserStub");
    expect(denPStub.userId).toBe("u-8");
    expect(denPStub.userName).toBe("Maria");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("ReportUserStub");
  });

  it("Rotas de perfil, configurações, moderação, notificações e páginas institucionais funcionam", async () => {
    mockParamsState.current = { userId: "pub-1", aba: "privacidade" };

    await renderRoute(<Perfil />);
    invokeAllCallbacks("ProfileHubStub");
    expect(mockPushOnce).toHaveBeenCalledWith("/perfil/configuracoes");

    await renderRoute(<PerfilPublico />);
    expect(getStub("PublicProfileStub").userId).toBe("pub-1");
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("PublicProfileStub");

    await renderRoute(<AvaliacoesRoute />);
    invokeAllCallbacks("ReceivedRatingsScreenStub");

    await renderRoute(<BloqueadosRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("BlockedUsersStub");

    await renderRoute(<ConvidarRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("InviteFriendsStub");

    await renderRoute(<EditarPerfilRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("ProfileStub");

    await renderRoute(<EncontrosRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("MeetingHistoryStub");

    await renderRoute(<SegurancaRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("SecurityStub");

    await renderRoute(<ConfiguracoesRoute />);
    invokeAllCallbacks("SettingsStub");
    expect(mockPushOnce).toHaveBeenCalledWith("/moderacao");

    await renderRoute(<ModeracaoRoute />);
    invokeAllCallbacks("RequireAuthStub");
    invokeAllCallbacks("ModerationScreenStub");

    await renderRoute(<NotificationsRoute />);
    invokeAllCallbacks("NotificationsScreenStub");
    getStub("NotificationsScreenStub").onNavigateToAction("/perfil");
    getStub("NotificationsScreenStub").onNavigateToAction("");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<AjudaRoute />);
    invokeAllCallbacks("HelpAndFaqStub");
    mockCanGoBack.mockReturnValue(false);
    getStub("HelpAndFaqStub").onBack();

    await renderRoute(<BemVindo />);
    invokeAllCallbacks("WelcomeRouteStub");

    await renderRoute(<Sobre />);
    invokeAllCallbacks("WelcomeRouteStub");

    await renderRoute(<Beta />);
    invokeAllCallbacks("BetaInviteRouteStub");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<ExcluirContaRoute />);
    invokeAllCallbacks("DeleteAccountScreenStub");
    mockCanGoBack.mockReturnValue(false);
    getStub("DeleteAccountScreenStub").onBack();

    await renderRoute(<NaoEncontrado />);
    invokeAllCallbacks("NotFoundStub");

    mockCanGoBack.mockReturnValue(true);
    await renderRoute(<TermosRoute />);
    expect(getStub("TermsAndPrivacyStub").initialTab).toBe("privacy");
    invokeAllCallbacks("TermsAndPrivacyStub");
    mockCanGoBack.mockReturnValue(false);
    getStub("TermsAndPrivacyStub").onBack();

    mockParamsState.current = {};
    await renderRoute(<TermosRoute />);
    expect(getStub("TermsAndPrivacyStub").initialTab).toBe("terms");

    const htmlElement = RootHtml({ children: null });
    expect(htmlElement.props.lang).toBe("pt-BR");

    mockPathnameState.current = "/";
    await renderRoute(<RootLayout />);
    expect(getStub("PwaRegisterStub")).toBeTruthy();
    expect(getStub("BrandSplashScreenStub")).toBeTruthy();
    getStub("PushRegistrationStub").onOpenRoute("/notificacoes");
    expect(mockPushOnce).toHaveBeenCalledWith("/notificacoes");
    getStub("InitialRouteGateStub").onShowWelcome();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");
    const navBar = getStub("ConnectedNavigationBarStub");
    navBar.onNavigate("search");
    expect(mockPushOnce).toHaveBeenCalledWith("/pesquisa");

    const retryFn = vi.fn();
    await renderRoute(<ErrorBoundary error={new Error("Falha")} retry={retryFn} />);
    expect(getStub("AppErrorFallbackStub").retry).toBe(retryFn);
  });
});

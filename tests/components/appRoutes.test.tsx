import React from "react";
import { render } from "@testing-library/react-native";

const mockPushOnce = jest.fn();
const mockReplaceOnce = jest.fn();
const mockBackOnce = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const mockParamsState = { current: {} as Record<string, string | undefined> };
const mockPathnameState = { current: "/" };
const mockRenderedProps: Record<string, Record<string, unknown>> = {};

function mockCreateScreenStub(name: string) {
  const Stub = (props: Record<string, unknown>) => {
    mockRenderedProps[name] = props;
    const ReactRuntime = require("react") as typeof import("react");
    return ReactRuntime.createElement(name, props, props.children as React.ReactNode);
  };
  return Stub;
}

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => mockCanGoBack(),
  },
  Stack: mockCreateScreenStub("StackStub"),
  usePathname: () => mockPathnameState.current,
  useLocalSearchParams: () => mockParamsState.current,
  useFocusEffect: (cb: () => void) => {
    const ReactRuntime = require("react") as typeof import("react");
    ReactRuntime.useEffect(() => {
      cb();
    }, []);
  },
}));

jest.mock("expo-screen-orientation", () => ({
  OrientationLock: { PORTRAIT_UP: 1 },
  lockAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: mockCreateScreenStub("StatusBarStub"),
}));

jest.mock("@/view/useIpebookFonts", () => ({
  useIpebookFonts: () => [true],
}));

jest.mock("@/view/components/ConnectedNavigationBar", () => ({
  ConnectedNavigationBar: mockCreateScreenStub("ConnectedNavigationBarStub"),
}));

jest.mock("@/view/components/ConnectedWebHeader", () => ({
  ConnectedWebHeader: mockCreateScreenStub("ConnectedWebHeaderStub"),
}));

jest.mock("@/view/onboarding/initialRouteGate", () => ({
  InitialRouteGate: mockCreateScreenStub("InitialRouteGateStub"),
}));

jest.mock("@/view/components/KeyboardAwareRoot", () => ({
  KeyboardAwareRoot: mockCreateScreenStub("KeyboardAwareRootStub"),
}));

jest.mock("@/view/components/BrandSplashScreen", () => ({
  BrandSplashScreen: mockCreateScreenStub("BrandSplashScreenStub"),
}));

jest.mock("@/view/components/PushRegistration", () => ({
  PushRegistration: mockCreateScreenStub("PushRegistrationStub"),
}));

jest.mock("@/view/components/PwaRegister", () => ({
  PwaRegister: mockCreateScreenStub("PwaRegisterStub"),
}));

jest.mock("@/view/components/AppErrorFallback", () => ({
  AppErrorFallback: mockCreateScreenStub("AppErrorFallbackStub"),
  startErrorReporting: jest.fn(),
}));

jest.mock("expo-router/html", () => ({
  ScrollViewStyleReset: () => null,
  useServerDocumentContext: () => ({
    htmlAttributes: { "data-theme": "light" },
    bodyAttributes: {},
    headNodes: null,
    bodyNodes: null,
  }),
}));

jest.mock("expo-linking", () => ({
  useURL: () => "https://ipebook.app/auth/callback#access_token=abc",
}));

jest.mock("@/view/pushOnce", () => ({
  pushOnce: (...args: unknown[]) => mockPushOnce(...args),
  replaceOnce: (...args: unknown[]) => mockReplaceOnce(...args),
  backOnce: (...args: unknown[]) => mockBackOnce(...args),
}));

jest.mock("@/view/components/RequireAuth", () => ({
  RequireAuth: mockCreateScreenStub("RequireAuthStub"),
}));

jest.mock("@/view/home", () => ({ __esModule: true, default: mockCreateScreenStub("HomeStub") }));
jest.mock("@/view/help/helpAndFaq", () => ({ __esModule: true, default: mockCreateScreenStub("HelpAndFaqStub") }));
jest.mock("@/view/search/searchAlertsScreen", () => ({ __esModule: true, default: mockCreateScreenStub("SearchAlertsScreenStub") }));
jest.mock("@/view/search/manageAlertScreen", () => ({ __esModule: true, default: mockCreateScreenStub("ManageAlertScreenStub") }));
jest.mock("@/view/search/editAlertScreen", () => ({ __esModule: true, default: mockCreateScreenStub("EditAlertScreenStub") }));
jest.mock("@/view/listings/createListingScreen", () => ({ __esModule: true, default: mockCreateScreenStub("CreateListingScreenStub") }));
jest.mock("@/view/auth/authCallback", () => ({ __esModule: true, default: mockCreateScreenStub("AuthCallbackStub") }));
jest.mock("@/view/onboarding/welcomeRoute", () => ({ __esModule: true, default: mockCreateScreenStub("WelcomeRouteStub") }));
jest.mock("@/view/beta/betaInviteScreen", () => ({ __esModule: true, default: mockCreateScreenStub("BetaInviteRouteStub") }));
jest.mock("@/view/conversations/chat", () => ({ __esModule: true, default: mockCreateScreenStub("ChatScreenStub") }));
jest.mock("@/view/auth/signUp", () => ({ __esModule: true, default: mockCreateScreenStub("SignUpStub") }));
jest.mock("@/view/listings/reportListingScreen", () => ({ __esModule: true, default: mockCreateScreenStub("ReportListingScreenStub") }));
jest.mock("@/view/listings/reportUser", () => ({ __esModule: true, default: mockCreateScreenStub("ReportUserStub") }));
jest.mock("@/view/listings/editListingScreen", () => ({ __esModule: true, default: mockCreateScreenStub("EditListingScreenStub") }));
jest.mock("@/view/auth/signIn", () => ({ __esModule: true, default: mockCreateScreenStub("SignInStub") }));
jest.mock("@/view/auth/forgotPassword", () => ({ __esModule: true, default: mockCreateScreenStub("ForgotPasswordStub") }));
jest.mock("@/view/auth/deleteAccountScreen", () => ({ __esModule: true, default: mockCreateScreenStub("DeleteAccountScreenStub") }));
jest.mock("@/view/favorites/favoritesScreen", () => ({ __esModule: true, default: mockCreateScreenStub("FavoritesScreenStub") }));
jest.mock("@/view/listings/manageListingScreen", () => ({ __esModule: true, default: mockCreateScreenStub("ManageListingScreenStub") }));
jest.mock("@/view/listings/bookDetail", () => ({ __esModule: true, default: mockCreateScreenStub("BookDetailStub") }));
jest.mock("@/view/listings/myListings", () => ({ __esModule: true, default: mockCreateScreenStub("MyListingsScreenStub") }));
jest.mock("@/view/conversations/conversations", () => ({ __esModule: true, default: mockCreateScreenStub("ConversationsScreenStub") }));
jest.mock("@/view/moderation/moderation", () => ({ __esModule: true, default: mockCreateScreenStub("ModerationScreenStub") }));
jest.mock("@/view/requests/requestDetail", () => ({ __esModule: true, default: mockCreateScreenStub("RequestDetailScreenStub") }));
jest.mock("@/view/requests/scheduleMeeting", () => ({ __esModule: true, default: mockCreateScreenStub("ScheduleMeetingScreenStub") }));
jest.mock("@/view/requests/delivery", () => ({ __esModule: true, default: mockCreateScreenStub("DeliveryScreenStub") }));
jest.mock("@/view/components/NotFound", () => ({ NotFound: mockCreateScreenStub("NotFoundStub") }));
jest.mock("@/view/notifications/notificationsScreen", () => ({ __esModule: true, default: mockCreateScreenStub("NotificationsScreenStub") }));
jest.mock("@/view/requests/receivedRequests", () => ({ __esModule: true, default: mockCreateScreenStub("ReceivedRequestsScreenStub") }));
jest.mock("@/view/profile/profileHub", () => ({ __esModule: true, default: mockCreateScreenStub("ProfileHubStub") }));
jest.mock("@/view/listings/publicProfile", () => ({ PublicProfile: mockCreateScreenStub("PublicProfileStub") }));
jest.mock("@/view/profile/receivedRatings", () => ({ __esModule: true, default: mockCreateScreenStub("ReceivedRatingsScreenStub") }));
jest.mock("@/view/profile/blockedUsers", () => ({ BlockedUsers: mockCreateScreenStub("BlockedUsersStub") }));
jest.mock("@/view/profile/settings", () => ({ Settings: mockCreateScreenStub("SettingsStub") }));
jest.mock("@/view/profile/inviteFriends", () => ({ InviteFriends: mockCreateScreenStub("InviteFriendsStub") }));
jest.mock("@/view/profile/profile", () => ({ __esModule: true, default: mockCreateScreenStub("ProfileStub") }));
jest.mock("@/view/profile/meetingHistory", () => ({ __esModule: true, default: mockCreateScreenStub("MeetingHistoryStub") }));
jest.mock("@/view/profile/security", () => ({ Security: mockCreateScreenStub("SecurityStub") }));
jest.mock("@/view/search/search", () => ({
  __esModule: true,
  default: mockCreateScreenStub("SearchStub"),
  parseInitialModality: (m?: string) => (m === "doacao" ? "donation" : m === "troca" ? "trade" : m === "venda" ? "sale" : "all"),
}));
jest.mock("@/view/listings/drafts", () => ({ __esModule: true, default: mockCreateScreenStub("DraftsScreenStub") }));
jest.mock("@/view/auth/resetPassword", () => ({ __esModule: true, default: mockCreateScreenStub("ResetPasswordStub") }));
jest.mock("@/view/legal/termsAndPrivacy", () => ({ __esModule: true, default: mockCreateScreenStub("TermsAndPrivacyStub") }));

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
import ConversasRoute from "@/app/conversas";
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
  const props = mockRenderedProps[name];
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
    jest.clearAllMocks();
    mockParamsState.current = {};
    mockCanGoBack.mockReturnValue(true);
    for (const key of Object.keys(mockRenderedProps)) {
      delete mockRenderedProps[key];
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
    mockParamsState.current = { modalidade: "doacao", categoria: " Romance ", bairro: "Paciência", q: " Dom Casmurro " };
    await renderRoute(<Pesquisa />);
    getStub("RequireAuthStub").onRequireSignIn();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/entrar");

    const search = getStub("SearchStub");
    expect(search.initialModality).toBe("donation");
    expect(search.initialCategory).toBe("Romance");
    expect(search.currentNeighborhood).toBe("Paciência");
    expect(search.initialTerm).toBe("Dom Casmurro");
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
    mockCanGoBack.mockReturnValueOnce(false);
    getStub("ConversationsScreenStub").onBack();
    expect(mockReplaceOnce).toHaveBeenCalledWith("/");
    mockCanGoBack.mockReturnValueOnce(true);
    getStub("ConversationsScreenStub").onBack();
    expect(mockBackOnce).toHaveBeenCalled();

    await renderRoute(<ConversasRoute />);
    invokeAllCallbacks("ConversationsScreenStub");

    mockCanGoBack.mockReturnValueOnce(false);
    await renderRoute(<ConversasRoute />);
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
    expect(mockReplaceOnce).toHaveBeenCalledWith("/bem-vindo");
    getStub("DeleteAccountScreenStub").onAccountDeleted();
    getStub("DeleteAccountScreenStub").onNavigateToLogin?.();
    getStub("DeleteAccountScreenStub").onEditProfile?.();

    await renderRoute(<NaoEncontrado />);
    invokeAllCallbacks("NotFoundStub");
    getStub("NotFoundStub").onGoHome();
    getStub("NotFoundStub").onExplore?.();

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

    const retryFn = jest.fn();
    await renderRoute(<ErrorBoundary error={new Error("Falha")} retry={retryFn} />);
    expect(getStub("AppErrorFallbackStub").retry).toBe(retryFn);
  });
});

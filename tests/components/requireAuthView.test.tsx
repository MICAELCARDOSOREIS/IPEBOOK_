
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import type { User } from "@/model/entities/user";

jest.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: jest.fn(),
}));

jest.mock("@/viewmodel/useNavigationBadgesViewModel", () => ({
  useNavigationBadgesViewModel: jest.fn(() => ({ conversations: 0 })),
}));

jest.mock("@/viewmodel/useNotificationsViewModel", () => ({
  useNotificationsViewModel: jest.fn(() => [
    { unreadCount: 0, items: [], loading: false, error: null },
    { refresh: jest.fn(), markAsRead: jest.fn(), markAllAsRead: jest.fn() },
  ]),
}));

jest.mock("@/viewmodel/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(() => ({ isOnline: true })),
}));

import { ConnectedNavigationBar } from "@/view/components/ConnectedNavigationBar";
import { ConnectedWebHeader } from "@/view/components/ConnectedWebHeader";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

const mockedAuth = jest.mocked(useAuthViewModel);

function mockAuth(user: User | null, loading = false) {
  mockedAuth.mockReturnValue([
    { user, loading, error: null },
    {
      signUp: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
      requestPasswordReset: jest.fn(),
    },
  ]);
}

describe("RequireAuth: catálogo só para pessoa conectada (Spec 092)", () => {
  it("redireciona e não renderiza o conteúdo sem sessão", async () => {
    mockAuth(null);
    const onRequireSignIn = jest.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("catálogo")).toBeNull();
  });

  it("não redireciona enquanto a sessão é verificada e mostra o carregamento", async () => {
    mockAuth(null, true);
    const onRequireSignIn = jest.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.queryByText("catálogo")).toBeNull();
    expect(screen.getByText(/Verificando sua sessão/)).toBeDefined();
  });

  it("renderiza o conteúdo com sessão ativa, sem redirecionar", async () => {
    mockAuth({ id: "ana", name: "Ana", email: "ana@exemplo.com" } as User);
    const onRequireSignIn = jest.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.getByText("catálogo")).toBeTruthy();
  });

  it("exibe estado offline amigável quando sem conexão e sem sessão", async () => {
    // A hidratação faz o componente renderizar duas vezes; o estado offline precisa persistir entre elas.
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    mockAuth(null, false);
    const onRequireSignIn = jest.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    expect(screen.getByText("Tentar novamente")).toBeDefined();
    expect(screen.getByText("Ir para o início")).toBeDefined();
    jest.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  });
});

describe("ConnectedNavigationBar e ConnectedWebHeader: ocultos sem sessão autenticada", () => {
  it("ConnectedNavigationBar não renderiza itens quando não há sessão ou enquanto carrega", async () => {
    mockAuth(null, false);
    const unauth = await render(
      <ConnectedNavigationBar pathname="/termos" active="home" onNavigate={jest.fn()} />,
    );
    expect(unauth.queryByText("Explorar")).toBeNull();

    mockAuth(null, true);
    const loading = await render(
      <ConnectedNavigationBar pathname="/termos" active="home" onNavigate={jest.fn()} />,
    );
    expect(loading.queryByText("Explorar")).toBeNull();

    mockAuth({ id: "ana", name: "Ana", email: "ana@exemplo.com" } as User, false);
    const authed = await render(
      <ConnectedNavigationBar pathname="/" active="home" onNavigate={jest.fn()} />,
    );
    expect(authed.getByText("Explorar")).toBeTruthy();
  });

  it("ConnectedWebHeader não renderiza cabeçalho interno quando não há sessão ou enquanto carrega", async () => {
    mockAuth(null, false);
    const unauth = await render(
      <ConnectedWebHeader pathname="/termos" active="home" onNavigate={jest.fn()} onAnnounce={jest.fn()} />,
    );
    expect(unauth.queryByTestId("web-header")).toBeNull();

    mockAuth(null, true);
    const loading = await render(
      <ConnectedWebHeader pathname="/termos" active="home" onNavigate={jest.fn()} onAnnounce={jest.fn()} />,
    );
    expect(loading.queryByTestId("web-header")).toBeNull();

    mockAuth({ id: "ana", name: "Ana Silva", email: "ana@exemplo.com" } as User, false);
    const authed = await render(
      <ConnectedWebHeader pathname="/" active="home" onNavigate={jest.fn()} onAnnounce={jest.fn()} />,
    );
    expect(authed.getByTestId("web-header")).toBeTruthy();
    expect(authed.getByText("AS")).toBeTruthy();
  });
});

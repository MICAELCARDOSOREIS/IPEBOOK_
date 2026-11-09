
import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/model/entities/user";

vi.mock("@/viewmodel/useAuthViewModel", () => ({
  useAuthViewModel: vi.fn(),
}));

vi.mock("@/viewmodel/useNavigationBadgesViewModel", () => ({
  useNavigationBadgesViewModel: vi.fn(() => ({ conversations: 0 })),
}));

vi.mock("@/viewmodel/useNotificationsViewModel", () => ({
  useNotificationsViewModel: vi.fn(() => [
    { unreadCount: 0, items: [], loading: false, error: null },
    { refresh: vi.fn(), markAsRead: vi.fn(), markAllAsRead: vi.fn() },
  ]),
}));

vi.mock("@/viewmodel/useNetworkStatus", () => ({
  useNetworkStatus: vi.fn(() => ({ isOnline: true })),
}));

import { ConnectedNavigationBar } from "@/view/components/ConnectedNavigationBar";
import { ConnectedWebHeader } from "@/view/components/ConnectedWebHeader";
import { RequireAuth } from "@/view/components/RequireAuth";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNetworkStatus } from "@/viewmodel/useNetworkStatus";

const mockedAuth = vi.mocked(useAuthViewModel);

function mockAuth(user: User | null, loading = false) {
  mockedAuth.mockReturnValue([
    { user, loading, error: null },
    {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      requestPasswordReset: vi.fn(),
    },
  ]);
}

describe("RequireAuth: catálogo só para pessoa conectada (Spec 092)", () => {
  it("redireciona e não renderiza o conteúdo sem sessão", async () => {
    mockAuth(null);
    const onRequireSignIn = vi.fn();
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
    const onRequireSignIn = vi.fn();
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
    const onRequireSignIn = vi.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.getByText("catálogo")).toBeTruthy();
  });

  it("exibe estado offline amigável quando sem conexão e sem sessão", async () => {
    vi.mocked(useNetworkStatus).mockReturnValueOnce({ isOnline: false });
    mockAuth(null, false);
    const onRequireSignIn = vi.fn();
    const screen = await render(
      <RequireAuth onRequireSignIn={onRequireSignIn}>
        <Text>catálogo</Text>
      </RequireAuth>,
    );

    expect(onRequireSignIn).not.toHaveBeenCalled();
    expect(screen.getByText("Você está sem conexão com a internet.")).toBeDefined();
    expect(screen.getByText("Tentar novamente")).toBeDefined();
    expect(screen.getByText("Ir para o início")).toBeDefined();
  });
});

describe("ConnectedNavigationBar e ConnectedWebHeader: ocultos sem sessão autenticada", () => {
  it("ConnectedNavigationBar não renderiza itens quando não há sessão ou enquanto carrega", async () => {
    mockAuth(null, false);
    const unauth = await render(
      <ConnectedNavigationBar pathname="/termos" active="home" onNavigate={vi.fn()} />,
    );
    expect(unauth.queryByText("Explorar")).toBeNull();

    mockAuth(null, true);
    const loading = await render(
      <ConnectedNavigationBar pathname="/termos" active="home" onNavigate={vi.fn()} />,
    );
    expect(loading.queryByText("Explorar")).toBeNull();

    mockAuth({ id: "ana", name: "Ana", email: "ana@exemplo.com" } as User, false);
    const authed = await render(
      <ConnectedNavigationBar pathname="/" active="home" onNavigate={vi.fn()} />,
    );
    expect(authed.getByText("Explorar")).toBeTruthy();
  });

  it("ConnectedWebHeader não renderiza cabeçalho interno quando não há sessão ou enquanto carrega", async () => {
    mockAuth(null, false);
    const unauth = await render(
      <ConnectedWebHeader pathname="/termos" active="home" onNavigate={vi.fn()} onAnnounce={vi.fn()} />,
    );
    expect(unauth.queryByTestId("web-header")).toBeNull();

    mockAuth(null, true);
    const loading = await render(
      <ConnectedWebHeader pathname="/termos" active="home" onNavigate={vi.fn()} onAnnounce={vi.fn()} />,
    );
    expect(loading.queryByTestId("web-header")).toBeNull();

    mockAuth({ id: "ana", name: "Ana Silva", email: "ana@exemplo.com" } as User, false);
    const authed = await render(
      <ConnectedWebHeader pathname="/" active="home" onNavigate={vi.fn()} onAnnounce={vi.fn()} />,
    );
    expect(authed.getByTestId("web-header")).toBeTruthy();
    expect(authed.getByText("AS")).toBeTruthy();
  });
});

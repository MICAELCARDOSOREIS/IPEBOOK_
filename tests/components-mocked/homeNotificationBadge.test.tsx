import { act, fireEvent, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import type { ProfileState, ProfileActions } from "@/viewmodel/useProfileViewModel";

vi.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: vi.fn() }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNotificationsViewModel", () => ({
  useNotificationsViewModel: vi.fn().mockReturnValue([{ unreadCount: 0 }, { refresh: vi.fn(), reload: vi.fn() }]),
}));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));
vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => false }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import Home from "@/view/home";

const homeState: HomeState = { books: [], loading: false, error: null };
const homeActions: HomeActions = { reload: vi.fn() };
const authState: AuthState = {
  user: { id: "u1", name: "Ana", email: "ana@example.com" } as AuthState["user"],
  loading: false,
  error: null,
};
const authActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() };

describe("Topo da Home — Botão de perfil e sem sino de notificações (Spec 078 / Melhoria UX)", () => {
  beforeEach(() => {
    vi.mocked(useHomeViewModel).mockReturnValue([homeState, homeActions]);
    vi.mocked(useAuthViewModel).mockReturnValue([authState, authActions]);
    vi.mocked(useProfileViewModel).mockReturnValue([
      { profile: { name: "Ana", photoUrl: null } as unknown as ProfileState["profile"], loading: false, saving: false, error: null },
      { reload: vi.fn(), update: vi.fn() },
    ]);
  });

  it("não renderiza mais o botão de notificações na Home (centralizado no Perfil)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });
    expect(screen.queryByRole("button", { name: /Abrir notificações/ })).toBeNull();
  });

  it("renderiza o botão de perfil com acessibilidade adequada e navega ao tocar", async () => {
    const onNavigateToProfile = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home onNavigateToProfile={onNavigateToProfile} />);
    });
    const profileBtn = screen.getByTestId("home-top-profile-button");
    expect(profileBtn).toBeDefined();
    expect(screen.getByRole("button", { name: "Meu perfil, Ana" })).toBeDefined();
    fireEvent.press(profileBtn);
    expect(onNavigateToProfile).toHaveBeenCalledTimes(1);
  });

  it("renderiza o botão flutuante de mensagens quando logado e navega ao tocar", async () => {
    const onNavigateToConversations = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Home
          onNavigateToConversations={onNavigateToConversations}
          conversationsBadgeCount={3}
        />,
      );
    });
    const chatFab = screen.getByTestId("home-floating-chat-button");
    expect(chatFab).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    fireEvent.press(chatFab);
    expect(onNavigateToConversations).toHaveBeenCalledTimes(1);
  });
});

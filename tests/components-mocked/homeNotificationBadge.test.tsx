import { act, fireEvent, render } from "@testing-library/react-native";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { HomeActions, HomeState } from "@/viewmodel/useHomeViewModel";
import type { ProfileState, ProfileActions } from "@/viewmodel/useProfileViewModel";

jest.mock("@/viewmodel/useHomeViewModel", () => ({ useHomeViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNotificationsViewModel", () => ({
  useNotificationsViewModel: jest.fn().mockReturnValue([{ unreadCount: 0 }, { refresh: jest.fn(), reload: jest.fn() }]),
}));
jest.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: jest.fn() }));
jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => false, useHydratedWindowWidth: () => 360 }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import Home from "@/view/home";

const homeState: HomeState = { books: [], loading: false, error: null };
const homeActions: HomeActions = { reload: jest.fn() };
const authState: AuthState = {
  user: { id: "u1", name: "Ana", email: "ana@example.com" } as AuthState["user"],
  loading: false,
  error: null,
};
const authActions: AuthActions = { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() };

describe("Topo da Home — Botão de perfil e sem sino de notificações (Spec 078 / Melhoria UX)", () => {
  beforeEach(() => {
    jest.mocked(useHomeViewModel).mockReturnValue([homeState, homeActions]);
    jest.mocked(useAuthViewModel).mockReturnValue([authState, authActions]);
    jest.mocked(useProfileViewModel).mockReturnValue([
      { profile: { name: "Ana", photoUrl: null } as unknown as ProfileState["profile"], loading: false, saving: false, error: null },
      { reload: jest.fn(), update: jest.fn() },
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
    const onNavigateToProfile = jest.fn();
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

  it("renderiza o botão de conversas no topo quando logado e navega ao tocar", async () => {
    const onNavigateToConversations = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <Home
          onNavigateToConversations={onNavigateToConversations}
          conversationsBadgeCount={3}
        />,
      );
    });
    const chatBtn = screen.getByTestId("home-top-conversations-button");
    expect(chatBtn).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    fireEvent.press(chatBtn);
    expect(onNavigateToConversations).toHaveBeenCalledTimes(1);
  });

  it("renderiza o botão de conversas no topo com badge singular (1), limite (9+) e zerado", async () => {
    const fn = jest.fn();
    let screen1!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen1 = await render(<Home onNavigateToConversations={fn} conversationsBadgeCount={1} />);
    });
    expect(screen1.getByRole("button", { name: "Abrir conversas, 1 nova" })).toBeDefined();
    expect(screen1.getByText("1")).toBeDefined();

    let screen10!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen10 = await render(<Home onNavigateToConversations={fn} conversationsBadgeCount={12} />);
    });
    expect(screen10.getByRole("button", { name: "Abrir conversas, 12 novas" })).toBeDefined();
    expect(screen10.getByText("9+")).toBeDefined();

    let screen0!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen0 = await render(<Home onNavigateToConversations={fn} conversationsBadgeCount={0} />);
    });
    expect(screen0.getByRole("button", { name: "Abrir conversas" })).toBeDefined();
    expect(screen0.queryByTestId("home-top-conversations-badge")).toBeNull();
  });

  it("renderiza o botão flutuante de anunciar livro na Home e navega ao tocar", async () => {
    const onNavigateToCreateListing = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home onNavigateToCreateListing={onNavigateToCreateListing} />);
    });
    const addFab = screen.getByTestId("home-floating-add-button");
    expect(addFab).toBeDefined();
    fireEvent.press(addFab);
    expect(onNavigateToCreateListing).toHaveBeenCalledTimes(1);
  });
});

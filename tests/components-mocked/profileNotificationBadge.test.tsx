import { act, fireEvent, render } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileActions, ProfileState } from "@/viewmodel/useProfileViewModel";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import ProfileHub from "@/view/profile/profileHub";

vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));
vi.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: vi.fn() }));
vi.mock("@/viewmodel/useMyListingsViewModel", () => ({
  useMyListingsViewModel: vi.fn().mockReturnValue([{ books: [] }, { reload: vi.fn() }]),
}));
vi.mock("@/viewmodel/useUserPreferencesViewModel", () => ({
  useUserPreferencesViewModel: vi.fn().mockReturnValue([{ preferences: null }, {}]),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

const authState: AuthState = {
  user: { id: "u1", name: "Ana", email: "ana@example.com" } as AuthState["user"],
  loading: false,
  error: null,
};
const authActions: AuthActions = { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() };

const profileState: ProfileState = {
  profile: {
    userId: "u1",
    name: "Ana",
    photoUrl: null,
    neighborhood: "Centro",
    instagramHandle: null,
    ratingCount: 0,
    averageRating: null,
  } as unknown as ProfileState["profile"],
  loading: false,
  saving: false,
  error: null,
};
const profileActions: ProfileActions = { reload: vi.fn(), update: vi.fn() };

describe("Notificações centralizadas no Perfil (Spec 078 / Melhoria UX)", () => {
  beforeEach(() => {
    vi.mocked(useAuthViewModel).mockReturnValue([authState, authActions]);
    vi.mocked(useProfileViewModel).mockReturnValue([profileState, profileActions]);
    vi.mocked(useNotificationsViewModel).mockReturnValue([
      { unreadCount: 3 } as NotificationsState,
      { refresh: vi.fn(), reload: vi.fn() } as unknown as NotificationsActions,
    ]);
  });

  it("renderiza botão de notificações no topo do perfil com badge numérico e navega ao tocar", async () => {
    const onNavigateToNotifications = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub
          onNavigateToNotifications={onNavigateToNotifications}
          onNavigateToEditProfile={vi.fn()}
          onNavigateToRatings={vi.fn()}
          onNavigateToSecurity={vi.fn()}
          onSignedOut={vi.fn()}
        />,
      );
    });

    const notifBtn = screen.getByTestId("profile-notifications-button");
    expect(notifBtn).toBeDefined();
    const badge = screen.getByTestId("profile-notifications-badge");
    expect(badge).toBeDefined();
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);

    fireEvent.press(notifBtn);
    expect(onNavigateToNotifications).toHaveBeenCalledTimes(1);
  });

  it("permite passar contador manual para teste determinístico", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub
          unreadNotificationsCount={5}
          onNavigateToNotifications={vi.fn()}
          onNavigateToEditProfile={vi.fn()}
          onNavigateToRatings={vi.fn()}
          onNavigateToSecurity={vi.fn()}
          onSignedOut={vi.fn()}
        />,
      );
    });

    const badge = screen.getByTestId("profile-notifications-badge");
    expect(badge).toBeDefined();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
  });
});

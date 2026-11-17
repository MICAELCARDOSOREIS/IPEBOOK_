import { act, fireEvent, render } from "@testing-library/react-native";
import type { AuthActions, AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileActions, ProfileState } from "@/viewmodel/useProfileViewModel";
import type { NotificationsActions, NotificationsState } from "@/viewmodel/useNotificationsViewModel";
import ProfileHub from "@/view/profile/profileHub";

jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: jest.fn() }));
jest.mock("@/viewmodel/useNotificationsViewModel", () => ({ useNotificationsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useMyListingsViewModel", () => ({
  useMyListingsViewModel: jest.fn().mockReturnValue([{ books: [] }, { reload: jest.fn() }]),
}));
jest.mock("@/viewmodel/useUserPreferencesViewModel", () => ({
  useUserPreferencesViewModel: jest.fn().mockReturnValue([{ preferences: null }, {}]),
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useNotificationsViewModel } from "@/viewmodel/useNotificationsViewModel";

const authState: AuthState = {
  user: { id: "u1", name: "Ana", email: "ana@example.com" } as AuthState["user"],
  loading: false,
  error: null,
};
const authActions: AuthActions = { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() };

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
const profileActions: ProfileActions = { reload: jest.fn(), update: jest.fn() };

describe("Notificações centralizadas no Perfil (Spec 078 / Melhoria UX)", () => {
  beforeEach(() => {
    jest.mocked(useAuthViewModel).mockReturnValue([authState, authActions]);
    jest.mocked(useProfileViewModel).mockReturnValue([profileState, profileActions]);
    jest.mocked(useNotificationsViewModel).mockReturnValue([
      { unreadCount: 3 } as NotificationsState,
      { refresh: jest.fn(), reload: jest.fn() } as unknown as NotificationsActions,
    ]);
  });

  it("renderiza botão de notificações no topo do perfil com badge numérico e navega ao tocar", async () => {
    const onNavigateToNotifications = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub
          onNavigateToNotifications={onNavigateToNotifications}
          onNavigateToEditProfile={jest.fn()}
          onNavigateToRatings={jest.fn()}
          onNavigateToSecurity={jest.fn()}
          onSignedOut={jest.fn()}
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
          onNavigateToNotifications={jest.fn()}
          onNavigateToEditProfile={jest.fn()}
          onNavigateToRatings={jest.fn()}
          onNavigateToSecurity={jest.fn()}
          onSignedOut={jest.fn()}
        />,
      );
    });

    const badge = screen.getByTestId("profile-notifications-badge");
    expect(badge).toBeDefined();
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(1);
  });
});

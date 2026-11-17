
import { act, render } from "@testing-library/react-native";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileState } from "@/viewmodel/useProfileViewModel";

jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: jest.fn() }));
jest.mock("@/viewmodel/useMyListingsViewModel", () => ({ useMyListingsViewModel: () => [{ books: [] }, {}] }));
jest.mock("@/viewmodel/useUserPreferencesViewModel", () => ({
  useUserPreferencesViewModel: () => [{ preferences: { userId: "ana", neighborhood: "Centro" }, loading: false }, {}],
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import ProfileHub from "@/view/profile/profileHub";

const mockedUseAuthViewModel = jest.mocked(useAuthViewModel);
const mockedUseProfileViewModel = jest.mocked(useProfileViewModel);

const fakeProfile: NonNullable<ProfileState["profile"]> = {
  userId: "ana",
  name: "Ana Paula",
  joinedAt: "2026-01-01T00:00:00.000Z",
  averageRating: 4.8,
  ratingCount: 5,
  completedNegotiations: 3,
  photoUrl: undefined,
  socialHandle: "anapaula",
};

describe("Meu perfil na Web Larga (Spec 093, Spec 122 · Figma 07.01)", () => {
  it("renderiza o grid de duas colunas com identidade e selos à esquerda, e seções Atividade e Conta lado a lado", async () => {
    mockedUseAuthViewModel.mockReturnValue([
      { user: { id: "ana", email: "ana@exemplo.com" } as AuthState["user"], loading: false, error: null },
      { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() },
    ]);
    mockedUseProfileViewModel.mockReturnValue([
      { profile: fakeProfile, loading: false, saving: false, error: null },
      { update: jest.fn().mockResolvedValue(true), reload: jest.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub
          onNavigateToEditProfile={jest.fn()}
          onNavigateToRatings={jest.fn()}
          onNavigateToNotifications={jest.fn()}
          onNavigateToSecurity={jest.fn()}
          onSignedOut={jest.fn()}
          onNavigateToCreateListing={jest.fn()}
        />
      );
    });

    // 1. Grid em duas colunas presente
    expect(screen.getByTestId("profile-wide-grid")).toBeDefined();

    // 2. Coluna lateral com leitor
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("@anapaula")).toBeDefined();
    expect(screen.queryByTestId("profile-badges-section")).toBeNull();

    // 3. Coluna principal com Atividade e Conta
    expect(screen.getByText("Atividade")).toBeDefined();
    expect(screen.getByText("Conta")).toBeDefined();
    expect(screen.getByLabelText("Minhas publicações")).toBeDefined();
    expect(screen.getByLabelText("Avaliações recebidas")).toBeDefined();
    expect(screen.getByLabelText("Notificações")).toBeDefined();
    expect(screen.getByLabelText("Segurança e verificação")).toBeDefined();
    expect(screen.getByLabelText("Sair da conta")).toBeDefined();
  });
});

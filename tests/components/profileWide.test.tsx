
import { act, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import type { AuthState } from "@/viewmodel/useAuthViewModel";
import type { ProfileState } from "@/viewmodel/useProfileViewModel";

vi.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, WIDE_WEB_MIN_WIDTH: 960 }));
vi.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: vi.fn() }));
vi.mock("@/viewmodel/useProfileViewModel", () => ({ useProfileViewModel: vi.fn() }));
vi.mock("@/viewmodel/useMyListingsViewModel", () => ({ useMyListingsViewModel: () => [{ books: [] }, {}] }));
vi.mock("@/viewmodel/useUserPreferencesViewModel", () => ({
  useUserPreferencesViewModel: () => [{ preferences: { userId: "ana", neighborhood: "Centro" }, loading: false }, {}],
}));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import ProfileHub from "@/view/profile/profileHub";

const mockedUseAuthViewModel = vi.mocked(useAuthViewModel);
const mockedUseProfileViewModel = vi.mocked(useProfileViewModel);

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
      { signUp: vi.fn(), signIn: vi.fn(), signOut: vi.fn(), requestPasswordReset: vi.fn() },
    ]);
    mockedUseProfileViewModel.mockReturnValue([
      { profile: fakeProfile, loading: false, saving: false, error: null },
      { update: vi.fn().mockResolvedValue(true), reload: vi.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ProfileHub
          onNavigateToEditProfile={vi.fn()}
          onNavigateToRatings={vi.fn()}
          onNavigateToNotifications={vi.fn()}
          onNavigateToSecurity={vi.fn()}
          onSignedOut={vi.fn()}
          onNavigateToCreateListing={vi.fn()}
        />
      );
    });

    // 1. Grid em duas colunas presente
    expect(screen.getByTestId("profile-wide-grid")).toBeDefined();

    // 2. Coluna lateral com leitor e selos comunitários
    expect(screen.getByText("Ana Paula")).toBeDefined();
    expect(screen.getByText("@anapaula")).toBeDefined();
    expect(screen.getByTestId("profile-badges-section")).toBeDefined();
    expect(screen.getByText("Selos Comunitários de Piripiri")).toBeDefined();
    expect(screen.getByText("Leitor de Piripiri")).toBeDefined();
    expect(screen.getByText("Ponto Seguro")).toBeDefined();
    expect(screen.getByText("Estante Ativa")).toBeDefined();

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

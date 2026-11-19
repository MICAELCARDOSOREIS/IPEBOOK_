import { fireEvent, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { Platform, View } from "react-native";
import { MemoryNetworkStatusDataSource } from "@/infra/datasources/memoryNetworkStatusDataSource";
import { ErrorState } from "@/view/components/ErrorState";
import { OfflineState } from "@/view/components/OfflineState";
import { ProfileIdentityCard, ProfileMenuSection } from "@/view/profile/ProfileHubSections";
import { Settings } from "@/view/profile/settings";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useNotificationPreferencesViewModel } from "@/viewmodel/useNotificationPreferencesViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";

jest.mock("@/viewmodel/useSettingsViewModel", () => ({ useSettingsViewModel: jest.fn() }));
jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/viewmodel/usePublicProfileViewModel", () => ({
  usePublicProfileViewModel: () => [{ profile: { userId: "ana", name: "Ana Paula", joinedAt: "2026-01-10T00:00:00.000Z" }, loading: false, error: null }, { reload: jest.fn() }],
}));
jest.mock("@/viewmodel/useNotificationPreferencesViewModel", () => ({
  useNotificationPreferencesViewModel: jest.fn(),
  NOTIFICATION_PREFERENCE_CATEGORIES: {
    proposals: { label: "Propostas e mensagens", description: "Alguém tem interesse num livro seu ou responde a um pedido", types: ["request_received", "request_accepted"] },
  },
}));

describe("Perfil, Configurações e Estados iOS 26 (Spec 137 · #232)", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    jest.mocked(useSettingsViewModel).mockReturnValue([
      { clearingCache: false, cacheCleared: false, cacheError: null, clearingHistory: false, historyCleared: false, historyError: null },
      { clearBooksCache: jest.fn().mockResolvedValue(undefined), clearSearchHistory: jest.fn().mockResolvedValue(undefined) },
    ]);
    jest.mocked(useAuthViewModel).mockReturnValue([
      { user: { id: "ana", email: "ana@exemplo.com" }, loading: false, error: null },
      { signUp: jest.fn(), signIn: jest.fn(), signOut: jest.fn(), requestPasswordReset: jest.fn() },
    ]);
    jest.mocked(useNotificationPreferencesViewModel).mockReturnValue([
      { enabled: { proposals: true, meetings: true, searchAlerts: true, system: true }, saving: false, error: null },
      { setEnabled: jest.fn().mockResolvedValue(undefined) },
    ]);
  });

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.clearAllMocks();
  });

  it("aplica feedback háptico em Meu perfil no iOS ao acionar Editar perfil e item de menu", async () => {
    const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const onEditProfile = jest.fn();
    const onMenu = jest.fn();

    const view = await render(
      <View>
        <ProfileIdentityCard
          name="Ana Paula"
          instagramHandle={null}
          totalPublications={2}
          completedTrocas={1}
          ratingText="5.0"
          onEditProfile={onEditProfile}
          onMyListings={jest.fn()}
          onMeetingHistory={jest.fn()}
          onRatings={jest.fn()}
        />
        <ProfileMenuSection
          title="Atividade"
          items={[{ key: "listings", icon: "shelf", label: "Minhas publicações", onPress: onMenu, showChevron: true }]}
        />
      </View>,
    );

    await fireEvent.press(view.getByLabelText("Editar perfil"));
    await fireEvent.press(view.getByLabelText("Minhas publicações"));
    expect(onEditProfile).toHaveBeenCalledTimes(1);
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(impactSpy).toHaveBeenCalledTimes(2);
    impactSpy.mockRestore();
  });

  it("aplica feedback de seleção em Configurações ao expandir seção no iOS", async () => {
    const selectionSpy = jest.spyOn(Haptics, "selectionAsync").mockResolvedValue();
    const view = await render(<Settings onBack={jest.fn()} onNavigateToEditProfile={jest.fn()} />);

    await fireEvent.press(view.getByLabelText("Preferências"));
    expect(selectionSpy).toHaveBeenCalledTimes(1);
    selectionSpy.mockRestore();
  });

  it("usa superfície Liquid Glass e haptic no retry de OfflineState e ErrorState no iOS", async () => {
    const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const onRetryOffline = jest.fn();
    const onRetryError = jest.fn();
    const networkDataSource = new MemoryNetworkStatusDataSource(false);

    const offline = await render(<OfflineState onRetry={onRetryOffline} networkDataSource={networkDataSource} />);
    expect(offline.getByTestId("ios-card-blur")).toBeDefined();
    await fireEvent.press(offline.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetryOffline).toHaveBeenCalledTimes(1);

    const error = await render(<ErrorState message="Falha ao carregar." onRetry={onRetryError} />);
    expect(error.getByTestId("ios-card-blur")).toBeDefined();
    await fireEvent.press(error.getByRole("button", { name: "Tentar novamente" }));
    expect(onRetryError).toHaveBeenCalledTimes(1);
    expect(impactSpy).toHaveBeenCalledTimes(2);
    impactSpy.mockRestore();
  });
});

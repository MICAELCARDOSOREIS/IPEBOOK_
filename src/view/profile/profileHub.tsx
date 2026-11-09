import { useMemo, useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import {
  makeAuthViewModel,
  makeMyListingsViewModel,
  makeNotificationsViewModel,
  makeProfileViewModel,
  makeUserPreferencesViewModel,
} from "@/di/container";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { AppIcon } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ErrorState } from "@/view/components/ErrorState";
import { FilledButton } from "@/view/components/FilledButton";
import { LoadingState } from "@/view/components/LoadingState";
import {
  ProfileCommunityBadges,
  ProfileIdentityCard,
  ProfileMenuSection,
  type ProfileMenuItem,
} from "@/view/profile/ProfileHubSections";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_GUTTER } from "@/view/webLayout";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

export type ProfileHubProps = {
  requireAuth?: boolean;
  onBack?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToCreateListing?: () => void;
  onNavigateToMyListings?: () => void;
  onNavigateToRatings: () => void;
  onNavigateToMeetingHistory?: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToInviteFriends?: () => void;
  onNavigateToSettings?: () => void;
  onSignedOut: () => void;
  /** Contador manual de notificações não lidas (útil para testes determinísticos). */
  unreadNotificationsCount?: number;
};

/**
 * Meu perfil organiza identidade social, métricas comunitárias e os atalhos próprios do IpêBook.
 */
export default function ProfileHub({
  requireAuth = true,
  onBack,
  onNavigateToSignIn,
  onNavigateToEditProfile,
  onNavigateToCreateListing,
  onNavigateToMyListings,
  onNavigateToRatings,
  onNavigateToMeetingHistory,
  onNavigateToFavorites,
  onNavigateToNotifications,
  onNavigateToSecurity,
  onNavigateToInviteFriends,
  onNavigateToSettings,
  onSignedOut,
  unreadNotificationsCount: explicitUnreadCount,
}: ProfileHubProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = makeAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state, profileActions] = makeProfileViewModel(userId);
  const [notificationsState] = makeNotificationsViewModel(userId);
  const unreadNotificationsCount = explicitUnreadCount ?? notificationsState.unreadCount;
  const [myListingsState] = makeMyListingsViewModel(userId);
  const [preferencesState] = makeUserPreferencesViewModel(userId);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const wideWeb = useIsWideWeb();

  const guardedBack = useGuardedPress(onBack);
  const guardedNavigateToSignIn = useGuardedPress(onNavigateToSignIn);
  const guardedNavigateToEditProfile = useGuardedPress(onNavigateToEditProfile);
  const guardedNavigateToCreateListing = useGuardedPress(onNavigateToCreateListing);
  const guardedNavigateToMyListings = useGuardedPress(onNavigateToMyListings);
  const guardedNavigateToRatings = useGuardedPress(onNavigateToRatings);
  const guardedNavigateToMeetingHistory = useGuardedPress(onNavigateToMeetingHistory);
  const guardedNavigateToFavorites = useGuardedPress(onNavigateToFavorites);
  const guardedNavigateToNotifications = useGuardedPress(onNavigateToNotifications);
  const guardedNavigateToSecurity = useGuardedPress(onNavigateToSecurity);
  const guardedNavigateToInviteFriends = useGuardedPress(onNavigateToInviteFriends);
  const guardedNavigateToSettings = useGuardedPress(onNavigateToSettings);

  useEffect(() => {
    if (requireAuth && !authState.loading && !userId) {
      onNavigateToSignIn?.();
    }
  }, [requireAuth, authState.loading, userId, onNavigateToSignIn]);

  // Se requer autenticação e não há usuário, aguarda redirecionamento
  if (requireAuth && (authState.loading || !userId)) return null;

  // Logado usa os dados reais; sem conta a tela exibe o estado de convidado (sem dados inventados)
  const isSignedIn = !!userId;
  const profile = {
    userId: state.profile?.userId ?? "",
    name: state.profile?.name ?? "Você",
    socialHandle: state.profile?.socialHandle,
    // Bairro real da pessoa, quando ela escolheu um; sem isso o cartão mostra só a cidade.
    neighborhood: preferencesState.preferences?.neighborhood,
    averageRating: state.profile?.averageRating ?? 0,
    ratingCount: state.profile?.ratingCount ?? 0,
    completedNegotiations: state.profile?.completedNegotiations ?? 0,
    photoUrl: state.profile?.photoUrl,
    joinedAt: state.profile?.joinedAt,
  };

  const activeBooks = myListingsState.books.filter((b) => b.status === "available").length;
  const reservedBooks = myListingsState.books.filter((b) => b.status === "reserved").length;
  const totalPublications = myListingsState.books.length;
  // Só oferece o link quando o valor gravado respeita o padrão do Instagram (regra do domínio).
  const instagramHandle = normalizeInstagramHandle(profile.socialHandle)?.slice(1) ?? null;
  const completedTrocas = profile.completedNegotiations;
  const ratingText = profile.ratingCount > 0 ? (profile.averageRating ?? 0).toFixed(1) : "—";

  async function handleConfirmSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      const ok = await authActions.signOut();
      if (!ok) {
        setSignOutError("Não foi possível sair da conta. Tente novamente.");
        return;
      }
      setConfirmingSignOut(false);
      onSignedOut();
    } finally {
      setSigningOut(false);
    }
  }

  // Itens da seção "Atividade" (Figma 07.01 nós 25:627, 25:638)
  const activityItems: ProfileMenuItem[] = [
    {
      key: "my-listings",
      icon: "shelf",
      iconColor: colors.text,
      label: "Minhas publicações",
      description: `${activeBooks} ativas · ${reservedBooks} reservada${reservedBooks !== 1 ? "s" : ""}`,
      onPress: guardedNavigateToMyListings,
      showChevron: true,
    },
    {
      key: "ratings",
      icon: "star",
      iconColor: colors.text,
      label: "Avaliações recebidas",
      description:
        profile.ratingCount > 0
          ? `★ ${ratingText} em ${completedTrocas} trocas`
          : "Veja o que a comunidade disse sobre você",
      onPress: guardedNavigateToRatings,
      showChevron: true,
    },
    {
      key: "meetings",
      icon: "calendar",
      iconColor: colors.text,
      label: "Histórico de encontros",
      description: "Encontros nos pontos seguros de Piripiri",
      onPress: guardedNavigateToMeetingHistory,
      showChevron: true,
    },
    {
      key: "favorites",
      icon: "heart",
      iconColor: colors.text,
      label: "Favoritos e alertas",
      description: "Livros salvos e alertas de busca",
      onPress: guardedNavigateToFavorites,
      showChevron: true,
    },
  ];

  // Seção "Conta" enxuta (ADR 0060): o que é preferência do aplicativo mora em Configurações
  const accountItems: ProfileMenuItem[] = [
    {
      key: "notifications",
      icon: "bell",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Notificações",
      description: "Alertas de pedidos, mensagens e buscas",
      badgeCount: unreadNotificationsCount,
      onPress: guardedNavigateToNotifications,
      showChevron: true,
    },
    {
      key: "security",
      icon: "lock",
      iconColor: colors.text,
      label: "Segurança e verificação",
      description: "Alterar senha da conta",
      onPress: guardedNavigateToSecurity,
      showChevron: true,
    },
    {
      key: "invite",
      icon: "share",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Convidar amigos",
      description: "Divulgue o IpêBook e ajude a comunidade a crescer",
      onPress: guardedNavigateToInviteFriends,
      showChevron: true,
    },
  ];

  function openSignOutDialog() {
    setSignOutError(null);
    setConfirmingSignOut(true);
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <ScrollView
        {...standardVerticalScrollProps}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: wideWeb ? tokens.spacing[32] : 160 },
        ]}
      >
        <View style={[styles.content, wideWeb && styles.contentWide]}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321: Source Serif 4 Bold 34px, #58331F)
              com entrada de Configurações no topo (ADR 0060), liberada também para visitante */}
          <View style={[styles.headerRow, wideWeb && styles.fullRow]}>
            {!wideWeb && onBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={8}
                onPress={guardedBack}
                style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
              >
                <AppIcon name="back" size={24} color={colors.m3.onSurface} />
              </Pressable>
            ) : null}
            <Text accessibilityRole="header" style={styles.title}>
              Meu perfil
            </Text>
            <View style={styles.headerActions}>
              <Pressable
                testID="profile-notifications-button"
                accessibilityRole="button"
                accessibilityLabel={
                  unreadNotificationsCount > 0
                    ? `Abrir notificações, ${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? "não lida" : "não lidas"}`
                    : "Abrir notificações"
                }
                hitSlop={8}
                onPress={guardedNavigateToNotifications}
                style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
              >
                <AppIcon name="bell" size={24} color={colors.m3.onSurfaceVariant} />
                {unreadNotificationsCount > 0 ? (
                  <View style={styles.notificationBadge} testID="profile-notifications-badge">
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir configurações"
                hitSlop={8}
                onPress={guardedNavigateToSettings}
                style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
              >
                <AppIcon name="settings" size={24} color={colors.m3.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          {state.loading && !state.profile && isSignedIn ? (
            <LoadingState label="Carregando perfil" variant="profile" />
          ) : isSignedIn && state.error && !state.profile ? (
            <ErrorState message={state.error} onRetry={profileActions.reload} />
          ) : isSignedIn ? (
            wideWeb ? (
              <View style={styles.wideGrid} testID="profile-wide-grid">
                <View style={styles.wideSideCol}>
                  <ProfileIdentityCard
                    name={profile.name}
                    photoUrl={profile.photoUrl}
                    neighborhood={profile.neighborhood}
                    instagramHandle={instagramHandle}
                    totalPublications={totalPublications}
                    completedTrocas={completedTrocas}
                    ratingText={ratingText}
                    wideWeb
                    onEditProfile={guardedNavigateToEditProfile}
                    onCreateListing={onNavigateToCreateListing ? guardedNavigateToCreateListing : undefined}
                    onMyListings={guardedNavigateToMyListings}
                    onMeetingHistory={guardedNavigateToMeetingHistory}
                    onRatings={guardedNavigateToRatings}
                  />
                  <ProfileCommunityBadges
                    neighborhood={profile.neighborhood}
                    completedTrocas={completedTrocas}
                    totalPublications={totalPublications}
                    wideWeb
                  />
                </View>

                {/* Coluna Principal da Web Larga: Atividade e Conta lado a lado */}
                <View style={styles.wideMainCol}>
                  <View style={styles.wideSectionsRow}>
                    <ProfileMenuSection title="Atividade" items={activityItems} wideWeb />
                    <ProfileMenuSection
                      title="Conta"
                      items={accountItems}
                      wideWeb
                      defaultIconColor={colors.m3.onSurfaceVariant}
                      onSignOut={openSignOutDialog}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <>
                <ProfileIdentityCard
                  name={profile.name}
                  photoUrl={profile.photoUrl}
                  neighborhood={profile.neighborhood}
                  instagramHandle={instagramHandle}
                  totalPublications={totalPublications}
                  completedTrocas={completedTrocas}
                  ratingText={ratingText}
                  onEditProfile={guardedNavigateToEditProfile}
                  onCreateListing={onNavigateToCreateListing ? guardedNavigateToCreateListing : undefined}
                  onMyListings={guardedNavigateToMyListings}
                  onMeetingHistory={guardedNavigateToMeetingHistory}
                  onRatings={guardedNavigateToRatings}
                />
                <ProfileCommunityBadges
                  neighborhood={profile.neighborhood}
                  completedTrocas={completedTrocas}
                  totalPublications={totalPublications}
                />
                <ProfileMenuSection title="Atividade" items={activityItems} />
                <ProfileMenuSection
                  title="Conta"
                  items={accountItems}
                  defaultIconColor={colors.m3.onSurfaceVariant}
                  onSignOut={openSignOutDialog}
                />
              </>
            )
          ) : (
            /* Estado de convidado: sem conta não há identidade nem atividade a exibir */
            <View style={[styles.guestCard, wideWeb && styles.fullRow]}>
              <Text style={styles.guestTitle}>Você ainda não entrou</Text>
              <Text style={styles.guestText}>
                Crie uma conta grátis para publicar livros, favoritar buscas e negociar trocas em Piripiri.
              </Text>
              <FilledButton
                label="Entrar ou criar conta"
                onPress={guardedNavigateToSignIn}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <Dialog
        visible={confirmingSignOut}
        title="Sair da conta?"
        message={signOutError ?? "Você precisará entrar novamente para acessar seus anúncios e negociações."}
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        destructive
        loading={signingOut}
        onConfirm={() => void handleConfirmSignOut()}
        onCancel={() => {
          setConfirmingSignOut(false);
          setSignOutError(null);
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
    // Web larga (Figma `07.01`): cartão e métricas em coluna lateral, "Atividade" e "Conta" lado a lado.
    contentWide: {
      maxWidth: 1240,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[32],
      gap: tokens.spacing[24],
    },
    fullRow: { width: "100%" },
    wideGrid: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[32],
      width: "100%",
    },
    wideSideCol: {
      width: 380,
      gap: tokens.spacing[20],
    },
    wideMainCol: {
      flex: 1,
      minWidth: 480,
    },
    wideSectionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[24],
      alignItems: "flex-start",
      width: "100%",
    },
    content: {
      width: "100%",
      paddingHorizontal: tokens.spacing[24],
      paddingTop: tokens.spacing[12],
      gap: tokens.spacing[16],
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    title: {
      flex: 1,
      ...tokens.typography.brandTitle,
      color: colors.brandBrown,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
    },
    notificationBadge: {
      position: "absolute",
      top: 4,
      right: 4,
      minWidth: 18,
      height: 18,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[4],
    },
    notificationBadgeText: {
      ...tokens.typography.badgeMicro,
      color: colors.badge.completed.text,
      fontWeight: "700",
    },
    // Alvo de toque de 48 dp ao redor da engrenagem (FR-011, Spec 073).
    settingsButton: {
      minWidth: tokens.accessibility.touchTarget,
      minHeight: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.buttonRest,
      alignItems: "center",
      justifyContent: "center",
    },
    settingsButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.92 }],
    },
    status: { alignItems: "center", paddingVertical: tokens.spacing[32] },
    guestCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    guestTitle: {
      ...tokens.typography.brandCardTitle,
      color: colors.text,
    },
    guestText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
  });
}

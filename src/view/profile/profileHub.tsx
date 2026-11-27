import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollEdgeScreen, ScrollEdgeScrollView } from "@/view/components/ScrollEdgeScreen";
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
import { IosGlassBackdrop, useOpaqueIosSurfaces } from "@/view/components/IosGlassBackdrop";
import { LoadingState } from "@/view/components/LoadingState";
import { TopAppBarBackButton } from "@/view/components/TopAppBar";
import {
  ProfileIdentityCard,
  type ProfileMenuItem,
  ProfileMenuSection,
} from "@/view/profile/ProfileHubSections";
import { scrollBottomPadding, standardVerticalScrollProps } from "@/view/scrollProps";
import { useTheme } from "@/view/theme/ThemeProvider";
import { type ColorPalette, tokens } from "@/view/tokens";
import { useGuardedPress } from "@/view/useGuardedPress";
import { useHydratedWindowWidth, useIsWideWeb } from "@/view/useIsWideWeb";
import { useOnRefocus } from "@/view/useRefocusKey";
import { WEB_GUTTER, WEB_MAX_WIDTH } from "@/view/webLayout";

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
  focusKey?: number;
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
  focusKey,
}: ProfileHubProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === "ios";
  const opaqueIos = useOpaqueIosSurfaces();
  const iosGlass = isIos && !opaqueIos;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = makeAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state, profileActions] = makeProfileViewModel(userId);
  const [notificationsState, notificationsActions] = makeNotificationsViewModel(userId);
  const unreadNotificationsCount = explicitUnreadCount ?? notificationsState.unreadCount;
  const [myListingsState, myListingsActions] = makeMyListingsViewModel(userId);
  useOnRefocus(focusKey, () => {
    profileActions.reload();
    void notificationsActions.refresh();
    void myListingsActions.reload();
  });
  const [preferencesState] = makeUserPreferencesViewModel(userId);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const wideWeb = useIsWideWeb();
  // Abaixo disso as duas colunas (380 + 480 px) não cabem na área útil e a página rola na horizontal.
  const stackColumns = useHydratedWindowWidth() < 1100;

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
      description: `${activeBooks} ativa${activeBooks !== 1 ? "s" : ""} · ${reservedBooks} reservada${reservedBooks !== 1 ? "s" : ""}`,
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
          ? `★ ${ratingText} em ${completedTrocas} troca${completedTrocas !== 1 ? "s" : ""}`
          : "Veja o que a comunidade disse sobre você",
      onPress: guardedNavigateToRatings,
      showChevron: true,
    },
    {
      key: "meetings",
      icon: "calendar",
      iconColor: colors.text,
      label: "Histórico de encontros",
      description: "Encontros nos pontos recomendados de Piripiri",
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
    <ScrollEdgeScreen edges={["top", "left", "right"]} style={styles.page} header={null}>
      <ScrollEdgeScrollView
        {...standardVerticalScrollProps}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: wideWeb ? tokens.spacing[32] : scrollBottomPadding.withoutBottomBar + insets.bottom },
        ]}
      >
        <View style={[styles.content, wideWeb && styles.contentWide]}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321: Source Serif 4 Bold 34px, #58331F)
              com entrada de Configurações no topo (ADR 0060), liberada também para visitante */}
          <View style={[styles.headerRow, wideWeb && styles.fullRow]}>
            {!wideWeb && onBack ? <TopAppBarBackButton onBack={guardedBack} /> : null}
            <View style={styles.headerTitleGroup}>
              <Text accessibilityRole="header" style={[styles.title, wideWeb && styles.titleWide]}>
                Meu perfil
              </Text>
              {wideWeb && isSignedIn ? (
                <Text style={styles.subtitle}>
                  Gerencie sua identidade, acompanhe suas trocas e ajuste sua conta em Piripiri.
                </Text>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              {wideWeb ? null : (
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
                style={({ pressed }) => [
                  styles.settingsButton,
                  isIos && (iosGlass ? styles.iosIconGlass : styles.iosIconOpaque),
                  pressed && (isIos && iosGlass ? styles.iosIconPressed : styles.settingsButtonPressed),
                ]}
              >
                {iosGlass ? <IosGlassBackdrop isInteractive style={styles.iosGlassIconShape} /> : null}
                <AppIcon name="bell" size={isIos ? 20 : 24} color={isIos ? colors.m3.primary : colors.m3.onSurfaceVariant} />
                {unreadNotificationsCount > 0 ? (
                  <View style={styles.notificationBadge} testID="profile-notifications-badge">
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Abrir configurações"
                hitSlop={8}
                onPress={guardedNavigateToSettings}
                style={({ pressed }) => [
                  styles.settingsButton,
                  !wideWeb && isIos && (iosGlass ? styles.iosIconGlass : styles.iosIconOpaque),
                  wideWeb && styles.settingsButtonWide,
                  pressed && (!wideWeb && isIos && iosGlass ? styles.iosIconPressed : styles.settingsButtonPressed),
                ]}
              >
                {!wideWeb && iosGlass ? <IosGlassBackdrop isInteractive style={styles.iosGlassIconShape} /> : null}
                <AppIcon name="settings" size={!wideWeb && isIos ? 20 : 24} color={!wideWeb && isIos ? colors.m3.primary : colors.m3.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          {state.loading && !state.profile && isSignedIn ? (
            <LoadingState label="Carregando perfil" variant="profile" />
          ) : isSignedIn && state.error && !state.profile ? (
            <ErrorState message={state.error} onRetry={profileActions.reload} />
          ) : isSignedIn ? (
            wideWeb ? (
              <View style={[styles.widePage, stackColumns && styles.wideGridStacked]} testID="profile-wide-grid">
                <View style={[styles.wideIdentity, stackColumns && styles.wideIdentityStacked]}>
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
                    onMyListings={guardedNavigateToMyListings}
                    onMeetingHistory={guardedNavigateToMeetingHistory}
                    onRatings={guardedNavigateToRatings}
                  />
                </View>
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
            <View style={[styles.guestCard, isIos && (iosGlass ? styles.iosGlassGuestCard : styles.iosOpaqueGuestCard), wideWeb && styles.fullRow]}>
              {iosGlass ? <IosGlassBackdrop style={styles.iosGlassGuestShape} /> : null}
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
      </ScrollEdgeScrollView>

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
    </ScrollEdgeScreen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, minHeight: 0, backgroundColor: colors.background },
    scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
    // Web larga (Figma `07.01`): cartão e métricas em coluna lateral, "Atividade" e "Conta" lado a lado.
    contentWide: {
      maxWidth: WEB_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      paddingTop: tokens.spacing[32],
      gap: tokens.spacing[24],
    },
    fullRow: { width: "100%" },
    widePage: {
      width: "100%",
      flexDirection: "row",
      alignItems: "stretch",
      gap: tokens.spacing[24],
    },
    wideIdentity: {
      width: 390,
      flexShrink: 0,
    },
    wideIdentityStacked: {
      width: "100%",
    },
    wideGridStacked: { flexDirection: "column" },
    wideSectionsRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: tokens.spacing[24],
      alignItems: "stretch",
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
    headerTitleGroup: {
      flex: 1,
      minWidth: 0,
      gap: tokens.spacing[4],
    },
    title: {
      ...tokens.typography.brandTitle,
      color: colors.brandBrown,
    },
    titleWide: {
      ...tokens.typography.brandLargeTitle,
    },
    subtitle: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
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
      color: colors.surface,
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
    settingsButtonWide: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.book.paperEdge,
    },
    iosIconGlass: {
      minWidth: 44,
      minHeight: 44,
      width: 44,
      height: 44,
      borderRadius: tokens.radius.full,
      backgroundColor: "transparent",
      borderCurve: "continuous",
      shadowColor: colors.m3.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    iosIconOpaque: {
      minWidth: 44,
      minHeight: 44,
      width: 44,
      height: 44,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderCurve: "continuous",
    },
    iosIconPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.94 }],
    },
    iosGlassIconShape: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.full,
      overflow: "hidden",
    },
    settingsButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.92 }],
    },
    status: { alignItems: "center", paddingVertical: tokens.spacing[32] },
    guestCard: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: tokens.radius.xl,
      padding: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    iosGlassGuestCard: {
      borderRadius: tokens.radius.xxl,
      borderCurve: "continuous",
      backgroundColor: "transparent",
    },
    iosOpaqueGuestCard: {
      borderRadius: tokens.radius.xxl,
      borderCurve: "continuous",
      backgroundColor: colors.m3.surfaceContainer,
      borderWidth: 1,
      borderColor: tokens.ios.separator,
    },
    iosGlassGuestShape: {
      ...StyleSheet.absoluteFill,
      borderRadius: tokens.radius.xxl,
      overflow: "hidden",
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

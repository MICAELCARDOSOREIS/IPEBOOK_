import * as Linking from "expo-linking";
import { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";
import { normalizeInstagramHandle } from "@/model/validators/instagramValidator";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { FilledButton } from "@/view/components/FilledButton";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_MAX_WIDTH, WEB_GUTTER } from "@/view/webLayout";

export type ProfileHubProps = {
  requireAuth?: boolean;
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
};

type MenuItem = {
  key: string;
  icon: AppIconName;
  iconColor?: string;
  label: string;
  description?: string;
  onPress: () => void;
  showChevron?: boolean;
};

/**
 * Meu perfil organiza identidade social, métricas comunitárias e os atalhos próprios do IpêBook.
 */
export default function ProfileHub({
  requireAuth = true,
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
}: ProfileHubProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = useAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state] = useProfileViewModel(userId);
  const [myListingsState] = useMyListingsViewModel(userId);
  const [preferencesState] = useUserPreferencesViewModel(userId);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wideWeb = useIsWideWeb();

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
    await authActions.signOut();
    setSigningOut(false);
    setConfirmingSignOut(false);
    onSignedOut();
  }

  // Itens da seção "Atividade" (Figma 07.01 nós 25:627, 25:638)
  const activityItems: MenuItem[] = [
    {
      key: "my-listings",
      icon: "shelf",
      iconColor: colors.text,
      label: "Minhas publicações",
      description: `${activeBooks} ativas · ${reservedBooks} reservada${reservedBooks !== 1 ? "s" : ""}`,
      onPress: onNavigateToMyListings ?? (() => {}),
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
      onPress: onNavigateToRatings,
      showChevron: true,
    },
    {
      key: "meetings",
      icon: "calendar",
      iconColor: colors.text,
      label: "Histórico de encontros",
      description: "Encontros nos pontos seguros de Piripiri",
      onPress: onNavigateToMeetingHistory ?? (() => {}),
      showChevron: true,
    },
    {
      key: "favorites",
      icon: "heart",
      iconColor: colors.text,
      label: "Favoritos e alertas",
      description: "Livros salvos e alertas de busca",
      onPress: onNavigateToFavorites ?? (() => {}),
      showChevron: true,
    },
  ];

  // Seção "Conta" enxuta (ADR 0060): o que é preferência do aplicativo mora em Configurações
  const accountItems: MenuItem[] = [
    {
      key: "notifications",
      icon: "bell",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Notificações",
      description: "Alertas de pedidos, mensagens e buscas",
      onPress: onNavigateToNotifications,
      showChevron: true,
    },
    {
      key: "security",
      icon: "lock",
      iconColor: colors.text,
      label: "Segurança e verificação",
      description: "Alterar senha da conta",
      onPress: onNavigateToSecurity,
      showChevron: true,
    },
    {
      key: "invite",
      icon: "share",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Convidar amigos",
      description: "Divulgue o IpêBook e ajude a comunidade a crescer",
      onPress: onNavigateToInviteFriends ?? (() => {}),
      showChevron: true,
    },
  ];

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, wideWeb && styles.contentWide]}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321: Source Serif 4 Bold 34px, #58331F)
              com entrada de Configurações no topo (ADR 0060), liberada também para visitante */}
          <View style={[styles.headerRow, wideWeb && styles.fullRow]}>
            <Text accessibilityRole="header" style={styles.title}>
              Meu perfil
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir configurações"
              hitSlop={8}
              onPress={onNavigateToSettings ?? (() => {})}
              style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
            >
              <AppIcon name="settings" size={24} color={colors.m3.onSurfaceVariant} />
            </Pressable>
          </View>

          {state.loading && isSignedIn ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.m3.primary} accessibilityLabel="Carregando perfil" />
            </View>
          ) : (
            <>
              {isSignedIn ? (
                <>
                  <View style={[styles.heroBlock, wideWeb && styles.heroBlockWide]}>
                    <View style={styles.libraryCardHeader}>
                      <View style={styles.libraryIcon}>
                        <AppIcon name="shelf" size={24} color={colors.ipe.onContainer} />
                      </View>
                      <View style={styles.libraryCardText}>
                        <Text style={styles.libraryCardTitle}>Minha biblioteca</Text>
                        <Text style={styles.libraryCardDescription}>
                          {totalPublications > 0
                            ? `${totalPublications} ${totalPublications === 1 ? "livro publicado" : "livros publicados"}`
                            : "Compartilhe seu primeiro livro com a comunidade"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.identityRow}>
                      <View style={styles.identityText}>
                        <Text accessibilityRole="header" style={styles.profileName} numberOfLines={2}>
                          {profile.name}
                        </Text>
                        {instagramHandle ? (
                          <Pressable
                            accessibilityRole="link"
                            accessibilityLabel={`Abrir Instagram @${instagramHandle}`}
                            hitSlop={8}
                            onPress={() => void Linking.openURL(`https://instagram.com/${instagramHandle}`)}
                          >
                            <Text style={styles.identityHandle}>{`@${instagramHandle}`}</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Adicionar Instagram ao perfil"
                            hitSlop={8}
                            onPress={onNavigateToEditProfile}
                          >
                            <Text style={styles.identityHandleAction}>Adicionar Instagram</Text>
                          </Pressable>
                        )}
                        <View style={styles.locationRow}>
                          <AppIcon name="place" size={16} color={colors.m3.onSurfaceVariant} />
                          <Text style={styles.locationText}>
                            {profile.neighborhood ? `${profile.neighborhood}, Piripiri` : "Piripiri, PI"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.avatarFrame}>
                        <Avatar name={profile.name} photoUrl={profile.photoUrl} size={88} />
                      </View>
                    </View>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Editar perfil"
                      onPress={onNavigateToEditProfile}
                      style={({ pressed }) => [styles.editProfileButton, pressed && styles.editProfileButtonPressed]}
                    >
                      <AppIcon name="edit" size={18} color={colors.m3.primary} />
                      <Text style={styles.editProfileButtonText}>Editar perfil</Text>
                    </Pressable>

                    <View style={styles.statsContainer}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Minhas publicações: ${totalPublications} ${totalPublications === 1 ? "publicação" : "publicações"}`}
                        onPress={onNavigateToMyListings ?? (() => {})}
                        style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
                      >
                        <Text style={styles.statNumber}>{totalPublications}</Text>
                        <Text style={styles.statLabel}>{totalPublications === 1 ? "publicação" : "publicações"}</Text>
                      </Pressable>

                      <View style={styles.statDivider} />

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Trocas concluídas: ${completedTrocas} ${completedTrocas === 1 ? "troca" : "trocas"}`}
                        onPress={onNavigateToMeetingHistory ?? (() => {})}
                        style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
                      >
                        <Text style={styles.statNumber}>{completedTrocas}</Text>
                        <Text style={styles.statLabel}>{completedTrocas === 1 ? "troca" : "trocas"}</Text>
                      </Pressable>

                      <View style={styles.statDivider} />

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Avaliações recebidas: ${ratingText}`}
                        onPress={onNavigateToRatings}
                        style={({ pressed }) => [styles.statBox, pressed && styles.statBoxPressed]}
                      >
                        <Text style={styles.statNumber}>{ratingText}</Text>
                        <Text style={styles.statLabel}>nota média</Text>
                      </Pressable>
                    </View>

                    {onNavigateToCreateListing ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Publicar um livro"
                          onPress={onNavigateToCreateListing}
                          style={({ pressed }) => [styles.publishButton, pressed && styles.publishButtonPressed]}
                        >
                          <AppIcon name="add" size={20} color={colors.m3.onPrimary} />
                          <Text style={styles.publishButtonText}>Publicar um livro</Text>
                        </Pressable>
                    ) : null}
                  </View>

                  {/* Seção 1: Atividade (Figma 07.01 nó 604:8684: altura 36px, cor #2C5E45) */}
                  <View style={[styles.section, wideWeb && styles.sectionWide]}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.sectionBloom} />
                      <Text style={styles.sectionHeader}>Atividade</Text>
                    </View>
                    <View style={styles.cardGroup}>
                      {activityItems.map((item) => (
                        <Pressable
                          key={item.key}
                          accessibilityRole="button"
                          accessibilityLabel={item.label}
                          onPress={item.onPress}
                          style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                        >
                          <View style={styles.menuIconContainer}>
                            <AppIcon name={item.icon} size={20} color={item.iconColor ?? colors.m3.onSurface} />
                          </View>
                          <View style={styles.menuRowText}>
                            <Text style={styles.menuRowTitle}>{item.label}</Text>
                            {item.description ? (
                              <Text style={styles.menuRowDescription}>{item.description}</Text>
                            ) : null}
                          </View>
                          {item.showChevron ? (
                            <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
                          ) : null}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              ) : (
                /* Estado de convidado: sem conta não há identidade nem atividade a exibir */
                <View style={[styles.guestCard, wideWeb && styles.fullRow]}>
                  <Text style={styles.guestTitle}>Você ainda não entrou</Text>
                  <Text style={styles.guestText}>
                    Crie uma conta grátis para publicar livros, favoritar buscas e negociar trocas em Piripiri.
                  </Text>
                  <FilledButton
                    label="Entrar ou criar conta"
                    onPress={onNavigateToSignIn ?? (() => {})}
                  />
                </View>
              )}

              {/* Seção 2: Conta (Figma 07.01 nó 604:8686). Sem sessão não há conta para gerenciar (ADR 0060). */}
              {isSignedIn ? (
                <View style={[styles.section, wideWeb && styles.sectionWide]}>
                  <View style={styles.sectionHeaderRow}>
                    <View style={styles.sectionBloom} />
                    <Text style={styles.sectionHeader}>Conta</Text>
                  </View>
                  <View style={styles.cardGroup}>
                    {accountItems.map((item) => (
                      <Pressable
                        key={item.key}
                        accessibilityRole="button"
                        accessibilityLabel={item.label}
                        onPress={item.onPress}
                        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                      >
                        <View style={styles.menuIconContainer}>
                          <AppIcon name={item.icon} size={20} color={item.iconColor ?? colors.m3.onSurfaceVariant} />
                        </View>
                        <View style={styles.menuRowText}>
                          <Text style={styles.menuRowTitle}>{item.label}</Text>
                          {item.description ? (
                            <Text style={styles.menuRowDescription}>{item.description}</Text>
                          ) : null}
                        </View>
                        {item.showChevron ? (
                          <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
                        ) : null}
                      </Pressable>
                    ))}

                    {/* Sair da conta (Figma 07.01 nó 25:674: sem chevron) */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Sair da conta"
                      onPress={() => setConfirmingSignOut(true)}
                      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
                    >
                      <View style={[styles.menuIconContainer, styles.signOutIconContainer]}>
                        <AppIcon name="logout" size={20} color={colors.error} />
                      </View>
                      <View style={styles.menuRowText}>
                        <Text style={[styles.menuRowTitle, styles.signOutText]}>Sair da conta</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <Dialog
        visible={confirmingSignOut}
        title="Sair da conta?"
        message="Você precisará entrar novamente para acessar seus anúncios e negociações."
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        destructive
        loading={signingOut}
        onConfirm={() => void handleConfirmSignOut()}
        onCancel={() => setConfirmingSignOut(false)}
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
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      columnGap: tokens.spacing[48],
      rowGap: tokens.spacing[24],
    },
    fullRow: { width: "100%" },
    heroBlock: {
      width: "100%",
      gap: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.ipe.petalSoft,
      borderWidth: 1,
      borderColor: colors.ipe.bloom,
      padding: tokens.spacing[16],
      shadowColor: colors.ipe.trunk,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 2,
    },
    // Web larga: identidade e métricas numa coluna lateral; Atividade e Conta ao lado.
    heroBlockWide: { width: 380, position: "sticky" as "relative", top: tokens.spacing[16] },
    sectionWide: { flex: 1, flexBasis: 300, minWidth: 300 },
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
    identityRow: {
      minHeight: 100,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
    },
    identityText: { flex: 1, minWidth: 0, gap: tokens.spacing[4] },
    profileName: {
      color: colors.brandBrown,
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      fontWeight: tokens.fontWeight.bold,
    },
    identityHandle: {
      ...tokens.typography.bodyLarge,
      fontFamily: fontFamily.semiBold,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.onSurfaceVariant,
    },
    identityHandleAction: {
      ...tokens.typography.bodyMedium,
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.m3.primary,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[4],
      marginTop: tokens.spacing[2],
    },
    locationText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    avatarFrame: {
      width: 100,
      height: 100,
      padding: tokens.spacing[3],
      borderRadius: tokens.radius.full,
      borderWidth: 2,
      borderColor: colors.ipe.bloom,
      backgroundColor: colors.ipe.petalSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      alignSelf: "flex-start",
      minHeight: tokens.accessibility.touchTarget,
      borderWidth: 1,
      borderColor: colors.ipe.bloom,
      borderRadius: tokens.radius.full,
      paddingHorizontal: tokens.spacing[16],
    },
    editProfileButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      backgroundColor: colors.m3.surfaceContainerHigh,
      transform: [{ scale: 0.98 }],
    },
    editProfileButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    statsContainer: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 76,
      marginTop: tokens.spacing[4],
    },
    statBox: {
      flex: 1,
      minWidth: 0,
      minHeight: tokens.accessibility.touchTarget,
      alignItems: "flex-start",
      justifyContent: "center",
      gap: tokens.spacing[2],
      paddingHorizontal: tokens.spacing[8],
      borderRadius: tokens.radius.small,
    },
    statBoxPressed: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    statDivider: {
      width: 1,
      height: tokens.spacing[40],
      backgroundColor: colors.m3.outlineVariant,
    },
    statNumber: {
      fontFamily: fontFamily.brand,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: tokens.fontWeight.bold,
      color: colors.brandBrown,
    },
    statLabel: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    libraryCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      paddingBottom: tokens.spacing[4],
    },
    libraryIcon: {
      width: 48,
      height: 48,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.ipe.bloom,
    },
    libraryCardText: {
      flex: 1,
      gap: tokens.spacing[2],
    },
    libraryCardTitle: {
      ...tokens.typography.titleMedium,
      color: colors.ipe.onContainer,
      fontWeight: tokens.fontWeight.bold,
    },
    libraryCardDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.ipe.onContainer,
    },
    publishButton: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      borderRadius: tokens.shapeMorph.buttonRest,
      backgroundColor: colors.m3.primary,
      paddingHorizontal: tokens.spacing[20],
    },
    publishButtonPressed: {
      borderRadius: tokens.shapeMorph.buttonPressed,
      opacity: 0.88,
    },
    publishButtonText: {
      ...tokens.typography.labelLarge,
      color: colors.m3.onPrimary,
      fontWeight: tokens.fontWeight.semiBold,
    },
    section: {
      gap: tokens.spacing[4],
    },
    sectionHeaderRow: {
      height: 36,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
    },
    // Flor de ipê marcando cada seção (Spec 078).
    sectionBloom: {
      width: tokens.spacing[8],
      height: tokens.spacing[8],
      borderRadius: tokens.radius.extraSmall,
      backgroundColor: colors.ipe.bloomDeep,
    },
    sectionHeader: {
      ...tokens.typography.labelLarge,
      // Figma `07.01` (conferido em 2026-10-26, Spec 076): rótulo de seção na cor primária.
      color: colors.m3.primary,
    },
    // Figma `07.01`: as linhas de menu ficam direto no fundo da página, sem cartão, borda nem
    // divisórias.
    cardGroup: {
      backgroundColor: "transparent",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[8],
      minHeight: tokens.accessibility.touchTarget,
      borderRadius: tokens.shapeMorph.chipUnselected,
    },
    menuRowPressed: {
      backgroundColor: colors.m3.surfaceContainerHigh,
      borderRadius: tokens.shapeMorph.chipSelected,
      transform: [{ scale: 0.985 }],
    },
    menuIconContainer: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    signOutIconContainer: {
      backgroundColor: colors.badge.sale.background,
    },
    menuRowText: { flex: 1, gap: tokens.spacing[2] },
    menuRowTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.m3.onSurface,
    },
    menuRowDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    signOutText: { color: colors.error },
  });
}

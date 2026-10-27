import { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { useUserPreferencesViewModel } from "@/viewmodel/useUserPreferencesViewModel";
import { ReaderCard } from "@/view/components/ReaderCard";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { FilledButton } from "@/view/components/FilledButton";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ProfileHubProps = {
  requireAuth?: boolean;
  onNavigateToSignIn?: () => void;
  onNavigateToEditProfile: () => void;
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
 * Hub de navegação e identidade do usuário fiel ao Figma `07.01 · Meu perfil` (`25:524`).
 */
export default function ProfileHub({
  requireAuth = true,
  onNavigateToSignIn,
  onNavigateToEditProfile,
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
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321: Source Serif 4 Bold 34px, #58331F)
              com entrada de Configurações no topo (ADR 0060), liberada também para visitante */}
          <View style={styles.headerRow}>
            <Text accessibilityRole="header" style={styles.title}>
              Meu perfil
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir configurações"
              hitSlop={8}
              onPress={onNavigateToSettings ?? (() => {})}
              style={styles.settingsButton}
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
                  {/* Cartão de leitor com o ipê da marca (Spec 078), no lugar do cartão neutro do Figma 07.01 */}
                  <ReaderCard
                    name={profile.name}
                    photoUrl={profile.photoUrl}
                    subtitle={`${
                      profile.ratingCount > 0
                        ? `★ ${profile.averageRating?.toFixed(1)} (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                        : "Sem avaliações ainda"
                    } · ${profile.neighborhood ? `${profile.neighborhood}, Piripiri` : "Piripiri, PI"}`}
                  />

                  {/* Botão Outline "Editar perfil" (Figma 07.01 nó 604:8677: 345x48px, rx 24px, stroke #D3CCC2, sem ícone) */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Editar perfil"
                    onPress={onNavigateToEditProfile}
                    style={styles.editProfileButton}
                  >
                    <Text style={styles.editProfileButtonText}>Editar perfil</Text>
                  </Pressable>

                  {/* Tríade de Métricas Comunitárias (Figma 07.01 nó 25:616: 3 caixas de 109.6x76px, rx 16px, fill #F7F3EC) */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{totalPublications}</Text>
                      <Text style={styles.statLabel}>publicações</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{completedTrocas}</Text>
                      <Text style={styles.statLabel}>trocas</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>{ratingText}</Text>
                      <Text style={styles.statLabel}>avaliação</Text>
                    </View>
                  </View>

                  {/* Seção 1: Atividade (Figma 07.01 nó 604:8684: altura 36px, cor #2C5E45) */}
                  <View style={styles.section}>
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
                          style={styles.menuRow}
                        >
                          <AppIcon name={item.icon} size={24} color={item.iconColor ?? colors.m3.onSurface} />
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
                <View style={styles.guestCard}>
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
                <View style={styles.section}>
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
                        style={styles.menuRow}
                      >
                        <AppIcon name={item.icon} size={24} color={item.iconColor ?? colors.m3.onSurfaceVariant} />
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
                      style={styles.menuRow}
                    >
                      <AppIcon name="logout" size={24} color={colors.error} />
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
    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
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
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.brandBrown,
    },
    // Alvo de toque de 48 dp ao redor da engrenagem (FR-011, Spec 073).
    settingsButton: {
      minWidth: tokens.accessibility.touchTarget,
      minHeight: tokens.accessibility.touchTarget,
      alignItems: "center",
      justifyContent: "center",
    },
    status: { alignItems: "center", paddingVertical: tokens.spacing[32] },
    guestCard: {
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: 20,
      padding: tokens.spacing[24],
      gap: tokens.spacing[12],
    },
    guestTitle: {
      fontFamily: fontFamily.brand,
      fontSize: 20,
      lineHeight: 26,
      color: colors.text,
    },
    guestText: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: 24,
      backgroundColor: "transparent",
      paddingHorizontal: tokens.spacing[24],
    },
    editProfileButtonText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fontFamily.medium,
      color: colors.m3.onSurfaceVariant,
      fontWeight: "500",
    },
    statsContainer: {
      flexDirection: "row",
      gap: tokens.spacing[8],
      height: 76,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingVertical: tokens.spacing[8],
    },
    statNumber: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "700",
      color: colors.brandBrown,
    },
    statLabel: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: fontFamily.regular,
      color: colors.m3.onSurfaceVariant,
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
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.ipe.bloomDeep,
    },
    sectionHeader: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fontFamily.medium,
      // Figma `07.01` (conferido em 2026-10-26, Spec 076): rótulo de seção na cor primária.
      color: colors.m3.primary,
      fontWeight: "500",
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
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[4],
      minHeight: tokens.accessibility.touchTarget,
    },
    menuRowText: { flex: 1, gap: 2 },
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

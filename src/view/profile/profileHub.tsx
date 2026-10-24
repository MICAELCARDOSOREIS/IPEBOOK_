import { useMemo, useState, useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { useMyListingsViewModel } from "@/viewmodel/useMyListingsViewModel";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { fontFamily, tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ProfileHubProps = {
  requireAuth?: boolean;
  onNavigateToSignIn?: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToMyListings?: () => void;
  onNavigateToRatings: () => void;
  onNavigateToFavorites?: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToBlockedUsers?: () => void;
  onNavigateToInviteFriends?: () => void;
  onNavigateToTerms: () => void;
  onNavigateToHelp: () => void;
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
  onNavigateToFavorites,
  onNavigateToNotifications,
  onNavigateToSecurity,
  onNavigateToPrivacy,
  onNavigateToBlockedUsers,
  onNavigateToInviteFriends,
  onNavigateToTerms,
  onNavigateToHelp,
  onSignedOut,
}: ProfileHubProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = useAuthViewModel();
  const userId = authState.user?.id ?? null;
  const [state] = useProfileViewModel(userId);
  const [myListingsState] = useMyListingsViewModel(userId);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (requireAuth && !authState.loading && !userId) {
      onNavigateToSignIn?.();
    }
  }, [requireAuth, authState.loading, userId, onNavigateToSignIn]);

  // Se requer autenticação e não há usuário, aguarda redirecionamento
  if (requireAuth && (authState.loading || !userId)) return null;

  // Se logado usa os dados reais; se visitante/demonstração usa os dados canônicos do Figma 07.01 (Lucas Andrade)
  const isDemonstration = !userId;
  const profile = {
    userId: state.profile?.userId ?? "demo",
    name: state.profile?.name ?? "Lucas Andrade",
    socialHandle: state.profile?.socialHandle ?? "@instragram",
    neighborhood: "Centro",
    averageRating: state.profile?.averageRating ?? 4.9,
    ratingCount: state.profile?.ratingCount ?? 8,
    completedNegotiations: state.profile?.completedNegotiations ?? 8,
    photoUrl: state.profile?.photoUrl,
    joinedAt: state.profile?.joinedAt ?? "2026-01-01T00:00:00.000Z",
  };

  const activeBooks = isDemonstration ? 4 : myListingsState.books.filter((b) => b.status === "available").length;
  const reservedBooks = isDemonstration ? 1 : myListingsState.books.filter((b) => b.status === "reserved").length;
  const totalPublications = isDemonstration ? 5 : myListingsState.books.length;
  const completedTrocas = isDemonstration ? 8 : (profile.completedNegotiations ?? 0);
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
      key: "favorites",
      icon: "heart",
      iconColor: colors.text,
      label: "Favoritos e alertas",
      description: "Livros salvos e alertas de busca",
      onPress: onNavigateToFavorites ?? (() => {}),
      showChevron: true,
    },
  ];

  // Itens da seção "Conta" (Figma 07.01 nós 25:647, 25:656, 25:665, 25:674)
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
      description: isDemonstration ? "E-mail confirmado" : "Alterar senha da conta",
      onPress: onNavigateToSecurity,
      showChevron: true,
    },
    {
      key: "privacy",
      icon: "document",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Privacidade e dados",
      description: "Baixe seus dados ou exclua sua conta",
      onPress: onNavigateToPrivacy,
      showChevron: true,
    },
    {
      key: "blocked",
      icon: "lock",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Pessoas bloqueadas",
      description: "Gerencie quem não pode interagir com você",
      onPress: onNavigateToBlockedUsers ?? (() => {}),
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
    {
      key: "terms",
      icon: "document",
      iconColor: colors.m3.onSurfaceVariant,
      label: "Termos e privacidade",
      description: "Termos de uso e política de privacidade",
      onPress: onNavigateToTerms,
      showChevron: true,
    },
    {
      key: "help",
      icon: "info",
      iconColor: colors.text,
      label: "Ajuda e suporte",
      description: "Dúvidas frequentes e suporte comunitário",
      onPress: onNavigateToHelp,
      showChevron: true,
    },
  ];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321: Source Serif 4 Bold 34px, #58331F) */}
          <Text accessibilityRole="header" style={styles.title}>
            Meu perfil
          </Text>

          {state.loading && !isDemonstration ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.m3.primary} accessibilityLabel="Carregando perfil" />
            </View>
          ) : (
            <>
              {/* Card de Identidade (Figma 07.01 nó 25:610: 345x96px, rx 20px, fill #F7F3EC) */}
              <View style={styles.identityCard}>
                <Avatar name={profile.name ?? "Você"} photoUrl={profile.photoUrl} size={72} />
                <View style={styles.identityText}>
                  <Text style={styles.name}>{profile.name ?? "Você"}</Text>
                  <Text style={styles.subtitle}>
                    {profile.socialHandle ??
                      (profile.ratingCount > 0
                        ? `★ ${profile.averageRating?.toFixed(1)} (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                        : "Sem avaliações ainda")}
                    {" · "}
                    {profile.neighborhood ? `${profile.neighborhood}, Piripiri` : "Piripiri, PI"}
                  </Text>
                </View>
              </View>

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
                  <Text style={styles.sectionHeader}>Atividade</Text>
                </View>
                <View style={styles.cardGroup}>
                  {activityItems.map((item, index) => (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={item.onPress}
                      style={[
                        styles.menuRow,
                        index === activityItems.length - 1 && styles.menuRowLast,
                      ]}
                    >
                      <AppIcon name={item.icon} size={24} color={item.iconColor ?? colors.m3.primary} />
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

              {/* Seção 2: Conta e Preferências (Figma 07.01 nó 604:8686: altura 36px, cor #2C5E45) */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
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
                    style={[styles.menuRow, styles.menuRowLast]}
                  >
                    <AppIcon name="logout" size={24} color={colors.error} />
                    <View style={styles.menuRowText}>
                      <Text style={[styles.menuRowTitle, styles.signOutText]}>Sair da conta</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Alternador de Tema M3 */}
              <ThemePreferenceSelector />
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
    title: {
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.brandBrown,
    },
    status: { alignItems: "center", paddingVertical: tokens.spacing[32] },
    identityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: 20,
      paddingHorizontal: tokens.spacing[16],
      paddingVertical: tokens.spacing[12],
      minHeight: 96,
    },
    identityText: { flex: 1, gap: tokens.spacing[4] },
    name: {
      fontFamily: fontFamily.brand,
      fontSize: 24,
      lineHeight: 29,
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fontFamily.regular,
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
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingVertical: tokens.spacing[8],
    },
    statNumber: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700",
      color: colors.text,
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
      justifyContent: "center",
      paddingHorizontal: tokens.spacing[4],
    },
    sectionHeader: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fontFamily.medium,
      color: colors.m3.primary,
      fontWeight: "600",
    },
    cardGroup: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      paddingVertical: tokens.spacing[16],
      paddingHorizontal: tokens.spacing[16],
      minHeight: tokens.accessibility.touchTarget,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    menuRowLast: {
      borderBottomWidth: 0,
    },
    menuRowText: { flex: 1, gap: 2 },
    menuRowTitle: {
      ...tokens.typography.bodyLarge,
      color: colors.text,
      fontWeight: "500",
    },
    menuRowDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurfaceVariant,
    },
    signOutText: { color: colors.error },
  });
}

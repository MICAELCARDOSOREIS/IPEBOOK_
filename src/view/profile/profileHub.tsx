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
  onNavigateToSignIn?: () => void;
  onNavigateToEditProfile: () => void;
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
  label: string;
  description: string;
  onPress: () => void;
};

/**
 * Hub de navegação e identidade do usuário alinhado ao Figma `07.01 · Meu perfil` (`25:524`).
 */
export default function ProfileHub({
  onNavigateToSignIn,
  onNavigateToEditProfile,
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
    if (!authState.loading && !userId) onNavigateToSignIn?.();
  }, [authState.loading, userId, onNavigateToSignIn]);

  if (authState.loading || !userId) return null;

  const profile = state.profile;

  async function handleConfirmSignOut() {
    setSigningOut(true);
    await authActions.signOut();
    setSigningOut(false);
    setConfirmingSignOut(false);
    onSignedOut();
  }

  const activityItems: MenuItem[] = [
    {
      key: "ratings",
      icon: "star",
      label: "Avaliações recebidas",
      description:
        profile && profile.ratingCount > 0
          ? `★ ${profile.averageRating?.toFixed(1)} em ${profile.completedNegotiations ?? profile.ratingCount} trocas`
          : "Veja o que a comunidade disse sobre você",
      onPress: onNavigateToRatings,
    },
    {
      key: "favorites",
      icon: "heart",
      label: "Favoritos e alertas",
      description: "Livros salvos e alertas de busca",
      onPress: onNavigateToFavorites ?? (() => {}),
    },
  ];

  const accountItems: MenuItem[] = [
    {
      key: "notifications",
      icon: "bell",
      label: "Notificações",
      description: "Alertas de pedidos, mensagens e buscas",
      onPress: onNavigateToNotifications,
    },
    {
      key: "security",
      icon: "lock",
      label: "Segurança e verificação",
      description: "Alterar senha da conta",
      onPress: onNavigateToSecurity,
    },
    {
      key: "privacy",
      icon: "document",
      label: "Privacidade e dados",
      description: "Baixe seus dados ou exclua sua conta",
      onPress: onNavigateToPrivacy,
    },
    {
      key: "blocked",
      icon: "lock",
      label: "Pessoas bloqueadas",
      description: "Gerencie quem não pode interagir com você",
      onPress: onNavigateToBlockedUsers ?? (() => {}),
    },
    {
      key: "invite",
      icon: "share",
      label: "Convidar amigos",
      description: "Divulgue o IpêBook e ajude a comunidade a crescer",
      onPress: onNavigateToInviteFriends ?? (() => {}),
    },
    {
      key: "terms",
      icon: "document",
      label: "Termos e privacidade",
      description: "Termos de uso e política de privacidade",
      onPress: onNavigateToTerms,
    },
    {
      key: "help",
      icon: "info",
      label: "Ajuda",
      description: "Dúvidas frequentes e suporte",
      onPress: onNavigateToHelp,
    },
  ];

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Título editorial da marca (Figma 07.01 nó 563:8321) */}
          <Text accessibilityRole="header" style={styles.title}>
            Meu perfil
          </Text>

          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.m3.primary} accessibilityLabel="Carregando perfil" />
            </View>
          ) : (
            <>
              {/* Card de Identidade do leitor (Figma 07.01 nó 25:610) */}
              <View style={styles.identityCard}>
                <Avatar name={profile?.name ?? "Você"} photoUrl={profile?.photoUrl} size={64} />
                <View style={styles.identityText}>
                  <Text style={styles.name}>{profile?.name ?? "Você"}</Text>
                  <Text style={styles.neighborhoodText}>
                    {profile && profile.ratingCount > 0
                      ? `★ ${profile.averageRating?.toFixed(1)} (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                      : "Sem avaliações ainda"}
                    {" · "}
                    {profile?.socialHandle ? `@${profile.socialHandle}` : "Piripiri, PI"}
                  </Text>
                </View>
              </View>

              {/* Botão Outline "Editar perfil" (Figma 07.01 nó 604:8677) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar perfil"
                onPress={onNavigateToEditProfile}
                style={styles.editProfileButton}
              >
                <AppIcon name="edit" size={18} color={colors.m3.primary} />
                <Text style={styles.editProfileButtonText}>Editar perfil</Text>
              </Pressable>

              {/* Tríade de Métricas de Atividade (Figma 07.01 nó 25:616) */}
              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{myListingsState.books.length}</Text>
                  <Text style={styles.statLabel}>publicações</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{profile?.completedNegotiations ?? 0}</Text>
                  <Text style={styles.statLabel}>trocas</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>
                    {profile && profile.ratingCount > 0 ? profile.averageRating?.toFixed(1) : "—"}
                  </Text>
                  <Text style={styles.statLabel}>avaliação</Text>
                </View>
              </View>

              {/* Seção 1: Atividade (Figma 07.01 nó 604:8684) */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Atividade</Text>
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
                      <AppIcon name={item.icon} size={22} color={colors.m3.primary} />
                      <View style={styles.menuRowText}>
                        <Text style={styles.menuRowTitle}>{item.label}</Text>
                        <Text style={styles.menuRowDescription}>{item.description}</Text>
                      </View>
                      <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Seção 2: Conta e Preferências (Figma 07.01 nó 604:8686) */}
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Conta</Text>
                <View style={styles.cardGroup}>
                  {accountItems.map((item) => (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={item.onPress}
                      style={styles.menuRow}
                    >
                      <AppIcon name={item.icon} size={22} color={colors.text} />
                      <View style={styles.menuRowText}>
                        <Text style={styles.menuRowTitle}>{item.label}</Text>
                        <Text style={styles.menuRowDescription}>{item.description}</Text>
                      </View>
                      <AppIcon name="chevronRight" size={20} color={colors.m3.onSurfaceVariant} />
                    </Pressable>
                  ))}

                  {/* Sair da conta */}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sair da conta"
                    onPress={() => setConfirmingSignOut(true)}
                    style={[styles.menuRow, styles.menuRowLast]}
                  >
                    <AppIcon name="logout" size={22} color={colors.error} />
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
      paddingHorizontal: tokens.spacing[20],
      paddingTop: tokens.spacing[12],
      gap: tokens.spacing[16],
    },
    title: {
      fontFamily: fontFamily.brand,
      fontSize: 34,
      lineHeight: 41,
      color: colors.text,
    },
    status: { alignItems: "center", paddingVertical: tokens.spacing[32] },
    identityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainer,
      borderRadius: 20,
      padding: tokens.spacing[16],
    },
    identityText: { flex: 1, gap: tokens.spacing[4] },
    name: {
      fontFamily: fontFamily.brand,
      fontSize: 22,
      lineHeight: 28,
      color: colors.text,
    },
    neighborhoodText: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[8],
      minHeight: tokens.accessibility.touchTarget,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      paddingHorizontal: tokens.spacing[20],
    },
    editProfileButtonText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      fontWeight: "600",
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
      ...tokens.typography.titleLarge,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700",
      color: colors.text,
    },
    statLabel: {
      ...tokens.typography.labelSmall,
      color: colors.m3.onSurfaceVariant,
    },
    section: {
      gap: tokens.spacing[8],
    },
    sectionHeader: {
      ...tokens.typography.labelMedium,
      color: colors.m3.primary,
      fontWeight: "600",
      paddingHorizontal: tokens.spacing[4],
      paddingTop: tokens.spacing[4],
    },
    cardGroup: {
      backgroundColor: colors.surface,
      borderRadius: tokens.radius.medium,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
      overflow: "hidden",
    },
    menuRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
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
      fontWeight: "600",
    },
    menuRowDescription: {
      ...tokens.typography.labelMedium,
      color: colors.secondaryText,
    },
    signOutText: { color: colors.error },
  });
}

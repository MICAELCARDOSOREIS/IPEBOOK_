import { useMemo, useState } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useProfileViewModel } from "@/viewmodel/useProfileViewModel";
import { Avatar } from "@/view/components/Avatar";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Dialog } from "@/view/components/Dialog";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type ProfileHubProps = {
  onNavigateToSignIn?: () => void;
  onNavigateToEditProfile: () => void;
  onNavigateToRatings: () => void;
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

/** Figma `07.01 · Meu perfil` (`25:524` / Web `370:16621`). */
export default function ProfileHub({
  onNavigateToSignIn,
  onNavigateToEditProfile,
  onNavigateToRatings,
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

  const menuItems: MenuItem[] = [
    {
      key: "edit",
      icon: "edit",
      label: "Editar perfil",
      description: "Nome, foto, telefone e bairro",
      onPress: onNavigateToEditProfile,
    },
    {
      key: "ratings",
      icon: "star",
      label: "Avaliações recebidas",
      description: "Veja o que a comunidade disse sobre você",
      onPress: onNavigateToRatings,
    },
    {
      key: "notifications",
      icon: "bell",
      label: "Notificações",
      description: "Alertas de pedidos, mensagens e alertas de busca",
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>Meu perfil</Text>

          {state.loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.action} accessibilityLabel="Carregando perfil" />
            </View>
          ) : (
            <View style={styles.headerCard}>
              <Avatar name={profile?.name ?? "Você"} photoUrl={profile?.photoUrl} size={64} />
              <View style={styles.headerText}>
                <Text style={styles.name}>{profile?.name ?? "Você"}</Text>
                <Text style={styles.statsLine}>
                  {profile && profile.ratingCount > 0
                    ? `★ ${profile.averageRating?.toFixed(1)} (${profile.ratingCount} ${profile.ratingCount > 1 ? "avaliações" : "avaliação"})`
                    : "Sem avaliações ainda"}
                  {" · "}
                  {profile?.completedNegotiations ?? 0} negociações concluídas
                </Text>
              </View>
            </View>
          )}

          <View style={styles.menu}>
            {menuItems.map((item) => (
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
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
              onPress={() => setConfirmingSignOut(true)}
              style={styles.menuRow}
            >
              <AppIcon name="logout" size={22} color={colors.error} />
              <View style={styles.menuRowText}>
                <Text style={[styles.menuRowTitle, styles.signOutText]}>Sair da conta</Text>
              </View>
            </Pressable>
          </View>
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
  scroll: { flexGrow: 1 },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24], gap: tokens.spacing[20] },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.action,
  },
  status: { alignItems: "center", paddingVertical: tokens.spacing[24] },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[16],
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
  },
  headerText: { flex: 1, gap: tokens.spacing[4] },
  name: {
    ...tokens.typography.titleLarge,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  statsLine: { ...tokens.typography.bodyMedium, color: colors.secondaryText },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
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
  menuRowText: { flex: 1, gap: 2 },
  menuRowTitle: { ...tokens.typography.bodyLarge, color: colors.text, fontWeight: "600" },
  menuRowDescription: { ...tokens.typography.labelMedium, color: colors.secondaryText },
  chevron: { ...tokens.typography.titleMedium, color: colors.secondaryText },
  signOutText: { color: colors.error },
  });
}

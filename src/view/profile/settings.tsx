import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { supportMailtoUrl, SUPPORT_EMAIL } from "@/view/supportContact";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/view/instagram";
import { InstagramIcon } from "@/view/components/InstagramIcon";
import { TopAppBar } from "@/view/components/TopAppBar";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { AppIcon } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { Dialog } from "@/view/components/Dialog";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { TextButton } from "@/view/components/TextButton";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { usePublicProfileViewModel } from "@/viewmodel/usePublicProfileViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type SettingsProps = {
  onBack: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToBlockedUsers?: () => void;
  /** Abre a página que apresenta o IpêBook. */
  onNavigateToAbout?: () => void;
  onNavigateToEditProfile?: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToNotifications?: () => void;
  /** Depois de sair da conta (Spec 091). */
  onSignedOut?: () => void;
};

type LinkItem = {
  key: string;
  icon: "document" | "info" | "lock" | "block" | "visibility" | "person" | "bell" | "place" | "mail" | "instagram";
  label: string;
  description?: string;
  onPress?: () => void;
};

/**
 * Tela de configurações do aplicativo (Spec 073, ADR 0058 e ADR 0060).
 * Hub de preferências: aparência, dados do dispositivo, gestão da conta e informações do
 * aplicativo. Entra aqui o que não é atividade de leitura do perfil, para manter Meu perfil curto.
 * Aparência, dados salvos e informações ficam disponíveis sem sessão; gestão de conta não.
 */
export function Settings({
  onBack,
  onNavigateToTerms,
  onNavigateToHelp,
  onNavigateToPrivacy,
  onNavigateToBlockedUsers,
  onNavigateToAbout,
  onNavigateToEditProfile,
  onNavigateToSecurity,
  onNavigateToNotifications,
  onSignedOut,
}: SettingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = useAuthViewModel();
  const hasAccount = !!authState.user?.id;
  const sessionUserId = authState.user?.id ?? null;
  const [profileState] = usePublicProfileViewModel(sessionUserId ?? "");
  const neighborhood = useActiveNeighborhood("all");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const defaultNeighborhoodLabel =
    neighborhood.activeNeighborhood === "all" || neighborhood.activeNeighborhood === "Todos os bairros (Piripiri)"
      ? "Todos os bairros"
      : neighborhood.activeNeighborhood;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authActions.signOut();
      setConfirmingSignOut(false);
      onSignedOut?.();
    } finally {
      setSigningOut(false);
    }
  }
  const [state, actions] = useSettingsViewModel();
  const version = Constants.expoConfig?.version ?? null;

  // Gestão da conta veio de Meu perfil (ADR 0060) e só aparece com sessão
  const accountLinks: LinkItem[] = hasAccount
    ? [
        {
          key: "security",
          icon: "lock" as const,
          label: "Segurança e verificação",
          description: "Senha, e-mail e confirmação da conta",
          onPress: onNavigateToSecurity,
        },
        {
          key: "notifications",
          icon: "bell" as const,
          label: "Central de notificações",
          description: "Propostas, mensagens e avisos de novos livros",
          onPress: onNavigateToNotifications,
        },
        {
          key: "privacy",
          icon: "visibility" as const,
          label: "Privacidade e dados",
          description: "Baixe seus dados ou exclua sua conta",
          onPress: onNavigateToPrivacy,
        },
        {
          key: "blocked",
          icon: "block" as const,
          label: "Pessoas bloqueadas",
          description: "Gerencie quem não pode interagir com você",
          onPress: onNavigateToBlockedUsers,
        },
      ].filter((link) => link.onPress)
    : [];

  const aboutLinks: LinkItem[] = [
    { key: "about", icon: "info" as const, label: "Conhecer o IpêBook", description: "Como funciona, segurança e a comunidade de Piripiri", onPress: onNavigateToAbout },
    { key: "help", icon: "info" as const, label: "Ajuda e suporte", onPress: onNavigateToHelp },
    {
      key: "instagram",
      icon: "instagram" as const,
      label: "Siga o IpêBook no Instagram",
      description: `@${INSTAGRAM_HANDLE}`,
      onPress: () => void Linking.openURL(INSTAGRAM_URL),
    },
    {
      key: "contact",
      icon: "mail" as const,
      label: "Falar com a equipe",
      description: SUPPORT_EMAIL,
      onPress: () => void Linking.openURL(supportMailtoUrl(version)),
    },
    { key: "terms", icon: "document" as const, label: "Termos e privacidade", onPress: onNavigateToTerms },
  ].filter((link) => link.onPress);

  function renderLink(link: LinkItem, index: number) {
    return (
      <Pressable
        key={link.key}
        accessibilityRole="button"
        accessibilityLabel={link.label}
        onPress={link.onPress}
        android_ripple={{ color: colors.m3.surfaceContainerHigh }}
        style={({ pressed }) => [styles.linkRow, index > 0 && styles.linkDivider, pressed && styles.linkPressed]}
      >
        <View style={styles.iconCircle}>
          {link.icon === "instagram" ? (
            <InstagramIcon size={20} color={colors.m3.onSecondaryContainer} />
          ) : (
            <AppIcon name={link.icon} size={20} color={colors.m3.onSecondaryContainer} />
          )}
        </View>
        <View style={styles.linkText}>
          <Text style={styles.linkLabel}>{link.label}</Text>
          {link.description ? <Text style={styles.linkDescription}>{link.description}</Text> : null}
        </View>
        <AppIcon name="chevronRight" size={18} color={colors.m3.onSurfaceVariant} />
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Configurações" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Cartão da conta (Spec 091): quem está logada e atalho para editar o perfil */}
          {hasAccount ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              onPress={onNavigateToEditProfile}
              style={styles.accountCard}
            >
              <Avatar
                name={profileState.profile?.name ?? authState.user?.email ?? "Você"}
                photoUrl={profileState.profile?.photoUrl ?? undefined}
                size={56}
              />
              <View style={styles.linkText}>
                <Text numberOfLines={1} style={styles.accountName}>
                  {profileState.profile?.name ?? "Minha conta"}
                </Text>
                <Text numberOfLines={1} style={styles.linkDescription}>
                  {authState.user?.email}
                </Text>
              </View>
              <Text style={styles.accountAction}>Editar</Text>
            </Pressable>
          ) : null}

          {/* Conta e dados (ADR 0060): só com sessão, e primeiro por ser o que mais importa */}
          {accountLinks.length > 0 ? (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionHeader}>
                Conta e dados
              </Text>
              <View style={styles.listCard}>{accountLinks.map(renderLink)}</View>
            </View>
          ) : null}

          {/* Preferências de uso (Spec 091): o bairro com que a Home e a Explorar abrem */}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              Preferências
            </Text>
            <View style={styles.listCard}>
              {renderLink({
                key: "neighborhood",
                icon: "place",
                label: "Bairro padrão",
                description: `${defaultNeighborhoodLabel} · usado para mostrar livros perto de você`,
                onPress: neighborhood.openSelector,
              }, 0)}
            </View>
          </View>

          {/* Aparência (Spec 073 FR-003, ADR 0036) */}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              Aparência
            </Text>
            <View style={styles.card}>
              <Text style={styles.sectionDescription}>
                Escolha como o aplicativo aparece para você.
              </Text>
              <ThemePreferenceSelector />
            </View>
          </View>

          {/* Dados neste dispositivo (Spec 073): limpeza do catálogo offline */}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              Dados neste dispositivo
            </Text>
            <View style={styles.card}>
              <Text style={styles.sectionDescription}>
                O IpêBook guarda uma cópia do catálogo de Piripiri para abrir rápido mesmo sem
                internet. Limpar não apaga seus anúncios nem remove sua conta.
              </Text>
              <OutlinedButton
                label="Limpar dados salvos"
                accessibilityLabel="Limpar dados salvos no dispositivo"
                loading={state.clearingCache}
                loadingLabel="Limpando dados salvos"
                onPress={() => void actions.clearBooksCache()}
              />
              <OutlinedButton
                label="Limpar histórico de buscas"
                accessibilityLabel="Limpar histórico de buscas deste aparelho"
                loading={state.clearingHistory}
                loadingLabel="Limpando histórico de buscas"
                onPress={() => void actions.clearSearchHistory(sessionUserId)}
              />
              {state.historyCleared ? (
                <Text accessibilityLiveRegion="polite" style={styles.feedbackSuccess}>
                  Histórico de buscas limpo.
                </Text>
              ) : null}
              {state.historyError ? (
                <Text accessibilityLiveRegion="polite" style={styles.feedbackError}>
                  {state.historyError}
                </Text>
              ) : null}
              {state.cacheCleared ? (
                <Text accessibilityLiveRegion="polite" style={styles.feedbackSuccess}>
                  Dados salvos limpos deste dispositivo.
                </Text>
              ) : null}
              {state.cacheError ? (
                <Text accessibilityLiveRegion="polite" style={styles.feedbackError}>
                  {state.cacheError}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Sobre e atalhos (Spec 073) */}
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              Sobre o IpêBook
            </Text>
            <View style={styles.listCard}>
              {aboutLinks.map(renderLink)}
              <View style={[styles.versionRow, aboutLinks.length > 0 && styles.linkDivider]}>
                <Text style={styles.versionLabel}>Versão</Text>
                <Text
                  accessibilityLabel={`Versão do aplicativo ${version ?? "desconhecida"}`}
                  style={styles.versionValue}
                >
                  {version ?? "—"}
                </Text>
              </View>
            </View>
          </View>

          {hasAccount ? (
            <View style={styles.signOutRow}>
              <TextButton label="Sair da conta" tone="danger" onPress={() => setConfirmingSignOut(true)} />
            </View>
          ) : null}

          <Text style={styles.footer}>
            Leitura, anúncios e configurações funcionam sem internet. Só publicar, favoritar e
            negociar pedem conexão.
          </Text>
        </View>
      </ScrollView>

      <NeighborhoodSelectorModal
        visible={neighborhood.isSelectorOpen}
        currentNeighborhood={neighborhood.activeNeighborhood}
        onSelect={(name) => void neighborhood.selectNeighborhood(name)}
        onClose={neighborhood.closeSelector}
      />
      <Dialog
        visible={confirmingSignOut}
        title="Sair da conta?"
        message="Você volta a ver só o catálogo. Seus anúncios e conversas continuam salvos."
        confirmLabel="Sair"
        cancelLabel="Ficar"
        destructive
        loading={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => setConfirmingSignOut(false)}
      />
    </SafeAreaView>
  );
}

export default Settings;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    card: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    listCard: {
      borderRadius: tokens.radius.large,
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.large,
      backgroundColor: colors.m3.secondaryContainer,
    },
    accountName: { ...tokens.typography.titleMedium, color: colors.m3.onSecondaryContainer },
    accountAction: { ...tokens.typography.labelLarge, color: colors.m3.primary },
    signOutRow: { alignItems: "center" },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.m3.secondaryContainer,
    },
    linkDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.m3.outlineVariant },
    linkPressed: { backgroundColor: colors.m3.surfaceContainerHigh },
    scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
    content: {
      width: "100%",
      maxWidth: 720,
      alignSelf: "center",
      padding: tokens.spacing[16],
      gap: tokens.spacing[24],
    },
    section: { gap: tokens.spacing[8] },
    sectionHeader: {
      ...tokens.typography.labelLarge,
      color: colors.m3.primary,
      paddingHorizontal: tokens.spacing[8],
    },
    sectionDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    footer: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[16],
    },
    feedbackSuccess: {
      ...tokens.typography.bodyMedium,
      color: colors.success,
    },
    feedbackError: {
      ...tokens.typography.bodyMedium,
      color: colors.error,
    },
    versionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[16],
    },
    versionLabel: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    versionValue: {
      ...tokens.typography.bodyMedium,
      fontWeight: "600",
      color: colors.text,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: 64,
      paddingVertical: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[16],
    },
    linkText: { flex: 1, gap: 2 },
    linkLabel: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
    },
    linkDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
  });
}

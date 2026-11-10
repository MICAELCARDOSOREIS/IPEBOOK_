import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { supportMailtoUrl, SUPPORT_EMAIL } from "@/view/supportContact";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/view/instagram";
import { InstagramIcon } from "@/view/components/InstagramIcon";
import { TopAppBar } from "@/view/components/TopAppBar";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { AppIcon, type AppIconName } from "@/view/components/AppIcon";
import { Avatar } from "@/view/components/Avatar";
import { Dialog } from "@/view/components/Dialog";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { TextButton } from "@/view/components/TextButton";
import {
  makeAuthViewModel,
  makeIsModerator,
  makeNotificationPreferencesViewModel,
  makePublicProfileViewModel,
  makeSettingsViewModel,
} from "@/di/container";
import {
  NOTIFICATION_PREFERENCE_CATEGORIES,
  type NotificationPreferenceKey,
} from "@/viewmodel/useNotificationPreferencesViewModel";
import { useActiveNeighborhood } from "@/viewmodel/useActiveNeighborhood";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { WEB_GUTTER } from "@/view/webLayout";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";
import { useGuardedPress } from "@/view/useGuardedPress";
import { withPress } from "@/view/pressFeedback";
const WIDE_CONTENT_MAX_WIDTH = 1240;

export type SettingsProps = {
  onBack: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToBlockedUsers?: () => void;
  /** Fila da moderação; o atalho só aparece para moderadores (Spec 102). */
  onNavigateToModeration?: () => void;
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
  icon: "document" | "info" | "lock" | "block" | "visibility" | "person" | "bell" | "place" | "mail" | "instagram" | "flag";
  label: string;
  description?: string;
  onPress?: () => void;
};

type SettingsSectionKey = "account" | "preferences" | "notifications" | "appearance" | "device" | "about";

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
  onNavigateToModeration,
  onNavigateToAbout,
  onNavigateToEditProfile,
  onNavigateToSecurity,
  onNavigateToNotifications,
  onSignedOut,
}: SettingsProps) {
  const fallbackBack = useCallback(() => {}, []);
  const guardedBack = useGuardedPress(onBack ?? fallbackBack);
  const guardedTermsPress = useGuardedPress(onNavigateToTerms);
  const guardedTerms = onNavigateToTerms ? guardedTermsPress : undefined;
  const guardedHelpPress = useGuardedPress(onNavigateToHelp);
  const guardedHelp = onNavigateToHelp ? guardedHelpPress : undefined;
  const guardedPrivacyPress = useGuardedPress(onNavigateToPrivacy);
  const guardedPrivacy = onNavigateToPrivacy ? guardedPrivacyPress : undefined;
  const guardedBlockedUsersPress = useGuardedPress(onNavigateToBlockedUsers);
  const guardedBlockedUsers = onNavigateToBlockedUsers ? guardedBlockedUsersPress : undefined;
  const guardedModerationPress = useGuardedPress(onNavigateToModeration);
  const guardedModeration = onNavigateToModeration ? guardedModerationPress : undefined;
  const guardedAboutPress = useGuardedPress(onNavigateToAbout);
  const guardedAbout = onNavigateToAbout ? guardedAboutPress : undefined;
  const guardedEditProfilePress = useGuardedPress(onNavigateToEditProfile);
  const guardedEditProfile = onNavigateToEditProfile ? guardedEditProfilePress : undefined;
  const guardedSecurityPress = useGuardedPress(onNavigateToSecurity);
  const guardedSecurity = onNavigateToSecurity ? guardedSecurityPress : undefined;
  const guardedNotificationsPress = useGuardedPress(onNavigateToNotifications);
  const guardedNotifications = onNavigateToNotifications ? guardedNotificationsPress : undefined;
  const guardedSignedOutPress = useGuardedPress(onSignedOut);
  const guardedSignedOut = onSignedOut ? guardedSignedOutPress : undefined;
  const { colors, resolvedScheme } = useTheme();
  // Web larga: barra lateral com a conta e o índice das seções, e as seções empilhadas ao lado.
  const wide = useIsWideWeb();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const mainY = useRef(0);
  const sectionY = useRef<Record<string, number>>({});
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState, authActions] = makeAuthViewModel();
  const hasAccount = !!authState.user?.id;
  const sessionUserId = authState.user?.id ?? null;
  const [profileState] = makePublicProfileViewModel(sessionUserId ?? "");
  const neighborhood = useActiveNeighborhood("all");
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [confirmingCleanup, setConfirmingCleanup] = useState<"catalog" | "history" | null>(null);
  const [expandedSection, setExpandedSection] = useState<SettingsSectionKey | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const defaultNeighborhoodLabel =
    neighborhood.activeNeighborhood === "all" || neighborhood.activeNeighborhood === "Todos os bairros (Piripiri)"
      ? "Todos os bairros"
      : neighborhood.activeNeighborhood;

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      const ok = await authActions.signOut();
      if (!ok) {
        setSignOutError("Não foi possível sair da conta. Tente novamente.");
        return;
      }
      setConfirmingSignOut(false);
      guardedSignedOut?.();
    } finally {
      setSigningOut(false);
    }
  }
  const [state, actions] = makeSettingsViewModel();
  const [notifPrefs, notifActions] = makeNotificationPreferencesViewModel(sessionUserId);
  const version = Constants.expoConfig?.version ?? null;
  const isModerator = makeIsModerator(sessionUserId);

  async function handleConfirmCleanup() {
    if (confirmingCleanup === "catalog") {
      await actions.clearBooksCache();
    } else if (confirmingCleanup === "history") {
      await actions.clearSearchHistory(sessionUserId);
    }
    setConfirmingCleanup(null);
  }

  const cleanupDialogOptions = {
    catalog: {
      title: "Remover a cópia do catálogo?",
      message: "Esta ação remove a cópia do catálogo salva neste aparelho. Você poderá baixá-la de novo depois. Seus anúncios, conversas e conta não serão apagados.",
      confirmLabel: "Remover cópia",
      loading: state.clearingCache,
    },
    history: {
      title: "Apagar histórico de buscas?",
      message: "Esta ação apaga as buscas recentes guardadas neste aparelho. As demais informações do IpêBook continuam iguais.",
      confirmLabel: "Apagar histórico",
      loading: state.clearingHistory,
    },
  } as const;
  const cleanupDialog = confirmingCleanup ? cleanupDialogOptions[confirmingCleanup] : null;

  // Gestão da conta veio de Meu perfil (ADR 0060) e só aparece com sessão
  const accountLinks: LinkItem[] = hasAccount
    ? [
        {
          key: "security",
          icon: "lock" as const,
          label: "Segurança e verificação",
          description: "Senha, e-mail e confirmação da conta",
          onPress: onNavigateToSecurity ? guardedSecurity : undefined,
        },
        {
          key: "notifications",
          icon: "bell" as const,
          label: "Central de notificações",
          description: "Propostas, mensagens e avisos de novos livros",
          onPress: onNavigateToNotifications ? guardedNotifications : undefined,
        },
        {
          key: "privacy",
          icon: "visibility" as const,
          label: "Privacidade e dados",
          description: "Baixe seus dados ou exclua sua conta",
          onPress: onNavigateToPrivacy ? guardedPrivacy : undefined,
        },
        {
          key: "blocked",
          icon: "block" as const,
          label: "Pessoas bloqueadas",
          description: "Gerencie quem não pode interagir com você",
          onPress: onNavigateToBlockedUsers ? guardedBlockedUsers : undefined,
        },
        ...(isModerator
          ? [
              {
                key: "moderation",
                icon: "flag" as const,
                label: "Moderação",
                description: "Analise as denúncias da comunidade",
                onPress: onNavigateToModeration ? guardedModeration : undefined,
              },
            ]
          : []),
      ].filter((link) => link.onPress)
    : [];

  const aboutLinks: LinkItem[] = [
    { key: "about", icon: "info" as const, label: "Conhecer o IpêBook", description: "Como funciona, segurança e a comunidade de Piripiri", onPress: onNavigateToAbout ? guardedAbout : undefined },
    { key: "help", icon: "info" as const, label: "Ajuda e suporte", onPress: onNavigateToHelp ? guardedHelp : undefined },
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
    { key: "terms", icon: "document" as const, label: "Termos e privacidade", onPress: onNavigateToTerms ? guardedTerms : undefined },
  ].filter((link) => link.onPress);

  // Índice da barra lateral (web larga): leva até cada seção da coluna principal.
  const navItems: { key: string; label: string; icon: Exclude<LinkItem["icon"], "instagram"> }[] = [
    ...(accountLinks.length > 0 ? [{ key: "account", label: "Conta e dados", icon: "person" as const }] : []),
    { key: "preferences", label: "Preferências", icon: "place" as const },
    ...(hasAccount ? [{ key: "notifications", label: "Notificações", icon: "bell" as const }] : []),
    { key: "appearance", label: "Aparência", icon: "visibility" as const },
    { key: "device", label: "Armazenamento e histórico", icon: "document" as const },
    { key: "about", label: "Sobre o IpêBook", icon: "info" as const },
  ];

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
        <View style={[styles.iconCircle, getIconToneStyle(link.icon, colors)]}>
          {link.icon === "instagram" ? (
            <InstagramIcon size={20} color={colors.m3.onSecondaryContainer} />
          ) : (
            <AppIcon name={link.icon} size={20} color={getIconColor(link.icon, colors)} />
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

  function renderSectionHeader(
    sectionKey: SettingsSectionKey,
    label: string,
    subtitle: string,
    icon: AppIconName,
  ) {
    const expanded = expandedSection === sectionKey;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        onPress={() => setExpandedSection((previous) => (previous === sectionKey ? null : sectionKey))}
        android_ripple={{ color: colors.m3.surfaceContainerHigh }}
        style={withPress([styles.disclosureHeader, expanded && styles.disclosureHeaderExpanded])}
      >
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderIcon}>
            <AppIcon name={icon} size={20} color={colors.m3.onSecondaryContainer} />
          </View>
          <View style={styles.sectionHeaderTextCol}>
            <Text accessibilityRole="header" style={styles.sectionHeader}>
              {label}
            </Text>
            <Text numberOfLines={1} style={styles.sectionSubtitle}>
              {subtitle}
            </Text>
          </View>
        </View>
        <View style={[styles.chevronBadge, expanded && styles.chevronBadgeExpanded]}>
          <AppIcon name={expanded ? "chevronUp" : "chevronDown"} size={18} color={colors.m3.onSurfaceVariant} />
        </View>
      </Pressable>
    );
  }

  const accountDisplayName = profileState.profile?.name || "Minha conta";
  const accountEmail = authState.user?.email ?? null;

  // Cartão da conta (Spec 091): quem está logada e atalho para editar o perfil.
  const accountCard = hasAccount ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar perfil de ${accountDisplayName}`}
      accessibilityHint={accountEmail ? `E-mail ${accountEmail}. Abre os dados para edição.` : "Abre os dados do seu perfil para edição."}
      onPress={guardedEditProfile}
      style={withPress([styles.accountCard, wide && styles.accountCardWide])}
    >
      <View style={styles.accountIdentity}>
        <Avatar
          name={profileState.profile?.name || accountEmail || "Você"}
          photoUrl={profileState.profile?.photoUrl ?? undefined}
          size={64}
        />
        <View style={styles.accountInfo}>
          <Text style={styles.accountEyebrow}>Conta conectada</Text>
          <Text numberOfLines={1} style={styles.accountName}>
            {accountDisplayName}
          </Text>
          <Text numberOfLines={1} style={styles.linkDescription}>
            {accountEmail ?? "E-mail não informado"}
          </Text>
        </View>
      </View>
      <View style={styles.accountAction}>
        <AppIcon name="edit" size={16} color={colors.m3.onSecondaryContainer} />
        <Text style={styles.accountActionText}>Editar</Text>
      </View>
    </Pressable>
  ) : null;

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Configurações" onBack={guardedBack} contentMaxWidth={wide ? WIDE_CONTENT_MAX_WIDTH : undefined} />
      <ScrollView ref={scrollRef} {...standardVerticalScrollProps} contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}>
        <View style={[styles.content, wide && styles.contentWide]}>
          {wide ? (
            <View style={styles.sidebar}>
              {accountCard}
              <View accessibilityRole="menu" accessibilityLabel="Seções das configurações" style={styles.sideNav}>
                {navItems.map((item) => (
                  <Pressable
                    key={item.key}
                    accessibilityRole="link"
                    accessibilityLabel={`Ir para ${item.label}`}
                    onPress={() => scrollRef.current?.scrollTo({ y: mainY.current + (sectionY.current[item.key] ?? 0) - 16, animated: true })}
                    style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [styles.sideNavItem, (hovered || pressed) && styles.sideNavItemActive]}
                  >
                    <AppIcon name={item.icon} size={20} color={colors.m3.onSurfaceVariant} />
                    <Text style={styles.sideNavLabel}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
              {hasAccount ? (
                <View style={styles.sideSignOut}>
                  <TextButton label="Sair da conta" tone="danger" onPress={() => { setSignOutError(null); setConfirmingSignOut(true); }} />
                </View>
              ) : null}
            </View>
          ) : null}
          <View
            style={wide ? styles.main : styles.mainStacked}
            onLayout={(event) => { mainY.current = wide ? event.nativeEvent.layout.y : 0; }}
          >
          {wide ? null : accountCard}

          {/* Conta e dados (ADR 0060): só com sessão, e primeiro por ser o que mais importa */}
          {accountLinks.length > 0 ? (
            <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.account = event.nativeEvent.layout.y; }}>
              {renderSectionHeader("account", "Conta e dados", "Segurança, notificações, privacidade e bloqueios", "person")}
              {expandedSection === "account" ? <View style={styles.sectionBodyList}>{accountLinks.map(renderLink)}</View> : null}
            </View>
          ) : null}

          {/* Preferências de uso (Spec 091): o bairro com que a Home e a Explorar abrem */}
          <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.preferences = event.nativeEvent.layout.y; }}>
            {renderSectionHeader("preferences", "Preferências", `Bairro padrão: ${defaultNeighborhoodLabel}`, "place")}
            {expandedSection === "preferences" ? (
              <View style={styles.sectionBodyList}>
                {renderLink({
                  key: "neighborhood",
                  icon: "place",
                  label: "Bairro padrão",
                  description: `${defaultNeighborhoodLabel} · usado para mostrar livros perto de você`,
                  onPress: neighborhood.openSelector,
                }, 0)}
              </View>
            ) : null}
          </View>

          {/* Notificações (Spec 099 / ADR 0075): a pessoa escolhe quais avisos chegam por push */}
          {hasAccount ? (
            <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.notifications = event.nativeEvent.layout.y; }}>
              {renderSectionHeader("notifications", "Notificações", "Propostas, lembretes de encontro e alertas", "bell")}
              {expandedSection === "notifications" ? (
                <View style={styles.sectionBodyList}>
                  {(Object.keys(NOTIFICATION_PREFERENCE_CATEGORIES) as NotificationPreferenceKey[]).map(
                    (key, index) => {
                      const category = NOTIFICATION_PREFERENCE_CATEGORIES[key];
                      return (
                        <View key={key} style={[styles.toggleRow, index > 0 && styles.linkDivider]}>
                          <View style={styles.linkText}>
                            <Text style={styles.linkLabel}>{category.label}</Text>
                            <Text style={styles.linkDescription}>{category.description}</Text>
                          </View>
                          <Switch
                            value={notifPrefs.enabled[key]}
                            onValueChange={(value) => void notifActions.setEnabled(key, value)}
                            accessibilityRole="switch"
                            accessibilityLabel={`${category.label}: ${notifPrefs.enabled[key] ? "ativada" : "desativada"}`}
                            trackColor={{
                              false: colors.m3.surfaceContainerHighest,
                              true: resolvedScheme === "dark" ? colors.m3.primaryContainer : colors.action,
                            }}
                            thumbColor={
                              notifPrefs.enabled[key]
                                ? resolvedScheme === "dark"
                                  ? colors.m3.primary
                                  : colors.m3.onPrimary
                                : colors.m3.outline
                            }
                          />
                        </View>
                      );
                    },
                  )}
                  {notifPrefs.error ? (
                    <Text accessibilityLiveRegion="polite" style={[styles.feedbackError, styles.inlineFeedback]}>
                      {notifPrefs.error}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* Aparência (Spec 073 FR-003, ADR 0036) */}
          <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.appearance = event.nativeEvent.layout.y; }}>
            {renderSectionHeader("appearance", "Aparência", "Tema claro, escuro ou padrão do sistema", "visibility")}
            {expandedSection === "appearance" ? (
              <View style={styles.sectionBodyCard}>
                <Text style={styles.sectionDescription}>
                  A preferência escolhida é aplicada imediatamente.
                </Text>
                <ThemePreferenceSelector />
              </View>
            ) : null}
          </View>

          {/* Armazenamento e histórico: cópia offline do catálogo e buscas recentes */}
          <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.device = event.nativeEvent.layout.y; }}>
            {renderSectionHeader("device", "Armazenamento e histórico", "Catálogo offline e histórico de buscas", "document")}
            {expandedSection === "device" ? (
              <View style={styles.sectionBodyCard}>
                <Text style={styles.sectionDescription}>
                  Uma cópia do catálogo fica salva para abrir livros sem internet. Removê-la libera espaço; ela pode ser baixada novamente. O histórico de buscas também fica salvo aqui e pode ser apagado separadamente.
                </Text>
                <OutlinedButton
                  label="Remover cópia do catálogo"
                  accessibilityLabel="Remover cópia do catálogo deste aparelho"
                  loading={state.clearingCache}
                  loadingLabel="Removendo cópia do catálogo"
                  onPress={() => setConfirmingCleanup("catalog")}
                />
                <OutlinedButton
                  label="Apagar histórico de buscas"
                  accessibilityLabel="Apagar histórico de buscas deste aparelho"
                  loading={state.clearingHistory}
                  loadingLabel="Apagando histórico de buscas"
                  onPress={() => setConfirmingCleanup("history")}
                />
                {state.historyCleared ? (
                  <Text accessibilityLiveRegion="polite" style={styles.feedbackSuccess}>
                    Histórico de buscas apagado.
                  </Text>
                ) : null}
                {state.historyError ? (
                  <Text accessibilityLiveRegion="polite" style={styles.feedbackError}>
                    {state.historyError}
                  </Text>
                ) : null}
                {state.cacheCleared ? (
                  <Text accessibilityLiveRegion="polite" style={styles.feedbackSuccess}>
                    Cópia do catálogo removida deste aparelho.
                  </Text>
                ) : null}
                {state.cacheError ? (
                  <Text accessibilityLiveRegion="polite" style={styles.feedbackError}>
                    {state.cacheError}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Sobre e atalhos (Spec 073) */}
          <View style={styles.sectionCard} onLayout={(event) => { sectionY.current.about = event.nativeEvent.layout.y; }}>
            {renderSectionHeader("about", "Sobre o IpêBook", "Ajuda, suporte, redes sociais e termos", "info")}
            {expandedSection === "about" ? (
              <View style={styles.sectionBodyList}>
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
            ) : null}
          </View>

          {hasAccount && !wide ? (
            <View style={styles.signOutRow}>
              <TextButton label="Sair da conta" tone="danger" onPress={() => { setSignOutError(null); setConfirmingSignOut(true); }} />
            </View>
          ) : null}

          <Text style={styles.footer}>
            Leitura, anúncios e configurações funcionam sem internet. Só publicar, favoritar e
            negociar pedem conexão.
          </Text>
          </View>
        </View>
      </ScrollView>

      <NeighborhoodSelectorModal
        visible={neighborhood.isSelectorOpen}
        currentNeighborhood={neighborhood.activeNeighborhood}
        onSelect={(name) => void neighborhood.selectNeighborhood(name)}
        onClose={neighborhood.closeSelector}
      />
      {cleanupDialog ? (
        <Dialog
          visible
          title={cleanupDialog.title}
          message={cleanupDialog.message}
          confirmLabel={cleanupDialog.confirmLabel}
          cancelLabel="Cancelar"
          destructive
          loading={cleanupDialog.loading}
          onConfirm={() => void handleConfirmCleanup()}
          onCancel={() => setConfirmingCleanup(null)}
        />
      ) : null}
      <Dialog
        visible={confirmingSignOut}
        title="Sair da conta?"
        message={signOutError ?? "Você volta a ver só o catálogo. Seus anúncios e conversas continuam salvos."}
        confirmLabel="Sair"
        cancelLabel="Ficar"
        destructive
        loading={signingOut}
        onConfirm={() => void handleSignOut()}
        onCancel={() => {
          setConfirmingSignOut(false);
          setSignOutError(null);
        }}
      />
    </SafeAreaView>
  );
}

export default Settings;

function getIconToneStyle(icon: LinkItem["icon"], colors: ColorPalette) {
  switch (icon) {
    case "lock":
    case "bell":
    case "place":
    case "mail":
      return { backgroundColor: colors.m3.surfaceContainerHigh };
    case "block":
      return { backgroundColor: colors.errorContainer };
    case "flag":
      return { backgroundColor: colors.m3.tertiaryContainer };
    case "instagram":
      return { backgroundColor: colors.m3.secondaryContainer };
    default:
      return { backgroundColor: colors.m3.secondaryContainer };
  }
}

function getIconColor(icon: LinkItem["icon"], colors: ColorPalette) {
  switch (icon) {
    case "lock":
    case "bell":
    case "place":
    case "mail":
      return colors.action;
    case "block":
      return colors.error;
    case "flag":
      return colors.m3.onTertiaryContainer;
    default:
      return colors.m3.onSecondaryContainer;
  }
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    accountCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[16],
      padding: tokens.spacing[16],
      borderRadius: tokens.radius.xl,
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    accountIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    accountInfo: { flex: 1, minWidth: 0, gap: tokens.spacing[2] },
    accountEyebrow: {
      ...tokens.typography.labelSmall,
      color: colors.secondaryText,
      fontWeight: tokens.fontWeight.semiBold,
    },
    accountName: {
      ...tokens.typography.titleMedium,
      color: colors.text,
      fontWeight: tokens.fontWeight.semiBold,
    },
    accountAction: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: tokens.spacing[6],
      paddingHorizontal: tokens.spacing[12],
      paddingVertical: tokens.spacing[6],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.secondaryContainer,
    },
    accountActionText: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSecondaryContainer,
      fontWeight: tokens.fontWeight.semiBold,
    },
    signOutRow: { alignItems: "center", paddingTop: tokens.spacing[4] },
    iconCircle: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    linkDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.m3.outlineVariant,
      marginLeft: 68,
    },
    linkPressed: { backgroundColor: colors.m3.surfaceContainerHigh },
    scroll: { flexGrow: 1, paddingBottom: tokens.spacing[32] },
    content: {
      width: "100%",
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
    },
    contentWide: {
      maxWidth: WIDE_CONTENT_MAX_WIDTH,
      alignSelf: "center",
      paddingHorizontal: WEB_GUTTER,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: tokens.spacing[48],
    },
    mainStacked: { gap: tokens.spacing[12] },
    // Coluna de leitura: as listas de opções não passam de ~880 px, como nas preferências de sistemas.
    main: { flex: 1, minWidth: 0, maxWidth: 880, gap: tokens.spacing[16] },
    sidebar: {
      width: 300,
      gap: tokens.spacing[16],
      // Fica visível enquanto a coluna principal rola (só existe na web).
      position: "sticky" as "relative",
      top: tokens.spacing[16],
    },
    accountCardWide: { flexDirection: "column", alignItems: "flex-start", gap: tokens.spacing[12] },
    sideNav: { gap: tokens.spacing[2] },
    sideNavItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
      minHeight: tokens.accessibility.touchTarget,
      paddingHorizontal: tokens.spacing[12],
      borderRadius: tokens.radius.full,
    },
    sideNavItemActive: { backgroundColor: colors.m3.surfaceContainerHigh },
    sideNavLabel: { ...tokens.typography.labelLarge, color: colors.m3.onSurface },
    sideSignOut: { alignItems: "flex-start", paddingHorizontal: tokens.spacing[4] },
    sectionCard: {
      borderRadius: tokens.radius.xl,
      overflow: "hidden",
      backgroundColor: colors.m3.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.m3.outlineVariant,
    },
    sectionHeaderRow: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[12],
    },
    sectionHeaderTextCol: {
      flex: 1,
      minWidth: 0,
      gap: tokens.spacing[2],
    },
    disclosureHeader: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: tokens.spacing[12],
      paddingVertical: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[16],
    },
    disclosureHeaderExpanded: {
      backgroundColor: colors.m3.surfaceContainer,
      borderBottomWidth: 1,
      borderBottomColor: colors.m3.outlineVariant,
    },
    sectionHeaderIcon: {
      width: tokens.spacing[40],
      height: tokens.spacing[40],
      borderRadius: tokens.radius.medium,
      backgroundColor: colors.m3.secondaryContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionHeader: {
      ...tokens.typography.titleMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.semiBold,
    },
    sectionSubtitle: {
      ...tokens.typography.labelMedium,
      color: colors.m3.onSurfaceVariant,
    },
    chevronBadge: {
      width: tokens.spacing[32],
      height: tokens.spacing[32],
      borderRadius: tokens.radius.full,
      backgroundColor: colors.m3.surfaceContainerHigh,
      alignItems: "center",
      justifyContent: "center",
    },
    chevronBadgeExpanded: {
      backgroundColor: colors.m3.secondaryContainer,
    },
    sectionBodyList: {
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    sectionBodyCard: {
      gap: tokens.spacing[12],
      padding: tokens.spacing[16],
      backgroundColor: colors.m3.surfaceContainerLow,
    },
    inlineFeedback: {
      paddingHorizontal: tokens.spacing[16],
      paddingBottom: tokens.spacing[12],
    },
    sectionDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
    },
    footer: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      textAlign: "center",
      paddingHorizontal: tokens.spacing[20],
      lineHeight: tokens.lineHeight[20],
      marginTop: tokens.spacing[4],
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
      fontWeight: tokens.fontWeight.semiBold,
      color: colors.text,
    },
    linkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      minHeight: 64,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: tokens.spacing[14],
      minHeight: 64,
      paddingVertical: tokens.spacing[10],
      paddingHorizontal: tokens.spacing[16],
    },
    linkText: { flex: 1, gap: tokens.spacing[2] },
    linkLabel: {
      ...tokens.typography.bodyMedium,
      color: colors.m3.onSurface,
      fontWeight: tokens.fontWeight.medium,
    },
    linkDescription: {
      ...tokens.typography.bodyMedium,
      color: colors.secondaryText,
      lineHeight: tokens.lineHeight[20],
    },
  });
}

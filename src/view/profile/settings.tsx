import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { TopAppBar } from "@/view/components/TopAppBar";
import { ThemePreferenceSelector } from "@/view/components/ThemePreferenceSelector";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { AppIcon } from "@/view/components/AppIcon";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { useSettingsViewModel } from "@/viewmodel/useSettingsViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

export type SettingsProps = {
  onBack: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToBlockedUsers?: () => void;
};

type LinkItem = {
  key: string;
  icon: "document" | "info" | "lock" | "block" | "visibility";
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
}: SettingsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [authState] = useAuthViewModel();
  const hasAccount = !!authState.user?.id;
  const [state, actions] = useSettingsViewModel();
  const version = Constants.expoConfig?.version ?? null;

  // Gestão da conta veio de Meu perfil (ADR 0060) e só aparece com sessão
  const accountLinks: LinkItem[] = hasAccount
    ? [
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
    { key: "help", icon: "info" as const, label: "Ajuda e suporte", onPress: onNavigateToHelp },
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
          <AppIcon name={link.icon} size={20} color={colors.m3.onSecondaryContainer} />
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
          {/* Conta e dados (ADR 0060): só com sessão, e primeiro por ser o que mais importa */}
          {accountLinks.length > 0 ? (
            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.sectionHeader}>
                Conta e dados
              </Text>
              <View style={styles.listCard}>{accountLinks.map(renderLink)}</View>
            </View>
          ) : null}

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

          <Text style={styles.footer}>
            Leitura, anúncios e configurações funcionam sem internet. Só publicar, favoritar e
            negociar pedem conexão.
          </Text>
        </View>
      </ScrollView>
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

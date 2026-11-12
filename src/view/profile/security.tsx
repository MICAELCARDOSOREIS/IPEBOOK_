import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { makeAuthViewModel } from "@/di/container";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

export type SecurityProps = {
  onBack: () => void;
  onNavigateToLogin?: () => void;
};

/**
 * Figma `07.06 · Segurança e verificação` (`145:2591` / Web `370:16761`).
 * Altera a senha por link enviado ao e-mail da conta, reaproveitando o fluxo já existente de
 * recuperação de acesso (`01.04`/`01.05`), em vez de uma troca com senha atual no app.
 */
export function Security({ onBack, onNavigateToLogin }: SecurityProps) {
  const guardedBack = useGuardedPress(onBack);
  const guardedLogin = useGuardedPress(onNavigateToLogin);
  const [authState, authActions] = makeAuthViewModel();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const email = authState.user?.email?.trim() ?? "";
  const checkingSession = authState.loading && !authState.user;
  const canSend = Boolean(email) && !sending && !checkingSession;

  async function handleSendLink() {
    if (!canSend) return;
    setSent(false);
    setSending(true);
    try {
      const result = await authActions.requestPasswordReset(email);
      if (result) setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar contentMaxWidth={720} title="Segurança e verificação" onBack={guardedBack} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding.withoutBottomBar }]}
        {...standardVerticalScrollProps}
      >
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <IconBadge icon="lock" tone="neutral" />
              <Text accessibilityRole="header" style={styles.sectionHeader}>Alterar senha</Text>
            </View>
            {checkingSession ? (
              <Text style={styles.bodyText}>Verificando sua sessão...</Text>
            ) : email ? (
              <>
                <Text style={styles.bodyText}>
                  Enviaremos um link de redefinição de senha para{" "}
                  <Text style={styles.highlight}>{email}</Text>. Abra o link para escolher uma nova
                  senha.
                </Text>
                {sent ? (
                  <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.successText}>
                    Link enviado. Confira sua caixa de entrada (e o spam).
                  </Text>
                ) : null}
                {authState.error ? (
                  <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorText}>
                    {authState.error}
                  </Text>
                ) : null}
                <FilledButton
                  label={sent ? "Reenviar link" : "Enviar link de redefinição"}
                  loading={sending}
                  loadingLabel="Enviando link"
                  disabled={!canSend}
                  onPress={() => void handleSendLink()}
                />
              </>
            ) : (
              <>
                <Text style={styles.bodyText}>
                  Entre na sua conta para enviar o link de redefinição de senha.
                </Text>
                {onNavigateToLogin ? (
                  <FilledButton label="Entrar na conta" onPress={guardedLogin} />
                ) : null}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Security;

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    padding: tokens.spacing[24],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
  sectionHeader: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: colors.text,
  },
  bodyText: { ...tokens.typography.bodyMedium, color: colors.text },
  highlight: { fontWeight: tokens.fontWeight.bold, color: colors.action },
  successText: { ...tokens.typography.bodyMedium, color: colors.action, fontWeight: tokens.fontWeight.semiBold },
  errorText: { ...tokens.typography.bodyMedium, color: colors.error },
  });
}

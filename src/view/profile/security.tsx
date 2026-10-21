import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";

export type SecurityProps = {
  onBack: () => void;
};

/**
 * Figma `07.06 · Segurança e verificação` (`145:2591` / Web `370:16761`).
 * Altera a senha por link enviado ao e-mail da conta, reaproveitando o fluxo já existente de
 * recuperação de acesso (`01.04`/`01.05`), em vez de uma troca com senha atual no app.
 */
export function Security({ onBack }: SecurityProps) {
  const [authState, authActions] = useAuthViewModel();
  const [sent, setSent] = useState(false);
  const email = authState.user?.email ?? "";

  async function handleSendLink() {
    const result = await authActions.requestPasswordReset(email);
    if (result) setSent(true);
  }

  return (
    <SafeAreaView style={styles.page}>
      <TopAppBar title="Segurança e verificação" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <IconBadge icon="lock" tone="neutral" />
              <Text accessibilityRole="header" style={styles.sectionHeader}>Alterar senha</Text>
            </View>
            <Text style={styles.bodyText}>
              Enviaremos um link de redefinição de senha para{" "}
              <Text style={styles.highlight}>{email}</Text>. Abra o link para escolher uma nova
              senha.
            </Text>
            {sent ? (
              <Text accessibilityRole="alert" style={styles.successText}>
                Link enviado. Confira sua caixa de entrada (e o spam).
              </Text>
            ) : null}
            {authState.error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>{authState.error}</Text>
            ) : null}
            <FilledButton
              label={sent ? "Reenviar link" : "Enviar link de redefinição"}
              loading={authState.loading}
              loadingLabel="Enviando link"
              onPress={() => void handleSendLink()}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Security;

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  scroll: { flexGrow: 1 },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: tokens.spacing[24] },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.medium,
    borderWidth: 1,
    borderColor: tokens.colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[12],
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: tokens.spacing[12] },
  sectionHeader: {
    flex: 1,
    ...tokens.typography.titleMedium,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.text,
  },
  bodyText: { ...tokens.typography.bodyMedium, color: tokens.colors.text },
  highlight: { fontWeight: "700", color: tokens.colors.action },
  successText: { ...tokens.typography.bodyMedium, color: tokens.colors.action, fontWeight: "600" },
  errorText: { ...tokens.typography.bodyMedium, color: tokens.colors.error },
});

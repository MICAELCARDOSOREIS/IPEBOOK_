import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { TextField } from "@/view/components/TextField";

export type ForgotPasswordProps = {
  onNavigateToSignIn?: () => void;
};

export default function ForgotPassword({ onNavigateToSignIn }: ForgotPasswordProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);

  const handleSubmit = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result) setRequested(true);
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Logotipo />
        <Text style={styles.title}>Esqueceu a senha?</Text>
        <Text style={styles.subtitle}>
          Informe seu e-mail. Se houver uma conta, você receberá um link para definir outra senha.
        </Text>

        {requested ? (
          <View style={styles.resultBox}>
            <Text accessibilityRole="alert" style={styles.resultLabel}>Se houver uma conta com este e-mail, enviaremos um link de recuperação.</Text>
            <Text style={styles.resultHint}>Confira também a pasta de spam.</Text>
          </View>
        ) : (
          <>
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!state.loading}
            />

            {state.error ? (
              <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
            ) : null}

            <FilledButton
              label="Recuperar senha"
              loading={state.loading}
              loadingLabel="Recuperando senha"
              onPress={() => void handleSubmit()}
            />
          </>
        )}

        <Pressable accessibilityRole="button" onPress={() => onNavigateToSignIn?.()} style={styles.linkButton}>
          <Text style={styles.link}>Voltar para o login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.colors.background },
  content: { flex: 1, width: "100%", maxWidth: 480, alignSelf: "center", padding: tokens.spacing[24], paddingTop: tokens.spacing[48], gap: tokens.spacing[16] },
  title: { fontSize: tokens.typography.displayLarge.fontSize, fontWeight: tokens.typography.displayLarge.fontWeight, color: tokens.colors.action },
  subtitle: { fontSize: 16, lineHeight: 24, color: tokens.colors.secondaryText, marginBottom: tokens.spacing[12] },
  error: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
  resultBox: { gap: tokens.spacing[6], borderWidth: 1, borderColor: tokens.colors.border, borderRadius: tokens.radius.medium, padding: tokens.spacing[16], backgroundColor: tokens.colors.surface },
  resultLabel: { fontSize: tokens.typography.labelMedium.fontSize, color: tokens.colors.secondaryText },
  resultHint: { fontSize: tokens.typography.bodyMedium.fontSize, color: tokens.colors.secondaryText },
  linkButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center" },
  link: { color: tokens.colors.action, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
});

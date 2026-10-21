import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { tokens } from "@/view/tokens";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";

export type ResetPasswordProps = {
  link: string | null;
  onNavigateToSignIn?: () => void;
  onNavigateToForgotPassword?: () => void;
  onBack?: () => void;
};

/**
 * Figma `01.06 · Nova senha` (nó `254:3595`), `01.09 · Senha atualizada` (nó `254:4006`) e
 * `01.08 · Link expirado` (Issue #97).
 */
export default function ResetPassword({
  link,
  onNavigateToSignIn,
  onNavigateToForgotPassword,
  onBack,
}: ResetPasswordProps) {
  const [state, actions] = useResetPasswordViewModel();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setValidationError(null);
    if (confirmPassword && password !== confirmPassword) {
      setValidationError("As senhas não coincidem.");
      return;
    }
    await actions.submit(link, password);
  };

  const errorMessage = validationError ?? state.error;

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? (
        <TopAppBar
          title={state.success ? "Senha atualizada" : state.linkExpired ? "Link expirado" : "Nova senha"}
          onBack={onBack}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {state.linkExpired ? (
            <>
              <IconBadge icon="error" tone="error" />
              <Text accessibilityRole="header" style={styles.title}>Link expirado.</Text>
              <Text style={styles.subtitle}>
                Esse link de recuperação não é mais válido. Solicite um novo link para continuar.
              </Text>
              <View style={styles.errorBox}>
                <Text accessibilityRole="alert" style={styles.errorMessage}>
                  Link de recuperação inválido ou expirado.
                </Text>
              </View>
              <FilledButton
                label="Solicitar novo link"
                onPress={() => onNavigateToForgotPassword?.()}
              />
            </>
          ) : state.success ? (
            <>
              <IconBadge icon="check" tone="action" />
              <Text accessibilityRole="header" style={styles.title}>
                Tudo certo com seu acesso.
              </Text>
              <Text style={styles.subtitle}>
                Sua nova senha foi salva. Entre novamente para continuar.
              </Text>
              <View style={styles.successBox}>
                <Text accessibilityRole="alert" style={styles.message}>
                  Senha atualizada. Entre com a nova senha.
                </Text>
              </View>
              <FilledButton
                label="Ir para o login"
                onPress={() => onNavigateToSignIn?.()}
              />
            </>
          ) : (
            <>
              <Text accessibilityRole="header" style={styles.title}>Um novo começo.</Text>
              <Text style={styles.subtitle}>Escolha uma senha com pelo menos 8 caracteres.</Text>
              <TextField
                label="Nova senha"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationError) setValidationError(null);
                }}
                secureTextEntry
                editable={!state.loading}
                helperText="Use uma senha que você não usa em outro lugar."
              />

              <TextField
                label="Confirmar senha"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationError) setValidationError(null);
                }}
                secureTextEntry
                editable={!state.loading}
              />

              {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text>
              ) : null}

              <FilledButton
                label="Salvar nova senha"
                loading={state.loading}
                loadingLabel="Salvando senha"
                onPress={() => void handleSubmit()}
              />
            </>
          )}

          <TextButton label="Voltar ao login" onPress={() => onNavigateToSignIn?.()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  centerContainer: {
    flexGrow: 1,
    paddingHorizontal: tokens.spacing[24],
    paddingTop: tokens.spacing[24],
    paddingBottom: tokens.spacing[32],
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    gap: tokens.spacing[16],
  },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    color: tokens.colors.action,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: tokens.colors.secondaryText,
    marginBottom: tokens.spacing[4],
  },
  successBox: {
    borderWidth: 1,
    borderColor: tokens.colors.success,
    backgroundColor: tokens.colors.soft,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
  },
  message: {
    color: tokens.colors.success,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    lineHeight: 20,
    fontWeight: "500",
  },
  error: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  errorBox: {
    borderWidth: 1,
    borderColor: tokens.colors.error,
    backgroundColor: tokens.colors.errorContainer,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
  },
  errorMessage: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    lineHeight: 20,
    fontWeight: "500",
  },
  linkButton: {
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: tokens.colors.action,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    fontWeight: "600",
  },
});

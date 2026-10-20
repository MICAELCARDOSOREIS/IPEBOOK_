import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ForgotPasswordProps = {
  onNavigateToSignIn?: () => void;
  onBack?: () => void;
};

export default function ForgotPassword({ onNavigateToSignIn, onBack }: ForgotPasswordProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);

  const handleSubmit = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result) setRequested(true);
  };

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? (
        <TopAppBar
          title={requested ? "Confira seu e-mail" : "Recuperar acesso"}
          onBack={onBack}
        />
      ) : null}
      <View style={styles.centerContainer}>
        <View style={styles.content}>
          <Logotipo />

          {requested ? (
            <>
              <Text style={styles.title}>Confira seu e-mail</Text>
              <Text style={styles.subtitle}>
                Se houver uma conta associada a {email ? <Text style={styles.emailHighlight}>{email}</Text> : "este endereço"}, enviamos um link para definir uma nova senha.
              </Text>

              <View style={styles.resultBox}>
                <Text accessibilityRole="alert" style={styles.resultLabel}>
                  Se houver uma conta com este e-mail, enviaremos um link de recuperação.
                </Text>
                <Text style={styles.resultHint}>
                  Não encontrou? Confira também a sua pasta de spam ou lixo eletrônico.
                </Text>
              </View>

              <FilledButton
                label="Voltar para o login"
                onPress={() => onNavigateToSignIn?.()}
              />
            </>
          ) : (
            <>
              <Text style={styles.title}>Esqueceu a senha?</Text>
              <Text style={styles.subtitle}>
                Informe seu e-mail. Se houver uma conta, você receberá um link para definir outra senha.
              </Text>

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

              <Pressable accessibilityRole="button" onPress={() => onNavigateToSignIn?.()} style={styles.linkButton}>
                <Text style={styles.link}>Voltar para o login</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: tokens.spacing[16],
    paddingVertical: tokens.spacing[24],
  },
  content: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: tokens.spacing[24],
    gap: tokens.spacing[16],
    ...(Platform.OS === "web"
      ? {
          boxShadow: tokens.elevation.level1,
        }
      : {
          elevation: 1,
        }),
  },
  title: {
    fontSize: tokens.typography.displayLarge.fontSize,
    lineHeight: tokens.typography.displayLarge.lineHeight,
    fontFamily: tokens.typography.displayLarge.fontFamily,
    fontWeight: tokens.typography.displayLarge.fontWeight,
    color: tokens.colors.action,
  },
  subtitle: {
    fontSize: tokens.typography.bodyLarge.fontSize,
    lineHeight: tokens.typography.bodyLarge.lineHeight,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    color: tokens.colors.secondaryText,
    marginBottom: tokens.spacing[4],
  },
  emailHighlight: {
    fontWeight: "bold",
    color: tokens.colors.text,
  },
  error: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  resultBox: {
    gap: tokens.spacing[6],
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius.medium,
    padding: tokens.spacing[16],
    backgroundColor: tokens.colors.surface,
  },
  resultLabel: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.text,
    fontWeight: "500",
  },
  resultHint: {
    fontSize: tokens.typography.labelMedium.fontSize,
    fontFamily: tokens.typography.labelMedium.fontFamily,
    color: tokens.colors.secondaryText,
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

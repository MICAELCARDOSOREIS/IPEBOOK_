import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type SignUpProps = {
  onAuthenticated?: () => void;
  onNavigateToSignIn?: () => void;
  onNavigateToTerms?: () => void;
  onBack?: () => void;
};

export default function SignUp({
  onAuthenticated,
  onNavigateToSignIn,
  onNavigateToTerms,
  onBack,
}: SignUpProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const success = await actions.signUp(email, password);
    if (success) onAuthenticated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? <TopAppBar title="Criar conta" onBack={onBack} /> : null}
      <View style={styles.centerContainer}>
        <View style={styles.content}>
          <Logotipo />
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Crie sua conta para anunciar e negociar livros.</Text>

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!state.loading}
          />

          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!state.loading}
            helperText="Mínimo de 8 caracteres."
          />

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}

          {state.statusMessage ? (
            <Text accessibilityRole="alert" style={styles.status}>{state.statusMessage}</Text>
          ) : null}

          <FilledButton
            label="Criar conta"
            loading={state.loading}
            loadingLabel="Criando conta"
            onPress={() => void handleSubmit()}
          />

          <Pressable accessibilityRole="button" onPress={() => onNavigateToTerms?.()} style={styles.termsButton}>
            <Text style={styles.termsText}>
              Ao criar conta, você concorda com os <Text style={styles.termsLink}>Termos de Uso e Privacidade</Text>.
            </Text>
          </Pressable>

          <Pressable accessibilityRole="button" onPress={() => onNavigateToSignIn?.()} style={styles.linkButton}>
            <Text style={styles.link}>Já tem conta? Entrar</Text>
          </Pressable>
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
  error: {
    color: tokens.colors.error,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
  },
  status: {
    color: tokens.colors.action,
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
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
  termsButton: {
    paddingVertical: tokens.spacing[4],
    alignItems: "center",
    minHeight: tokens.accessibility.touchTarget,
    justifyContent: "center",
  },
  termsText: {
    fontSize: tokens.typography.bodyMedium.fontSize,
    fontFamily: tokens.typography.bodyMedium.fontFamily,
    color: tokens.colors.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: tokens.colors.action,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

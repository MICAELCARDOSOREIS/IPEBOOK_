import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { Logotipo } from "@/view/components/Logotipo";
import { TextField } from "@/view/components/TextField";

export type SignUpProps = {
  onAuthenticated?: () => void;
  onNavigateToSignIn?: () => void;
};

export default function SignUp({ onAuthenticated, onNavigateToSignIn }: SignUpProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const success = await actions.signUp(email, password);
    if (success) onAuthenticated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
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

        <FilledButton
          label="Criar conta"
          loading={state.loading}
          loadingLabel="Criando conta"
          onPress={() => void handleSubmit()}
        />

        <Pressable accessibilityRole="button" onPress={() => onNavigateToSignIn?.()} style={styles.linkButton}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
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
  linkButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center" },
  link: { color: tokens.colors.action, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
});

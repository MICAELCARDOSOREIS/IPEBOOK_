import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";

export type SignInProps = {
  onAuthenticated?: () => void;
  onNavigateToSignUp?: () => void;
};

export default function SignIn({ onAuthenticated, onNavigateToSignUp }: SignInProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const success = await actions.signIn(email, password);
    if (success) onAuthenticated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Entre com sua conta para anunciar e negociar livros.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            accessibilityLabel="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!state.loading}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            accessibilityLabel="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!state.loading}
            style={styles.input}
          />
        </View>

        {state.error ? (
          <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: state.loading }}
          disabled={state.loading}
          onPress={() => void handleSubmit()}
          style={styles.button}
        >
          {state.loading ? (
            <ActivityIndicator color={tokens.colors.surface} accessibilityLabel="Entrando" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => onNavigateToSignUp?.()} style={styles.linkButton}>
          <Text style={styles.link}>Ainda não tem conta? Criar conta</Text>
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
  field: { gap: tokens.spacing[6] },
  label: { fontSize: tokens.typography.labelMedium.fontSize, color: tokens.colors.secondaryText },
  input: { minHeight: tokens.accessibility.touchTarget, borderWidth: 1, borderColor: tokens.colors.border, borderRadius: tokens.radius.small, paddingHorizontal: tokens.spacing[12], color: tokens.colors.text, backgroundColor: tokens.colors.surface },
  error: { color: tokens.colors.error, fontSize: tokens.typography.bodyMedium.fontSize },
  button: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center", borderRadius: tokens.radius.small, backgroundColor: tokens.colors.action, marginTop: tokens.spacing[8] },
  buttonText: { color: tokens.colors.surface, fontSize: 16, fontWeight: "600" },
  linkButton: { minHeight: tokens.accessibility.touchTarget, justifyContent: "center", alignItems: "center" },
  link: { color: tokens.colors.action, fontSize: tokens.typography.bodyMedium.fontSize, fontWeight: "600" },
});

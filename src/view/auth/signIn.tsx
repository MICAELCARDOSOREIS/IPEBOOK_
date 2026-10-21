import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens } from "@/view/tokens";
import { FilledButton } from "@/view/components/FilledButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type SignInProps = {
  onAuthenticated?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToForgotPassword?: () => void;
  onBack?: () => void;
};

/** Figma `01.10 · Entrar com e-mail` (nó `354:6017`). */
export default function SignIn({
  onAuthenticated,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onBack,
}: SignInProps = {}) {
  const [state, actions] = useAuthViewModel();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const success = await actions.signIn(email, password);
    if (success) onAuthenticated?.();
  };

  return (
    <SafeAreaView style={styles.page}>
      {onBack ? <TopAppBar title="Entrar com e-mail" onBack={onBack} /> : null}
      <ScrollView
        contentContainerStyle={styles.centerContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>
            Sua próxima leitura começa aqui.
          </Text>
          <Text style={styles.subtitle}>Entre com o e-mail e a senha da sua conta.</Text>

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!state.loading}
            placeholder="voce@exemplo.com"
          />

          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!state.loading}
          />

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}

          <FilledButton
            label="Entrar"
            loading={state.loading}
            loadingLabel="Entrando"
            onPress={() => void handleSubmit()}
          />

          <TextButton label="Esqueci minha senha" onPress={() => onNavigateToForgotPassword?.()} />
          <TextButton label="Criar uma conta" onPress={() => onNavigateToSignUp?.()} />
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
    color: tokens.colors.text,
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
});

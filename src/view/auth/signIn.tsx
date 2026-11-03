import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthShell } from "@/view/auth/AuthShell";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { GoogleLogo } from "@/view/components/GoogleLogo";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { standardVerticalScrollProps, scrollBottomPadding } from "@/view/scrollProps";

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
  const guardedBack = useGuardedPress(onBack);
  const guardedAuthenticated = useGuardedPress(onAuthenticated);
  const guardedSignUp = useGuardedPress(onNavigateToSignUp);
  const guardedForgotPassword = useGuardedPress(onNavigateToForgotPassword);
  const [state, actions] = useAuthViewModel();
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const success = await actions.signInWithGoogle?.();
    setGoogleLoading(false);
    if (success) guardedAuthenticated();
  };

  const handleSubmit = async () => {
    const success = await actions.signIn(email, password);
    if (success) guardedAuthenticated();
  };

  return (
    <AuthShell>
    <SafeAreaView style={styles.page}>
      {onBack ? <TopAppBar title="Entrar com e-mail" onBack={guardedBack} /> : null}
      <ScrollView
        contentContainerStyle={[
          styles.centerContainer,
          wideWeb && { justifyContent: "center" },
          { paddingBottom: scrollBottomPadding.withoutBottomBar },
        ]}
        {...standardVerticalScrollProps}
      >
        <View style={styles.content}>
          <Logotipo underline />

          <Manchete texto="Sua próxima leitura" realce="começa aqui." />
          <Text style={styles.subtitle}>Entre com o e-mail e a senha da sua conta.</Text>

          <OutlinedButton
            label="Continuar com Google"
            accessibilityLabel="Continuar com Google"
            icon={<GoogleLogo size={20} />}
            loading={googleLoading}
            disabled={state.loading}
            onPress={() => void handleGoogleSignIn()}
          />

          <View accessibilityRole="none" style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou entre com e-mail</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!state.loading}
            placeholder="voce@exemplo.com"
          />

          <TextField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={() => void handleSubmit()}
            editable={!state.loading}
          />

          <View style={styles.forgotPasswordRow}>
            <TextButton label="Esqueci minha senha" onPress={guardedForgotPassword} />
          </View>

          {state.error ? (
            <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
          ) : null}

          <FilledButton
            label="Entrar"
            loading={state.loading}
            loadingLabel="Entrando"
            onPress={() => void handleSubmit()}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Ainda não tem conta?</Text>
            <TextButton label="Criar uma conta" onPress={guardedSignUp} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </AuthShell>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
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
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
    marginBottom: tokens.spacing[4],
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[12],
    marginVertical: tokens.spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
  },
  forgotPasswordRow: {
    alignSelf: "flex-end",
    marginTop: -tokens.spacing[8],
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacing[6],
    marginTop: tokens.spacing[8],
  },
  footerPrompt: {
    ...tokens.typography.bodyMedium,
    color: colors.m3.onSurfaceVariant,
  },
  error: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
  },
  });
}

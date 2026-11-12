import { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthShell } from "@/view/auth/AuthShell";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { makeAuthViewModel } from "@/di/container";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { GoogleLogo } from "@/view/components/GoogleLogo";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { TextButton } from "@/view/components/TextButton";
import { TextField, type TextInputInstance } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";
import { useGuardedPress } from "@/view/useGuardedPress";
import { scrollBottomPadding } from "@/view/scrollProps";

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
  const [state, actions] = makeAuthViewModel();
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const passwordInputRef = useRef<TextInputInstance>(null);
  const busy = submitting || googleLoading;

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setGoogleLoading(true);
    try {
      const success = await actions.signInWithGoogle?.();
      if (success) guardedAuthenticated();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (busy) return;
    setSubmitting(true);
    try {
      const success = await actions.signIn(email, password);
      if (success) guardedAuthenticated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <ScreenContainer
        maxWidth={560}
        paddingTop={tokens.spacing[16]}
        paddingBottom={scrollBottomPadding.withoutBottomBar}
        header={onBack ? <TopAppBar contentMaxWidth={560} title="Entrar com e-mail" onBack={guardedBack} /> : undefined}
        contentStyle={[
          styles.content,
          wideWeb && { justifyContent: "center" },
        ]}
      >
        <Logotipo underline />

        <Manchete texto="Sua próxima leitura" realce="começa aqui." />
        <Text style={styles.subtitle}>Entre com o e-mail e a senha da sua conta.</Text>

        <OutlinedButton
          label="Continuar com Google"
          accessibilityLabel="Continuar com Google"
          icon={<GoogleLogo size={20} />}
          loading={googleLoading}
          disabled={busy}
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
          onSubmitEditing={() => passwordInputRef.current?.focus?.()}
          editable={!busy}
          placeholder="voce@exemplo.com"
        />

        <TextField
          inputRef={passwordInputRef}
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={() => void handleSubmit()}
          editable={!busy}
        />

        <View style={styles.forgotPasswordRow}>
          <TextButton
            label="Esqueci minha senha"
            disabled={busy}
            onPress={guardedForgotPassword}
          />
        </View>

        {state.error ? <InlineErrorCard message={state.error} /> : null}

        <FilledButton
          label="Entrar"
          loading={submitting}
          loadingLabel="Entrando"
          disabled={busy}
          onPress={() => void handleSubmit()}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>Ainda não tem conta?</Text>
          <TextButton label="Criar uma conta" disabled={busy} onPress={guardedSignUp} />
        </View>
      </ScreenContainer>
    </AuthShell>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    content: {
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
  });
}

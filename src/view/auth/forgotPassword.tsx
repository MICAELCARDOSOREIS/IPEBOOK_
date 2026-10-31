import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthShell } from "@/view/auth/AuthShell";
import { useIsWideWeb } from "@/view/useIsWideWeb";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import { tokens, type ColorPalette } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";
import { FilledButton } from "@/view/components/FilledButton";
import { IconBadge } from "@/view/components/IconBadge";
import { Logotipo } from "@/view/components/Logotipo";
import { Manchete } from "@/view/components/Manchete";
import { OutlinedButton } from "@/view/components/OutlinedButton";
import { TextButton } from "@/view/components/TextButton";
import { TextField } from "@/view/components/TextField";
import { TopAppBar } from "@/view/components/TopAppBar";

export type ForgotPasswordProps = {
  onNavigateToSignIn?: () => void;
  onBack?: () => void;
};

/** Espera antes de liberar o reenvio, igual ao contador do Figma `01.05`. */
const RESEND_SECONDS = 45;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Figma `01.04 · Recuperar acesso` (nó `6:534`) e `01.05 · Confira seu e-mail` (nó `6:597`). */
export default function ForgotPassword({ onNavigateToSignIn, onBack }: ForgotPasswordProps = {}) {
  const [state, actions] = useAuthViewModel();
  const { colors } = useTheme();
  const wideWeb = useIsWideWeb();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState("");
  const [requested, setRequested] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!requested || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((previous) => (previous <= 1 ? 0 : previous - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [requested, secondsLeft]);

  const handleSubmit = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result && mounted.current) {
      setRequested(true);
      setSecondsLeft(RESEND_SECONDS);
    }
  };

  const handleResend = async () => {
    const result = await actions.requestPasswordReset(email);
    if (result && mounted.current) setSecondsLeft(RESEND_SECONDS);
  };

  return (
    <AuthShell>
    <SafeAreaView style={styles.page}>
      {onBack ? (
        <TopAppBar
          title={requested ? "Confira seu e-mail" : "Recuperar acesso"}
          onBack={onBack}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={[styles.centerContainer, wideWeb && { justifyContent: "center" }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Logotipo underline />

          {requested ? (
            <>
              <IconBadge icon="mail" tone="donation" size="large" />
              <Text accessibilityRole="header" style={styles.title}>Confira seu e-mail.</Text>
              <Text style={styles.subtitle}>
                Se houver uma conta com{" "}
                {email ? <Text style={styles.emailHighlight}>{email}</Text> : "este endereço"}, você
                vai receber um link para criar uma nova senha.
              </Text>

              <View style={styles.resultBox}>
                <Text accessibilityRole="alert" style={styles.resultLabel}>Não chegou?</Text>
                <Text style={styles.resultHint}>
                  Confira a caixa de spam ou verifique se o endereço está correto.
                </Text>
              </View>

              <FilledButton label="Voltar ao login" onPress={() => onNavigateToSignIn?.()} />

              <OutlinedButton
                label="Corrigir e-mail"
                onPress={() => {
                  setRequested(false);
                  setSecondsLeft(RESEND_SECONDS);
                }}
              />

              {secondsLeft > 0 ? (
                <Text style={styles.countdown}>
                  {`Você pode reenviar o link em ${formatCountdown(secondsLeft)}.`}
                </Text>
              ) : (
                <TextButton
                  label="Reenviar link"
                  disabled={state.loading}
                  onPress={() => void handleResend()}
                />
              )}
            </>
          ) : (
            <>
              <Manchete texto="Recupere seu" realce="acesso." />
              <Text style={styles.subtitle}>
                Digite seu e-mail para receber as instruções de redefinição de senha.
              </Text>

              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                editable={!state.loading}
                placeholder="voce@exemplo.com"
              />

              {state.error ? (
                <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
              ) : null}

              <FilledButton
                label="Enviar link"
                loading={state.loading}
                loadingLabel="Enviando link"
                onPress={() => void handleSubmit()}
              />

              <OutlinedButton label="Voltar ao login" onPress={() => onNavigateToSignIn?.()} />

              <Text style={styles.footnote}>
                Se você lembrar sua senha, faça login normalmente.
              </Text>
            </>
          )}
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
  title: {
    ...tokens.typography.displayLarge,
    color: colors.text,
  },
  subtitle: {
    ...tokens.typography.bodyLarge,
    color: colors.secondaryText,
  },
  emailHighlight: {
    color: colors.text,
    fontFamily: tokens.typography.bodyLarge.fontFamily,
    fontWeight: tokens.fontWeight.semiBold,
  },
  resultBox: {
    backgroundColor: colors.m3.surfaceContainerLow,
    borderRadius: tokens.radius.large,
    borderWidth: 1,
    borderColor: colors.m3.outlineVariant,
    padding: tokens.spacing[16],
    gap: tokens.spacing[6],
  },
  resultLabel: {
    ...tokens.typography.titleMedium,
    color: colors.text,
    fontWeight: tokens.fontWeight.bold,
  },
  resultHint: {
    ...tokens.typography.bodyMedium,
    color: colors.secondaryText,
    lineHeight: tokens.lineHeight[20],
  },
  countdown: {
    ...tokens.typography.bodyMedium,
    textAlign: "center",
    color: colors.secondaryText,
  },
  footnote: {
    ...tokens.typography.bodyMedium,
    textAlign: "center",
    color: colors.secondaryText,
  },
  error: {
    ...tokens.typography.bodyMedium,
    color: colors.error,
  },
  });
}
